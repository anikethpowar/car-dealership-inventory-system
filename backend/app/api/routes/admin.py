from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import require_admin
from app.models.user import User
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/me", response_model=UserResponse)
def admin_me(admin: Annotated[User, Depends(require_admin)]) -> User:
    """Return the profile of the currently authenticated admin user."""
    return admin

