import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone

from app.config import settings


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}".encode("utf-8"))


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expiration_minutes)
    payload = json.dumps(
        {
        "sub": str(user_id),
        "exp": int(expires_at.timestamp()),
        },
        separators=(",", ":"),
    ).encode("utf-8")
    payload_segment = _b64encode(payload)
    signature = hmac.new(
        settings.jwt_secret.encode("utf-8"),
        payload_segment.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return f"{payload_segment}.{_b64encode(signature)}"


def decode_access_token(token: str) -> int | None:
    try:
        payload_segment, signature_segment = token.split(".", 1)
        expected_signature = hmac.new(
            settings.jwt_secret.encode("utf-8"),
            payload_segment.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        if not hmac.compare_digest(signature_segment, _b64encode(expected_signature)):
            return None

        payload = json.loads(_b64decode(payload_segment).decode("utf-8"))
    except (ValueError, json.JSONDecodeError):
        return None

    subject = payload.get("sub")
    expires_at = payload.get("exp")
    if subject is None or expires_at is None:
        return None

    if datetime.now(timezone.utc).timestamp() >= float(expires_at):
        return None

    try:
        return int(subject)
    except ValueError:
        return None
