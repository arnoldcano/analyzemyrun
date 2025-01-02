from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AnalyzeMyRun"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str
    SECRET_KEY: str
    
    # MapMyFitness API credentials
    MAPMYFITNESS_CLIENT_ID: Optional[str] = None
    MAPMYFITNESS_CLIENT_SECRET: Optional[str] = None
    
    # JWT settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 