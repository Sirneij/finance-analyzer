from datetime import datetime, timedelta

from src.utils.base import validate_and_convert_transactions
from src.utils.summarize import analyze_recurring_transactions
from tests import BaseAsyncTestClass


class TestRecurringTransactions(BaseAsyncTestClass):
    async def test_weekly_recurring(self):
        """
        Test that transactions with the same description occurring roughly 7 days apart
        are detected as recurring weekly payments with high confidence.
        """
        base_date = datetime(2024, 1, 1)
        # Create three transactions 7 days apart.
        tx1 = self.create_transaction_dict(base_date, 'Weekly Yoga Class', -20.0, 980.0, 'expense')
        tx2 = self.create_transaction_dict(
            (base_date + timedelta(days=7)).isoformat(), 'Weekly Yoga Class', -20.0, 960.0, 'expense'
        )
        tx3 = self.create_transaction_dict(
            (base_date + timedelta(days=14)).isoformat(), 'Weekly Yoga Class', -20.0, 940.0, 'expense'
        )

        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])
        recurring = analyze_recurring_transactions(transactions)

        # We expect at least one recurring transaction.
        self.assertIsInstance(recurring, list)
        self.assertTrue(len(recurring) > 0, 'Expected at least one recurring transaction to be detected')

        # Find the recurring entry that was classified as Weekly.
        rec = next((r for r in recurring if r['frequency'] == 'Weekly'), None)
        self.assertIsNotNone(rec, 'Expected a weekly recurring transaction')

        # Verify that the description is stored in lowercase.
        self.assertEqual(rec['description'], 'weekly yoga class')
        # Amount should be the absolute value (rounded) from the key, i.e. 20.0
        self.assertEqual(rec['amount'], 20.0)
        self.assertEqual(rec['frequency'], 'Weekly')
        # With a 7-day interval, the standard deviation is 0, so confidence should be 'High'.
        self.assertEqual(rec['confidence'], 'High')

    async def test_weekly_condition_not_met(self):
        """
        Test that transactions with the same description occurring 9 days apart
        do not trigger the weekly recurring condition.
        The weekly condition requires 6 <= avg_interval <= 8 days, so an avg_interval of 9 should not classify them as weekly.
        """
        base_date = datetime(2024, 1, 1)
        # Create three transactions 9 days apart.
        tx1 = self.create_transaction_dict(base_date.isoformat(), 'Weekly Payment', -50.0, 950.0)
        tx2 = self.create_transaction_dict((base_date + timedelta(days=9)).isoformat(), 'Weekly Payment', -50.0, 900.0)
        tx3 = self.create_transaction_dict((base_date + timedelta(days=18)).isoformat(), 'Weekly Payment', -50.0, 850.0)

        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])
        recurring = analyze_recurring_transactions(transactions)

        # We expect no recurring transactions to be detected since avg_interval = 9 days,
        # which does not meet the weekly criterion (6 <= avg_interval <= 8).
        self.assertEqual(len(recurring), 0, 'Expected no recurring transaction for 9-day intervals.')

    async def test_already_seen(self):
        """
        Test that transactions that have already been classified as recurring are not detected again.
        """
        base_date = datetime(2024, 1, 1)
        # Create three transactions 7 days apart.
        tx1 = self.create_transaction_dict(base_date.isoformat(), 'Weekly Payment', -50.0, 950.0)
        tx2 = self.create_transaction_dict((base_date + timedelta(days=7)).isoformat(), 'Weekly Payment', -50.0, 900.0)
        tx3 = self.create_transaction_dict((base_date + timedelta(days=14)).isoformat(), 'Weekly Payment', -50.0, 850.0)

        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])
        recurring = analyze_recurring_transactions(transactions)

        # We expect at least one recurring transaction.
        self.assertIsInstance(recurring, list)
        self.assertTrue(len(recurring) > 0, 'Expected at least one recurring transaction to be detected')

        # Run the analysis again with the same transactions.
        # Pass in the existing recurring transactions to simulate that they have already been seen.
        recurring2 = analyze_recurring_transactions(transactions)

        # We expect no new recurring transactions to be detected.
        self.assertEqual(len(recurring2), 1, 'Expected no additional recurring transactions to be detected')

        # Create a new transaction that matches the recurring pattern
        tx4 = self.create_transaction_dict((base_date + timedelta(days=21)).isoformat(), 'Weekly Payment', -50.0, 800.0)
        transactions2 = await validate_and_convert_transactions([tx1, tx2, tx3, tx4])
        recurring3 = analyze_recurring_transactions(transactions2)

        # We expect only one recurring transaction to be detected
        self.assertEqual(len(recurring3), 1, 'Expected only one recurring transaction to be detected')
