from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/user", tags=["user"])


def _save_profile_picture(upload: UploadFile | None) -> str | None:
    if upload is None or not upload.filename:
        return None

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    extension = Path(upload.filename).suffix or ".png"
    filename = f"{uuid4().hex}{extension}"
    destination = upload_dir / filename
    destination.write_bytes(upload.file.read())
    return f"http://127.0.0.1:8000/uploads/{filename}"


@router.get("/profile", response_model=schemas.UserProfileResponse)
def get_profile(user: models.User = Depends(get_current_user)):
    return {"user": user, "joined_date": user.created_at}


@router.put("/profile/update", response_model=schemas.UserProfileResponse)
def update_profile(
    name: str = Form(...),
    theme_preference: str = Form(...),
    preferred_difficulty: str = Form(...),
    preferred_time_limit: int = Form(...),
    typing_sound: bool = Form(...),
    profile_pic_file: UploadFile | None = File(default=None),
    profile_pic_url: str | None = Form(default=None),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_pic = _save_profile_picture(profile_pic_file) or profile_pic_url or user.profile_pic

    try:
        updated_user = crud.update_user_profile(
            db,
            user_id=user.id,
            name=name,
            profile_pic=profile_pic,
            theme_preference=theme_preference,
            preferred_difficulty=preferred_difficulty,
            preferred_time_limit=preferred_time_limit,
            typing_sound=typing_sound,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return {"user": updated_user, "joined_date": updated_user.created_at}


@router.get("/recommendations", response_model=schemas.RecommendationResponse)
def get_recommendations(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"recommendations": crud.build_recommendations(db, user.id)}
