"""
Structured logging configuration.
Supports both JSON and text formatting with correlation ID tracking.
"""

import logging
import sys
from typing import Optional
import json
from datetime import datetime

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """
    JSON log formatter for structured logging.
    Useful for log aggregation services like ELK, Datadog, etc.
    """

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add correlation_id if present
        if hasattr(record, "correlation_id"):
            log_data["correlation_id"] = record.correlation_id

        # Add extra fields
        if hasattr(record, "extra"):
            log_data.update(record.extra)

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


class TextFormatter(logging.Formatter):
    """
    Colored text formatter for development.
    """

    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        "INFO": "\033[32m",  # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[35m",  # Magenta
        "RESET": "\033[0m",  # Reset
    }

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.COLORS["RESET"])
        reset = self.COLORS["RESET"]

        record.levelname = f"{color}{record.levelname}{reset}"
        record.name = f"\033[34m{record.name}{reset}"  # Blue

        return super().format(record)


def setup_logging() -> None:
    """
    Configure application logging.
    Uses JSON format in production, colored text in development.
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)

    # Choose formatter based on environment
    if settings.LOG_FORMAT == "json" or settings.is_production:
        formatter = JSONFormatter()
    else:
        formatter = TextFormatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Set log level for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)


def get_logger(name: str, correlation_id: Optional[str] = None) -> logging.LoggerAdapter:
    """
    Get a logger with optional correlation ID.

    Args:
        name: Logger name (usually __name__)
        correlation_id: Optional correlation ID for request tracking

    Returns:
        Logger adapter with correlation ID context
    """
    logger = logging.getLogger(name)

    extra = {}
    if correlation_id:
        extra["correlation_id"] = correlation_id

    return logging.LoggerAdapter(logger, extra)
