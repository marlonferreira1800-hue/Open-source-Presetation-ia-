from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tomo AI Clone"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./tomo.db"
    
    # LLM Provider Keys
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    DEFAULT_MODEL: str = "gemini-1.5-flash"  # Custo-eficiente e multimodal
    
    # Messaging Channels
    TELEGRAM_BOT_TOKEN: Optional[str] = os.getenv("TELEGRAM_BOT_TOKEN", "")
    EVOLUTION_API_URL: Optional[str] = os.getenv("EVOLUTION_API_URL", "")
    EVOLUTION_API_KEY: Optional[str] = os.getenv("EVOLUTION_API_KEY", "")
    EVOLUTION_INSTANCE_NAME: Optional[str] = os.getenv("EVOLUTION_INSTANCE_NAME", "tomo_bot")
    
    # Scheduler Settings
    PROACTIVE_CHECKINS_ENABLED: bool = True
    MORNING_CHECKIN_HOUR: int = 8   # 08:00
    EVENING_CHECKIN_HOUR: int = 21  # 21:00
    INACTIVITY_THRESHOLD_HOURS: int = 6

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
