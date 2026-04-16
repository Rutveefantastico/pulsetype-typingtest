from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app import crud, schemas
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user, get_optional_current_user
from app.security import create_access_token
from app.services.oauth_service import oauth

router = APIRouter(prefix="/auth", tags=["auth"])


def _build_cookie_kwargs() -> dict:
    return {
        "httponly": True,
        "samesite": "lax",
        "secure": False,
        "max_age": settings.jwt_expiration_minutes * 60,
        "path": "/",
    }


def _set_session_cookie(response: Response, user_id: int) -> None:
    token = create_access_token(user_id)
    response.set_cookie(settings.session_cookie_name, token, **_build_cookie_kwargs())


@router.get("/me", response_model=schemas.AuthStatusResponse)
def get_auth_status(user=Depends(get_optional_current_user)):
    if user is None:
        return {"authenticated": False, "user": None}

    return {"authenticated": True, "user": user}


@router.get("/providers", response_model=schemas.ProviderStatusResponse)
def get_provider_status():
    return {
        "google": bool(settings.google_client_id and settings.google_client_secret),
        "github": bool(settings.github_client_id and settings.github_client_secret),
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(settings.session_cookie_name, path="/")
    return {"success": True}


@router.get("/google/login")
async def login_google(request: Request):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured.",
        )

    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google")
async def login_google_alias(request: Request):
    return await login_google(request)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Google profile.")

    user = crud.upsert_user(
        db,
        provider="google",
        provider_user_id=user_info["sub"],
        name=user_info.get("name") or user_info.get("email") or "Google User",
        email=user_info["email"],
        profile_picture=user_info.get("picture"),
    )

    response = RedirectResponse(url=f"{settings.frontend_url}/dashboard", status_code=status.HTTP_302_FOUND)
    _set_session_cookie(response, user.id)
    return response


@router.get("/github/login")
async def login_github(request: Request):
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth is not configured.",
        )

    redirect_uri = request.url_for("github_callback")
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/github")
async def login_github_alias(request: Request):
    return await login_github(request)


@router.get("/callback")
async def callback_redirect(request: Request, provider: str):
    query = str(request.url.query)
    suffix = f"?{query}" if query else ""
    if provider == "google":
        return RedirectResponse(
            url=f"/api/auth/google/callback{suffix}",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )
    if provider == "github":
        return RedirectResponse(
            url=f"/api/auth/github/callback{suffix}",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported auth provider.")


@router.get("/github/callback", name="github_callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.github.authorize_access_token(request)
    profile_response = await oauth.github.get("user", token=token)
    profile = profile_response.json()
    emails_response = await oauth.github.get("user/emails", token=token)
    emails = emails_response.json()

    primary_email = next(
        (item["email"] for item in emails if item.get("primary") and item.get("verified")),
        None,
    ) or next((item["email"] for item in emails if item.get("verified")), None)

    if not primary_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="GitHub email not available.")

    user = crud.upsert_user(
        db,
        provider="github",
        provider_user_id=str(profile["id"]),
        name=profile.get("name") or profile.get("login") or "GitHub User",
        email=primary_email,
        profile_picture=profile.get("avatar_url"),
    )

    response = RedirectResponse(url=f"{settings.frontend_url}/dashboard", status_code=status.HTTP_302_FOUND)
    _set_session_cookie(response, user.id)
    return response
