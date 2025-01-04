import asyncio
import logging
import os
import tempfile

import pytesseract
from aiohttp import web
from aiohttp.web import Application, Request, Response
from pdf2image import convert_from_path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)

logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


async def extract_text_from_pdf(pdf_file: bytes) -> str:
    logger.info('Starting PDF text extraction')
    # Create temporary file to store uploaded PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_pdf:
        tmp_pdf.write(pdf_file)
        tmp_path: str = tmp_pdf.name
        logger.debug(f'Created temporary file: {tmp_path}')

    try:
        # Convert to image using resolution 600 dpi
        logger.info('Converting PDF to images')
        pages = convert_from_path(tmp_path)
        logger.debug(f'Converted {len(pages)} pages')

        # Extract text
        text_data: str = ''
        for i, page in enumerate(pages, 1):
            logger.debug(f'Processing page {i}')
            text: str = pytesseract.image_to_string(page)
            text_data += text + '\n'

        logger.info('Text extraction completed successfully')
        return text_data
    except Exception as e:
        logger.error(f'Error during text extraction: {str(e)}', exc_info=True)
        raise
    finally:
        # Clean up temporary file
        logger.debug(f'Cleaning up temporary file: {tmp_path}')
        os.unlink(tmp_path)


@routes.post('/extract-text')
async def extract_text(request: Request) -> Response:
    try:
        logger.info('Received text extraction request')
        reader = await request.multipart()
        field = await reader.next()

        if field.name != 'file':
            logger.warning('No file field in request')
            return web.json_response({'error': 'No file uploaded'}, status=400)

        # Read the file content
        logger.info('Reading uploaded file')
        file_content: bytes = await field.read()

        text: str = await extract_text_from_pdf(file_content)
        logger.info('Successfully processed request')
        return web.json_response({'text': text})
    except Exception as e:
        logger.error(f'Request processing failed: {str(e)}', exc_info=True)
        return web.json_response({'error': str(e)}, status=500)


async def create_app() -> Application:
    logger.info('Creating application')
    app = web.Application()
    app.add_routes(routes)
    return app


async def run(port: int = 5173) -> None:
    try:
        app: Application = await create_app()
        runner: web.AppRunner = web.AppRunner(app)
        await runner.setup()
        site: web.TCPSite = web.TCPSite(runner, '', port)
        logger.info(f'Starting server on port {port}')
        await site.start()

        # Keep the server running
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        logger.info('Shutting down server')
        await runner.cleanup()
    except Exception as e:
        logger.error(f'Server error: {str(e)}', exc_info=True)
        raise


if __name__ == '__main__':
    asyncio.run(run())
