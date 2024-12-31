import uuid
from datetime import datetime, timezone

from sqlalchemy import UUID, DateTime, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.utils.security import get_password_hash, verify_password


class User(Base):
    __tablename__ = 'users'

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=False)
    is_superuser: Mapped[bool] = mapped_column(nullable=False, default=False)
    date_joined: Mapped[DateTime] = mapped_column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self) -> str:
        return f'User(id={self.id}, email={self.email}, name={self.name})'

    def set_password(self, password: str) -> None:
        self.hashed_password = get_password_hash(password)

    def verify_password(self, password: str) -> bool:
        return verify_password(password, self.hashed_password)

    @classmethod
    async def get(cls, db: AsyncSession, id: str):
        try:
            transaction = await db.get(cls, id)
        except NoResultFound:
            return None
        return transaction

    @classmethod
    async def get_all(cls, db: AsyncSession):
        return (await db.execute(select(cls))).scalars().all()
