import asyncio
import json
from unittest.mock import AsyncMock, patch

from aiohttp import WSMsgType

from src.app.app_instance import WEBSOCKETS
from tests import BaseAioHTTPTestCase


class TestWebSocketHandler(BaseAioHTTPTestCase):
    """Exhaustively test the WebSocket handler."""

    async def setUpAsync(self):
        await super().setUpAsync()
        # Capture the original create_task function.
        self.orig_create_task = asyncio.create_task

    async def __dummy_analyze(self, transactions, ws_manager):
        """Dummy analyze implementation that returns a known result."""
        return {
            'categories': {
                'expenses': {
                    'groceries': 10.0,
                    'rent': 90.0,
                },
                'expense_percentages': {
                    'groceries': 5,
                    'rent': 45,
                },
                'income': 200.0,
            }
        }

    async def __dummy_summarize(self, transactions, ws_manager):
        """Dummy summarize implementation that returns a known result."""
        return {
            'income': {
                'total': 200.00,
                'trend': 'neutral',
                'change': 0.0,
            },
            'expenses': {
                'total': 100.00,
                'trend': 'neutral',
                'change': 0.0,
            },
            'savings': {
                'total': 100.00,
                'trend': 'neutral',
                'change': 0.0,
            },
            'total_transactions': 2,
            'expense_count': 1,
            'income_count': 1,
            'avg_expense': 100.00,
            'avg_income': 200.00,
            'start_date': '2022-01-01',
            'end_date': '2022-01-31',
            'largest_expense': 200.00,
            'largest_income': 200.00,
            'savings_rate': 50.0,
            'monthly_summary': {
                '2022-01': {
                    'income': 200.00,
                    'expenses': 100.00,
                    'savings': 100.00,
                },
            },
            'anomalies': [],
            'spending_analysis': {
                'total_spent': 100.00,
                'total_income': 200.00,
                'savings_rate': 50.0,
                'daily_summary': {
                    '2022-01-01': {
                        'total_spent': 100.00,
                        'total_income': 200.00,
                        'savings_rate': 50.0,
                    },
                },
                'cumulative_balance': {
                    '2022-01-01': 100.00,
                },
            },
            'spending_trends': {
                'total_spent': 100.00,
                'total_income': 200.00,
                'savings_rate': 50.0,
            },
            'recurring_transactions': [],
            'financial_health': {
                'debt_to_income_ratio': 0,
                'savings_rate': 0,
                'balance_growth_rate': 0,
                'financial_health_score': 0,
            },
        }

    def __dummy_create_task(self, coro):
        if hasattr(coro, 'cr_code') and 'ping_server' in coro.cr_code.co_qualname:
            # Explicitly close the ping_server coroutine so it doesn't leak.
            coro.close()
            # Return a dummy, already‐completed future.
            fut = asyncio.Future()
            fut.set_result(None)
            return fut
        return self.orig_create_task(coro)

    async def __receive_messages(self, ws, count, timeout=5):
        """Helper to collect 'count' text messages from the WebSocket."""
        messages = []
        while len(messages) < count:
            msg = await ws.receive(timeout=timeout)
            if msg.type == WSMsgType.TEXT:
                messages.append(json.loads(msg.data))
            elif msg.type == WSMsgType.CLOSE:
                break
        return messages

    async def test_analyze_action(self):
        """Test that sending an 'analyze' action yields progress and result messages."""
        self.transactions = [
            self.create_transaction_dict('2022-01-01', 'Transaction 1', -100.0, 100.0),
            self.create_transaction_dict('2022-01-02', 'Transaction 2', 200.0, 300.0),
        ]

        # Patch the analyzer so that it returns a predictable result,
        # and patch create_task with our dummy version.
        with patch(
            'src.app.app_instance.analyze_transactions',
            new=AsyncMock(side_effect=self.__dummy_analyze),
        ), patch("asyncio.create_task", self.__dummy_create_task):
            ws = await self.client.ws_connect('/ws')
            msg_data = {'action': 'analyze', 'transactions': self.transactions}
            await ws.send_str(json.dumps(msg_data))
            # This helps avoid timout errors when the server is slow to respond.
            messages = await self.__receive_messages(ws, 2)
            self.assertEqual(len(messages), 2)

            # First response: progress message.
            progress, result = messages
            self.assertEqual(progress.get('action'), 'progress')
            self.assertEqual(progress.get('message'), 'Analysis complete')
            self.assertEqual(progress.get('progress'), 1.0)
            self.assertEqual(progress.get('taskType'), 'Analysis')

            # Second response: result message.
            self.assertEqual(result.get('action'), 'analysis_complete')
            self.assertEqual(result.get('taskType'), 'Analysis')
            expected_data = await self.__dummy_analyze(self.transactions, self.websocket_manager)
            self.assertEqual(result.get('result'), expected_data)
            await ws.close()

    async def test_summary_action(self):
        """Test that sending a 'summary' action yields progress and result messages."""
        self.transactions = [
            self.create_transaction_dict('2022-01-01', 'Transaction 1', -100.0, 100.0),
            self.create_transaction_dict('2022-01-02', 'Transaction 2', 200.0, 300.0),
        ]

        # Patch the summarizer so that it returns a predictable result,
        # and patch create_task with our dummy version.
        with patch(
            'src.app.app_instance.summarize_transactions',
            new=AsyncMock(side_effect=self.__dummy_summarize),
        ), patch("asyncio.create_task", self.__dummy_create_task):
            ws = await self.client.ws_connect('/ws')
            msg_data = {'action': 'summary', 'transactions': self.transactions}
            await ws.send_str(json.dumps(msg_data))
            # This helps avoid timout errors when the server is slow to respond.
            messages = await self.__receive_messages(ws, 2)
            self.assertEqual(len(messages), 2)

            # First response: progress message.
            progress, result = messages
            self.assertEqual(progress.get('action'), 'progress')
            self.assertEqual(progress.get('message'), 'Summary complete')
            self.assertEqual(progress.get('progress'), 1.0)
            self.assertEqual(progress.get('taskType'), 'Summarize')

            # Second response: result message.
            self.assertEqual(result.get('action'), 'summary_complete')
            self.assertEqual(result.get('taskType'), 'Summarize')
            expected_data = await self.__dummy_summarize(self.transactions, self.websocket_manager)
            self.assertEqual(result.get('result'), expected_data)
            await ws.close()

    async def test_unknown_action(self):
        """Test that an unknown action returns an error message."""
        ws = await self.client.ws_connect('/ws')
        msg_data = {'action': 'nonexistent'}
        await ws.send_str(json.dumps(msg_data))
        # This helps avoid timout errors when the server is slow to respond.
        messages = await self.__receive_messages(ws, 1)
        self.assertEqual(len(messages), 1)
        error = messages[0]
        self.assertEqual(error.get('action'), 'error')
        self.assertEqual(error.get('taskType'), 'Error')
        self.assertEqual(error.get('result'), {'message': 'Unknown action'})
        await ws.close()

    async def test_message_processing_exception(self):
        """Test that sending invalid JSON produces an error message."""
        ws = await self.client.ws_connect('/ws')
        await ws.send_str('invalid json')
        # This helps avoid timout errors when the server is slow to respond.
        messages = await self.__receive_messages(ws, 1)
        self.assertEqual(len(messages), 1)
        error = messages[0]
        self.assertEqual(error.get('action'), 'error')
        self.assertEqual(error.get('taskType'), 'Error')
        self.assertEqual(error.get('result'), {'error': 'Expecting value: line 1 column 1 (char 0)'})
        await ws.close()

    async def test_close_on_error(self):
        """Test that when a client closes the connection, the WebSocket is removed from the app."""
        ws = await self.client.ws_connect('/ws')
        await ws.send_str('invalid json')
        # This helps avoid timout errors when the server is slow to respond.
        messages = await self.__receive_messages(ws, 1)
        self.assertEqual(len(messages), 1)
        await ws.close()
        self.assertNotIn(ws, self.app[WEBSOCKETS])
