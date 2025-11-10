"""
Configuration Module - Environment-based configuration.

Better than NestJS:
- Pydantic Settings (type-safe, validated)
- Automatic .env loading
- Environment variables
- Type hints
- Secrets management
"""

from typing import Optional, Any, Dict
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache


class Config(BaseSettings):
    """
    Base configuration class.

    Extend this to create your own configuration:

    Example:
        class AppConfig(Config):
            database_url: str = Field(..., env="DATABASE_URL")
            redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
            secret_key: str = Field(..., env="SECRET_KEY")

            @property
            def is_production(self) -> bool:
                return self.environment == "production"
    """

    # Application settings
    app_name: str = Field(default="BASW Application", env="APP_NAME")
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")

    # Server settings
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=3000, env="PORT")

    # CORS settings
    cors_origins: str = Field(default="*", env="CORS_ORIGINS")

    # Database settings (optional, override in your config)
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")

    # Redis settings (optional)
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")

    # JWT settings (optional)
    jwt_secret: Optional[str] = Field(default=None, env="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_expiration: int = Field(default=3600, env="JWT_EXPIRATION")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow",
    )

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == "production"

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by key."""
        return getattr(self, key, default)


@lru_cache()
def get_config() -> Config:
    """
    Get cached configuration instance.

    This function is cached to ensure singleton behavior.
    """
    return Config()


class ConfigService:
    """
    Configuration service for dependency injection.

    Example:
        @Injectable()
        class MyService:
            def __init__(self, config: ConfigService):
                self.config = config

            async def do_something(self):
                if self.config.is_production:
                    # Production logic
                    pass
    """

    def __init__(self, config: Optional[Config] = None):
        self._config = config or get_config()

    @property
    def config(self) -> Config:
        """Get the configuration object."""
        return self._config

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        return self._config.get(key, default)

    @property
    def is_development(self) -> bool:
        return self._config.is_development

    @property
    def is_production(self) -> bool:
        return self._config.is_production

    def __getattr__(self, name: str) -> Any:
        """Allow direct access to config attributes."""
        return getattr(self._config, name)
