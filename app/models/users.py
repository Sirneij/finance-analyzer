import uuid

from sqlalchemy import UUID, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.utils.passwords import get_password_hash, verify_password


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
    date_joined: Mapped[DateTime] = mapped_column(DateTime, nullable=False)

    def __repr__(self) -> str:
        return f'User(id={self.id}, email={self.email}, name={self.name})'

    def set_password(self, password: str) -> None:
        self.hashed_password = get_password_hash(password)

    def verify_password(self, password: str) -> bool:
        return verify_password(password, self.hashed_password)
