import asyncio

from aiohttp import WSMsgType, web
from aiohttp.web import Application, Request, Response, WebSocketResponse

from utils.analyzer import analyze_transactions
from utils.extract_text import extract_text_from_pdf
from utils.settings import base_settings
from utils.summarize import summarize_transactions

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


@routes.post('/summarize')
async def summarize(request: web.Request) -> web.Response:
    try:
        data = await request.json()
        base_settings.logger.info('Received summarization request')
        if not isinstance(data, list):
            base_settings.logger.warning(
                'Invalid input - expected list of transactions'
            )
            return web.json_response(
                {'error': 'Invalid input - expected list of transactions'}, status=400
            )

        result = await summarize_transactions(data)

        return web.json_response(result)
    except Exception as e:
        base_settings.logger.error(f'Summarization error: {str(e)}', exc_info=True)
        return web.json_response(
            {'error': 'Summarization failed: ' + str(e)}, status=500
        )


@routes.get('/ws')
async def websocket_handler(request: Request) -> WebSocketResponse:
    """WebSocket handler for real-time communication."""
    ws = WebSocketResponse()
    await ws.prepare(request)

    base_settings.logger.info('New WebSocket connection established')
    base_settings.active_websockets.add(ws)

    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                data = msg.json()
                base_settings.logger.info(f'Received message: {data}')

                # Handle specific actions
                if data['action'].lower() == 'analyze':
                    transactions = data.get('transactions', [])
                    result = await analyze_transactions(transactions)
                    await ws.send_json({'type': 'analysis_result', 'data': result})
                elif data['action'].lower() == 'summary':
                    transactions = data.get('transactions', [])
                    result = await summarize_transactions(transactions)
                    await ws.send_json({'type': 'summary_result', 'data': result})
                elif data['action'].lower() == 'progress':
                    operation_type = 'Summary'
                    await base_settings.send_progress(
                        'Processing transactions...', 
                        base_settings.active_websockets, operation_type
                    )
                else:
                    await ws.send_json({'error': 'Unknown action'})
            elif msg.type == WSMsgType.ERROR:
                base_settings.logger.error(
                    f'WebSocket connection closed with exception: {ws.exception()}'
                )
    except Exception as e:
        base_settings.logger.error(f'WebSocket error: {str(e)}', exc_info=True)
    finally:
        base_settings.logger.info('WebSocket connection closed')
        base_settings.active_websockets.remove(ws)

    return ws


async def broadcast_to_websockets(message: dict) -> None:
    """Broadcast a message to all connected WebSocket clients."""
    for ws in base_settings.active_websockets:
        if not ws.closed:
            await ws.send_json(message)


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
