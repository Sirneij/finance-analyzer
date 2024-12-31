import pytest_asyncio

from app.db.session import async_session_maker


@pytest_asyncio.fixture
async def async_session():
    session = async_session_maker()
    try:
        yield session
    finally:
        await session.close()
