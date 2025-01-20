import logging

from aiohttp.web import WebSocketResponse
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)

logger = logging.getLogger(__name__)

load_dotenv()


class Settings:
    logger = logger
    # List to store active WebSocket connections
    active_websockets = set()

    # Add to existing settings
    async def send_ws_message(self, ws: WebSocketResponse, message: dict) -> None:
        """Send WebSocket message with logging."""
        if ws and not ws.closed:
            self.logger.debug(f'Sending WebSocket message: {message}')
            try:
                await ws.send_json(message)
                self.logger.debug('WebSocket message sent successfully')
            except Exception as e:
                self.logger.error(f'Failed to send WebSocket message: {e}')
        else:
            self.logger.error('WebSocket unavailable or closed')


base_settings = Settings()
