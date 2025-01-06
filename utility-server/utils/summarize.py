from datetime import datetime

import pandas as pd

from models.base import Transaction
from utils.analyzer import validate_transaction
from utils.settings import base_settings as settings


async def summarize_transactions(transactions: list[dict]) -> dict:
    """Summarize transaction data."""
    try:
        settings.logger.info('Starting transaction summarization')

        # Validate and convert transactions to objects
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
            settings.logger.warning('No valid transactions provided')
            return {'error': 'No valid transactions provided'}

        # Calculate total spending and income
        total_spent = sum(tx.amount for tx in tx_objects if tx.amount < 0)
        total_income = sum(tx.amount for tx in tx_objects if tx.amount > 0)

        # Calculate total savings in dollars
        total_savings = total_income + total_spent

        # Count of transactions
        total_transactions = len(tx_objects)
        expense_count = sum(1 for tx in tx_objects if tx.amount < 0)
        income_count = sum(1 for tx in tx_objects if tx.amount > 0)

        # Average transaction amounts
        avg_expense = abs(total_spent / expense_count) if expense_count > 0 else 0
        avg_income = total_income / income_count if income_count > 0 else 0

        # Date range
        start_date = min(tx.date for tx in tx_objects)
        end_date = max(tx.date for tx in tx_objects)

        # Largest single transaction
        largest_expense = min(tx.amount for tx in tx_objects if tx.amount < 0)
        largest_income = max(tx.amount for tx in tx_objects if tx.amount > 0)

        # Monthly summaries
        df = pd.DataFrame([t.__dict__ for t in tx_objects])
        df['date'] = pd.to_datetime(df['date'])
        monthly_summary = (
            df.groupby(df['date'].dt.to_period('M'))['amount'].sum().to_dict()
        )

        # Calculate trends and percentage change
        monthly_income = (
            df[df['amount'] > 0].groupby(df['date'].dt.to_period('M'))['amount'].sum()
        )
        monthly_expense = (
            df[df['amount'] < 0]
            .groupby(df['date'].dt.to_period('M'))['amount']
            .sum()
            .abs()
        )
        monthly_savings = (monthly_income - monthly_expense).fillna(0)

        income_trend = await calculate_trend(monthly_income)
        expense_trend = await calculate_trend(monthly_expense)
        savings_trend = await calculate_trend(monthly_savings)

        income_change = await calculate_percentage_change(monthly_income)
        expense_change = await calculate_percentage_change(monthly_expense)
        savings_change = await calculate_percentage_change(monthly_savings)

        # Savings rate
        savings_rate = (
            ((total_income + total_spent) / total_income) * 100 if total_income else 0
        )

        monthly_summary = {
            str(month): {
                'income': float(monthly_income.get(month, 0)),
                'expenses': float(monthly_expense.get(month, 0)),
                'savings': float(monthly_savings.get(month, 0)),
            }
            for month in monthly_income.index.union(monthly_expense.index)
        }

        # Prepare summary
        summary = {
            'income': {
                'total': total_income,
                'trend': income_trend,
                'change': income_change,
            },
            'expenses': {
                'total': abs(total_spent),
                'trend': expense_trend,
                'change': expense_change,
            },
            'savings': {
                'total': total_savings,
                'trend': savings_trend,
                'change': savings_change,
            },
            'total_transactions': total_transactions,
            'expense_count': expense_count,
            'income_count': income_count,
            'avg_expense': avg_expense,
            'avg_income': avg_income,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'largest_expense': largest_expense,
            'largest_income': largest_income,
            'savings_rate': savings_rate,
            'monthly_summary': monthly_summary,
        }

        settings.logger.info('Transaction summarization completed successfully')
        return summary
    except Exception as e:
        settings.logger.error(f'Error summarizing transactions: {str(e)}')
        return {'error': f'Summarization failed: {str(e)}'}


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

    return (
        ((recent_avg - highest_value) / highest_value) * 100
        if highest_value != 0
        else 0
    )
