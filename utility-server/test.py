import asyncio

from aiohttp import web


# Websocket handler
async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    # On connection
    print('WebSocket connection established')

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                if msg.data == 'close':
                    await ws.close()
                elif msg.data == 'progress':
                    # Send progress reports
                    await send_progress_reports(ws)
                else:
                    # Echo the message back
                    response = {'message': f'Server received: {msg.data}'}
                    await ws.send_json(response)
            elif msg.type == web.WSMsgType.ERROR:
                print(f'WebSocket connection closed with error: {ws.exception()}')
    finally:
        print('WebSocket connection closed')

    return ws


async def send_progress_reports(ws):
    # Send progress reports
    for i in range(1, 11):
        await ws.send_json({'progress': i * 10})
        await asyncio.sleep(1)


# Setup application
app = web.Application()
app.router.add_get('/ws', websocket_handler)

if __name__ == '__main__':
    web.run_app(app, host='localhost', port=8080)
