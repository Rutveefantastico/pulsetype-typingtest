from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings


database_url = settings.database_url
if database_url.startswith("sqlite:///"):
    database_path = database_url.removeprefix("sqlite:///")
    if database_path:
        Path(database_path).parent.mkdir(parents=True, exist_ok=True)

connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

engine = create_engine(database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
