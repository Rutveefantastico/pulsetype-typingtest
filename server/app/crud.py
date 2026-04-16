from datetime import date, datetime, timedelta, timezone

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app import models, schemas


def upsert_user(
    db: Session,
    *,
    provider: str,
    provider_user_id: str,
    name: str,
    email: str,
    profile_picture: str | None,
) -> models.User:
    user = (
        db.query(models.User)
        .filter(models.User.provider == provider, models.User.provider_user_id == provider_user_id)
        .first()
    )

    if user is None:
        user = db.query(models.User).filter(models.User.email == email).first()

    if user is None:
        user = models.User(
            provider=provider,
            provider_user_id=provider_user_id,
            name=name,
            email=email,
            profile_pic=profile_picture,
        )
        db.add(user)
    else:
        user.provider = provider
        user.provider_user_id = provider_user_id
        user.name = name
        user.email = email
        user.profile_pic = profile_picture

    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int) -> models.User | None:
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_result(
    db: Session,
    *,
    user_id: int,
    result: schemas.ResultCreate,
) -> models.TypingResult:
    duplicate_window_start = datetime.now(timezone.utc) - timedelta(seconds=3)
    existing_result = (
        db.query(models.TypingResult)
        .filter(
            models.TypingResult.user_id == user_id,
            models.TypingResult.wpm == result.wpm,
            models.TypingResult.accuracy == result.accuracy,
            models.TypingResult.errors == result.errors,
            models.TypingResult.difficulty == result.difficulty,
            models.TypingResult.time_limit == result.time_limit,
            models.TypingResult.mode == result.mode,
            models.TypingResult.created_at >= duplicate_window_start,
        )
        .order_by(desc(models.TypingResult.created_at))
        .first()
    )
    if existing_result is not None:
        return existing_result

    db_result = models.TypingResult(
        user_id=user_id,
        wpm=result.wpm,
        accuracy=result.accuracy,
        errors=result.errors,
        difficulty=result.difficulty,
        time_limit=result.time_limit,
        mode=result.mode,
        score=result.score,
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result


def get_leaderboard(db: Session, limit: int = 10) -> list[models.TypingResult]:
    return (
        db.query(models.TypingResult)
        .join(models.TypingResult.user)
        .order_by(desc(models.TypingResult.wpm), desc(models.TypingResult.accuracy))
        .limit(limit)
        .all()
    )


def get_leaderboard_by_difficulty(
    db: Session,
    *,
    limit: int = 10,
    difficulty: str | None = None,
) -> list[models.TypingResult]:
    query = db.query(models.TypingResult).join(models.TypingResult.user)
    if difficulty:
        query = query.filter(models.TypingResult.difficulty == difficulty)
    return query.order_by(desc(models.TypingResult.wpm), desc(models.TypingResult.accuracy)).limit(limit).all()


def get_dashboard_summary(db: Session, user_id: int) -> dict:
    user = get_user_by_id(db, user_id)
    if user is None:
        raise ValueError("User not found")

    aggregates = (
        db.query(
            func.count(models.TypingResult.id),
            func.avg(models.TypingResult.wpm),
            func.avg(models.TypingResult.accuracy),
            func.max(models.TypingResult.wpm),
            func.max(models.TypingResult.accuracy),
        )
        .filter(models.TypingResult.user_id == user_id)
        .one()
    )

    recent_results = (
        db.query(models.TypingResult)
        .filter(models.TypingResult.user_id == user_id)
        .order_by(desc(models.TypingResult.created_at))
        .limit(8)
        .all()
    )

    practice_dates = [
        row[0]
        for row in (
            db.query(func.date(models.TypingResult.created_at))
            .filter(models.TypingResult.user_id == user_id)
            .group_by(func.date(models.TypingResult.created_at))
            .order_by(desc(func.date(models.TypingResult.created_at)))
            .all()
        )
        if row[0]
    ]

    current_streak, longest_streak = calculate_streaks(practice_dates)
    achievements = build_achievements(
        tests_taken=int(aggregates[0] or 0),
        best_wpm=int(aggregates[3] or 0),
        best_accuracy=round(float(aggregates[4] or 0), 1),
        current_streak=current_streak,
    )

    return {
        "user": user,
        "tests_taken": int(aggregates[0] or 0),
        "average_wpm": round(float(aggregates[1] or 0), 1),
        "average_accuracy": round(float(aggregates[2] or 0), 1),
        "best_wpm": int(aggregates[3] or 0),
        "best_accuracy": round(float(aggregates[4] or 0), 1),
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "achievements": achievements,
        "history_points": [
            {
                "date": result.created_at.isoformat(),
                "wpm": result.wpm,
                "accuracy": result.accuracy,
                "mode": result.mode,
            }
            for result in reversed(recent_results)
        ],
        "recent_results": recent_results,
    }


def update_user_profile(
    db: Session,
    *,
    user_id: int,
    name: str,
    profile_pic: str | None,
    theme_preference: str,
    preferred_difficulty: str,
    preferred_time_limit: int,
    typing_sound: bool,
) -> models.User:
    user = get_user_by_id(db, user_id)
    if user is None:
        raise ValueError("User not found")

    user.name = name
    if profile_pic:
        user.profile_pic = profile_pic
    user.theme_preference = theme_preference
    user.preferred_difficulty = preferred_difficulty
    user.preferred_time_limit = preferred_time_limit
    user.typing_sound = 1 if typing_sound else 0

    db.commit()
    db.refresh(user)
    return user


def build_recommendations(db: Session, user_id: int) -> list[str]:
    results = (
        db.query(models.TypingResult)
        .filter(models.TypingResult.user_id == user_id)
        .order_by(desc(models.TypingResult.created_at))
        .limit(12)
        .all()
    )

    if not results:
        return [
            "Start with a few classic tests to unlock personalized recommendations.",
            "Try medium difficulty first to establish a useful baseline.",
        ]

    average_accuracy = sum(result.accuracy for result in results) / len(results)
    average_wpm = sum(result.wpm for result in results) / len(results)
    average_errors = sum(result.errors for result in results) / len(results)
    latest = results[0]

    recommendations: list[str] = []
    if average_accuracy < 92:
        recommendations.append("Focus on accuracy before speed for your next few sessions.")
    if average_wpm < 45:
        recommendations.append("Practice medium difficulty passages to build rhythm and confidence.")
    if average_errors >= 6:
        recommendations.append("You are making frequent errors. Slow down slightly and aim for cleaner runs.")
    if latest.time_limit >= 120 and latest.errors >= 5:
        recommendations.append("Long sessions are increasing your mistakes. Mix in shorter timed bursts.")
    if latest.difficulty == "hard" and latest.accuracy < 94:
        recommendations.append("Practice medium difficulty texts before pushing hard passages again.")
    if latest.mode != "classic":
        recommendations.append("Alternate game modes with classic tests to keep both speed and control improving.")

    return recommendations[:4] or [
        "Your trend looks healthy. Keep balancing classic tests with focused challenge modes."
    ]


def calculate_streaks(practice_dates: list[str]) -> tuple[int, int]:
    if not practice_dates:
        return 0, 0

    normalized_dates = sorted({date.fromisoformat(value) for value in practice_dates}, reverse=True)
    longest = 1
    current_run = 1

    for index in range(1, len(normalized_dates)):
        previous = normalized_dates[index - 1]
        current = normalized_dates[index]
        if previous - current == timedelta(days=1):
            current_run += 1
            longest = max(longest, current_run)
        else:
            current_run = 1

    today = date.today()
    current_streak = 0
    if normalized_dates[0] in {today, today - timedelta(days=1)}:
        current_streak = 1
        for index in range(1, len(normalized_dates)):
            previous = normalized_dates[index - 1]
            current = normalized_dates[index]
            if previous - current == timedelta(days=1):
                current_streak += 1
            else:
                break

    return current_streak, longest


def build_achievements(*, tests_taken: int, best_wpm: int, best_accuracy: float, current_streak: int) -> list[str]:
    achievements: list[str] = []
    if tests_taken >= 1:
        achievements.append("First Run")
    if tests_taken >= 10:
        achievements.append("Consistent Grinder")
    if best_wpm >= 60:
        achievements.append("Speedster 60")
    if best_wpm >= 100:
        achievements.append("Century Sprinter")
    if best_accuracy >= 98:
        achievements.append("Precision Master")
    if current_streak >= 3:
        achievements.append("Daily Rhythm")
    return achievements
