"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Data Profiling Utility"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Oracle Metadata Database
    ORACLE_HOST: str
    ORACLE_PORT: int = 1521
    ORACLE_SERVICE_NAME: str
    ORACLE_USER: str
    ORACLE_PASSWORD: str
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # File Storage
    RESULTS_BASE_PATH: str = "/app/profiling_results"
    RESULTS_RETENTION_DAYS: int = 90
    
    # Security
    SECRET_KEY: str
    ENCRYPTION_KEY: str
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Profiling Configuration
    MAX_CONCURRENT_JOBS: int = 10
    DEFAULT_TOP_N_VALUES: int = 10
    MAX_PREVIEW_ROWS: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
