from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from models.base import Transaction


async def analyze_transactions(transactions: list[dict]) -> dict:
    """Analyze transactions and return insights"""
    # Validate and preprocess transactions
    tx_objects = [
        Transaction(
            date=datetime.fromisoformat(t['date']),
            description=t['description'],
            amount=float(t['amount']),
            balance=float(t['balance']),
            type=t['type'],
            _id=t.get('_id'),
            createdAt=datetime.fromisoformat(t['createdAt']),
            updatedAt=datetime.fromisoformat(t['updatedAt']),
            userId=t['userId'],
        )
        for t in transactions
        if validate_transaction(t)
    ]

    if not tx_objects:
        return {'error': 'No valid transactions provided'}

    # 1. Classify transactions into categories
    categories = classify_transactions(tx_objects)

    # 2. Detect anomalies
    anomalies = detect_anomalies(tx_objects)

    # 3. Generate spending analysis
    spending_analysis = analyze_spending(tx_objects)

    # 4. Predict future trends
    predictions = await predict_trends(tx_objects)

    return {
        'categories': categories,
        'anomalies': anomalies,
        'spending_analysis': spending_analysis,
        'predictions': predictions,
    }


def validate_transaction(t: dict) -> bool:
    """Validate transaction fields"""
    required_fields = {'date', 'description', 'amount', 'balance', 'type', 'userId'}
    return all(field in t for field in required_fields)


def classify_transactions(transactions: list[Transaction]) -> dict[str, float]:
    """Classify transactions into categories"""
    amounts = np.array([tx.amount for tx in transactions]).reshape(-1, 1)
    scaler = StandardScaler()
    scaled_amounts = scaler.fit_transform(amounts)

    kmeans = KMeans(n_clusters=5, random_state=42)
    clusters = kmeans.fit_predict(scaled_amounts)

    categories = {
        'groceries': 0,
        'transportation': 0,
        'entertainment': 0,
        'utilities': 0,
        'other': 0,
    }

    for tx, cluster in zip(transactions, clusters):
        category = determine_category(tx, cluster)
        categories[category] += abs(tx.amount)

    return categories


def determine_category(transaction: Transaction, cluster: int) -> str:
    """Determine category for a transaction (mock logic)"""
    if 'instacart' in transaction.description.lower():
        return 'groceries'
    if 'uber' in transaction.description.lower():
        return 'transportation'
    if (
        'netflix' in transaction.description.lower()
        or 'openai' in transaction.description.lower()
    ):
        return 'entertainment'
    return 'other'


def detect_anomalies(transactions: list[Transaction]) -> list[dict]:
    """Detect anomalies based on Z-scores"""
    amounts = np.array([tx.amount for tx in transactions])
    mean = np.mean(amounts)
    std = np.std(amounts)

    anomalies = []
    for tx in transactions:
        z_score = (tx.amount - mean) / std
        if abs(z_score) > 2:
            anomalies.append(
                {
                    'date': tx.date.isoformat(),
                    'description': tx.description,
                    'amount': tx.amount,
                    'reason': 'Unusual spending pattern',
                }
            )

    return anomalies


def analyze_spending(transactions: list[Transaction]) -> dict:
    """Generate spending analysis"""
    total_spent = sum(tx.amount for tx in transactions if tx.amount < 0)
    total_income = sum(tx.amount for tx in transactions if tx.amount > 0)

    df = pd.DataFrame([t.__dict__ for t in transactions])
    # Convert date keys to ISO format strings for JSON serialization
    daily_summary = (
        df.groupby(df['date'].dt.date)['amount'].sum().apply(float).to_dict()
    )
    daily_summary = {date.isoformat(): amount for date, amount in daily_summary.items()}

    return {
        'total_spent': abs(total_spent),
        'total_income': total_income,
        'savings_rate': (
            (total_income + total_spent) / total_income if total_income else 0
        ),
        'daily_summary': daily_summary,
    }


async def predict_trends(transactions: list[Transaction]) -> dict:
    """Predict future spending trends"""
    if len(transactions) < 2:
        return {'trend': 'Not enough data'}

    dates = [(tx.date - transactions[0].date).days for tx in transactions]
    amounts = [tx.amount for tx in transactions]

    coeffs = np.polyfit(dates, amounts, 1)
    trend = 'increasing' if coeffs[0] > 0 else 'decreasing'

    df = pd.DataFrame([t.__dict__ for t in transactions])
    months = len(df['date'].dt.to_period('M').unique())

    return {
        'trend': trend,
        'estimated_monthly_spend': abs(
            sum(tx.amount for tx in transactions if tx.amount < 0)
        )
        / (months or 1),
    }
