from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Difficulty = Literal["easy", "medium", "hard"]


class TextResponse(BaseModel):
    difficulty: Difficulty
    text: str


class ResultCreate(BaseModel):
    wpm: int = Field(ge=0, le=400)
    accuracy: float = Field(ge=0, le=100)
    errors: int = Field(ge=0, le=1000)
    difficulty: Difficulty
    time_limit: int = Field(ge=1, le=1000)
    mode: str = Field(default="classic", max_length=30)
    score: int | None = Field(default=None, ge=0)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    profile_pic: str | None
    provider: str
    theme_preference: str
    preferred_difficulty: Difficulty
    preferred_time_limit: int
    typing_sound: bool

    model_config = ConfigDict(from_attributes=True)


class ResultResponse(BaseModel):
    id: int
    user: UserResponse
    wpm: int
    accuracy: float
    errors: int
    difficulty: Difficulty
    time_limit: int
    mode: str
    score: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeaderboardResponse(BaseModel):
    entries: list[ResultResponse]


class AuthStatusResponse(BaseModel):
    authenticated: bool
    user: UserResponse | None = None


class ProviderStatusResponse(BaseModel):
    google: bool
    github: bool


class DashboardResponse(BaseModel):
    user: UserResponse
    tests_taken: int
    average_wpm: float
    average_accuracy: float
    best_wpm: int
    best_accuracy: float
    current_streak: int
    longest_streak: int
    achievements: list[str]
    history_points: list[dict]
    recent_results: list[ResultResponse]


class UserProfileResponse(BaseModel):
    user: UserResponse
    joined_date: datetime


class RecommendationResponse(BaseModel):
    recommendations: list[str]
