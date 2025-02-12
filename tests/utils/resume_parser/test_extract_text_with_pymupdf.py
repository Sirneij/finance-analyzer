import os
import tempfile

import fitz  # PyMuPDF

from src.utils.resume_parser import extract_text_with_pymupdf
from tests import BaseAsyncTestClass


class TestExtractTextWithPymupdf(BaseAsyncTestClass):
    """Test the `extract_text_with_pymupdf` function."""

    async def asyncSetUp(self):
        # Track temporary files created during tests.
        self.temp_files = []

    async def asyncTearDown(self):
        """Clean up temporary files created during tests."""
        for file_path in self.temp_files:
            if os.path.exists(file_path):
                os.remove(file_path)

    def _create_pdf(self, pages_content: list[str]) -> str:
        """
        Utility function to create a temporary PDF with the specified text contents
        for each page. Returns the PDF file path.
        """
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        self.temp_files.append(temp_file.name)
        doc = fitz.open()
        for content in pages_content:
            page = doc.new_page()  # create a new page
            page.insert_text((72, 72), content)  # add text at a fixed position
        doc.save(temp_file.name)
        doc.close()
        temp_file.close()
        return temp_file.name

    async def test_extract_text_file_path_single_page(self):
        # Create a PDF with a single page and extract text via file path (str)
        expected_text = 'Hello, file path!'
        pdf_path = self._create_pdf([expected_text])
        result = await extract_text_with_pymupdf(pdf_path)
        self.assertIn(expected_text, result)
        self.assertTrue(result.strip().endswith(expected_text))  # check trimmed result

    async def test_extract_text_from_bytes_single_page(self):
        # Create a PDF and read it as bytes to test stream input.
        expected_text = 'Hello from bytes!'
        pdf_path = self._create_pdf([expected_text])
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        result = await extract_text_with_pymupdf(pdf_bytes)
        self.assertIn(expected_text, result)
        self.assertTrue(result.strip().endswith(expected_text))

    async def test_extract_text_multiple_pages(self):
        # Create a PDF with multiple pages and verify the text from all pages is extracted.
        page1 = 'This is page one.'
        page2 = 'Page two reporting.'
        page3 = 'Finally, page three.'
        pdf_path = self._create_pdf([page1, page2, page3])
        result = await extract_text_with_pymupdf(pdf_path)
        self.assertIn(page1, result)
        self.assertIn(page2, result)
        self.assertIn(page3, result)
        # Ensure pages are separated by newlines.
        self.assertIn('\n', result)

    async def test_extract_text_empty_pdf(self):
        # Create a PDF with a page that contains no text.
        pdf_path = self._create_pdf([''])
        result = await extract_text_with_pymupdf(pdf_path)
        self.assertEqual(result, '')

    async def test_invalid_file_path_raises_exception(self):
        # Pass an invalid file path and verify an exception is raised.
        fake_path = '/nonexistent/path/to/file.pdf'
        with self.assertRaises(Exception):
            await extract_text_with_pymupdf(fake_path)

    async def test_invalid_pdf_bytes_raises_exception(self):
        # Pass invalid bytes (not a valid PDF) and verify an exception is raised.
        invalid_bytes = b'This is not a PDF.'
        with self.assertRaises(Exception):
            await extract_text_with_pymupdf(invalid_bytes)
