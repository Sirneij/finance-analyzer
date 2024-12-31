import unittest
from unittest.mock import AsyncMock, patch
from urllib.parse import urlparse

import pytest
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.core.settings import settings
from app.db.session import async_session_maker, engine, get_async_session, init_db


class TestDatabaseSession(unittest.TestCase):
    def test_engine_configuration(self):
        """Test database engine configuration"""
        self.assertIsInstance(engine, AsyncEngine)
        self.assertEqual(engine.echo, settings.ECHO_SQL)

        # Parse URLs to compare components
        engine_url = urlparse(str(engine.url))
        settings_url = urlparse(settings.ASYNC_DATABASE_URL)

        self.assertEqual(engine_url.scheme, settings_url.scheme)
        self.assertEqual(engine_url.hostname, settings_url.hostname)
        self.assertEqual(engine_url.port, settings_url.port)
        self.assertEqual(engine_url.path, settings_url.path)

    def test_session_maker_configuration(self):
        """Test session maker configuration"""
        session = async_session_maker()
        self.assertIsInstance(session, AsyncSession)
        self.assertFalse(async_session_maker.kw['expire_on_commit'])
        self.assertFalse(async_session_maker.kw['autocommit'])
        self.assertFalse(async_session_maker.kw['autoflush'])

    @pytest.mark.asyncio
    async def test_get_async_session(self, async_session):
        async with async_session_maker() as session:
            self.assertIsInstance(session, AsyncSession)
            self.assertFalse(session.is_closed())
        self.assertTrue(session.is_closed())

    @pytest.mark.asyncio
    async def test_session_lifecycle(self):
        async for session in get_async_session():
            self.assertIsInstance(session, AsyncSession)
            self.assertFalse(session.is_closed())

    @pytest.mark.asyncio
    async def test_get_async_session(self):
        """Test async session creation and closure"""
        session = None
        async for s in get_async_session():
            session = s
            self.assertIsInstance(s, AsyncSession)
        self.assertTrue(session.is_closed())

    @pytest.mark.asyncio
    async def test_init_db(self):
        """Test database initialization"""
        mock_conn = AsyncMock()
        with patch('app.db.session.engine.begin') as mock_begin:
            mock_begin.return_value.__aenter__.return_value = mock_conn
            await init_db()
            mock_begin.assert_called_once()
