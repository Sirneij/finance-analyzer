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


async def analyze_transactions(
    transactions: list[dict], ws_manager: WebSocketManager = None
) -> dict:
    """Analyze transactions and return insights with progress updates."""
    try:
        # Step 1: Validate and preprocess transactions
        if ws_manager:
            await ws_manager.send_progress(
                'Validating transactions...', 0.1, 'Analysis'
            )

        if not transactions:
            if ws_manager:
                await ws_manager.send_progress(
                    'No transactions provided', 1.0, 'Summarize'
                )
            return {'error': 'No transactions provided'}

        tx_objects = [
            Transaction(
                _id=t['_id'],
                balance=float(t['balance']),
                type=t['type'],
                date=datetime.fromisoformat(t['date']),
                description=t['description'],
                amount=float(t['amount']),
                userId=t['userId'],
                createdAt=datetime.fromisoformat(t['createdAt']),
                updatedAt=datetime.fromisoformat(t['updatedAt']),
            )
            for t in transactions
            if validate_transaction(t)
        ]

        if not tx_objects:
            if ws_manager:
                await ws_manager.send_progress(
                    'No valid transactions provided', 1.0, 'Analysis'
                )
            return {'error': 'No valid transactions provided'}

        # Step 2: Classification
        if ws_manager:
            await ws_manager.send_progress(
                'Classifying transactions...', 0.2, 'Analysis'
            )
        categories = await classify_transactions(tx_objects)

        # Step 3: Anomaly Detection
        if ws_manager:
            await ws_manager.send_progress('Detecting anomalies...', 0.4, 'Analysis')
        anomalies = await detect_anomalies(tx_objects)

        # Step 4: Spending Analysis
        if ws_manager:
            await ws_manager.send_progress('Analyzing spending...', 0.6, 'Analysis')
        spending_analysis = await analyze_spending(tx_objects)

        # Step 5: Trend Prediction
        if ws_manager:
            await ws_manager.send_progress(
                'Predicting spending trends...', 0.8, 'Analysis'
            )
        spending_trends = await predict_trends(tx_objects)

        # Compile the results
        result = {
            'categories': categories,
            'anomalies': anomalies,
            'spending_analysis': spending_analysis,
            'spending_trends': spending_trends,
        }

        settings.logger.info('Transaction analysis completed successfully')
        return result

    except Exception as e:
        settings.logger.error(f'Error analyzing transactions: {str(e)}', exc_info=True)
        if ws_manager:
            await ws_manager.send_progress('Analysis failed', 1.0)
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


async def classify_transactions(transactions: list[Transaction]) -> dict:
    """
    Classify transactions using FinBERT.
    """
    # Get device (GPU if available, otherwise CPU)
    device, device_name = get_device()
    settings.logger.info(f'Using device for classification: {device_name}')
    # Load FinBERT classification pipeline
    classifier = pipeline(
        'zero-shot-classification',
        model='yiyanghkust/finbert-tone',
        device=0 if device.type in ['cuda', 'mps'] else -1,  # Use GPU if available
    )

    # Define financial categories
    labels = os.getenv(
        'LABELS', 'groceries,housing,transportation,entertainment,utilities,other'
    ).split(',')

    # Prepare transaction descriptions for classification
    descriptions = [tx.description.lower() for tx in transactions]

    # Batch classify descriptions (Improves performance)
    results = await asyncio.to_thread(
        classifier, descriptions, labels, truncation=True, max_length=128
    )

    # Initialize categories and percentages
    categories = {label: 0 for label in labels}

    # Aggregate classification results
    for tx, result in zip(transactions, results):
        category = result['labels'][0]
        categories[category] += abs(tx.amount)

    total_spent = sum(categories.values())

    # Calculate percentages
    percentages = {
        category: (amount / total_spent) * 100 if total_spent > 0 else 0
        for category, amount in categories.items()
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
                reason = (
                    f'Unusually high income of {tx.amount} detected '
                    f'(Z-score: {z_score:.2f}).'
                )
            elif tx.amount < 0 and abs(tx.amount) > abs(mean) + 2 * std:
                reason = (
                    f'Unusually large expense of {tx.amount} detected '
                    f'(Z-score: {z_score:.2f}).'
                )
            elif tx.amount < 0 and 'luxury' in tx.description.lower():
                reason = 'Uncommon luxury expense detected.'
            elif tx.amount < 0 and 'groceries' in tx.description.lower():
                reason = 'Unusually high grocery expense detected.'
            else:
                reason = f'Outlier transaction with amount {tx.amount} (Z-score: {z_score:.2f}).'

            # Append the anomaly details
            anomaly_details.append(
                {
                    'date': tx.date.isoformat(),
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
    cumulative_balance = {
        row['date'].strftime('%Y-%m-%d'): row['cumulative_balance']
        for _, row in df.iterrows()
    }

    return {
        'total_spent': abs(total_spent),
        'total_income': total_income,
        'savings_rate': (
            ((total_income + total_spent) / total_income) * 100 if total_income else 0
        ),
        'daily_summary': daily_summary,
        'cumulative_balance': cumulative_balance,
    }


async def predict_trends(transactions: list[Transaction]) -> dict:
    """Predict future spending trends with enhanced analysis."""
    if len(transactions) < 2:
        return {'trend': 'Not enough data'}

    # Convert dates to numeric for regression
    dates = [(tx.date - transactions[0].date).days for tx in transactions]
    amounts = [tx.amount for tx in transactions]

    # Linear regression for trends
    coeffs = np.polyfit(dates, amounts, 1)
    trend = 'increasing' if coeffs[0] > 0 else 'decreasing'

    # Include confidence interval (optional)
    slope, intercept = coeffs
    trend_line = [slope * x + intercept for x in dates]

    # Estimated monthly spend
    df = pd.DataFrame([t.__dict__ for t in transactions])
    df['date'] = pd.to_datetime(df['date'])
    df['date'] = df['date'].dt.tz_localize(None)
    months = len(df['date'].dt.to_period('M').unique())

    return {
        'trend': trend,
        'trend_slope': slope,
        'estimated_monthly_spend': abs(
            sum(tx.amount for tx in transactions if tx.amount < 0)
        )
        / (months or 1),
    }
