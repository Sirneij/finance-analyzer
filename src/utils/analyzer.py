import asyncio
import os
from typing import Any

import torch
from transformers import pipeline

from src.models.base import Transaction
from src.utils.base import (
    get_device,
    update_progress,
    validate_and_convert_transactions,
)
from src.utils.settings import base_settings as settings
from src.utils.websocket import WebSocketManager


async def analyze_transactions(
    transactions: list[dict[str, Any]], ws_manager: WebSocketManager | None = None
) -> dict[str, Any]:
    """
    Validate transactions, classify them into expense/income categories,
    and report progress. Overall progress is updated with percentage labels.
    """
    try:
        # Step 1: Validate and convert transactions.
        await update_progress(ws_manager, 'Validating transactions...', 0.0)
        if not transactions:
            await update_progress(ws_manager, 'No transactions provided', 1.0)
            return {'error': 'No transactions provided'}

        tx_objects = await validate_and_convert_transactions(transactions)
        if not tx_objects:
            await update_progress(ws_manager, 'No valid transactions provided', 1.0)
            return {'error': 'No valid transactions provided'}

        await update_progress(ws_manager, 'Transactions validated', 0.1)

        # Step 2: Classify transactions.
        categories = await classify_transactions(tx_objects, ws_manager)
        await update_progress(ws_manager, 'Transactions classified', 0.9)

        # Step 3: Analysis complete.
        result = {'categories': categories}
        await update_progress(ws_manager, 'Analysis complete', 1.0)
        return result

    except Exception as e:
        settings.logger.error(f'Error analyzing transactions: {str(e)}', exc_info=True)
        await update_progress(ws_manager, 'Analysis failed', 1.0)
        return {'error': f'Analysis failed: {str(e)}'}


async def classify_transactions(
    transactions: list[Transaction], ws_manager: WebSocketManager | None = None
) -> dict[str, Any]:
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

    try:

        def match_pattern(description: str) -> str | None:
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
        expense_categories: dict[str, float] = {label: 0 for label in expense_labels}
        income_total = 0.0

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

                # prevent blocking the event loop
                await asyncio.sleep(0.01)
                # Clear memory based on device type
                if device.type == 'cuda':
                    torch.cuda.empty_cache()
                elif device.type == 'mps':
                    torch.mps.empty_cache()  # Clear MPS memory cache
                else:  # cpu
                    import gc

                    gc.collect()  # Run garbage collection for CPU

        expense_total = sum(expense_categories.values())
        percentages = {
            cat: (amt / expense_total) * 100 if expense_total > 0 else 0 for cat, amt in expense_categories.items()
        }

        return {
            'expenses': expense_categories,
            'expense_percentages': percentages,
            'income': income_total,
        }
    except Exception as e:
        settings.logger.error(f'Error in classification: {str(e)}')
        await update_progress(ws_manager, 'Analysis failed', 1.0)
        return {'error': f'Classification failed: {str(e)}'}
