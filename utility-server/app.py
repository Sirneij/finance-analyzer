import asyncio

from aiohttp import web
from aiohttp.web import Application, Request, Response

from utils.analyzer import analyze_transactions
from utils.extract_text import extract_text_from_pdf
from utils.settings import base_settings

routes = web.RouteTableDef()


@routes.post('/extract-text')
async def extract_text(request: Request) -> Response:
    try:
        base_settings.logger.info('Received text extraction request')
        reader = await request.multipart()
        field = await reader.next()

        if field.name != 'file':
            base_settings.logger.warning('No file field in request')
            return web.json_response({'error': 'No file uploaded'}, status=400)

        # Read the file content
        base_settings.logger.info('Reading uploaded file')
        file_content: bytes = await field.read()

        text: str = await extract_text_from_pdf(file_content)
        base_settings.logger.info('Successfully processed request')
        return web.json_response({'text': text})
    except Exception as e:
        base_settings.logger.error(
            f'Request processing failed: {str(e)}', exc_info=True
        )
        return web.json_response({'error': str(e)}, status=500)


@routes.post('/analyze')
async def analyze(request: web.Request) -> web.Response:
    try:
        data = await request.json()
        base_settings.logger.info('Received analysis request')
        if not isinstance(data, list):
            base_settings.logger.warning(
                'Invalid input - expected list of transactions'
            )
            return web.json_response(
                {'error': 'Invalid input - expected list of transactions'}, status=400
            )

        result = await analyze_transactions(data)
        return web.json_response(result)

    except Exception as e:
        base_settings.logger.error(f'Analysis error: {str(e)}', exc_info=True)
        return web.json_response({'error': 'Analysis failed: ' + str(e)}, status=500)


async def create_app() -> Application:
    base_settings.logger.info('Creating application')
    app = web.Application()
    app.add_routes(routes)
    return app


async def run(port: int = 5173) -> None:
    try:
        app: Application = await create_app()
        runner: web.AppRunner = web.AppRunner(app)
        await runner.setup()
        site: web.TCPSite = web.TCPSite(runner, '', port)
        base_settings.logger.info(f'Starting server on port {port}')
        await site.start()

        # Keep the server running
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        base_settings.logger.info('Shutting down server')
        await runner.cleanup()
    except Exception as e:
        base_settings.logger.error(f'Server error: {str(e)}', exc_info=True)
        raise


if __name__ == '__main__':
    asyncio.run(run())
