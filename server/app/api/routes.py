from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.services.text_service import get_random_text

router = APIRouter()


@router.get("/text", response_model=schemas.TextResponse)
def read_text(
    difficulty: schemas.Difficulty = Query(default="medium"),
):
    try:
        text = get_random_text(difficulty)
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported difficulty level.",
        ) from exc

    return {"difficulty": difficulty, "text": text}


@router.post("/result", response_model=schemas.ResultResponse, status_code=status.HTTP_201_CREATED)
def create_result(result: schemas.ResultCreate, db: Session = Depends(get_db)):
    return crud.create_result(db, result)


@router.get("/leaderboard", response_model=schemas.LeaderboardResponse)
def read_leaderboard(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return {"entries": crud.get_leaderboard(db, limit=limit)}
