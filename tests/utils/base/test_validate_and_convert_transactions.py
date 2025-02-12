from datetime import datetime

from src.models.base import Transaction
from src.utils.base import validate_and_convert_transactions
from tests import BaseAsyncTestClass


class TestValidateAndConvertTransactions(BaseAsyncTestClass):
    async def test_empty_list(self):
        # If an empty list is provided, expect an empty list in return.
        result: list[Transaction] = await validate_and_convert_transactions([])
        self.assertEqual(result, [])

    async def test_valid_transaction_with_string_fields_and_v(self):
        # Create a valid transaction with date fields as strings and a __v field.
        now = datetime.now()
        txn_dict = self.create_transaction_dict(now, 'Normal', -123.45, 1000.0, include_v=True)

        result: list[Transaction] = await validate_and_convert_transactions([txn_dict])
        self.assertEqual(len(result), 1)
        txn = result[0]

        # Verify that the __v field is not present in the Transaction object.
        self.assertFalse(hasattr(txn, '__v'))

        # Verify that numeric fields are floats.
        self.assertIsInstance(txn.amount, float)
        self.assertAlmostEqual(txn.amount, -123.45)
        self.assertIsInstance(txn.balance, float)
        self.assertAlmostEqual(txn.balance, 1000.0)

        # Verify that date fields are datetime objects.
        self.assertIsInstance(txn.date, datetime)
        self.assertEqual(txn.date.isoformat(), now.isoformat())
        self.assertIsInstance(txn.createdAt, datetime)
        self.assertEqual(txn.createdAt.isoformat(), now.isoformat())
        self.assertIsInstance(txn.updatedAt, datetime)
        self.assertEqual(txn.updatedAt.isoformat(), now.isoformat())

    async def test_transaction_missing_required_field(self):
        # Create a transaction missing one required field (e.g., 'balance').
        txn_dict = self.create_transaction_dict(datetime.now(), 'Normal', -50, 500)
        del txn_dict['balance']

        result: list[Transaction] = await validate_and_convert_transactions([txn_dict])
        # Since the transaction is invalid, the function should return an empty list.
        self.assertEqual(result, [])

    async def test_transaction_invalid_field_format(self):
        # Create a transaction where the date field is an invalid string.
        txn_dict = self.create_transaction_dict(datetime.now(), 'Normal', -50, 500)
        txn_dict['date'] = "invalid-date-string"

        result: list[Transaction] = await validate_and_convert_transactions([txn_dict])
        self.assertEqual(result, [])

        # Also test non-numeric amount.
        txn_dict = self.create_transaction_dict(datetime.now(), 'Normal', -50, 500)
        txn_dict['amount'] = "not-a-number"
        result = await validate_and_convert_transactions([txn_dict])
        self.assertEqual(result, [])

    async def test_multiple_transactions_mixed_validity(self):
        # Create several transactions, some valid and some invalid.
        valid_txn1 = self.create_transaction_dict(datetime(2024, 1, 1, 12, 0), 'Normal', -100, 900)
        valid_txn2 = self.create_transaction_dict(datetime(2024, 1, 2, 12, 0), 'Normal', 2000, 2900)
        invalid_txn = self.create_transaction_dict(datetime(2024, 1, 3, 12, 0), 'Normal', -150, 750)
        del invalid_txn['userId']  # remove a required field

        tx_list = [valid_txn1, invalid_txn, valid_txn2]
        result: list[Transaction] = await validate_and_convert_transactions(tx_list)
        self.assertEqual(len(result), 2)

        # Verify that the valid transactions are converted correctly.
        txn_ids = {txn._id for txn in result}
        self.assertIn(valid_txn1['_id'], txn_ids)
        self.assertIn(valid_txn2['_id'], txn_ids)

        for txn in result:
            self.assertIsInstance(txn.date, datetime)
            self.assertIsInstance(txn.createdAt, datetime)
            self.assertIsInstance(txn.updatedAt, datetime)
            self.assertIsInstance(txn.amount, float)
            self.assertIsInstance(txn.balance, float)

    async def test_transaction_already_converted(self):
        # Create a transaction dictionary with already-converted datetime objects
        now = datetime.now()
        txn_dict = self.create_transaction_dict(now, 'Normal', -200, 800, include_v=False)

        result: list[Transaction] = await validate_and_convert_transactions([txn_dict])
        self.assertEqual(len(result), 1)
        txn = result[0]

        # Verify that the types remain as datetime for date fields and float for numbers.
        self.assertIsInstance(txn.date, datetime)
        self.assertEqual(txn.date, now)
        self.assertIsInstance(txn.createdAt, datetime)
        self.assertEqual(txn.createdAt, now)
        self.assertIsInstance(txn.updatedAt, datetime)
        self.assertEqual(txn.updatedAt, now)
        self.assertIsInstance(txn.amount, float)
        self.assertAlmostEqual(txn.amount, -200)
        self.assertIsInstance(txn.balance, float)
        self.assertAlmostEqual(txn.balance, 800)
