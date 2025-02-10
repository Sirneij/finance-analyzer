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
    """
    Detect the best available device (GPU, MPS, or CPU) for PyTorch computations.
    """
    if torch.cuda.is_available():
        # Check if CUDA (NVIDIA GPU) is available
        return torch.device('cuda'), 'CUDA (NVIDIA GPU)'
    elif torch.backends.mps.is_available():
        # Check if MPS (Metal Performance Shaders on Apple Silicon) is available
        return torch.device('mps'), 'MPS (Apple Metal)'
    else:
        # Default to CPU
        return torch.device('cpu'), 'CPU'


async def analyze_transactions(transactions: list[dict], ws_manager: WebSocketManager = None) -> dict:
    """Analyze transactions and return insights with progress updates."""
    try:
        # Validation (10%)
        if ws_manager:
            await ws_manager.send_progress('Validating transactions...', 0.1, 'Analysis')

        if not transactions:
            if ws_manager:
                await ws_manager.send_progress('No transactions provided', 1.0, 'Summarize')
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

        # Anomaly Detection (60% - 75%)
        if ws_manager:
            await ws_manager.send_progress('Detecting anomalies...', 0.75, 'Analysis')
        anomalies = await detect_anomalies(tx_objects)

        # Spending Analysis (75% - 90%)
        if ws_manager:
            await ws_manager.send_progress('Analyzing spending...', 0.9, 'Analysis')
        spending_analysis = await analyze_spending(tx_objects)

        # Trend Prediction (90% - 100%)
        if ws_manager:
            await ws_manager.send_progress('Predicting trends...', 0.95, 'Analysis')
        spending_trends = await predict_trends(tx_objects)

        # Compile the results
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
    """Validate transaction fields."""
    try:
        required_fields = {'date', 'description', 'amount', 'balance', 'type', 'userId'}
        if not all(field in t for field in required_fields):
            return False

        # Validate amount and balance are numeric
        float(t['amount'])
        float(t['balance'])

        # Validate date formats
        datetime.fromisoformat(t['date'])

        return True
    except (ValueError, TypeError):
        return False


async def classify_transactions(transactions: list[Transaction], ws_manager: WebSocketManager = None) -> dict:
    """Classify transactions using FinBERT with batched processing."""
    device, device_name = get_device()
    settings.logger.info(f'Using device for classification: {device_name}')

    # Load FinBERT classification pipeline
    classifier = pipeline(
        'zero-shot-classification',
        model='yiyanghkust/finbert-tone',
        device=0 if device.type in ['cuda', 'mps'] else -1,
    )

    labels = os.getenv(
        'LABELS',
        'groceries,housing,transportation,entertainment,utilities,other',
    ).split(',')
    categories = {label: 0 for label in labels}

    # Batch processing
    BATCH_SIZE = 32
    total_batches = len(transactions) // BATCH_SIZE + (1 if len(transactions) % BATCH_SIZE else 0)

    for batch_idx in range(total_batches):
        start_idx = batch_idx * BATCH_SIZE
        end_idx = min((batch_idx + 1) * BATCH_SIZE, len(transactions))
        batch = transactions[start_idx:end_idx]

        # Update progress
        if ws_manager:
            progress = 0.2 + (0.4 * (batch_idx / total_batches))  # Progress from 20% to 60%
            await ws_manager.send_progress(
                f'Classifying transactions (batch {batch_idx + 1}/{total_batches})...',
                progress,
                'Analysis',
            )

        # Process batch
        descriptions = [tx.description.lower() for tx in batch]
        try:
            results = await asyncio.to_thread(
                classifier,
                descriptions,
                labels,
                truncation=True,
                max_length=128,
            )

            # Aggregate results
            for tx, result in zip(batch, results):
                category = result['labels'][0]
                categories[category] += abs(tx.amount)

            # Free up memory
            del results
            if device.type == 'cuda':
                torch.cuda.empty_cache()

        except Exception as e:
            settings.logger.error(f'Error processing batch {batch_idx}: {str(e)}')
            continue

    # Calculate percentages
    total_spent = sum(categories.values())
    percentages = {
        category: (amount / total_spent) * 100 if total_spent > 0 else 0 for category, amount in categories.items()
    }

    return {'categories': categories, 'percentages': percentages}


async def detect_anomalies(transactions: list[Transaction]) -> list[dict]:
    """Detect anomalies in transactions and provide specific reasons."""
    # Extract transaction amounts and reshape for Isolation Forest
    amounts = np.array([tx.amount for tx in transactions]).reshape(-1, 1)
    model = IsolationForest(contamination=0.05, random_state=42)
    anomalies = model.fit_predict(amounts)

    # Calculate mean and standard deviation for dynamic reason generation
    mean = np.mean(amounts)
    std = np.std(amounts)

    # Detect anomalies and generate specific reasons
    anomaly_details = []
    for tx, anomaly in zip(transactions, anomalies):
        if anomaly == -1:  # Anomaly detected
            # Calculate the Z-score for the transaction
            z_score = (tx.amount - mean) / std

            # Generate a dynamic reason
            if tx.amount > 0:
                reason = f'Unusually high income of {tx.amount} detected ' f'(Z-score: {z_score:.2f}).'
            elif tx.amount < 0 and abs(tx.amount) > abs(mean) + 2 * std:
                reason = f'Unusually large expense of {tx.amount} detected ' f'(Z-score: {z_score:.2f}).'
            elif tx.amount < 0 and 'luxury' in tx.description.lower():
                reason = 'Uncommon luxury expense detected.'
            elif tx.amount < 0 and 'groceries' in tx.description.lower():
                reason = 'Unusually high grocery expense detected.'
            else:
                reason = f'Outlier transaction with amount {tx.amount} (Z-score: {z_score:.2f}).'

            # Append the anomaly details
            anomaly_details.append(
                {
                    'date': tx.date,
                    'description': tx.description,
                    'amount': tx.amount,
                    'reason': reason,
                }
            )

    return anomaly_details


async def analyze_spending(transactions: list[Transaction]) -> dict:
    """Generate spending analysis with cumulative balance"""
    total_spent = sum(tx.amount for tx in transactions if tx.amount < 0)
    total_income = sum(tx.amount for tx in transactions if tx.amount > 0)

    # Create a DataFrame from transactions
    df = pd.DataFrame([t.__dict__ for t in transactions])

    # Ensure date parsing is correct
    df['date'] = pd.to_datetime(df['date'])
    df['date'] = df['date'].dt.tz_localize(None)

    # Group by the date and calculate daily totals
    daily_summary = df.groupby(df['date'].dt.date)['amount'].sum()

    # Sort by date to ensure cumulative calculations are correct
    df = df.sort_values(by='date')

    # Calculate the cumulative balance
    df['cumulative_balance'] = df['balance']

    # Convert daily_summary to JSON-serializable format
    daily_summary = {str(date): float(amount) for date, amount in daily_summary.items()}

    # Prepare cumulative balance as JSON-serializable format
    cumulative_balance = {row['date'].strftime('%Y-%m-%d'): row['cumulative_balance'] for _, row in df.iterrows()}

    return {
        'total_spent': abs(total_spent),
        'total_income': total_income,
        'savings_rate': (((total_income + total_spent) / total_income) * 100 if total_income else 0),
        'daily_summary': daily_summary,
        'cumulative_balance': cumulative_balance,
    }


async def predict_trends(transactions: list[Transaction]) -> dict:
    """Predict future spending trends with enhanced analysis."""
    if len(transactions) < 2:
        return {'trend': 'Not enough data'}

    # Convert dates to datetime objects first
    for tx in transactions:
        if isinstance(tx.date, str):
            tx.date = datetime.fromisoformat(tx.date.replace('Z', '+00:00'))

    # Convert dates to numeric for regression
    start_date = transactions[0].date
    dates = [(tx.date - start_date).days for tx in transactions]

    amounts = [tx.amount for tx in transactions]

    # Linear regression for trends
    coeffs = np.polyfit(dates, amounts, 1)
    trend = 'increasing' if coeffs[0] > 0 else 'decreasing'

    # Include confidence interval (optional)
    slope, _ = coeffs

    # Estimated monthly spend
    df = pd.DataFrame([t.__dict__ for t in transactions])
    df['date'] = pd.to_datetime(df['date'])
    df['date'] = df['date'].dt.tz_localize(None)
    months = len(df['date'].dt.to_period('M').unique())

    return {
        'trend': trend,
        'trend_slope': slope,
        'estimated_monthly_spend': abs(sum(tx.amount for tx in transactions if tx.amount < 0)) / (months or 1),
    }
