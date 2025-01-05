import asyncio
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from transformers import pipeline

from models.base import Transaction
from utils.settings import base_settings as settings


async def analyze_transactions(transactions: list[dict]) -> dict:
    """Analyze transactions and return insights."""
    try:
        # Validate and preprocess transactions
        tx_objects = tx_objects = [
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
            settings.logger.warning('No valid transactions provided')
            return {'error': 'No valid transactions provided'}

        results = await asyncio.gather(
            classify_transactions(tx_objects),
            detect_anomalies(tx_objects),
            analyze_spending(tx_objects),
            predict_trends(tx_objects),
        )

        return {
            'categories': results[0],
            'anomalies': results[1],
            'spending_analysis': results[2],
            'spending_trends': results[3],
        }
    except Exception as e:
        settings.logger.error(f'Error analyzing transactions: {str(e)}')
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
    """Classify transactions using an async lightweight text classification pipeline."""
    classifier = pipeline(
        'zero-shot-classification', model='distilbert-base-uncased', device=-1
    )
    labels = [
        'groceries',
        'housing',
        'transportation',
        'entertainment',
        'utilities',
        'other',
    ]

    categories = {label: 0 for label in labels}

    for tx in transactions:
        result = await asyncio.to_thread(classifier, tx.description, labels)
        category = result['labels'][0]
        categories[category] += abs(tx.amount)

    # Calculate total spending
    total_spent = sum(categories.values())

    # Calculate percentage for each category
    percentages = {
        category: (amount / total_spent) * 100 if total_spent > 0 else 0
        for category, amount in categories.items()
    }

    # Combine absolute values and percentages into a single dictionary
    return {
        'categories': categories,
        'percentages': percentages,
    }


async def detect_anomalies(transactions: list[Transaction]) -> list[dict]:
    amounts = np.array([tx.amount for tx in transactions]).reshape(-1, 1)
    model = IsolationForest(contamination=0.05, random_state=42)
    anomalies = model.fit_predict(amounts)
    return [
        {
            'date': tx.date.isoformat(),
            'description': tx.description,
            'amount': tx.amount,
            'reason': 'Anomaly detected by Isolation Forest',
        }
        for tx, anomaly in zip(transactions, anomalies)
        if anomaly == -1
    ]


async def analyze_spending(transactions: list[Transaction]) -> dict:
    """Generate spending analysis"""
    total_spent = sum(tx.amount for tx in transactions if tx.amount < 0)
    total_income = sum(tx.amount for tx in transactions if tx.amount > 0)

    # Create a DataFrame from transactions
    df = pd.DataFrame([t.__dict__ for t in transactions])

    # Ensure date parsing is correct
    df['date'] = pd.to_datetime(df['date'])

    # Group by the date and calculate daily totals
    daily_summary = df.groupby(df['date'].dt.date)['amount'].sum()

    # Convert daily_summary to JSON-serializable format
    daily_summary = {str(date): float(amount) for date, amount in daily_summary.items()}

    return {
        'total_spent': abs(total_spent),
        'total_income': total_income,
        'savings_rate': (
            (total_income + total_spent) / total_income if total_income else 0
        ),
        'daily_summary': daily_summary,
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
    months = len(df['date'].dt.to_period('M').unique())

    return {
        'trend': trend,
        'trend_slope': slope,
        'estimated_monthly_spend': abs(
            sum(tx.amount for tx in transactions if tx.amount < 0)
        )
        / (months or 1),
    }
