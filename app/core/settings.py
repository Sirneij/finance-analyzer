import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    # API Settings
    API_VERSION_STR: str = '/api/v1'
    APP_VERSION: str = '1.0.0'
    APP_DESCRIPTION: str = (
        'APP for managing users, transactions, insights, and financial goals.'
    )
    APP_TITLE: str = 'AI-Powered Financial Behavior Analyzer API'

    # SQLAlchemy Async Settings
    DATABASE_URL: str = os.getenv('DATABASE_URL', '')
    ASYNC_DATABASE_URL: str = DATABASE_URL.replace(
        'postgresql://', 'postgresql+asyncpg://'
    )
    ECHO_SQL: bool = True
    POOL_SIZE: int = 5
    MAX_OVERFLOW: int = 10
    POOL_TIMEOUT: int = 30

    # Security Settings
    SECRET_KEY: str = os.getenv('SECRET_KEY', '')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    PASSWORD_HASH_ALGORITHM: str = 'argon2'

    # Email Settings
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = os.getenv('SMTP_HOST', '')
    SMTP_USER: str = os.getenv('SMTP_USER', '')
    SMTP_PASSWORD: str = os.getenv('SMTP_PASSWORD', '')

    # Redis Settings
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')

    # Storage Settings
    STORAGE_BUCKET: str = os.getenv('STORAGE_BUCKET', '')

    class Config:
        case_sensitive = True
        env_file = '.env'


settings = Settings()
