import uuid
from datetime import datetime, timedelta

import pandas as pd

from src.utils.summarize import (
    calculate_percentage_change,
    calculate_trend,
    summarize_transactions,
)
from tests.utils import BaseUtilsTestClass


class TestSummarizeTransactions(BaseUtilsTestClass):
    async def test_empty_transactions(self):
        # Should return an error if no transactions are provided.
        result = await summarize_transactions([])
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'No transactions provided')

    async def test_no_valid_transactions(self):
        # A transaction missing required fields (e.g., 'balance') should be skipped.
        tx_invalid = {
            '_id': str(uuid.uuid4()),
            'date': datetime.now().isoformat(),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'description': 'Invalid transaction',
            'amount': -100,
            # 'balance' is missing
            'type': 'expense',
            'userId': '1',
        }
        result = await summarize_transactions([tx_invalid])
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'No valid transactions provided')

    async def test_summarize_single_month(self):
        # All transactions occur in January 2024.
        base_date = datetime(2024, 1, 5)
        tx1 = self.create_transaction_dict(base_date, 'Salary', 5000, 5000, 'income')
        tx2 = self.create_transaction_dict(base_date + timedelta(days=5), 'Rent', -1500, 3500, 'expense')
        tx3 = self.create_transaction_dict(base_date + timedelta(days=10), 'Groceries', -200, 3300, 'expense')

        transactions = [tx1, tx2, tx3]
        summary = await summarize_transactions(transactions)

        # Totals
        self.assertAlmostEqual(summary['income']['total'], 5000)
        self.assertAlmostEqual(summary['expenses']['total'], 1700)  # absolute value of total expense
        self.assertAlmostEqual(summary['savings']['total'], 5000 - 1700)
        self.assertEqual(summary['total_transactions'], 3)
        self.assertEqual(summary['expense_count'], 2)
        self.assertEqual(summary['income_count'], 1)
        self.assertAlmostEqual(summary['avg_expense'], 1700 / 2)
        self.assertAlmostEqual(summary['avg_income'], 5000)

        # Date range
        self.assertEqual(summary['start_date'], base_date.isoformat())
        self.assertEqual(summary['end_date'], (base_date + timedelta(days=10)).isoformat())

        # Largest transactions
        self.assertEqual(summary['largest_expense'], -1500)  # the most negative value among expenses
        self.assertEqual(summary['largest_income'], 5000)

        # Savings rate calculation: ((5000 + (-1700)) / 5000) * 100 = 66%
        self.assertAlmostEqual(summary['savings_rate'], (5000 - 1700) / 5000 * 100, places=2)

        # Monthly summary: only one month should be present.
        self.assertEqual(len(summary['monthly_summary']), 1)
        month_key = list(summary['monthly_summary'].keys())[0]
        self.assertAlmostEqual(summary['monthly_summary'][month_key]['income'], 5000)
        self.assertAlmostEqual(summary['monthly_summary'][month_key]['expenses'], 1700)
        self.assertAlmostEqual(summary['monthly_summary'][month_key]['savings'], 5000 - 1700)

        # Trends: with one month, trends should be 'neutral' and percentage change 0.
        self.assertEqual(summary['income']['trend'], 'neutral')
        self.assertEqual(summary['expenses']['trend'], 'neutral')
        self.assertEqual(summary['savings']['trend'], 'neutral')
        self.assertAlmostEqual(summary['income']['change'], 0)
        self.assertAlmostEqual(summary['expenses']['change'], 0)
        self.assertAlmostEqual(summary['savings']['change'], 0)

    async def test_summarize_multiple_months(self):
        # Transactions spanning January and February 2024.
        jan_date = datetime(2024, 1, 10)
        feb_date = datetime(2024, 2, 10)

        # January: Income 4000, Expense -2000
        tx1 = self.create_transaction_dict(jan_date, 'Salary', 4000, 4000, 'income')
        tx2 = self.create_transaction_dict(jan_date + timedelta(days=2), 'Rent', -2000, 2000, 'expense')

        # February: Income 5000, Expense -2500
        tx3 = self.create_transaction_dict(feb_date, 'Salary', 5000, 5000, 'income')
        tx4 = self.create_transaction_dict(feb_date + timedelta(days=3), 'Rent', -2500, 2500, 'expense')

        transactions = [tx1, tx2, tx3, tx4]
        summary = await summarize_transactions(transactions)

        # Totals
        self.assertAlmostEqual(summary['income']['total'], 4000 + 5000)
        self.assertAlmostEqual(summary['expenses']['total'], 2000 + 2500)
        self.assertAlmostEqual(summary['savings']['total'], (4000 + 5000) - (2000 + 2500))

        # Monthly summary should have two keys: '2024-01' and '2024-02'.
        self.assertEqual(len(summary['monthly_summary']), 2)
        self.assertIn('2024-01', summary['monthly_summary'])
        self.assertIn('2024-02', summary['monthly_summary'])
        self.assertAlmostEqual(summary['monthly_summary']['2024-01']['income'], 4000)
        self.assertAlmostEqual(summary['monthly_summary']['2024-01']['expenses'], 2000)
        self.assertAlmostEqual(summary['monthly_summary']['2024-01']['savings'], 4000 - 2000)
        self.assertAlmostEqual(summary['monthly_summary']['2024-02']['income'], 5000)
        self.assertAlmostEqual(summary['monthly_summary']['2024-02']['expenses'], 2500)
        self.assertAlmostEqual(summary['monthly_summary']['2024-02']['savings'], 5000 - 2500)

        # Trends: With two months, due to insufficient prior data for a robust trend calculation,
        # the function is likely to return 'neutral'.
        self.assertEqual(summary['income']['trend'], 'neutral')
        self.assertEqual(summary['expenses']['trend'], 'neutral')
        self.assertEqual(summary['savings']['trend'], 'neutral')

        # Percentage changes: For income, highest = 5000, recent_avg = (4000+5000)/2 = 4500 → change = ((4500 - 5000)/5000)*100 ≈ -10%
        self.assertAlmostEqual(summary['income']['change'], -10, places=0)
        self.assertAlmostEqual(summary['expenses']['change'], -10, places=0)
        self.assertAlmostEqual(summary['savings']['change'], -10, places=0)

    async def test_invalid_transaction_filtering(self):
        # One valid transaction and one invalid transaction.
        valid_tx = self.create_transaction_dict(datetime(2024, 1, 10), 'Salary', 3000, 3000, 'income')
        invalid_tx = {
            # Missing 'balance' field.
            '_id': str(uuid.uuid4()),
            'date': datetime(2024, 1, 11).isoformat(),
            'createdAt': datetime(2024, 1, 11).isoformat(),
            'updatedAt': datetime(2024, 1, 11).isoformat(),
            'description': 'Invalid',
            'amount': -100,
            'type': 'expense',
            'userId': '1',
        }
        summary = await summarize_transactions([valid_tx, invalid_tx])

        # Only the valid transaction should be processed.
        self.assertEqual(summary['total_transactions'], 1)
        self.assertEqual(summary['income_count'], 1)

    async def test_calculate_trend(self):
        # Directly test calculate_trend with various pd.Series inputs.

        # Case 1: Up trend
        series_up = pd.Series([100, 150, 200])
        trend_up = await calculate_trend(series_up)
        self.assertEqual(trend_up, 'up')

        # Case 2: Down trend
        series_down = pd.Series([200, 150, 100])
        trend_down = await calculate_trend(series_down)
        self.assertEqual(trend_down, 'down')

        # Case 3: Neutral trend (all equal)
        series_neutral = pd.Series([100, 100, 100])
        trend_neutral = await calculate_trend(series_neutral)
        self.assertEqual(trend_neutral, 'neutral')

        # Case 4: Single data point
        series_single = pd.Series([100])
        trend_single = await calculate_trend(series_single)
        self.assertEqual(trend_single, 'neutral')

    async def test_calculate_percentage_change(self):
        # Test calculate_percentage_change with various inputs.

        # Example: For series [200, 150, 100]:
        # highest = 200; recent_avg = (150+100)/2 = 125
        # Change = ((125 - 200) / 200) * 100 = -37.5%
        series = pd.Series([200, 150, 100])
        change = await calculate_percentage_change(series)
        self.assertAlmostEqual(change, -37.5, places=1)

        # Single data point should yield 0% change.
        series_single = pd.Series([100])
        change_single = await calculate_percentage_change(series_single)
        self.assertEqual(change_single, 0)
