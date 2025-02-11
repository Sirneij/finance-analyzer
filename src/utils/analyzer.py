import asyncio
import os

import torch
from transformers import pipeline

from models.base import Transaction
from utils.base import get_device, validate_and_convert_transactions
from utils.settings import base_settings as settings
from utils.websocket import WebSocketManager


async def analyze_transactions(transactions: list[dict], ws_manager: WebSocketManager = None) -> dict:
    """
    Validate transactions, classify them into expense/income categories,
    and report progress. Overall progress is updated with percentage labels.
    """
    try:
        # Step 1: Validate and convert transactions.
        if ws_manager:
            await ws_manager.send_progress('Validating transactions...', 0.0, 'Analysis')
        if not transactions:
            if ws_manager:
                await ws_manager.send_progress('No transactions provided', 1.0, 'Analysis')
            return {'error': 'No transactions provided'}

        tx_objects = await validate_and_convert_transactions(transactions)
        if not tx_objects:
            if ws_manager:
                await ws_manager.send_progress('No valid transactions provided', 1.0, 'Analysis')
            return {'error': 'No valid transactions provided'}
        if ws_manager:
            await ws_manager.send_progress('Transactions validated', 0.1, 'Analysis')

        # Step 2: Classify transactions.
        categories = await classify_transactions(tx_objects, ws_manager)
        if ws_manager:
            await ws_manager.send_progress('Transactions classified', 0.9, 'Analysis')

        # Step 3: Analysis complete.
        result = {'categories': categories}
        if ws_manager:
            await ws_manager.send_progress('Analysis complete', 1.0, 'Analysis')
        return result

    except Exception as e:
        settings.logger.error(f'Error analyzing transactions: {str(e)}', exc_info=True)
        if ws_manager:
            await ws_manager.send_progress('Analysis failed', 1.0, 'Analysis')
        return {'error': f'Analysis failed: {str(e)}'}


async def classify_transactions(transactions: list[Transaction], ws_manager: WebSocketManager = None) -> dict:
    """
    Classify transactions into expense categories (and accumulate income) using
    pattern matching and a zero-shot classifier for unmatched transactions.
    The classification progress will range from 10% to 90%.
    """
    COMMON_PATTERNS = {
        'groceries': [
            'grocery',
            'food',
            'market',
            'supermarket',
            'trader',
            'wholefood',
            'aldi',
            'costco',
            'walmart',
            'target',
            'shoprite',
        ],
        'housing': ['rent', 'mortgage', 'housing', 'maintenance', 'zelle.*tian tian'],
        'utilities': ['electric', 'water', 'gas', 'utility', 'con edison'],
        'education': ['tuition', 'sbu web', 'school', 'university'],
        'transportation': ['uber', 'lyft', 'taxi', 'transit', 'mta'],
        'subscriptions': ['netflix', 'spotify', 'apple.com', 'amazon prime'],
        'insurance': ['insurance', 'geico', 'metlife'],
        'credit_cards': ['discover', 'chase', 'amex', 'payment'],
        'healthcare': ['hospital', 'clinic', 'pharmacy', 'doctor', 'medical', 'cvs', 'walgreens'],
        'dining': [
            'restaurant',
            'cafe',
            'starbucks',
            'dunkin',
            'mcdonalds',
            'burger',
            'pizza',
            'grubhub',
            'doordash',
            'ubereats',
        ],
        'fitness': ['gym', 'fitness', 'peloton', 'sports', 'workout', 'athletic'],
        'shopping': ['amazon', 'ebay', 'bestbuy', 'nike', 'adidas', 'clothing', 'mall'],
    }

    def match_pattern(description: str) -> str:
        desc_lower = description.lower()
        for category, patterns in COMMON_PATTERNS.items():
            if any(pattern in desc_lower for pattern in patterns):
                return category
        return None

    device, device_name = get_device()
    settings.logger.info(f'Using device for classification: {device_name}')

    # Use environment-specified expense labels or fallback to defaults.
    base_labels = 'groceries,housing,transportation,entertainment,utilities,education,credit_cards,insurance,other'
    expense_labels = os.getenv('LABELS', base_labels).split(',')
    expense_categories = {label: 0 for label in expense_labels}
    income_total = 0

    BATCH_SIZE = 32
    total_batches = (len(transactions) + BATCH_SIZE - 1) // BATCH_SIZE

    classifier = pipeline(
        'zero-shot-classification',
        model='facebook/bart-large-mnli',
        device=0 if device.type in ['cuda', 'mps'] else -1,
    )

    # Process transactions in batches.
    for batch_idx in range(total_batches):
        start_idx = batch_idx * BATCH_SIZE
        end_idx = min((batch_idx + 1) * BATCH_SIZE, len(transactions))
        batch = transactions[start_idx:end_idx]

        if ws_manager:
            # Calculate progress: ranges from 0.1 to 0.9 over all batches.
            progress = 0.1 + 0.8 * ((batch_idx + 1) / total_batches)
            await ws_manager.send_progress(
                f'Classifying transactions: batch {batch_idx + 1} of {total_batches}',
                progress,
                'Analysis',
            )

        unmatched_expenses = []
        unmatched_indices = []

        for idx, tx in enumerate(batch):
            if tx.amount < 0:
                category = match_pattern(tx.description)
                if category and category in expense_categories:
                    expense_categories[category] += abs(tx.amount)
                else:
                    unmatched_expenses.append(tx.description.lower())
                    unmatched_indices.append(idx)
            else:
                income_total += tx.amount

        try:
            if unmatched_expenses:
                results = await asyncio.to_thread(
                    classifier,
                    unmatched_expenses,
                    expense_labels,
                    truncation=True,
                    max_length=128,
                )
                for idx, result in enumerate(results):
                    tx = batch[unmatched_indices[idx]]
                    best_label = result['labels'][0]
                    best_score = result['scores'][0]
                    expense_categories[best_label] += abs(tx.amount) * best_score

            await asyncio.sleep(0.01)
            if device.type == 'cuda':
                torch.cuda.empty_cache()
        except Exception as e:
            settings.logger.error(f'Error processing batch {batch_idx}: {str(e)}')
            continue

    expense_total = sum(expense_categories.values())
    percentages = {
        cat: (amt / expense_total) * 100 if expense_total > 0 else 0 for cat, amt in expense_categories.items()
    }

    return {
        'expenses': expense_categories,
        'expense_percentages': percentages,
        'income': income_total,
    }
