from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(20), nullable=False)
    provider_user_id = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    profile_pic = Column(String(500), nullable=True)
    theme_preference = Column(String(30), nullable=False, default="dark")
    preferred_difficulty = Column(String(20), nullable=False, default="medium")
    preferred_time_limit = Column(Integer, nullable=False, default=60)
    typing_sound = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    results = relationship("TypingResult", back_populates="user", cascade="all, delete-orphan")


class TypingResult(Base):
    __tablename__ = "typing_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    wpm = Column(Integer, nullable=False)
    accuracy = Column(Float, nullable=False)
    errors = Column(Integer, nullable=False)
    difficulty = Column(String(20), nullable=False)
    time_limit = Column(Integer, nullable=False)
    mode = Column(String(30), nullable=False, default="classic")
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="results")
