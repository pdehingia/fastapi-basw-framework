"""
HTTP Exceptions - Better error handling than NestJS.

Features:
- Detailed error messages
- Error codes
- Metadata support
- Automatic OpenAPI documentation
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException as FastAPIHTTPException


class HttpException(FastAPIHTTPException):
    """Base HTTP Exception with enhanced features."""

    def __init__(
        self,
        status_code: int,
        message: str,
        error: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.error = error or self.__class__.__name__
        self.metadata = metadata or {}

        detail = {
            "message": message,
            "error": self.error,
            "statusCode": status_code,
        }

        if metadata:
            detail["metadata"] = metadata

        super().__init__(status_code=status_code, detail=detail)


class BadRequestException(HttpException):
    """400 Bad Request Exception."""

    def __init__(
        self,
        message: str = "Bad Request",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(400, message, "BadRequest", metadata)


class UnauthorizedException(HttpException):
    """401 Unauthorized Exception."""

    def __init__(
        self,
        message: str = "Unauthorized",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(401, message, "Unauthorized", metadata)


class ForbiddenException(HttpException):
    """403 Forbidden Exception."""

    def __init__(
        self,
        message: str = "Forbidden",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(403, message, "Forbidden", metadata)


class NotFoundException(HttpException):
    """404 Not Found Exception."""

    def __init__(
        self,
        message: str = "Not Found",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(404, message, "NotFound", metadata)


class ConflictException(HttpException):
    """409 Conflict Exception."""

    def __init__(
        self,
        message: str = "Conflict",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(409, message, "Conflict", metadata)


class InternalServerErrorException(HttpException):
    """500 Internal Server Error Exception."""

    def __init__(
        self,
        message: str = "Internal Server Error",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(500, message, "InternalServerError", metadata)


class ValidationException(BadRequestException):
    """Validation Error Exception."""

    def __init__(
        self,
        errors: list,
        message: str = "Validation failed",
    ):
        super().__init__(message, metadata={"errors": errors})
