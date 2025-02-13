import asyncio
from unittest.mock import patch

from aiohttp import WSMsgType

from src.app.app_instance import WEBSOCKETS, websocket_handler
from tests import BaseAsyncTestClass
from tests.app.websocket_handler import (
    FakeMessage,
    FakeRequest,
    FakeWebSocketResponse,
    FakeWSIterationError,
    FakeWSPingReset,
)


class TestWebSocketHandlerPing(BaseAsyncTestClass):
    async def test_ping_pong_behavior(self):
        # Create fake messages: a PING message and then a CLOSE message.
        fake_ping = FakeMessage(WSMsgType.PING, data=b'test ping')
        fake_close = FakeMessage(WSMsgType.CLOSE)
        # Create our fake WebSocketResponse with these messages.
        fake_ws = FakeWebSocketResponse(messages=[fake_ping, fake_close])
        # Create a fake request with our fake_ws.
        fake_req = FakeRequest(fake_ws)
        # Patch the creation of WebSocketResponse so that the handler uses our fake_ws.
        with patch('src.app.app_instance.web.WebSocketResponse', return_value=fake_ws):
            await websocket_handler(fake_req)

        # The handler's ping branch should call pong() with the ping data.
        self.assertIn(b'test ping', fake_ws.pong_called, 'Expected pong data not found')
        # The fake websocket should have been closed after processing.
        self.assertTrue(fake_ws.closed, 'WebSocket was not closed')

    async def test_pong_branch(self):
        """Simulate receiving a PONG message. The handler should simply log it and not call ws.pong()."""
        fake_pong = FakeMessage(WSMsgType.PONG, data=b'test pong')
        fake_close = FakeMessage(WSMsgType.CLOSE)
        fake_ws = FakeWebSocketResponse(messages=[fake_pong, fake_close])
        fake_req = FakeRequest(fake_ws)
        # fake_req.app[WEBSOCKETS].add(fake_ws)
        with patch('src.app.app_instance.web.WebSocketResponse', return_value=fake_ws):
            await websocket_handler(fake_req)
        # Since the handler only logs a PONG, no call to ws.pong() is expected.
        self.assertEqual(fake_ws.pong_called, [], 'PONG branch should not call pong()')
        self.assertTrue(fake_ws.closed, 'WebSocket was not closed after processing PONG')

    async def test_ping_server_connection_reset(self):
        """Simulate that during ping_server, ws.ping() raises ConnectionResetError."""
        # Create a fake message list that is not used since ping_server is separate.
        fake_messages = [
            FakeMessage(WSMsgType.TEXT, data=b'{"action": "analyze", "transactions": []}'),
            FakeMessage(WSMsgType.CLOSE),
        ]
        # Use our FakeWSPingReset that raises ConnectionResetError when ping() is called.
        fake_ws = FakeWSPingReset(messages=fake_messages)
        fake_req = FakeRequest(fake_ws)
        # fake_req.app[WEBSOCKETS].add(fake_ws)
        with patch('src.app.app_instance.web.WebSocketResponse', return_value=fake_ws):
            # When the handler is called, the ping_server task will run.
            await websocket_handler(fake_req)
        # We expect that the exception was caught and the ws was closed.
        self.assertTrue(fake_ws.closed, 'WebSocket was not closed after connection reset in ping_server')

    async def test_unknown_message_type(self):
        """Simulate a message with an unknown type (not PING, PONG, TEXT, CLOSE, or ERROR).
        In this case, no branch should be taken and nothing is sent.
        Eventually, the loop ends (via a CLOSE message) and the ws is closed.
        """
        # Define an unknown type. For example, we use WSMsgType.BINARY.
        fake_unknown = FakeMessage(WSMsgType.BINARY, data=b'some binary data')
        fake_close = FakeMessage(WSMsgType.CLOSE)
        fake_ws = FakeWebSocketResponse(messages=[fake_unknown, fake_close])
        fake_req = FakeRequest(fake_ws)
        # fake_req.app[WEBSOCKETS].add(fake_ws)
        with patch('src.app.app_instance.web.WebSocketResponse', return_value=fake_ws):
            await websocket_handler(fake_req)
        # We expect that no progress or result messages were sent.
        # (Depending on your handler, this branch might simply ignore the unknown type.)
        self.assertEqual(len(fake_ws.sent_messages), 0, 'Unexpected messages sent for unknown type')
        self.assertTrue(fake_ws.closed, 'WebSocket was not closed after processing unknown type')

    async def test_outer_iteration_exception(self):
        """Simulate an exception raised during iteration over ws messages.
        The outer exception block should catch the error, log it,
        and ensure that the websocket is closed.
        """

        fake_ws = FakeWSIterationError()
        # Bypass handshake by overriding prepare.
        fake_ws.prepare = lambda request: asyncio.sleep(0)
        fake_req = FakeRequest(fake_ws)
        fake_req.app[WEBSOCKETS].add(fake_ws)

        with self.assertLogs('src.utils.settings', level='ERROR') as cm:
            with patch('src.app.app_instance.web.WebSocketResponse', return_value=fake_ws):
                await websocket_handler(fake_req)

        self.assertTrue(
            any('WebSocket handler error: Simulated iteration error' in line for line in cm.output),
            'Expected outer iteration error log not found',
        )
        self.assertTrue(fake_ws.closed, 'WebSocket was not closed after iteration error')
