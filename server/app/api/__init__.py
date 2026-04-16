from app.api.auth_routes import router as auth_router
from app.api.typing_routes import router as typing_router
from app.api.user_routes import router as user_router

__all__ = ["auth_router", "typing_router", "user_router"]
