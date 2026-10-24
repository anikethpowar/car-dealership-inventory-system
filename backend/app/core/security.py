from datetime import UTC, datetime, timedelta
from typing import Any

from jose import jwt
from pwdlib import PasswordHash

from app.core.config import settings

# Initialize password hashing using the recommended configuration
password_hash_context = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a plain-text password using pwdlib's recommended hasher."""
    return password_hash_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its stored hash."""
    return password_hash_context.verify(plain_password, hashed_password)


def create_access_token(
    user_id: int | str,
    role: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token containing sub, role, and exp claims."""
    if expires_delta is not None:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode: dict[str, Any] = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
    }
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )
