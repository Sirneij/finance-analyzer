from aiohttp import web

from src.utils.settings import base_settings


class WebSocketManager:
    def __init__(self, ws: web.WebSocketResponse):
        self.ws = ws
        self._ready = False
        self._closing = False
        base_settings.logger.info(f'Initializing WebSocket manager: {ws}')

    async def prepare(self):
        """Initialize the WebSocket manager"""
        if self._ready:
            return

        self._ready = True
        base_settings.logger.info('WebSocket manager ready')

    async def send_progress(self, message: str, progress: float, task_type: str = None):
        """Send progress updates"""
        if self.ws.closed or self._closing:
            base_settings.logger.warning('WebSocket closed - cannot send progress')
            return False

        try:
            await self.ws.send_json(
                {'action': 'progress', 'message': message, 'progress': progress, 'taskType': task_type}
            )
            return True
        except Exception as e:
            base_settings.logger.error(f'Error sending progress: {str(e)}')
            return False

    async def send_result(self, result: dict, task_type: str, action: str):
        if not self._ready or self.ws.closed:
            base_settings.logger.warning('Cannot send result - WebSocket not ready/closed')
            return

        try:
            await self.ws.send_json(
                {
                    'action': action,
                    'result': result,
                    'taskType': task_type,
                }
            )
        except Exception as e:
            base_settings.logger.error(f'Error sending result: {str(e)}')

    async def close(self):
        """Clean up resources"""
        self._closing = True
        if not self.ws.closed:
            await self.ws.close()
