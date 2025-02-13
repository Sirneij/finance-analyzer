import asyncio
import json

from aiohttp import WSMsgType

from src.app.app_instance import WEBSOCKETS


class FakeMessage:
    """Simulate an incoming WebSocket message."""

    def __init__(self, msg_type, data=None):
        self.type = msg_type
        self.data = data

    def json(self):
        # For TEXT messages, decode the JSON.
        return json.loads(self.data.decode() if isinstance(self.data, bytes) else self.data)


class FakeTransport:
    def write(self, data):
        pass


class FakeProtocol:
    def __init__(self):
        self.transport = FakeTransport()


class FakeWebSocketResponse:
    """
    A fake WebSocketResponse that bypasses the handshake and
    simulates sending/receiving messages.
    """

    def __init__(self, messages=None):
        # messages should be a list of FakeMessage instances.
        self.sent_messages = []  # Records messages sent via send_str/send_json.
        self.closed = False
        self._messages = messages or []
        self._iter = iter(self._messages)
        self.pong_called = []

    async def prepare(self, request):
        # Bypass handshake logic.
        return

    async def send_str(self, data):
        self.sent_messages.append(data)

    async def send_json(self, data):
        self.sent_messages.append(json.dumps(data))

    async def pong(self, data):
        self.pong_called.append(data)

    async def close(self):
        self.closed = True

    # Allow async iteration over incoming messages.
    def __aiter__(self):
        self._iter = iter(self._messages)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration

    async def receive(self, timeout=None):
        try:
            return next(self._iter)
        except StopIteration:
            await self.close()
            # Return a dummy CLOSE message.
            return FakeMessage(WSMsgType.CLOSE)


class FakeRequest:
    """
    A fake Request with the minimal attributes expected by the handshake.
    Note: We use the actual WEBSOCKETS key from your application.
    """

    def __init__(self, ws, headers=None):
        self.ws = ws
        # Use the same key as your application.
        self.app = {WEBSOCKETS: set()}
        self._loop = asyncio.get_running_loop()
        self.headers = headers or {
            'Upgrade': 'websocket',
            'Connection': 'Upgrade',
            'Sec-WebSocket-Key': 'dummykey==',
            'Sec-WebSocket-Version': '13',
        }
        self._protocol = FakeProtocol()
        self.method = "GET"


class FakeWSPingReset(FakeWebSocketResponse):
    async def ping(self):
        raise ConnectionResetError("Simulated connection reset")


# Define an async iterator that immediately raises an exception.
class ExceptionIterator:
    async def __anext__(self):
        raise Exception("Simulated iteration error")

    def __aiter__(self):
        return self


# Create a fake websocket that uses this iterator.
class FakeWSIterationError(FakeWebSocketResponse):
    def __aiter__(self):
        return ExceptionIterator()


class FakeWSUnknownType(FakeWebSocketResponse):
    """Fake websocket that will yield a message with an unknown type."""

    pass
