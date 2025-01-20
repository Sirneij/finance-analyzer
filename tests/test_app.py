import os
import unittest

import aiohttp
from aiohttp.test_utils import AioHTTPTestCase, unittest_run_loop

from app import create_app


class TestPDFExtractor(AioHTTPTestCase):
    async def get_application(self):
        return await create_app()

    def setUp(self):
        super().setUp()
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.fixtures_dir = os.path.join(current_dir, 'fixtures')
        os.makedirs(self.fixtures_dir, exist_ok=True)
        self.sample_pdf = os.path.join(self.fixtures_dir, 'sample.pdf')

    @unittest_run_loop
    async def test_extract_text_success(self):
        with open(self.sample_pdf, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field(
                'file', f, filename='sample.pdf', content_type='application/pdf'
            )

            resp = await self.client.post('/extract-text', data=data)

        self.assertEqual(resp.status, 200)
        json_response = await resp.json()
        self.assertIn('text', json_response)
        self.assertIsInstance(json_response['text'], str)

    @unittest_run_loop
    async def test_missing_file(self):
        data = aiohttp.FormData()
        resp = await self.client.post(
            '/extract-text', data=data, headers={'Content-Type': 'multipart/form-data'}
        )

        self.assertEqual(resp.status, 400)
        json_response = await resp.json()
        self.assertIn('error', json_response)
        self.assertEqual(json_response['error'], 'No file uploaded')

    @unittest_run_loop
    async def test_invalid_file(self):
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


if __name__ == '__main__':
    unittest.main()
