from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart-Mental API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = ""

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "smartmental"
    POSTGRES_PORT: str = "5432"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # CORS — lock to frontend domain in production
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost", "http://localhost:3000"]

    # Rate limiting
    RATE_LIMIT_SESSIONS: str = "5/minute"        # Session creation per IP
    RATE_LIMIT_CHAT: str = "20/minute"           # Chat messages per session
    RATE_LIMIT_ASSESSMENTS: str = "10/minute"    # Assessment submissions per session

    # Data retention (NDPR compliance)
    SESSION_RETENTION_DAYS: int = 90             # Delete sessions older than N days

    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
