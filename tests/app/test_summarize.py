from unittest.mock import patch

from tests import BaseAioHTTPTestCase


class TestSummarize(BaseAioHTTPTestCase):
    """Test the `summarize` endpoint."""

    async def test_summarize_success(self):
        """Test summarizing a list of text."""
        with patch('src.app.app_instance.summarize_transactions') as mock_summarize:
            mock_summarize.return_value = {
                'income': {
                    'total': 200.00,
                    'trend': 'neutral',
                    'change': 0.0,
                },
                'expenses': {
                    'total': 100.00,
                    'trend': 'neutral',
                    'change': 0.0,
                },
                'savings': {
                    'total': 100.00,
                    'trend': 'neutral',
                    'change': 0.0,
                },
                'total_transactions': 2,
                'expense_count': 1,
                'income_count': 1,
                'avg_expense': 100.00,
                'avg_income': 200.00,
                'start_date': '2022-01-01',
                'end_date': '2022-01-31',
                'largest_expense': 200.00,
                'largest_income': 200.00,
                'savings_rate': 50.0,
                'monthly_summary': {
                    '2022-01': {
                        'income': 200.00,
                        'expenses': 100.00,
                        'savings': 100.00,
                    },
                },
                'anomalies': [],
                'spending_analysis': {
                    'total_spent': 100.00,
                    'total_income': 200.00,
                    'savings_rate': 50.0,
                    'daily_summary': {
                        '2022-01-01': {
                            'total_spent': 100.00,
                            'total_income': 200.00,
                            'savings_rate': 50.0,
                        },
                    },
                    'cumulative_balance': {
                        '2022-01-01': 100.00,
                    },
                },
                'spending_trends': {
                    'total_spent': 100.00,
                    'total_income': 200.00,
                    'savings_rate': 50.0,
                },
                'recurring_transactions': [],
                'financial_health': {
                    'debt_to_income_ratio': 0,
                    'savings_rate': 0,
                    'balance_growth_rate': 0,
                    'financial_health_score': 0,
                },
            }
            transactions = [
                self.create_transaction_dict('2022-01-01', 'Transaction 1', -100.0, 100.0),
                self.create_transaction_dict('2022-01-02', 'Transaction 2', 200.0, 300.0),
            ]
            resp = await self.client.post('/summarize', json=transactions)

            self.assertEqual(resp.status, 200)
            json_response = await resp.json()
            self.assertEqual(json_response['income']['total'], 200.00)
            self.assertEqual(json_response['expenses']['total'], 100.00)
            self.assertEqual(json_response['savings']['total'], 100.00)
            self.assertEqual(json_response['total_transactions'], 2)
            self.assertEqual(json_response['expense_count'], 1)
            self.assertEqual(json_response['income_count'], 1)
            self.assertEqual(json_response['avg_expense'], 100.00)
            self.assertEqual(json_response['avg_income'], 200.00)
            self.assertEqual(json_response['start_date'], '2022-01-01')
            self.assertEqual(json_response['end_date'], '2022-01-31')
            self.assertEqual(json_response['largest_expense'], 200.00)
            self.assertEqual(json_response['largest_income'], 200.00)
            self.assertEqual(json_response['savings_rate'], 50.0)
            self.assertEqual(json_response['monthly_summary']['2022-01']['income'], 200.00)
            self.assertEqual(json_response['anomalies'], [])
            self.assertEqual(json_response['spending_analysis']['total_spent'], 100.00)
            self.assertEqual(json_response['spending_analysis']['total_income'], 200.00)
            self.assertEqual(json_response['spending_analysis']['savings_rate'], 50.0)
            self.assertEqual(json_response['spending_analysis']['daily_summary']['2022-01-01']['total_spent'], 100.00)
            self.assertEqual(json_response['spending_analysis']['cumulative_balance']['2022-01-01'], 100.00)
            self.assertEqual(json_response['spending_trends']['total_spent'], 100.00)
            self.assertEqual(json_response['spending_trends']['total_income'], 200.00)
            self.assertEqual(json_response['spending_trends']['savings_rate'], 50.0)
            self.assertEqual(json_response['recurring_transactions'], [])
            self.assertEqual(json_response['financial_health']['debt_to_income_ratio'], 0)
            self.assertEqual(json_response['financial_health']['savings_rate'], 0)
            self.assertEqual(json_response['financial_health']['balance_growth_rate'], 0)
            self.assertEqual(json_response['financial_health']['financial_health_score'], 0)

    async def test_summarize_invalid_input(self):
        """Test summarizing invalid input."""
        resp = await self.client.post('/summarize', json='invalid')

        self.assertEqual(resp.status, 400)
        json_response = await resp.json()
        self.assertEqual(json_response['error'], 'Invalid input - expected list of transactions')

    async def test_summarize_error(self):
        """Test summarizing text with an error."""
        with patch('src.app.app_instance.summarize_transactions') as mock_summarize:
            mock_summarize.side_effect = RuntimeError('Summarize error')
            transactions = [
                self.create_transaction_dict('2022-01-01', 'Transaction 1', -100.0, 100.0),
            ]
            resp = await self.client.post('/summarize', json=transactions)

            self.assertEqual(resp.status, 500)
            json_response = await resp.json()
            self.assertEqual(json_response['error'], 'Summarization failed: Summarize error')
