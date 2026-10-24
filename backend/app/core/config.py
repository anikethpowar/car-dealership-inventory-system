from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    app_name: str = "Car Dealership Inventory System API"
    app_version: str = "0.1.0"
    database_url: str = f"sqlite:///{BACKEND_DIR / 'dealership.db'}"
    frontend_origin: str = "http://localhost:5173"
    jwt_secret_key: str = "change-this-insecure-secret-key-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

