from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from app.api import auth_router, typing_router, user_router
from app.config import settings
from app.database import Base, engine

Base.metadata.create_all(bind=engine)
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

app = FastAPI(title=settings.api_title)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.jwt_secret,
    same_site="lax",
    https_only=False,
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(auth_router, prefix="/api")
app.include_router(typing_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
