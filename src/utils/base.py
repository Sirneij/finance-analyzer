import difflib
from datetime import datetime
from typing import List

import numpy as np
import pandas as pd
import torch

from src.models.base import Transaction
from src.utils.websocket import WebSocketManager


async def validate_and_convert_transactions(transactions: list[dict]) -> List[Transaction]:
    """
    Validate a list of transaction dictionaries and return a list of Transaction objects.

    The function:
      - Requires the following fields: '_id', 'date', 'description', 'amount',
        'balance', 'type', 'userId', 'createdAt', 'updatedAt'.
      - Filters out the '__v' field if present.
      - Converts 'amount' and 'balance' to floats.
      - Converts 'date', 'createdAt', and 'updatedAt' from strings to datetime objects
        (if they are supplied as strings).
    """
    valid_transactions = []
    # Define all required fields (including _id, createdAt, and updatedAt)
    required_fields = {'_id', 'date', 'description', 'amount', 'balance', 'type', 'userId', 'createdAt', 'updatedAt'}

    for t in transactions:
        # Skip if any required field is missing.
        if not all(field in t for field in required_fields):
            continue

        try:
            # Create a filtered copy that removes the '__v' field, if present.
            data = {k: v for k, v in t.items() if k != '__v'}

            # Convert numeric fields
            data['amount'] = float(data['amount'])
            data['balance'] = float(data['balance'])

            # Convert date fields if they are strings
            data['date'] = datetime.fromisoformat(data['date']) if isinstance(data['date'], str) else data['date']
            data['createdAt'] = (
                datetime.fromisoformat(data['createdAt']) if isinstance(data['createdAt'], str) else data['createdAt']
            )
            data['updatedAt'] = (
                datetime.fromisoformat(data['updatedAt']) if isinstance(data['updatedAt'], str) else data['updatedAt']
            )

            # Create the Transaction dataclass instance
            transaction_obj = Transaction(
                _id=data['_id'],
                amount=data['amount'],
                balance=data['balance'],
                createdAt=data['createdAt'],
                date=data['date'],
                description=data['description'],
                type=data['type'],
                updatedAt=data['updatedAt'],
                userId=data['userId'],
            )

            valid_transactions.append(transaction_obj)
        except (ValueError, TypeError):
            # Skip this transaction if any conversion fails.
            continue

    return valid_transactions


def get_device() -> tuple[torch.device, str]:
    if torch.cuda.is_available():
        return torch.device('cuda'), 'CUDA (NVIDIA GPU)'
    elif torch.backends.mps.is_available():
        return torch.device('mps'), 'MPS (Apple Metal)'
    else:
        return torch.device('cpu'), 'CPU'


def detect_anomalies(transactions: list, z_threshold: float = 3.0, global_multiplier: float = 2.0) -> list:
    """
    Detect anomalies in a list of transactions using fuzzy grouping for descriptions.

    - Transactions are first grouped using fuzzy matching.
    - For groups with only one transaction, a global threshold based on the median expense/income is used.
    - For groups with multiple transactions, a z‑score is computed.

    Returns a list of anomaly dictionaries.
    """
    # Group transactions by description using fuzzy matching.
    tx_patterns = group_transactions_by_description(transactions)

    # Compute statistics (mean, standard deviation, count) for each group.
    pattern_stats = {
        group_key: {'mean': np.mean(amounts), 'std': np.std(amounts), 'count': len(amounts)}
        for group_key, amounts in tx_patterns.items()
    }

    # Compute global medians to handle single-instance groups.
    expense_values = [abs(tx.amount) for tx in transactions if tx.amount < 0]
    income_values = [tx.amount for tx in transactions if tx.amount > 0]
    global_median_expense = np.median(expense_values) if expense_values else 0
    global_median_income = np.median(income_values) if income_values else 0

    anomalies = []
    # Prepare list of group keys for fuzzy lookup.
    group_keys = list(pattern_stats.keys())

    for tx in transactions:
        # Determine the group key for the current transaction using fuzzy matching.
        group_key = find_group_key(tx.description, group_keys, cutoff=0.9)
        stats = pattern_stats.get(group_key)
        if stats is None:
            continue

        # Skip regular transactions with many similar occurrences.
        if stats['count'] > 3 and stats['std'] < 0.1 * abs(stats['mean']):
            continue

        is_anomaly = False
        reason = ""

        # For single-instance groups, apply a global threshold check.
        if stats['count'] == 1:
            if tx.amount < 0 and abs(tx.amount) > global_multiplier * global_median_expense:
                is_anomaly = True
                reason = f"Unusual expense of {tx.amount:.2f}"
            elif tx.amount > 0 and tx.amount > global_multiplier * global_median_income:
                is_anomaly = True
                reason = f"Unusual income of {tx.amount:.2f}"
            if is_anomaly:
                anomalies.append(
                    {
                        'date': tx.date.isoformat(),
                        'description': tx.description,
                        'amount': tx.amount,
                        'reason': f"{reason} (Single instance anomaly)",
                    }
                )
            continue

        # For groups with more than one transaction, compute a z-score.
        z_score = (tx.amount - stats['mean']) / (stats['std'] if stats['std'] > 0 else 1)
        if abs(z_score) > z_threshold:
            # Optionally, you can exclude typical items (e.g., salary, rent) from anomaly detection.
            if tx.amount > 0:
                if "salary" not in tx.description.lower() and "deposit" not in tx.description.lower():
                    is_anomaly = True
                    reason = f"Unusual income of {tx.amount:.2f}"
            else:
                if "tuition" not in tx.description.lower() and "rent" not in tx.description.lower():
                    is_anomaly = True
                    reason = f"Unusual expense of {tx.amount:.2f}"
        if is_anomaly:
            anomalies.append(
                {
                    'date': tx.date.isoformat(),
                    'description': tx.description,
                    'amount': tx.amount,
                    'reason': f"{reason} (Z-score: {z_score:.2f})",
                }
            )

    return anomalies


def analyze_spending(transactions: list[Transaction]) -> dict:
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


def predict_trends(transactions: list[Transaction]) -> dict:
    if len(transactions) < 2:
        return {'trend': 'Not enough data'}

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


def analyze_recurring_transactions(transactions: list[Transaction]) -> dict:
    """Identify potential recurring transactions based on amount and frequency."""
    # Group transactions by description and amount
    recurring_candidates = {}

    for tx in transactions:
        # Create a key combining description and amount
        key = (tx.description.lower(), round(abs(tx.amount), 2))
        if key not in recurring_candidates:
            recurring_candidates[key] = []
        recurring_candidates[key].append(tx.date)

    recurring = []
    for (desc, amount), dates in recurring_candidates.items():
        if len(dates) >= 2:  # At least 2 occurrences
            dates.sort()
            # Calculate average days between transactions
            intervals = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
            avg_interval = sum(intervals) / len(intervals)
            std_interval = np.std(intervals) if len(intervals) > 1 else 0

            # If standard deviation is low, it's likely recurring
            if std_interval < 5 and 25 <= avg_interval <= 35:  # Monthly
                recurring.append(
                    {
                        'description': desc,
                        'amount': amount,
                        'frequency': 'Monthly',
                        'confidence': 'High' if std_interval < 2 else 'Medium',
                    }
                )
            elif std_interval < 3 and 6 <= avg_interval <= 8:  # Weekly
                recurring.append(
                    {
                        'description': desc,
                        'amount': amount,
                        'frequency': 'Weekly',
                        'confidence': 'High' if std_interval < 1 else 'Medium',
                    }
                )

    return recurring


def calculate_financial_health(transactions: list[Transaction]) -> dict:
    """Calculate various financial health indicators."""
    if not transactions:
        return {
            'debt_to_income_ratio': 0,
            'savings_rate': 0,
            'balance_growth_rate': 0,
            'financial_health_score': 0,
        }
    total_income = sum(tx.amount for tx in transactions if tx.amount > 0)
    total_expenses = abs(sum(tx.amount for tx in transactions if tx.amount < 0))

    # Sort transactions by date
    sorted_txs = sorted(transactions, key=lambda x: x.date)
    start_balance = sorted_txs[0].balance
    end_balance = sorted_txs[-1].balance

    # Calculate metrics
    debt_to_income = total_expenses / total_income if total_income > 0 else float('inf')
    savings_rate = (total_income - total_expenses) / total_income * 100 if total_income > 0 else 0
    balance_growth = (end_balance - start_balance) / abs(start_balance) * 100 if start_balance != 0 else 0

    return {
        'debt_to_income_ratio': round(debt_to_income, 2),
        'savings_rate': round(savings_rate, 2),
        'balance_growth_rate': round(balance_growth, 2),
        'financial_health_score': calculate_health_score(debt_to_income, savings_rate, balance_growth),
    }


def calculate_health_score(debt_ratio: float, savings_rate: float, balance_growth: float) -> int:
    """Calculate a financial health score from 0-100."""
    score = 100
    # Penalize high debt-to-income ratio more heavily
    if debt_ratio > 0.43:
        score -= 40
    elif debt_ratio > 0.36:
        score -= 15

    # Reward good savings rate
    if savings_rate >= 20:
        score += 20
    elif savings_rate >= 10:
        score += 10

    # Consider balance growth
    if balance_growth > 10:
        score += 10
    elif balance_growth < -10:
        score -= 10

    return max(0, min(100, score))


def calculate_totals(tx_objects: list[Transaction]) -> tuple[float, float]:
    """Calculate total spent and total income."""
    total_spent = sum(tx.amount for tx in tx_objects if tx.amount < 0)
    total_income = sum(tx.amount for tx in tx_objects if tx.amount > 0)
    return total_spent, total_income


async def calculate_trend(monthly_data: pd.Series) -> str:
    """
    Calculate trend ('up', 'down', 'neutral') based on monthly data.
    """
    if len(monthly_data) < 2:
        return 'neutral'

    recent_avg = monthly_data[-2:].mean()
    earlier_avg = monthly_data[:-2].mean()

    if recent_avg > earlier_avg:
        return 'up'
    elif recent_avg < earlier_avg:
        return 'down'
    else:
        return 'neutral'


async def calculate_percentage_change(monthly_data: pd.Series) -> float:
    """
    Calculate the percentage change from the highest monthly value to the average of the last two months.
    """
    if len(monthly_data) < 2:
        return 0

    highest_value = monthly_data.max()
    recent_avg = monthly_data[-2:].mean()

    return ((recent_avg - highest_value) / highest_value) * 100 if highest_value != 0 else 0


async def update_progress(
    ws_manager: WebSocketManager | None, message: str, progress: float, task: str = 'Analysis'
) -> None:
    """Helper function to handle progress updates via websocket if available."""
    if ws_manager:
        await ws_manager.send_progress(message, progress, task)


def group_transactions_by_description(transactions: list[Transaction], cutoff=0.69) -> dict:
    """
    Group transactions by description using fuzzy matching with difflib.

    Returns a dictionary mapping a representative description (the group key)
    to a list of transaction amounts. Two descriptions are grouped together if
    their similarity is above a certain threshold.
    """
    groups = {}

    for tx in transactions:
        desc = tx.description.lower().strip()
        # Try to find an existing key similar to desc.
        # difflib.get_close_matches returns a list of close matches.
        close_matches = difflib.get_close_matches(desc, groups.keys(), n=1, cutoff=cutoff)
        if close_matches:
            matched_key = close_matches[0]
        else:
            matched_key = None

        if matched_key:
            groups[matched_key].append(tx.amount)
        else:
            groups[desc] = [tx.amount]

    return groups


def find_group_key(description: str, group_keys: list, cutoff: float = 0.69) -> str:
    """
    Find the best matching key from group_keys for the given description using difflib.
    Returns the matched key if similarity is above cutoff; otherwise, returns the description.
    """
    desc = description.lower().strip()
    matches = difflib.get_close_matches(desc, group_keys, n=1, cutoff=cutoff)
    if matches:
        return matches[0]
    return desc
