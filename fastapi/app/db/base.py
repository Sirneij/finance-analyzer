from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base(cls=AsyncAttrs)
