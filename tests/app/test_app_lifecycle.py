import weakref

from aiohttp import WSCloseCode

from src.app.app_instance import (
    WEBSOCKETS,
    cleanup_background_tasks,
    cleanup_ws,
    start_background_tasks,
)
from tests import BaseAioHTTPTestCase


class TestAppLifecycle(BaseAioHTTPTestCase):
    async def test_start_background_tasks(self):
        """Test that start_background_tasks initializes the websockets key."""
        await start_background_tasks(self.app)
        # Check that the key is present and is a WeakSet.
        self.assertIn(WEBSOCKETS, self.app)
        self.assertIsInstance(self.app[WEBSOCKETS], weakref.WeakSet)

    async def test_cleanup_ws(self):
        """Test that cleanup_ws closes all websockets with the proper code and message."""
        # Manually set up the websockets key.
        self.app[WEBSOCKETS] = weakref.WeakSet()
        self.app[WEBSOCKETS].add(self.fake_ws)
        # Call cleanup_ws which should close fake_ws.
        await cleanup_ws(self.app)
        self.assertTrue(self.fake_ws.closed, "Fake websocket was not closed.")
        self.assertEqual(
            self.fake_ws.close_code, WSCloseCode.GOING_AWAY, "Fake websocket was not closed with expected code."
        )
        self.assertEqual(
            self.fake_ws.close_message, 'Server shutdown', "Fake websocket was not closed with expected message."
        )

    async def test_cleanup_background_tasks(self):
        """Test that cleanup_background_tasks calls cleanup_ws appropriately."""
        self.app[WEBSOCKETS] = weakref.WeakSet()
        self.app[WEBSOCKETS].add(self.fake_ws)
        await cleanup_background_tasks(self.app)
        self.assertTrue(self.fake_ws.closed, "Fake websocket was not closed via cleanup_background_tasks.")
        self.assertEqual(self.fake_ws.close_code, WSCloseCode.GOING_AWAY)
        self.assertEqual(self.fake_ws.close_message, 'Server shutdown')
