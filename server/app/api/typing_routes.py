from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.dependencies import get_current_user
from app.services.text_service import get_random_text

router = APIRouter(tags=["typing"])


@router.get("/text", response_model=schemas.TextResponse)
def read_text(
    difficulty: schemas.Difficulty = Query(default="medium"),
    time_limit: int = Query(default=60, ge=15, le=1000),
):
    try:
        text = get_random_text(difficulty, time_limit)
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported difficulty level.",
        ) from exc

    return {"difficulty": difficulty, "text": text}


@router.post("/result", response_model=schemas.ResultResponse, status_code=status.HTTP_201_CREATED)
def create_result(
    result: schemas.ResultCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_result(db, user_id=user.id, result=result)


@router.get("/leaderboard", response_model=schemas.LeaderboardResponse)
def read_leaderboard(
    limit: int = Query(default=10, ge=1, le=50),
    difficulty: schemas.Difficulty | None = Query(default=None),
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"entries": crud.get_leaderboard_by_difficulty(db, limit=limit, difficulty=difficulty)}


@router.get("/dashboard", response_model=schemas.DashboardResponse)
def read_dashboard(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_dashboard_summary(db, user.id)


@router.get("/user/stats", response_model=schemas.DashboardResponse)
def read_user_stats(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_dashboard_summary(db, user.id)
