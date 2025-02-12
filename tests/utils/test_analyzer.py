import uuid
from datetime import datetime, timedelta
from unittest.mock import patch

import torch

from src.utils.analyzer import analyze_transactions, classify_transactions
from src.utils.base import (
    analyze_recurring_transactions,
    analyze_spending,
    calculate_financial_health,
    detect_anomalies,
    predict_trends,
    validate_and_convert_transactions,
)
from tests import BaseAsyncTestClass


class TestAnalyzer(BaseAsyncTestClass):
    @patch(
        'src.utils.analyzer.pipeline', return_value=lambda *args, **kwargs: [{'labels': ['groceries'], 'scores': [1.0]}]
    )
    async def test_analyze_transactions_valid(self, mock_pipeline):
        tx_data = [
            {
                '_id': str(uuid.uuid4()),
                'date': '2024-01-01T00:00:00',
                'createdAt': '2024-01-01T00:00:00',
                'updatedAt': '2024-01-01T00:00:00',
                'description': 'Test expense',
                'amount': -100,
                'balance': 900,
                'type': 'expense',
                'userId': '1',
            },
            {
                '_id': str(uuid.uuid4()),
                'date': '2024-01-02T00:00:00',
                'createdAt': '2024-01-02T00:00:00',
                'updatedAt': '2024-01-02T00:00:00',
                'description': 'Salary',
                'amount': 2000,
                'balance': 2900,
                'type': 'income',
                'userId': '1',
            },
        ]
        result = await analyze_transactions(tx_data)
        self.assertIn('categories', result)

    async def test_detect_anomalies(self):
        # Create transactions with a clear anomaly
        tx1 = self.create_transaction_dict('2024-01-01T00:00:00', 'Normal expense', -100.0, 900.0, 'expense')
        tx2 = self.create_transaction_dict('2024-01-02T00:00:00', 'Outlier expense', -5000.0, -4100.0, 'expense')
        tx3 = self.create_transaction_dict('2024-01-03T00:00:00', 'Normal expense', -150.0, 750.0, 'expense')
        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])
        anomalies = detect_anomalies(transactions)
        self.assertIsInstance(anomalies, list)
        self.assertTrue(len(anomalies) > 0, "Expected at least one anomaly to be detected")
        self.assertTrue(all('reason' in anomaly for anomaly in anomalies))
        # Verify that the large expense is flagged
        large_anomaly = next((a for a in anomalies if a['amount'] == -5000.0), None)
        self.assertIsNotNone(large_anomaly, "Expected the large expense to be detected as an anomaly")

    async def test_analyze_spending(self):
        tx1 = self.create_transaction_dict('2024-01-01T00:00:00', 'Expense', -100.0, 900.0, 'expense')
        tx2 = self.create_transaction_dict('2024-01-02T00:00:00', 'Salary', 2000.0, 2900.0, 'income')
        transactions = await validate_and_convert_transactions([tx1, tx2])
        spending = analyze_spending(transactions)
        self.assertIn('total_spent', spending)
        self.assertIn('total_income', spending)
        self.assertIn('daily_summary', spending)
        self.assertIn('cumulative_balance', spending)
        self.assertEqual(spending['total_spent'], 100)
        self.assertEqual(spending['total_income'], 2000)

    async def test_predict_trends(self):
        txs = [
            self.create_transaction_dict('2024-01-01T00:00:00', 'Expense', -100.0, 900.0, 'expense'),
            self.create_transaction_dict('2024-01-02T00:00:00', 'Expense', -150.0, 750.0, 'expense'),
            self.create_transaction_dict('2024-01-03T00:00:00', 'Salary', 2000.0, 2750.0, 'income'),
        ]
        transactions = await validate_and_convert_transactions(txs)
        trends = predict_trends(transactions)
        self.assertIn('trend', trends)
        self.assertIn('trend_slope', trends)
        self.assertIn('estimated_monthly_spend', trends)
        self.assertGreaterEqual(trends['estimated_monthly_spend'], 0)

    async def test_classify_transactions_pattern_matching(self):
        """
        Test that transactions with descriptions matching common patterns
        are categorized correctly without invoking the ML pipeline.
        """
        # Create dummy transactions that should match predefined patterns
        tx1 = self.create_transaction_dict('2024-01-01T00:00:00', 'Walmart grocery purchase', -50.0, 950.0, 'expense')
        tx2 = self.create_transaction_dict('2024-01-02T00:00:00', 'Uber ride', -20.0, 930.0, 'expense')
        tx3 = self.create_transaction_dict('2024-01-03T00:00:00', 'Netflix subscription', -15.0, 915.0, 'expense')
        tx4 = self.create_transaction_dict('2024-01-04T00:00:00', 'Salary', 3000.0, 3915.0, 'income')

        # We assume pattern matching is applied first
        transactions = await validate_and_convert_transactions([tx1, tx2, tx3, tx4])
        # Call classify_transactions without a WebSocket manager
        result = await classify_transactions(transactions)
        categories = result.get('expenses', {})
        income_total = result.get('income', 0)

        # Check that the descriptions are mapped to expected categories:
        # "Walmart grocery" should fall under 'groceries'
        self.assertIn('groceries', categories)
        self.assertGreater(categories['groceries'], 0)

        # "Uber ride" should fall under 'transportation'
        self.assertIn('transportation', categories)
        self.assertGreater(categories['transportation'], 0)

        # "Netflix subscription" should be captured under 'subscriptions'
        self.assertIn('subscriptions', categories)
        self.assertGreater(categories['subscriptions'], 0)

        # Income should include the salary
        self.assertEqual(income_total, 3000)

    @patch.dict(
        'os.environ',
        {"LABELS": "groceries,housing,transportation,entertainment,utilities,education,credit_cards,insurance,other"},
    )
    @patch('src.utils.analyzer.pipeline')
    async def test_classify_transactions_ml_fallback(self, mock_pipeline):
        # Simulate a transaction with an unmatched description
        tx1 = self.create_transaction_dict(
            '2024-01-05T00:00:00', 'Unusual expense with no pattern', -75.0, 840.0, 'expense'
        )

        # Setup the fake pipeline result
        fake_result = [{'labels': ['other'], 'scores': [0.95]}]
        mock_pipeline.return_value = lambda *args, **kwargs: fake_result

        transactions = await validate_and_convert_transactions([tx1])
        result = await classify_transactions(transactions)
        categories = result.get('expenses', {})

        # Expect that the ML fallback has assigned this expense to 'other'
        self.assertIn('other', categories)
        self.assertAlmostEqual(categories['other'], 75 * 0.95, places=2)

    async def test_analyze_recurring_transactions_monthly(self):
        """
        Test that transactions with the same description and a roughly monthly interval
        are detected as recurring.
        """

        base_date = datetime(2024, 1, 1)
        # Create 3 monthly transactions (interval ~30 days)
        tx1 = self.create_transaction_dict((base_date).isoformat(), 'Gym membership', -50.0, 950.0, 'expense')
        tx2 = self.create_transaction_dict(
            (base_date + timedelta(days=30)).isoformat(), 'Gym membership', -50.0, 900.0, 'expense'
        )
        tx3 = self.create_transaction_dict(
            (base_date + timedelta(days=60)).isoformat(), 'Gym membership', -50.0, 850.0, 'expense'
        )

        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])

        recurring = analyze_recurring_transactions(transactions)
        self.assertTrue(len(recurring) > 0)
        monthly_recurring = next((r for r in recurring if r['frequency'] == 'Monthly'), None)
        self.assertIsNotNone(monthly_recurring)
        self.assertEqual(monthly_recurring['description'], 'gym membership')

    async def test_analyze_recurring_transactions_weekly(self):
        """
        Test that transactions with the same description and a roughly weekly interval
        are detected as recurring.
        """

        base_date = datetime(2024, 1, 1)
        # Create 3 weekly transactions (interval ~7 days)
        tx1 = self.create_transaction_dict((base_date).isoformat(), 'Weekly yoga class', -20.0, 980.0, 'expense')
        tx2 = self.create_transaction_dict(
            (base_date + timedelta(days=7)).isoformat(), 'Weekly yoga class', -20.0, 960.0, 'expense'
        )
        tx3 = self.create_transaction_dict(
            (base_date + timedelta(days=14)).isoformat(), 'Weekly yoga class', -20.0, 940.0, 'expense'
        )

        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])

        recurring = analyze_recurring_transactions(transactions)
        self.assertTrue(len(recurring) > 0)
        weekly_recurring = next((r for r in recurring if r['frequency'] == 'Weekly'), None)
        self.assertIsNotNone(weekly_recurring)
        self.assertEqual(weekly_recurring['description'], 'weekly yoga class')

    async def test_calculate_financial_health(self):
        """
        Test the calculation of financial health indicators.
        """

        # Create a sequence of transactions:
        # Assume the following scenario:
        #   - Start balance: 1000, End balance: 1500
        #   - Total income: 5000, Total expenses: 3000
        #   - Debt-to-income ratio should be 3000/5000 = 0.6 (which is above the guideline)
        #   - Savings rate: (5000 - 3000)/5000 * 100 = 40%
        #   - Balance growth: (1500 - 1000)/1000 * 100 = 50%
        tx1 = self.create_transaction_dict('2024-01-01T00:00:00', 'Initial balance', 0, 1000, 'other')
        tx2 = self.create_transaction_dict('2024-01-02T00:00:00', 'Salary', 5000, 6000, 'income')
        tx3 = self.create_transaction_dict('2024-01-03T00:00:00', 'Rent', -3000, 1500, 'expense')

        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])

        health = calculate_financial_health(transactions)
        self.assertIn('debt_to_income_ratio', health)
        self.assertIn('savings_rate', health)
        self.assertIn('balance_growth_rate', health)
        self.assertIn('financial_health_score', health)
        self.assertAlmostEqual(health['debt_to_income_ratio'], 0.6, places=2)
        self.assertAlmostEqual(health['savings_rate'], 40.0, places=2)
        self.assertAlmostEqual(health['balance_growth_rate'], 50.0, places=2)
        # Since debt ratio is high, the score should be penalized accordingly.
        self.assertTrue(health['financial_health_score'] < 100)

    def test_edge_empty_transactions(self):
        """
        Ensure that functions gracefully handle an empty list of transactions.
        """
        # predict_trends should return a message indicating insufficient data
        trends = predict_trends([])
        self.assertIn('trend', trends)
        self.assertEqual(trends['trend'], 'Not enough data')

        # calculate_financial_health on empty list should not crash (might return infinity or 0)
        health = calculate_financial_health([])
        self.assertIn('debt_to_income_ratio', health)
        self.assertIn('savings_rate', health)
        self.assertIn('balance_growth_rate', health)
        self.assertIn('financial_health_score', health)

    async def test_not_transaction_analyzer(self):
        """
        Ensure that functions gracefully handle invalid transaction data.
        """
        analysis = await analyze_transactions(None, self.websocket_manager)
        self.assertIn('error', analysis)
        self.assertEqual(analysis['error'], 'No transactions provided')
        self.assertTrue(self.fake_ws.messages)

    async def test_analyze_transactions_with_websocket(self):
        """Test the analyze_transactions function with a WebSocketManager."""
        # Create an invalid transaction
        tx_1 = [
            {
                '_id': str(uuid.uuid4()),
                'date': '2024-01-01T00:00:00',
                'createdAt': '2024-01-01T00:00:00',
                'updatedAt': '2024-01-01T00:00:00',
                'description': 'Test expense',
                'amount': -100,
                'type': 'expense',
                'userId': '1',
            }
        ]

        result = await analyze_transactions(tx_1, self.websocket_manager)
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'No valid transactions provided')
        # Check that progress messages were sent
        self.assertTrue(self.fake_ws.messages)

        # Create valid transactions
        tx_2 = self.create_transaction_dict('2024-01-01T00:00:00', 'Salary', 2000, 2900, 'income')
        result = await analyze_transactions([tx_2], self.websocket_manager)
        self.assertIn('categories', result)
        # Check that progress messages were sent
        self.assertTrue(self.fake_ws.messages)

    @patch('src.utils.analyzer.validate_and_convert_transactions')
    async def test_analyze_transactions_classification_exception(self, mock_validate):
        """Test analyze_transactions handling when classification fails"""
        valid_tx = self.create_transaction_dict('2024-01-01T00:00:00', 'Salary', 2000, 2900, 'income')
        mock_validate.side_effect = ValueError('Mock classification error')
        result = await analyze_transactions(valid_tx, self.websocket_manager)
        self.assertIn('error', result)
        msg = self.fake_ws.messages[-1]
        self.assertEqual(msg['action'], 'progress')
        self.assertEqual(msg['message'], 'Analysis failed')
        self.assertEqual(msg['taskType'], 'Analysis')

    @patch('src.utils.analyzer.pipeline')
    async def test_classify_transactions_exception(self, mock_pipeline):
        """Test classify_transactions handling when pipeline fails"""
        tx = self.create_transaction_dict('2024-01-01T00:00:00', 'Test expense', -100, 900, 'expense')
        transactions = await validate_and_convert_transactions([tx])
        mock_pipeline.side_effect = RuntimeError('Mock pipeline error')

        result = await classify_transactions(transactions, self.websocket_manager)

        # Check error response
        self.assertIn('error', result)
        self.assertTrue('Classification failed' in result['error'])

        # Check websocket message
        msg = self.fake_ws.messages[-1]
        self.assertEqual(msg['action'], 'progress')
        self.assertEqual(msg['message'], 'Analysis failed')
        self.assertEqual(msg['taskType'], 'Analysis')

    @patch('src.utils.analyzer.get_device')
    @patch('src.utils.analyzer.pipeline')
    async def test_classify_transactions_device_cpu(self, mock_pipeline, mock_device):
        """Test that classify_transactions uses CPU device for the pipeline."""
        tx = self.create_transaction_dict('2024-01-01T00:00:00', 'Test expense', -100, 900, 'expense')
        transactions = await validate_and_convert_transactions([tx])
        mock_device.return_value = (torch.device('cpu'), 'CPU')
        await classify_transactions(transactions, self.websocket_manager)
        mock_pipeline.assert_called_once_with('zero-shot-classification', model='facebook/bart-large-mnli', device=-1)

    @patch('src.utils.analyzer.get_device')
    @patch('src.utils.analyzer.pipeline')
    async def test_classify_transactions_device_gpu(self, mock_pipeline, mock_device):
        """Test that classify_transactions uses GPU device for the pipeline."""
        tx = self.create_transaction_dict('2024-01-01T00:00:00', 'Test expense', -100, 900, 'expense')
        transactions = await validate_and_convert_transactions([tx])
        mock_device.return_value = (torch.device('cuda'), 'GPU')
        await classify_transactions(transactions, self.websocket_manager)
        mock_pipeline.assert_called_once_with('zero-shot-classification', model='facebook/bart-large-mnli', device=0)
