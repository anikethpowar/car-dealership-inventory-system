"""
Seed script: create the admin user in the database.

Run from the backend directory:
    python -m scripts.seed_admin

Reads ADMIN_EMAIL and ADMIN_PASSWORD from the environment (or the .env file).
Falls back to clearly-development-only defaults when neither variable is set.
"""

import os
import sys
from pathlib import Path

# Ensure the backend directory is on sys.path when run as __main__
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select

import app.models  # noqa: F401 – registers models with Base.metadata  # noqa: E402
from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.user import User

_DEV_EMAIL = "admin@example.com"
_DEV_PASSWORD = "AdminPass123!"


def main() -> None:
    admin_email = os.environ.get("ADMIN_EMAIL", _DEV_EMAIL)
    admin_password = os.environ.get("ADMIN_PASSWORD", _DEV_PASSWORD)

    db = SessionLocal()
    try:
        existing: User | None = db.scalar(select(User).where(User.email == admin_email))

        if existing is not None:
            if existing.role == "admin":
                print(f"Admin user '{admin_email}' already exists. Nothing to do.")
                return
            else:
                print(
                    f"ERROR: A non-admin user with email '{admin_email}' already "
                    "exists. The role was NOT changed. "
                    "Set ADMIN_EMAIL to a different address or update the user manually."
                )
                sys.exit(1)

        admin = User(
            email=admin_email,
            password_hash=hash_password(admin_password),
            role="admin",
        )
        db.add(admin)
        db.commit()
        print(f"Admin user '{admin_email}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
