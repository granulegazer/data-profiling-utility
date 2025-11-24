"""Application configuration settings"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Data Profiling Utility"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API
    API_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite:///./profiling_results.db"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    # Oracle Connection
    ORACLE_HOST: Optional[str] = None
    ORACLE_PORT: Optional[int] = 1521
    ORACLE_SERVICE: Optional[str] = None
    ORACLE_USER: Optional[str] = None
    ORACLE_PASSWORD: Optional[str] = None
    
    # PostgreSQL Connection
    POSTGRES_HOST: Optional[str] = None
    POSTGRES_PORT: Optional[int] = 5432
    POSTGRES_DB: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    UPLOAD_DIR: str = "./uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
