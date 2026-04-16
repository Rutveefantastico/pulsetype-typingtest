from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def build_default_database_url() -> str:
    desktop_dir = Path(r"C:\Users\Rahul Kumar\OneDrive\Desktop")
    return f"sqlite:///{(desktop_dir / 'PulseType' / 'typing_test_deluxe.db').as_posix()}"


class Settings(BaseSettings):
    api_title: str = "PulseType API"
    database_url: str = build_default_database_url()
    allowed_origins: str = "http://127.0.0.1:5173,http://localhost:5173"
    frontend_url: str = "http://127.0.0.1:5173"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60 * 24 * 7
    session_cookie_name: str = "pulse_type_session"
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    upload_dir: str = str(Path(r"C:\Users\Rahul Kumar\OneDrive\Desktop") / "PulseType" / "uploads")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
