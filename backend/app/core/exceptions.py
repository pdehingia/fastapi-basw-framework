"""
Custom exception classes for the application.
Provides domain-specific exceptions with proper error codes.
"""

from typing import Optional, Dict, Any


class AppException(Exception):
    """
    Base application exception.
    All custom exceptions should inherit from this.
    """

    def __init__(
        self,
        message: str,
        code: str = "APP_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundException(AppException):
    """Exception raised when a resource is not found."""

    def __init__(
        self,
        message: str = "Resource not found",
        resource_type: Optional[str] = None,
        resource_id: Optional[Any] = None
    ):
        details = {}
        if resource_type:
            details["resource_type"] = resource_type
        if resource_id:
            details["resource_id"] = resource_id

        super().__init__(message, "NOT_FOUND", details)


class ValidationException(AppException):
    """Exception raised for validation errors."""

    def __init__(
        self,
        message: str = "Validation error",
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        error_details = details or {}
        if field:
            error_details["field"] = field

        super().__init__(message, "VALIDATION_ERROR", error_details)


class UnauthorizedException(AppException):
    """Exception raised when authentication fails."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, "UNAUTHORIZED")


class ForbiddenException(AppException):
    """Exception raised when user doesn't have permission."""

    def __init__(
        self,
        message: str = "You don't have permission to access this resource",
        required_permission: Optional[str] = None
    ):
        details = {}
        if required_permission:
            details["required_permission"] = required_permission

        super().__init__(message, "FORBIDDEN", details)


class ConflictException(AppException):
    """Exception raised when there's a conflict (e.g., duplicate resource)."""

    def __init__(
        self,
        message: str = "Resource conflict",
        field: Optional[str] = None
    ):
        details = {}
        if field:
            details["field"] = field

        super().__init__(message, "CONFLICT", details)


class BadRequestException(AppException):
    """Exception raised for invalid requests."""

    def __init__(
        self,
        message: str = "Bad request",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, "BAD_REQUEST", details)


class InternalServerException(AppException):
    """Exception raised for internal server errors."""

    def __init__(
        self,
        message: str = "Internal server error",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, "INTERNAL_ERROR", details)


class RateLimitException(AppException):
    """Exception raised when rate limit is exceeded."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: Optional[int] = None
    ):
        details = {}
        if retry_after:
            details["retry_after"] = retry_after

        super().__init__(message, "RATE_LIMIT_EXCEEDED", details)


class ServiceUnavailableException(AppException):
    """Exception raised when a service is unavailable."""

    def __init__(
        self,
        message: str = "Service temporarily unavailable",
        service_name: Optional[str] = None
    ):
        details = {}
        if service_name:
            details["service"] = service_name

        super().__init__(message, "SERVICE_UNAVAILABLE", details)
