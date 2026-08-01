import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FraudGuard"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # DB settings
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "fraudguard")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    # MLflow
    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
    MLFLOW_MODEL_NAME: str = "fraudguard_xgboost_model"
    
    # AI / LLM provider settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock") # "openai", "ollama", or "mock"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OLLAMA_HOST: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    
    # Feature Store & Queue capacities
    LRU_CACHE_CAPACITY: int = 5000
    FRAUD_ALERT_THRESHOLD: float = 0.65

    class Config:
        case_sensitive = True

settings = Settings()
