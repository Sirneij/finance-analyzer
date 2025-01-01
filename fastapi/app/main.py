from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import users
from app.core.settings import settings
from app.db.session import sessionmanager


def init_app(initiliaze_db: bool = True) -> FastAPI:
    lifespan = None
    if initiliaze_db:

        sessionmanager.init(settings.ASYNC_DATABASE_URL)

        @asynccontextmanager
        async def lifespan(app: FastAPI):
            yield
            if sessionmanager._engine is not None:
                await sessionmanager.close()

    app = FastAPI(
        title=settings.APP_TITLE,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],  # Change to specific origins in production
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    app.include_router(users.router, prefix='/api/v1/users', tags=['users'])

    @app.get('/', tags=['Health'])
    async def read_root():
        settings_dict = settings.model_dump()
        return {
            'message': 'AI-Powered Financial Behavior Analyzer API is running',
            'settings': settings_dict,
        }

    return app


app = init_app()
