from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.users import User
from app.schemas import users as users_schema

router = APIRouter()


@router.post(
    '/register',
    status_code=status.HTTP_201_CREATED,
    response_model=users_schema.UserRead,
)
async def create_user(
    user_in: users_schema.UserCreate,
    db: AsyncSession = Depends(get_async_session),
) -> User:
    user = User(
        name=user_in.name,
        email=user_in.email,
    )
    user.set_password(user_in.password)

    try:
        db.add(user)
        await db.commit()
    except exc.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail='Email already exists'
        )

    return user
