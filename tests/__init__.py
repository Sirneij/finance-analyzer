import unittest
import uuid
from datetime import datetime

from src.utils.websocket import WebSocketManager


# A simple fake WebSocketResponse to simulate aiohttp behavior.
class FakeWebSocket:
    def __init__(self, raise_on_send=False):
        self.messages = []  # will store the JSON messages sent
        self.closed = False
        self.raise_on_send = raise_on_send

    async def send_json(self, data):
        if self.raise_on_send:
            raise Exception('send_json error')
        self.messages.append(data)

    async def close(self):
        self.closed = True


class BaseAsyncTestClass(unittest.IsolatedAsyncioTestCase):
    """Base class for async tests."""

    async def asyncSetUp(self):
        # Create a FakeWebSocket for each test.
        self.fake_ws = FakeWebSocket()
        self.websocket_manager = WebSocketManager(self.fake_ws)

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


class BaseTestClass(unittest.TestCase):
    """Base class for sync tests."""

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
