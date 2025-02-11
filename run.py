from aiohttp import web
import os
from src.app.app_instance import init_app
from src.utils.settings import base_settings

if __name__ == '__main__':
    app = init_app()
    try:
        web.run_app(
            app,
            host='0.0.0.0',
            port=int(os.environ.get('PORT', 5173)),
        )
    except KeyboardInterrupt:
        base_settings.logger.info('Received keyboard interrupt...')
    except Exception as e:
        base_settings.logger.error(f'Server error: {e}')
    finally:
        base_settings.logger.info('Server shutdown complete.')
