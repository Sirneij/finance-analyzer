import contextlib
from typing import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.settings import settings
from app.db.base import Base


class DatabaseSessionManager:
    def __init__(self):
        self._engine: AsyncEngine | None = None
        self._sessionmaker: async_sessionmaker | None = None

    def init(self, host: str):
        self._engine = create_async_engine(
            host,
            echo=settings.ECHO_SQL,
            future=True,
            pool_size=settings.POOL_SIZE,
            max_overflow=settings.MAX_OVERFLOW,
            pool_timeout=settings.POOL_TIMEOUT,
        )
        self._sessionmaker = async_sessionmaker(
            bind=self._engine,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

    async def close(self):
        if self._engine is None:
            raise Exception('DatabaseSessionManager is not initialized')
        await self._engine.dispose()
        self._engine = None
        self._sessionmaker = None

    @contextlib.asynccontextmanager
    async def connect(self) -> AsyncIterator[AsyncConnection]:
        if self._engine is None:
            raise Exception("DatabaseSessionManager is not initialized")

        async with self._engine.begin() as connection:
            try:
                yield connection
            except Exception:
                await connection.rollback()
                raise

    @contextlib.asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        if self._sessionmaker is None:
            raise Exception('DatabaseSessionManager is not initialized')

        session = self._sessionmaker()
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

    async def create_all(self, connection: AsyncConnection):
        await connection.run_sync(Base.metadata.create_all)

    async def drop_all(self, connection: AsyncConnection):
        await connection.run_sync(Base.metadata.drop_all)


sessionmanager = DatabaseSessionManager()


async def get_async_session() -> AsyncIterator[AsyncSession]:
    async with sessionmanager.session() as session:
        try:
            yield session
        finally:
            await session.close()
