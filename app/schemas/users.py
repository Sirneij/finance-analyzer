from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    email: EmailStr

    class Config:
        orm_mode = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class User(UserBase):
    id: str
    is_active: bool
    is_superuser: bool
    hashed_password: str


class UserRead(UserBase):
    id: str
    is_active: bool
    is_superuser: bool
