from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.users import User
from app.schemas import users as users_schema

router = APIRouter()


@router.get('/', response_model=list[users_schema.UserRead])
async def read_users(db: AsyncSession = Depends(get_async_session)) -> list[User]:
    users = await User.get_all(db)
    return users


@router.get('/{user_id}', response_model=users_schema.UserRead)
async def read_user(
    user_id: str, db: AsyncSession = Depends(get_async_session)
) -> User:
    user = await User.get(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='User not found'
        )
    return user


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
