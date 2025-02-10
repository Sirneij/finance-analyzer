import unittest
import uuid
from datetime import datetime


class BaseUtilsTestClass(unittest.IsolatedAsyncioTestCase):
    """Base class for utility function tests."""

    def create_transaction_dict(
        self,
        date: datetime | str,
        description: str,
        amount: float,
        balance: float,
        type_str='expense',
        include_v: bool = True,
    ) -> dict:
        txn = {
            '_id': str(uuid.uuid4()),
            'date': date.isoformat() if isinstance(date, datetime) else date,
            'createdAt': date.isoformat() if isinstance(date, datetime) else date,
            'updatedAt': date.isoformat() if isinstance(date, datetime) else date,
            'description': description,
            'amount': amount,
            'balance': balance,
            'type': type_str,
            'userId': '1',
        }
        if include_v:
            txn['__v'] = 0

        return txn
