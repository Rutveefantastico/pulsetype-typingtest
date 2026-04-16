from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models
from app.config import settings
from app.database import get_db
from app.security import decode_access_token


def get_current_user(
    db: Session = Depends(get_db),
    session_token: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> models.User:
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")

    user_id = decode_access_token(session_token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session.")

    user = crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    return user


def get_optional_current_user(
    db: Session = Depends(get_db),
    session_token: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> models.User | None:
    if not session_token:
        return None

    user_id = decode_access_token(session_token)
    if user_id is None:
        return None

    return crud.get_user_by_id(db, user_id)
