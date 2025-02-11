from src.utils.websocket import WebSocketManager
from tests.utils import BaseUtilsTestClass


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


# Test suite for the WebSocketManager
class TestWebSocketManager(BaseUtilsTestClass):

    async def asyncSetUp(self):
        # Create a FakeWebSocket for each test.
        self.fake_ws = FakeWebSocket()
        self.manager = WebSocketManager(self.fake_ws)

    async def test_prepare(self):
        # Before prepare, _ready should be False.
        self.assertFalse(self.manager._ready)
        await self.manager.prepare()
        self.assertTrue(self.manager._ready)
        # Calling prepare again should do nothing.
        await self.manager.prepare()
        self.assertTrue(self.manager._ready)

    async def test_send_progress_success(self):
        # When the socket is open and manager not closing, send_progress should work.
        await self.manager.prepare()
        ret = await self.manager.send_progress('Progress message', 0.5, 'TestTask')
        self.assertTrue(ret)
        # Check that the message was sent.
        self.assertEqual(len(self.fake_ws.messages), 1)
        msg = self.fake_ws.messages[0]
        self.assertEqual(msg['action'], 'progress')
        self.assertEqual(msg['message'], 'Progress message')
        self.assertEqual(msg['progress'], 0.5)
        self.assertEqual(msg['taskType'], 'TestTask')

    async def test_send_progress_fail_closed(self):
        # If the WebSocket is closed, send_progress should return False.
        self.fake_ws.closed = True
        ret = await self.manager.send_progress('Progress message', 0.5, 'TestTask')
        self.assertFalse(ret)
        # No message should be sent.
        self.assertEqual(len(self.fake_ws.messages), 0)

    async def test_send_progress_fail_exception(self):
        # If send_json raises an exception, send_progress should return False.
        self.fake_ws.raise_on_send = True
        ret = await self.manager.send_progress('Progress message', 0.5, 'TestTask')
        self.assertFalse(ret)
        # No message should be recorded.
        self.assertEqual(len(self.fake_ws.messages), 0)

    async def test_send_result_success(self):
        # Prepare the manager.
        await self.manager.prepare()
        # Call send_result and check that a JSON message is sent.
        result_data = {'foo': 'bar'}
        await self.manager.send_result(result_data, 'TestTask', 'result_complete')
        self.assertEqual(len(self.fake_ws.messages), 1)
        msg = self.fake_ws.messages[0]
        self.assertEqual(msg['action'], 'result_complete')
        self.assertEqual(msg['result'], result_data)
        self.assertEqual(msg['taskType'], 'TestTask')

    async def test_send_result_not_ready(self):
        # If the manager is not prepared (_ready is False), send_result should not send a message.
        # Do not call prepare.
        result_data = {'foo': 'bar'}
        # Also, simulate closed websocket.
        self.fake_ws.closed = True
        await self.manager.send_result(result_data, 'TestTask', 'result_complete')
        self.assertEqual(len(self.fake_ws.messages), 0)

    async def test_close(self):
        # Call close and check that _closing is True and that the ws.close method was called.
        await self.manager.close()
        self.assertTrue(self.manager._closing)
        self.assertTrue(self.fake_ws.closed)
