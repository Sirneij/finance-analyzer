import os
import tempfile

import pytesseract
from pdf2image import convert_from_path

from .settings import base_settings as settings


async def extract_text_from_pdf(pdf_file: bytes) -> str:
    settings.logger.info('Starting PDF text extraction')
    # Create temporary file to store uploaded PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_pdf:
        tmp_pdf.write(pdf_file)
        tmp_path: str = tmp_pdf.name
        settings.logger.debug(f'Created temporary file: {tmp_path}')

    try:
        # Convert to image using resolution 600 dpi
        settings.logger.info('Converting PDF to images')
        pages = convert_from_path(tmp_path)
        settings.logger.debug(f'Converted {len(pages)} pages')

        # Extract text
        text_data: str = ''
        for i, page in enumerate(pages, 1):
            settings.logger.debug(f'Processing page {i}')
            text: str = pytesseract.image_to_string(page)
            text_data += text + '\n'

        settings.logger.info('Text extraction completed successfully')
        return text_data
    except Exception as e:
        settings.logger.error(f'Error during text extraction: {str(e)}', exc_info=True)
        raise
    finally:
        # Clean up temporary file
        settings.logger.debug(f'Cleaning up temporary file: {tmp_path}')
        os.unlink(tmp_path)
