import unittest
import uuid
from datetime import datetime

from aiohttp.test_utils import AioHTTPTestCase

from src.app.app_instance import init_app
from src.utils.websocket import WebSocketManager


class Base:
    """Base class for tests."""

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


# A simple fake WebSocketResponse to simulate aiohttp behavior.
class FakeWebSocket:
    def __init__(self, raise_on_send=False):
        self.messages = []  # will store the JSON messages sent
        self.closed = False
        self.raise_on_send = raise_on_send
        self.close_code = None
        self.close_message = None

    async def send_json(self, data):
        if self.raise_on_send:
            raise Exception('send_json error')
        self.messages.append(data)

    async def close(self, code=None, message=None):
        self.closed = True
        self.close_code = code
        self.close_message = message


class BaseAsyncTestClass(Base, unittest.IsolatedAsyncioTestCase):
    """Base class for async tests."""

    async def asyncSetUp(self):
        # Create a FakeWebSocket for each test.
        self.fake_ws = FakeWebSocket()
        self.websocket_manager = WebSocketManager(self.fake_ws)


class BaseTestClass(Base, unittest.TestCase):
    """Base class for sync tests."""


class BaseAioHTTPTestCase(Base, AioHTTPTestCase):
    """Base class for aiohttp tests."""

    async def get_application(self):
        return init_app()

    async def asyncSetUp(self):
        await super().asyncSetUp()
        # Create a FakeWebSocket for each test.
        self.fake_ws = FakeWebSocket()
        self.websocket_manager = WebSocketManager(self.fake_ws)


if __name__ == '__main__':
    unittest.main()
