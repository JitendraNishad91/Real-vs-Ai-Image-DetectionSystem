import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    # Database (PostgreSQL Neon / SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/realcheck.db")

    # Security keys (SECRET_KEY takes priority, JWT_SECRET kept for backwards compatibility)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "") or SECRET_KEY or "dev_insecure_secret_change_me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Email (Gmail SMTP) for password reset flow
    EMAIL_ADDRESS: str = os.getenv("EMAIL_ADDRESS", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "").replace(" ", "")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "465"))
    RESET_CODE_EXPIRE_MINUTES: int = int(os.getenv("RESET_CODE_EXPIRE_MINUTES", "10"))


settings = Settings()
