import secrets
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AnalyzeMyRun"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # PostgreSQL database settings
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "analyzemyrun"
    SQLALCHEMY_DATABASE_URI: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"

    # Security settings
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # MapMyFitness API settings
    MAPMYFITNESS_CLIENT_ID: Optional[str] = None
    MAPMYFITNESS_CLIENT_SECRET: Optional[str] = None

    # First admin user
    FIRST_SUPERUSER: str = "admin@analyzemyrun.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin"
    FIRST_SUPERUSER_NAME: str = "Admin"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 