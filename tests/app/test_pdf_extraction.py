import os

import aiohttp

from tests import BaseAioHTTPTestCase


class TestPDFExtractor(BaseAioHTTPTestCase):

    async def asyncSetUp(self):
        await super().asyncSetUp()
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.fixtures_dir = os.path.join(current_dir, 'fixtures')
        os.makedirs(self.fixtures_dir, exist_ok=True)
        self.sample_pdf = os.path.join(self.fixtures_dir, 'sample.pdf')

    async def test_extract_text_success(self):
        """Test extracting text from a PDF file"""
        with open(self.sample_pdf, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field('file', f, filename='sample.pdf', content_type='application/pdf')

            resp = await self.client.post('/extract-text', data=data)

        self.assertEqual(resp.status, 200)
        json_response = await resp.json()
        self.assertIn('text', json_response)
        self.assertIsInstance(json_response['text'], str)

    async def test_missing_file(self):
        """Test handling a request with no file uploaded"""
        # Create empty form data with proper headers
        data = aiohttp.FormData()
        resp = await self.client.post(
            '/extract-text',
            data=data,
            headers={'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'},
        )

        self.assertEqual(resp.status, 400)
        json_response = await resp.json()
        self.assertIn('error', json_response)
        self.assertEqual(json_response['error'], 'No file uploaded')

    async def test_invalid_file(self):
        """Test handling a request with an invalid file"""
        data = aiohttp.FormData()
        data.add_field(
            'file',
            b'not a pdf file',
            filename='test.pdf',
            content_type='application/pdf',
        )

        resp = await self.client.post('/extract-text', data=data)
        self.assertEqual(resp.status, 500)
        json_response = await resp.json()
        self.assertIn('error', json_response)

    async def test_field_name_not_file(self):
        """Test handling a request with a file uploaded under a different field name"""
        with open(self.sample_pdf, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field('not_file', f, filename='sample.pdf', content_type='application/pdf')

            resp = await self.client.post('/extract-text', data=data)

        self.assertEqual(resp.status, 400)
        json_response = await resp.json()
        self.assertIn('error', json_response)
        self.assertEqual(json_response['error'], 'No file field in request')

    async def test_content_type_not_formdata_but_json(self):
        """Test handling a request with a JSON body instead of form data"""
        resp = await self.client.post('/extract-text', json={'file': 'test.pdf'})
        self.assertEqual(resp.status, 400)
        json_response = await resp.json()
        self.assertIn('error', json_response)
        self.assertEqual(json_response['error'], 'Invalid content type')
