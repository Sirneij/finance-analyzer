from unittest.mock import patch

from tests import BaseAioHTTPTestCase


class TestTransactionAnalyzer(BaseAioHTTPTestCase):
    """Test the `analyze` endpoint."""

    async def test_analyze_success(self):
        """Test analyzing a list of transactions."""
        with patch('src.app.app_instance.analyze_transactions') as mock_analyze:
            mock_analyze.return_value = {
                'categories': {
                    'expenses': {
                        'groceries': 10.0,
                        'rent': 90.0,
                    },
                    'expense_percentages': {
                        'groceries': 5,
                        'rent': 45,
                    },
                    'income': 200.0,
                }
            }
            transactions = [
                self.create_transaction_dict('2022-01-01', 'Transaction 1', -10.0, 10.0),
                self.create_transaction_dict('2022-01-02', 'Transaction 2', -90.0, 100.0),
            ]
            resp = await self.client.post('/analyze', json=transactions)

            self.assertEqual(resp.status, 200)
            json_response = await resp.json()
            self.assertEqual(json_response['categories']['expenses']['groceries'], 10.0)
            self.assertEqual(json_response['categories']['expenses']['rent'], 90.0)
            self.assertEqual(json_response['categories']['expense_percentages']['groceries'], 5)
            self.assertEqual(json_response['categories']['expense_percentages']['rent'], 45)
            self.assertEqual(json_response['categories']['income'], 200.0)

    async def test_analyze_invalid_input(self):
        """Test analyzing invalid input."""
        resp = await self.client.post('/analyze', json='invalid')

        self.assertEqual(resp.status, 400)
        json_response = await resp.json()
        self.assertEqual(json_response['error'], 'Invalid input - expected list of transactions')

    async def test_analyze_empty_input(self):
        """Test analyzing an empty list of transactions."""
        resp = await self.client.post('/analyze', json=[])

        self.assertEqual(resp.status, 200)
        json_response = await resp.json()
        self.assertEqual(json_response, {'error': 'No transactions provided'})

    async def test_analyze_error(self):
        """Test analyzing transactions with an error."""
        with patch('src.app.app_instance.analyze_transactions') as mock_analyze:
            mock_analyze.side_effect = RuntimeError('Analyze error')
            transactions = [
                self.create_transaction_dict('2022-01-01', 'Transaction 1', -10.0, 10.0),
            ]
            resp = await self.client.post('/analyze', json=transactions)

            self.assertEqual(resp.status, 500)
            json_response = await resp.json()
            self.assertEqual(json_response['error'], 'Analysis failed: Analyze error')
