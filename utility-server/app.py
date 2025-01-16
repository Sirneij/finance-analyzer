import asyncio
import signal
from asyncio import Lock

from aiohttp import WSMsgType, web
from aiohttp.web import Request, Response, WebSocketResponse

from utils.analyzer import analyze_transactions
from utils.extract_text import extract_text_from_pdf
from utils.settings import base_settings
from utils.summarize import summarize_transactions
from utils.websocket import WebSocketManager

# Replace global ws_connections with typed version
ws_connections: set[WebSocketResponse] = set()
ws_lock = Lock()


async def start_background_tasks(app):
    """Initialize application background tasks."""
    app['ws_connections'] = ws_connections
    app['ws_lock'] = ws_lock


async def cleanup_background_tasks(app):
    """Cleanup application resources."""
    await cleanup_ws(app)


async def cleanup_ws(app):
    """Cleanup WebSocket connections on shutdown."""
    async with ws_lock:
        connections = set(ws_connections)  # Create a copy to iterate safely
        for ws in connections:
            await ws.close(code=WSMsgType.CLOSE, message='Server shutdown')
        ws_connections.clear()


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


async def websocket_handler(request: Request) -> WebSocketResponse:
    """WebSocket handler for real-time communication."""
    ws = web.WebSocketResponse(
        # heartbeat=30,  # Send heartbeat every 30 seconds
        # autoping=True,  # Automatically respond to pings
    )
    await ws.prepare(request)

    async with ws_lock:
        ws_connections.add(ws)
    ws_manager = WebSocketManager(ws)
    await ws_manager.prepare()

    base_settings.logger.info('WebSocket connection established')

    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                try:
                    data = msg.json()
                    if data.get('action') == 'analyze':
                        result = await analyze_transactions(
                            data.get('transactions'), ws_manager
                        )
                        await ws_manager.send_progress(
                            'Analysis complete', 1.0, 'Analysis'
                        )
                        await ws_manager.send_result(
                            result, 'Analysis', 'analysis_complete'
                        )
                    elif data.get('action') == 'summary':
                        result = await summarize_transactions(
                            data.get('transactions'), ws_manager
                        )
                        await ws_manager.send_progress(
                            'Summary complete', 1.0, 'Summarize'
                        )
                        await ws_manager.send_result(
                            result, 'Summarize', 'summary_complete'
                        )
                    else:
                        await ws_manager.send_result(
                            {'message': 'Unknown action'}, 'Error', 'error'
                        )
                except Exception as e:
                    base_settings.logger.error(f'Message processing error: {str(e)}')
                    await ws_manager.send_result({'error': str(e)}, 'Error', 'error')
            elif msg.type == WSMsgType.ERROR:
                base_settings.logger.error(f'WebSocket error: {ws.exception()}')
    finally:
        async with ws_lock:
            ws_connections.remove(ws)
        await ws.close()
        base_settings.logger.info('WebSocket connection closed')
    return ws


def init_app() -> web.Application:
    app = web.Application()
    app.router.add_post('/extract-text', extract_text)
    app.router.add_post('/analyze', analyze)
    app.router.add_post('/summarize', summarize)
    app.router.add_get('/ws', websocket_handler)

    # Add startup/cleanup handlers
    app.on_startup.append(start_background_tasks)
    app.on_cleanup.append(cleanup_background_tasks)

    return app


async def shutdown(app):
    """Cleanup tasks tied to the service's shutdown."""
    base_settings.logger.info('Starting graceful shutdown...')
    await cleanup_ws(app)
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    for task in tasks:
        task.cancel()
    base_settings.logger.info(f'Cancelling {len(tasks)} outstanding tasks')
    await asyncio.gather(*tasks, return_exceptions=True)


async def find_free_port(start_port: int = 5173) -> int:
    """Find first available port starting from start_port."""
    port = start_port
    while port < 65535:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('', port))
            sock.close()
            return port
        except OSError:
            port += 1
    raise OSError("No free ports available")


if __name__ == '__main__':
    import socket

    app = init_app()

    async def main():
        runner = web.AppRunner(app)
        await runner.setup()

        # Find available port
        port = await find_free_port()
        host = '0.0.0.0'  # Listen on all interfaces
        site = web.TCPSite(runner, host, port)

        try:
            await site.start()
            base_settings.logger.info(f'Server started at http://localhost:{port}')

            # Use standard signal handling
            def signal_handler(signame):
                base_settings.logger.info(f'Received signal {signame}')
                asyncio.create_task(shutdown(app))

            for signame in ('SIGINT', 'SIGTERM'):
                loop = asyncio.get_running_loop()
                loop.add_signal_handler(
                    getattr(signal, signame), lambda s=signame: signal_handler(s)
                )

            # Keep the server running
            await asyncio.Event().wait()

        except OSError as e:
            base_settings.logger.error(f'Failed to start server: {e}')
            raise
        finally:
            await runner.cleanup()

    # Main execution with proper signal handling
    try:
        if asyncio.get_event_loop().is_running():
            base_settings.logger.error("Cannot start server in running event loop")
        else:
            asyncio.run(main())
    except KeyboardInterrupt:
        base_settings.logger.info('Received keyboard interrupt...')
    except Exception as e:
        base_settings.logger.error(f'Server error: {e}')
    finally:
        base_settings.logger.info('Server shutdown complete.')
