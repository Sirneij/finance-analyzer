import asyncio
from weakref import WeakSet

from aiohttp import WSCloseCode, WSMsgType, web
from aiohttp.multipart import BodyPartReader
from aiohttp.web import Request, Response, WebSocketResponse

from src.utils.analyzer import analyze_transactions
from src.utils.extract_text import extract_text_from_pdf
from src.utils.resume_parser import extract_text_with_pymupdf, parse_resume_text
from src.utils.settings import base_settings
from src.utils.summarize import summarize_transactions
from src.utils.websocket import WebSocketManager

# Replace global ws_connections with typed version
WEBSOCKETS = web.AppKey("websockets", WeakSet[WebSocketResponse])


async def start_background_tasks(app: web.Application) -> None:
    """Initialize application background tasks."""
    app[WEBSOCKETS] = WeakSet()


async def cleanup_background_tasks(app: web.Application) -> None:
    """Cleanup application resources."""
    await cleanup_ws(app)


async def cleanup_ws(app: web.Application) -> None:
    """Cleanup WebSocket connections on shutdown."""
    for websocket in set(app[WEBSOCKETS]):  # type: ignore
        await websocket.close(code=WSCloseCode.GOING_AWAY, message=b'Server shutdown')


async def parse_resume(request: Request) -> Response:
    """Parse a resume PDF file and extract relevant information."""
    try:
        base_settings.logger.info('Received resume parsing request')
        reader = await request.multipart()
        field = await reader.next()

        if not field or not isinstance(field, BodyPartReader) or field.name != 'file':
            base_settings.logger.warning('No file field in request')
            return web.json_response({'error': 'No file field in request'}, status=400)

        # Read the file content as bytes directly
        base_settings.logger.info('Reading uploaded file')
        file_content = await field.read(decode=True)  # Add decode=True

        base_settings.logger.info('Extracting text from PDF')

        # Pass the raw bytes to the PDF processor
        text: str = await extract_text_with_pymupdf(file_content)
        base_settings.logger.info('Extracted text from PDF')
        resume_data = await parse_resume_text(text)
        base_settings.logger.info('Successfully processed request')
        return web.json_response(resume_data)
    except Exception as error:
        base_settings.logger.error(f'Request processing failed: {str(error)}', exc_info=True)
        return web.json_response({'error': str(error)}, status=500)


async def extract_text(request: Request) -> Response:
    """Extract text from a PDF file using OCR."""
    try:
        base_settings.logger.info('Received text extraction request')

        # Check if content type is correct
        if not request.headers.get('Content-Type', '').startswith('multipart/form-data'):
            base_settings.logger.warning('Invalid content type')
            return web.json_response({'error': 'Invalid content type'}, status=400)

        try:
            reader = await request.multipart()
            field = await reader.next()
        except ValueError as value_error:
            base_settings.logger.warning(
                f'No file uploaded or invalid multipart form data {value_error}', exc_info=True
            )
            return web.json_response({'error': 'No file uploaded'}, status=400)

        if not field or not isinstance(field, BodyPartReader) or field.name != 'file':
            base_settings.logger.warning('No file field in request')
            return web.json_response({'error': 'No file field in request'}, status=400)

        # Read the file content
        base_settings.logger.info('Reading uploaded file')
        file_content: bytes = await field.read()

        text: str = await extract_text_from_pdf(file_content)
        base_settings.logger.info('Successfully processed request')
        return web.json_response({'text': text})
    except Exception as e:
        base_settings.logger.error(f'Request processing failed: {str(e)}', exc_info=True)
        return web.json_response({'error': str(e)}, status=500)


async def analyze(request: web.Request) -> web.Response:
    """Analyze a list of transactions."""
    try:
        data = await request.json()
        base_settings.logger.info('Received analysis request')
        if not isinstance(data, list):
            base_settings.logger.warning(
                'Invalid input - expected list of transactions',
            )
            return web.json_response(
                {'error': 'Invalid input - expected list of transactions'},
                status=400,
            )

        result = await analyze_transactions(data)

        return web.json_response(result)
    except Exception as e:
        base_settings.logger.error(f'Analysis error: {str(e)}', exc_info=True)
        return web.json_response(
            {'error': 'Analysis failed: ' + str(e)},
            status=500,
        )


async def summarize(request: web.Request) -> web.Response:
    """Summarize a list of transactions."""
    try:
        data = await request.json()
        base_settings.logger.info('Received summarization request')
        if not isinstance(data, list):
            base_settings.logger.warning(
                'Invalid input - expected list of transactions',
            )
            return web.json_response(
                {'error': 'Invalid input - expected list of transactions'},
                status=400,
            )

        result = await summarize_transactions(data)

        return web.json_response(result)
    except Exception as e:
        base_settings.logger.error(
            f'Summarization error: {str(e)}',
            exc_info=True,
        )
        return web.json_response(
            {'error': 'Summarization failed: ' + str(e)},
            status=500,
        )


async def websocket_handler(request: Request) -> WebSocketResponse:
    """WebSocket handler for real-time communication."""
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    # Add ws to the WeakSet
    request.app[WEBSOCKETS].add(ws)
    ws_manager = WebSocketManager(ws)
    await ws_manager.prepare()

    async def ping_server(ws: WebSocketResponse) -> None:
        try:
            while True:
                await ws.ping()
                await asyncio.sleep(25)
        except ConnectionResetError:
            base_settings.logger.info("Client disconnected")
        finally:
            await ws.close()

    asyncio.create_task(ping_server(ws))
    base_settings.logger.info('WebSocket connection established')

    try:
        async for msg in ws:
            if msg.type == WSMsgType.PING:
                base_settings.logger.info('Intercepted PING from client')
                await ws.pong(msg.data)
            elif msg.type == WSMsgType.PONG:
                base_settings.logger.info('Intercepted PONG from client')
            elif msg.type == WSMsgType.TEXT:
                try:
                    data = msg.json()
                    if data.get('action') == 'analyze':
                        result = await analyze_transactions(
                            data.get('transactions'),
                            ws_manager,
                        )
                        await ws_manager.send_progress(
                            'Analysis complete',
                            1.0,
                            'Analysis',
                        )
                        await ws_manager.send_result(
                            result,
                            'Analysis',
                            'analysis_complete',
                        )
                    elif data.get('action') == 'summary':
                        result = await summarize_transactions(
                            data.get('transactions'),
                            ws_manager,
                        )
                        await ws_manager.send_progress(
                            'Summary complete',
                            1.0,
                            'Summarize',
                        )
                        await ws_manager.send_result(
                            result,
                            'Summarize',
                            'summary_complete',
                        )
                    else:
                        await ws_manager.send_result(
                            {'message': 'Unknown action'},
                            'Error',
                            'error',
                        )
                except Exception as e:
                    base_settings.logger.error(
                        f'Message processing error: {str(e)}',
                    )
                    await ws_manager.send_result(
                        {'error': str(e)},
                        'Error',
                        'error',
                    )
            elif msg.type in (WSMsgType.CLOSE, WSMsgType.ERROR):
                base_settings.logger.info(
                    'WebSocket is closing or encountered an error',
                )
                break
    except Exception as e:
        base_settings.logger.error(f'WebSocket handler error: {str(e)}')
    finally:
        request.app[WEBSOCKETS].discard(ws)
        if not ws.closed:
            await ws.close()
        base_settings.logger.info('WebSocket connection closed')

    return ws


def init_app() -> web.Application:
    """Initialize the application."""
    app = web.Application()

    # Add routes
    app.router.add_post('/parse-resume', parse_resume)
    app.router.add_post('/extract-text', extract_text)
    app.router.add_post('/analyze', analyze)
    app.router.add_post('/summarize', summarize)
    app.router.add_get('/ws', websocket_handler)

    # Add startup/cleanup handlers
    app.on_startup.append(start_background_tasks)
    app.on_shutdown.append(cleanup_ws)

    return app
