from tests import BaseAsyncTestClass


class TestWebSocketManager(BaseAsyncTestClass):
    async def test_prepare(self):
        # Before prepare, _ready should be False.
        self.assertFalse(self.websocket_manager._ready)
        await self.websocket_manager.prepare()
        self.assertTrue(self.websocket_manager._ready)
        # Calling prepare again should do nothing.
        await self.websocket_manager.prepare()
        self.assertTrue(self.websocket_manager._ready)

    async def test_send_progress_success(self):
        # When the socket is open and websocket_manager not closing, send_progress should work.
        await self.websocket_manager.prepare()
        ret = await self.websocket_manager.send_progress('Progress message', 0.5, 'TestTask')
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
        ret = await self.websocket_manager.send_progress('Progress message', 0.5, 'TestTask')
        self.assertFalse(ret)
        # No message should be sent.
        self.assertEqual(len(self.fake_ws.messages), 0)

    async def test_send_progress_fail_exception(self):
        # If send_json raises an exception, send_progress should return False.
        self.fake_ws.raise_on_send = True
        ret = await self.websocket_manager.send_progress('Progress message', 0.5, 'TestTask')
        self.assertFalse(ret)
        # No message should be recorded.
        self.assertEqual(len(self.fake_ws.messages), 0)

    async def test_send_result_success(self):
        # Prepare the websocket_manager.
        await self.websocket_manager.prepare()
        # Call send_result and check that a JSON message is sent.
        result_data = {'foo': 'bar'}
        await self.websocket_manager.send_result(result_data, 'TestTask', 'result_complete')
        self.assertEqual(len(self.fake_ws.messages), 1)
        msg = self.fake_ws.messages[0]
        self.assertEqual(msg['action'], 'result_complete')
        self.assertEqual(msg['result'], result_data)
        self.assertEqual(msg['taskType'], 'TestTask')

    async def test_send_result_not_ready(self):
        # If the websocket_manager is not prepared (_ready is False), send_result should not send a message.
        # Do not call prepare.
        result_data = {'foo': 'bar'}
        # Also, simulate closed websocket.
        self.fake_ws.closed = True
        await self.websocket_manager.send_result(result_data, 'TestTask', 'result_complete')
        self.assertEqual(len(self.fake_ws.messages), 0)

    async def test_send_result_exception(self):
        # If send_json raises an exception, send_result should return False.
        await self.websocket_manager.prepare()
        self.fake_ws.raise_on_send = True
        result_data = {'foo': 'bar'}
        await self.websocket_manager.send_result(result_data, 'TestTask', 'result_complete')
        self.assertEqual(len(self.fake_ws.messages), 0)

    async def test_close_already_closed(self):
        self.fake_ws.closed = True
        # Call close and check that _closing is True and that the ws.close method was called.
        await self.websocket_manager.close()
        self.assertTrue(self.websocket_manager._closing)
        self.assertTrue(self.fake_ws.closed)

    async def test_close_success(self):
        # Call close when the WebSocket is open.
        await self.websocket_manager.prepare()
        await self.websocket_manager.close()
        self.assertTrue(self.websocket_manager._closing)
        self.assertTrue(self.fake_ws.closed)
