import asyncio
from datetime import datetime

import pandas as pd

from src.models.base import Transaction
from src.utils.base import (
    analyze_recurring_transactions,
    analyze_spending,
    calculate_financial_health,
    calculate_percentage_change,
    calculate_totals,
    calculate_trend,
    detect_anomalies,
    predict_trends,
    update_progress,
    validate_and_convert_transactions,
)
from src.utils.settings import base_settings as settings
from src.utils.websocket import WebSocketManager


def calculate_metrics(
    tx_objects: list[Transaction], total_spent: float, total_income: float
) -> tuple[float, int, int, int, float, float]:
    """Calculate savings, counts, and average amounts."""
    total_savings = total_income + total_spent
    total_transactions = len(tx_objects)
    expense_count = sum(1 for tx in tx_objects if tx.amount < 0)
    income_count = sum(1 for tx in tx_objects if tx.amount > 0)
    avg_expense = abs(total_spent / expense_count) if expense_count > 0 else 0
    avg_income = total_income / income_count if income_count > 0 else 0
    return total_savings, total_transactions, expense_count, income_count, avg_expense, avg_income


def calculate_date_range_and_largest(tx_objects: list[Transaction]) -> tuple[datetime, datetime, float, float]:
    """Determine the date range and largest transactions."""
    if len(tx_objects) > 1:
        start_date = min(tx.date for tx in tx_objects)
        end_date = max(tx.date for tx in tx_objects)
    else:
        start_date = end_date = tx_objects[0].date

    expense_values = [tx.amount for tx in tx_objects if tx.amount < 0]
    income_values = [tx.amount for tx in tx_objects if tx.amount > 0]
    largest_expense = min(expense_values, default=0)
    largest_income = max(income_values, default=0)
    return start_date, end_date, largest_expense, largest_income


def generate_monthly_summary_and_trends(tx_objects: list[Transaction]) -> tuple[dict, pd.Series, pd.Series, pd.Series]:
    """
    Generate monthly summaries and return:
      - monthly_summary: dict mapping month to income, expenses, and savings
      - monthly_income: pd.Series with income per month
      - monthly_expense: pd.Series with expense per month
      - monthly_savings: pd.Series with savings per month
    """
    df = pd.DataFrame([t.__dict__ for t in tx_objects])
    df['date'] = pd.to_datetime(df['date'])
    monthly_income = df[df['amount'] > 0].groupby(df['date'].dt.to_period('M'))['amount'].sum()
    monthly_expense = df[df['amount'] < 0].groupby(df['date'].dt.to_period('M'))['amount'].sum().abs()
    monthly_savings = (monthly_income - monthly_expense).fillna(0)
    monthly_summary = {
        str(month): {
            'income': float(monthly_income.get(month, 0)),
            'expenses': float(monthly_expense.get(month, 0)),
            'savings': float(monthly_savings.get(month, 0)),
        }
        for month in monthly_income.index.union(monthly_expense.index)
    }
    return monthly_summary, monthly_income, monthly_expense, monthly_savings


async def summarize_transactions(transactions: list[dict], ws_manager: WebSocketManager = None) -> dict:
    """Summarize transaction data."""
    try:
        # Step 0: Validate and convert transactions.
        await update_progress(ws_manager, 'Validating transactions...', 0.0, 'Summarize')
        if not transactions:
            await update_progress(ws_manager, 'No transactions provided', 1.0, 'Summarize')
            return {'error': 'No transactions provided'}
        tx_objects = await validate_and_convert_transactions(transactions)
        if not tx_objects:
            settings.logger.warning('No valid transactions provided')
            await update_progress(ws_manager, 'No valid transactions provided', 1.0, 'Summarize')
            return {'error': 'No valid transactions provided'}

        await update_progress(ws_manager, 'Transactions validated', 0.10, 'Summarize')

        # Step 1: Calculate totals.
        total_spent, total_income = calculate_totals(tx_objects)
        await update_progress(ws_manager, 'Totals calculated', 0.20, 'Summarize')

        # Step 2: Calculate additional metrics.
        total_savings, total_transactions, expense_count, income_count, avg_expense, avg_income = calculate_metrics(
            tx_objects, total_spent, total_income
        )
        await update_progress(ws_manager, 'Additional metrics calculated', 0.35, 'Summarize')

        # Step 3: Determine date range and largest transactions.
        start_date, end_date, largest_expense, largest_income = calculate_date_range_and_largest(tx_objects)
        await update_progress(ws_manager, 'Date range and largest transactions identified', 0.50, 'Summarize')

        # Step 4: Generate monthly summary and calculate trends.
        await update_progress(ws_manager, 'Generating monthly summaries...', 0.60, 'Summarize')
        monthly_summary, monthly_income, monthly_expense, monthly_savings = generate_monthly_summary_and_trends(
            tx_objects
        )

        await update_progress(ws_manager, 'Calculating trends...', 0.65, 'Summarize')
        income_trend = await calculate_trend(monthly_income)
        expense_trend = await calculate_trend(monthly_expense)
        savings_trend = await calculate_trend(monthly_savings)
        income_change = await calculate_percentage_change(monthly_income)
        expense_change = await calculate_percentage_change(monthly_expense)
        savings_change = await calculate_percentage_change(monthly_savings)

        await update_progress(ws_manager, 'Monthly summaries and trends calculated', 0.70, 'Summarize')

        savings_rate = ((total_income + total_spent) / total_income) * 100 if total_income else 0

        # Step 5: Offload heavy synchronous computations concurrently.
        await update_progress(ws_manager, 'Detecting anomalies...', 0.75, 'Summarize')
        anomalies_future = asyncio.to_thread(detect_anomalies, tx_objects)

        await update_progress(ws_manager, 'Analyzing spending...', 0.80, 'Summarize')
        spending_analysis_future = asyncio.to_thread(analyze_spending, tx_objects)

        await update_progress(ws_manager, 'Predicting spending trends...', 0.85, 'Summarize')
        spending_trends_future = asyncio.to_thread(predict_trends, tx_objects)

        await update_progress(ws_manager, 'Analyzing recurring transactions...', 0.88, 'Summarize')
        recurring_transactions_future = asyncio.to_thread(analyze_recurring_transactions, tx_objects)

        await update_progress(ws_manager, 'Calculating financial health...', 0.92, 'Summarize')
        financial_health_future = asyncio.to_thread(calculate_financial_health, tx_objects)

        # Await offloaded tasks concurrently.
        anomalies, spending_analysis, spending_trends, recurring_transactions, financial_health = await asyncio.gather(
            anomalies_future,
            spending_analysis_future,
            spending_trends_future,
            recurring_transactions_future,
            financial_health_future,
        )

        await update_progress(ws_manager, 'Finalizing summary...', 0.95, 'Summarize')

        # Compile the summary dictionary.
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
            'anomalies': anomalies,
            'spending_analysis': spending_analysis,
            'spending_trends': spending_trends,
            'recurring_transactions': recurring_transactions,
            'financial_health': financial_health,
        }
        settings.logger.info('Transaction summarization completed successfully')
        return summary
    except Exception as e:
        settings.logger.error(f'Error summarizing transactions: {str(e)}')
        await update_progress(ws_manager, 'Summarization failed', 1.0, 'Summarize')
        return {'error': f'Summarization failed: {str(e)}'}
