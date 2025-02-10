import asyncio
import os
from datetime import datetime

import numpy as np
import pandas as pd
import torch
from sklearn.ensemble import IsolationForest
from transformers import pipeline

from models.base import Transaction
from utils.settings import base_settings as settings
from utils.websocket import WebSocketManager


def get_device() -> tuple[torch.device, str]:
    if torch.cuda.is_available():
        return torch.device('cuda'), 'CUDA (NVIDIA GPU)'
    elif torch.backends.mps.is_available():
        return torch.device('mps'), 'MPS (Apple Metal)'
    else:
        return torch.device('cpu'), 'CPU'


async def analyze_transactions(transactions: list[dict], ws_manager: WebSocketManager = None) -> dict:
    try:
        if ws_manager:
            await ws_manager.send_progress('Validating transactions...', 0.1, 'Analysis')

        if not transactions:
            if ws_manager:
                await ws_manager.send_progress('No transactions provided', 1.0, 'Analysis')
            return {'error': 'No transactions provided'}

        tx_objects = [
            Transaction(**{k: v for k, v in t.items() if k != '__v'}) for t in transactions if validate_transaction(t)
        ]
        if not tx_objects:
            if ws_manager:
                await ws_manager.send_progress('No valid transactions provided', 1.0, 'Analysis')
            return {'error': 'No valid transactions provided'}

        # Classification (20% - 60%)
        categories = await classify_transactions(tx_objects, ws_manager)

        # Offload heavy synchronous computations to worker threads.
        if ws_manager:
            await ws_manager.send_progress('Detecting anomalies...', 0.75, 'Analysis')
        anomalies = await asyncio.to_thread(_detect_anomalies, tx_objects)

        if ws_manager:
            await ws_manager.send_progress('Analyzing spending...', 0.9, 'Analysis')
        spending_analysis = await asyncio.to_thread(_analyze_spending, tx_objects)

        if ws_manager:
            await ws_manager.send_progress('Predicting trends...', 0.95, 'Analysis')
        spending_trends = await asyncio.to_thread(_predict_trends, tx_objects)

        result = {
            'categories': categories,
            'anomalies': anomalies,
            'spending_analysis': spending_analysis,
            'spending_trends': spending_trends,
        }

        if ws_manager:
            await ws_manager.send_progress('Analysis complete', 1.0, 'Analysis')
        return result

    except Exception as e:
        settings.logger.error(f'Error analyzing transactions: {str(e)}', exc_info=True)
        if ws_manager:
            await ws_manager.send_progress('Analysis failed', 1.0, 'Analysis')
        return {'error': f'Analysis failed: {str(e)}'}


def validate_transaction(t: dict) -> bool:
    try:
        required_fields = {'date', 'description', 'amount', 'balance', 'type', 'userId'}
        if not all(field in t for field in required_fields):
            return False
        float(t['amount'])
        float(t['balance'])
        datetime.fromisoformat(t['date'])
        return True
    except (ValueError, TypeError):
        return False


async def classify_transactions(transactions: list[Transaction], ws_manager: WebSocketManager = None) -> dict:
    device, device_name = get_device()
    settings.logger.info(f'Using device for classification: {device_name}')

    classifier = pipeline(
        'zero-shot-classification',
        model='yiyanghkust/finbert-tone',
        device=0 if device.type in ['cuda', 'mps'] else -1,
    )

    # Use the environment labels for expense-related categories.
    expense_labels = os.getenv('LABELS', 'groceries,housing,transportation,entertainment,utilities,other').split(',')
    # Initialize expense totals and track income separately.
    expense_categories = {label: 0 for label in expense_labels}
    income_total = 0

    BATCH_SIZE = 32
    total_batches = len(transactions) // BATCH_SIZE + (1 if len(transactions) % BATCH_SIZE else 0)

    for batch_idx in range(total_batches):
        start_idx = batch_idx * BATCH_SIZE
        end_idx = min((batch_idx + 1) * BATCH_SIZE, len(transactions))
        batch = transactions[start_idx:end_idx]

        if ws_manager:
            progress = 0.2 + (0.4 * (batch_idx / total_batches))
            await ws_manager.send_progress(
                f'Classifying transactions (batch {batch_idx + 1}/{total_batches})...',
                progress,
                'Analysis',
            )

        # Classify only expense transactions.
        expense_descriptions = [tx.description.lower() for tx in batch if tx.amount < 0]
        try:
            if expense_descriptions:
                results = await asyncio.to_thread(
                    classifier,
                    expense_descriptions,
                    expense_labels,
                    truncation=True,
                    max_length=128,
                )
                expense_index = 0
                for tx in batch:
                    if tx.amount < 0:
                        result = results[expense_index]
                        expense_index += 1
                        # Weight by confidence score and absolute amount.
                        best_label = result['labels'][0]
                        best_score = result['scores'][0]
                        expense_categories[best_label] += abs(tx.amount) * best_score
                    else:
                        income_total += tx.amount
            else:
                # If no expense transaction in this batch, add income.
                for tx in batch:
                    if tx.amount >= 0:
                        income_total += tx.amount
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
    # Optionally, include income as a separate key.
    categories = {
        'expenses': expense_categories,
        'expense_percentages': percentages,
        'income': income_total,
    }
    return categories


def _detect_anomalies(transactions: list[Transaction]) -> list[dict]:
    amounts = np.array([tx.amount for tx in transactions]).reshape(-1, 1)
    model = IsolationForest(contamination=0.05, random_state=42)
    anomaly_preds = model.fit_predict(amounts)
    mean = np.mean(amounts)
    std = np.std(amounts)
    anomaly_details = []
    for tx, pred in zip(transactions, anomaly_preds):
        if pred == -1:
            z_score = (tx.amount - mean) / std
            if tx.amount > 0:
                reason = f'Unusually high income of {tx.amount} detected (Z-score: {z_score:.2f}).'
            elif tx.amount < 0 and abs(tx.amount) > abs(mean) + 2 * std:
                reason = f'Unusually large expense of {tx.amount} detected (Z-score: {z_score:.2f}).'
            elif tx.amount < 0 and 'luxury' in tx.description.lower():
                reason = 'Uncommon luxury expense detected.'
            elif tx.amount < 0 and 'groceries' in tx.description.lower():
                reason = 'Unusually high grocery expense detected.'
            else:
                reason = f'Outlier transaction with amount {tx.amount} (Z-score: {z_score:.2f}).'
            anomaly_details.append(
                {
                    'date': tx.date,
                    'description': tx.description,
                    'amount': tx.amount,
                    'reason': reason,
                }
            )
    return anomaly_details


def _analyze_spending(transactions: list[Transaction]) -> dict:
    total_spent = sum(tx.amount for tx in transactions if tx.amount < 0)
    total_income = sum(tx.amount for tx in transactions if tx.amount > 0)
    df = pd.DataFrame([t.__dict__ for t in transactions])
    df['date'] = pd.to_datetime(df['date'])
    df['date'] = df['date'].dt.tz_localize(None)
    daily_summary = df.groupby(df['date'].dt.date)['amount'].sum()
    df = df.sort_values(by='date')
    df['cumulative_balance'] = df['balance']
    daily_summary = {str(date): float(amount) for date, amount in daily_summary.items()}
    cumulative_balance = {row['date'].strftime('%Y-%m-%d'): row['cumulative_balance'] for _, row in df.iterrows()}
    return {
        'total_spent': abs(total_spent),
        'total_income': total_income,
        'savings_rate': (((total_income + total_spent) / total_income) * 100 if total_income else 0),
        'daily_summary': daily_summary,
        'cumulative_balance': cumulative_balance,
    }


def _predict_trends(transactions: list[Transaction]) -> dict:
    if len(transactions) < 2:
        return {'trend': 'Not enough data'}
    for tx in transactions:
        if isinstance(tx.date, str):
            tx.date = datetime.fromisoformat(tx.date.replace('Z', '+00:00'))
    start_date = transactions[0].date
    dates = [(tx.date - start_date).days for tx in transactions]
    amounts = [tx.amount for tx in transactions]
    coeffs = np.polyfit(dates, amounts, 1)
    trend = 'increasing' if coeffs[0] > 0 else 'decreasing'
    slope = coeffs[0]
    df = pd.DataFrame([t.__dict__ for t in transactions])
    df['date'] = pd.to_datetime(df['date'])
    df['date'] = df['date'].dt.tz_localize(None)
    months = len(df['date'].dt.to_period('M').unique())
    estimated_monthly_spend = abs(sum(tx.amount for tx in transactions if tx.amount < 0)) / (months or 1)
    return {
        'trend': trend,
        'trend_slope': slope,
        'estimated_monthly_spend': estimated_monthly_spend,
    }
