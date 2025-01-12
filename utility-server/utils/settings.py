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

    async def send_progress(
        self,
        message: str,
        active_websockets: set[WebSocketResponse],
        operation_type: str,
    ):
        """Send progress message to all connected WebSocket clients."""
        for client in active_websockets:
            await client.send_json(
                {
                    'action': 'progress',
                    'message': message,
                    'operation': operation_type,
                }
            )


base_settings = Settings()
