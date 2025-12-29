import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the project root directory (erp folder)
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
_DEFAULT_SQLITE_PATH = os.path.join(_PROJECT_ROOT, "flash_erp.db")


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=(
            "backend/backend.env",
            "backend.env",
            "backend/.env",
            ".env",
        ),
        case_sensitive=True,
    )
    
    # Application
    APP_NAME: str = "Flash ERP"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database - Default to SQLite for local development
    DATABASE_URL: str = f"sqlite:///{_DEFAULT_SQLITE_PATH}"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert comma-separated string to list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
settings = Settings()

# Log the database being used
print(f"[Config] Using database: {settings.DATABASE_URL}")
