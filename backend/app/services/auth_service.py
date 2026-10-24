from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.auth import UserRegister


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

