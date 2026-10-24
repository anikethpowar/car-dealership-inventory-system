from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    app_name: str = "Car Dealership Inventory System API"
    app_version: str = "0.1.0"
    database_url: str = f"sqlite:///{BACKEND_DIR / 'dealership.db'}"
    frontend_origin: str = "http://localhost:5173"

    secret_key: str = "change-this-insecure-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    jwt_secret_key: str = "change-this-insecure-secret-key-in-production"
    jwt_algorithm: str = "HS256"

    @model_validator(mode="after")
    def sync_keys(self) -> "Settings":
        # Keep secret_key and jwt_secret_key in sync if one is customized via environment
        if (
            self.secret_key == "change-this-insecure-secret-key-in-production"
            and self.jwt_secret_key != "change-this-insecure-secret-key-in-production"
        ):
            self.secret_key = self.jwt_secret_key
        elif (
            self.jwt_secret_key == "change-this-insecure-secret-key-in-production"
            and self.secret_key != "change-this-insecure-secret-key-in-production"
        ):
            self.jwt_secret_key = self.secret_key
        return self

    @property
    def SECRET_KEY(self) -> str:
        return self.secret_key

    @property
    def ALGORITHM(self) -> str:
        return self.algorithm

    @property
    def ACCESS_TOKEN_EXPIRE_MINUTES(self) -> int:
        return self.access_token_expire_minutes

    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
