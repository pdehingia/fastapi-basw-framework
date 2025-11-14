"""
Shared exception classes for the Maya platform.
"""

from fastapi import HTTPException
from starlette import status


class MayaException(Exception):
    """Base exception for Maya platform."""
    
    def __init__(self, message: str, details: str = None):
        self.message = message
        self.details = details
        super().__init__(self.message)


class DatabaseError(MayaException):
    """Database operation error."""
    pass


class NotFoundError(HTTPException):
    """Resource not found error."""
    
    def __init__(self, detail: str = "Resource not found"):
        error_response = {
            "success": False,
            "message": detail,
            "errorCode": "NOT_FOUND",
            "statusCode": 404
        }
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response
        )


class ValidationError(HTTPException):
    """Validation error."""
    
    def __init__(self, detail: str = "Validation failed"):
        error_response = {
            "success": False,
            "message": detail,
            "errorCode": "VALIDATION_FAILED",
            "statusCode": 400
        }
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response
        )


class ValidationException(ValidationError):
    """Alias for ValidationError for compatibility."""
    pass


class AuthenticationError(HTTPException):
    """Authentication error."""
    
    def __init__(self, detail: str = "Authentication failed"):
        error_response = {
            "success": False,
            "message": detail,
            "errorCode": "AUTH_FAILED",
            "statusCode": 401
        }
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response,
            headers={"WWW-Authenticate": "Bearer"}
        )


class UnauthorizedException(HTTPException):
    """Unauthorized access error - alias for backward compatibility."""
    
    def __init__(self, message: str = "Authentication failed", code: str = None, details: dict = None):
        # Create standardized error response
        error_response = {
            "success": False,
            "message": message,
            "errorCode": code or "AUTH_FAILED",
            "statusCode": 401
        }
        if details:
            error_response["details"] = details
            
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response,
            headers={"WWW-Authenticate": "Bearer"}
        )


class AuthorizationError(HTTPException):
    """Authorization error."""
    
    def __init__(self, detail: str = "Not enough permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class ConflictError(HTTPException):
    """Conflict error for duplicate resources."""
    
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )