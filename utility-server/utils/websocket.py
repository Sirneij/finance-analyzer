from aiohttp import web

from utils.settings import base_settings


class WebSocketManager:
    def __init__(self, ws: web.WebSocketResponse):
        self.ws = ws
        self._ready = False
        base_settings.logger.info(f'Initializing WebSocket manager: {ws}')

    async def prepare(self):
        self._ready = True
        base_settings.logger.info('WebSocket manager ready')

    async def send_progress(self, message: str, progress: float, task_type: str = None):
        if not self._ready or self.ws.closed:
            base_settings.logger.warning(
                'Cannot send progress - WebSocket not ready/closed'
            )
            return

        try:
            await self.ws.send_json(
                {
                    'type': 'progress',
                    'message': message,
                    'progress': progress,
                    'taskType': task_type,
                }
            )
        except Exception as e:
            base_settings.logger.error(f'Error sending progress: {str(e)}')

    async def send_result(self, result: dict, task_type: str, action: str):
        if not self._ready or self.ws.closed:
            base_settings.logger.warning(
                'Cannot send result - WebSocket not ready/closed'
            )
            return

        try:
            await self.ws.send_json(
                {'action': action, 'result': result, 'type': task_type}
            )
        except Exception as e:
            base_settings.logger.error(f'Error sending result: {str(e)}')
