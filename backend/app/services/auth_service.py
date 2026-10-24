from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister


class EmailAlreadyExistsError(Exception):
    """Raised when attempting to register an email that already exists."""


def register_customer(db: Session, user_data: UserRegister) -> User:
    """Register a new customer with a hashed password and customer role."""
    # Check whether the email is already registered
    stmt = select(User).where(User.email == user_data.email)
    existing_user = db.scalar(stmt)
    if existing_user is not None:
        raise EmailAlreadyExistsError("Email is already registered")

    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="customer",
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise EmailAlreadyExistsError("Email is already registered") from exc

    db.refresh(user)
    return user


def login_user(db: Session, credentials: UserLogin) -> str:
    """Authenticate user credentials and return a signed JWT access token."""
    stmt = select(User).where(User.email == credentials.email)
    user = db.scalar(stmt)

    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    return create_access_token(user_id=user.id, role=user.role)


# Aliases for convenience
login_customer = login_user
