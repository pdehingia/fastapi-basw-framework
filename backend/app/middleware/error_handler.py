"""
Global error handling middleware.
Catches all exceptions and returns standardized error responses.
"""

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, OperationalError
import logging

from app.core.exceptions import (
    AppException,
    NotFoundException,
    ValidationException,
    UnauthorizedException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
    RateLimitException,
    ServiceUnavailableException
)
from app.shared.responses import error_response, create_error_json_response

logger = logging.getLogger(__name__)


def add_exception_handlers(app: FastAPI) -> None:
    """
    Register all exception handlers with the FastAPI app.

    Args:
        app: FastAPI application instance
    """

    @app.exception_handler(NotFoundException)
    async def not_found_handler(request: Request, exc: NotFoundException):
        """Handle resource not found exceptions."""
        logger.warning(f"Not found: {exc.message}", extra={"path": request.url.path})

        return create_error_json_response(
            message=exc.message,
            error_code=exc.code,
            status_code=status.HTTP_404_NOT_FOUND,
            details=exc.details
        )

    @app.exception_handler(ValidationException)
    async def validation_handler(request: Request, exc: ValidationException):
        """Handle validation exceptions."""
        logger.warning(f"Validation error: {exc.message}")

        return create_error_json_response(
            message=exc.message,
            error_code=exc.code,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=exc.details
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_handler(request: Request, exc: RequestValidationError):
        """Handle Pydantic validation errors."""
        errors = []
        for error in exc.errors():
            errors.append({
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"]
            })

        logger.warning(f"Request validation failed: {errors}")

        return create_error_json_response(
            message="Validation failed",
            error_code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details={"errors": errors}
        )

    @app.exception_handler(UnauthorizedException)
    async def unauthorized_handler(request: Request, exc: UnauthorizedException):
        """Handle authentication failures."""
        logger.warning(f"Unauthorized access attempt: {exc.message}")

        return create_error_json_response(
            message=exc.message,
            error_code=exc.code,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=exc.details,
            headers={"WWW-Authenticate": "Bearer"}
        )

    @app.exception_handler(ForbiddenException)
    async def forbidden_handler(request: Request, exc: ForbiddenException):
        """Handle authorization failures."""
        logger.warning(
            f"Forbidden access: {exc.message}",
            extra={"path": request.url.path}
        )

        return create_error_json_response(
            message=exc.message,
            error_code=exc.code,
            status_code=status.HTTP_403_FORBIDDEN,
            details=exc.details
        )

    @app.exception_handler(ConflictException)
    async def conflict_handler(request: Request, exc: ConflictException):
        """Handle resource conflicts."""
        logger.warning(f"Resource conflict: {exc.message}")

        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=error_response(
                error=exc.message,
                code=exc.code,
                details=exc.details
            )
        )

    @app.exception_handler(BadRequestException)
    async def bad_request_handler(request: Request, exc: BadRequestException):
        """Handle bad requests."""
        logger.warning(f"Bad request: {exc.message}")

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response(
                error=exc.message,
                code=exc.code,
                details=exc.details
            )
        )

    @app.exception_handler(RateLimitException)
    async def rate_limit_handler(request: Request, exc: RateLimitException):
        """Handle rate limit exceptions."""
        logger.warning(f"Rate limit exceeded: {exc.message}")

        headers = {}
        if exc.details.get("retry_after"):
            headers["Retry-After"] = str(exc.details["retry_after"])

        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=error_response(
                error=exc.message,
                code=exc.code,
                details=exc.details
            ),
            headers=headers
        )

    @app.exception_handler(ServiceUnavailableException)
    async def service_unavailable_handler(request: Request, exc: ServiceUnavailableException):
        """Handle service unavailable exceptions."""
        logger.error(f"Service unavailable: {exc.message}")

        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=error_response(
                error=exc.message,
                code=exc.code,
                details=exc.details
            )
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        """Handle database integrity errors."""
        logger.error(f"Database integrity error: {exc}", exc_info=True)

        # Extract useful information from the error
        error_message = "Database constraint violation"
        if "UNIQUE constraint failed" in str(exc.orig):
            error_message = "A record with this value already exists"
        elif "FOREIGN KEY constraint failed" in str(exc.orig):
            error_message = "Referenced record does not exist"

        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=error_response(
                error=error_message,
                code="INTEGRITY_ERROR"
            )
        )

    @app.exception_handler(OperationalError)
    async def operational_error_handler(request: Request, exc: OperationalError):
        """Handle database operational errors."""
        logger.error(f"Database operational error: {exc}", exc_info=True)

        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=error_response(
                error="Database temporarily unavailable",
                code="DATABASE_ERROR"
            )
        )

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        """Handle generic application exceptions."""
        logger.error(f"Application error: {exc.message}", exc_info=True)

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response(
                error=exc.message,
                code=exc.code,
                details=exc.details
            )
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle FastAPI HTTPException with standardized response format."""
        
        # If the detail is already a dict (from our standardized exceptions), use it directly
        if isinstance(exc.detail, dict):
            return JSONResponse(
                status_code=exc.status_code,
                content=exc.detail,
                headers=getattr(exc, 'headers', None)
            )
        
        # Otherwise, wrap the detail in our standard format
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(
                message=exc.detail,
                error_code="HTTP_ERROR",
                status_code=exc.status_code,
                details=None
            ),
            headers=getattr(exc, 'headers', None)
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Handle all unhandled exceptions."""
        logger.exception(f"Unhandled exception: {exc}")

        # Don't expose internal error details in production
        from app.core.config import settings
        error_detail = str(exc) if settings.DEBUG else "An unexpected error occurred"

        return create_error_json_response(
            message="Internal server error",
            error_code="INTERNAL_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"detail": error_detail} if settings.DEBUG else None
        )
