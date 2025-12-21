from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: Optional[str] = None
    JWT_SECRET: str = "super-secret-key-change-me"
    JWT_ALGORITHM: str = "HS256"

    def db_url(self) -> str:
        # Prefer DATABASE_URL if provided; fallback to local SQLite
        if self.DATABASE_URL:
            # SQLAlchemy requires 'postgresql://' instead of 'postgres://'
            if self.DATABASE_URL.startswith("postgres://"):
                return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
            return self.DATABASE_URL
        return "sqlite:///anomalyse.db"

settings = Settings()