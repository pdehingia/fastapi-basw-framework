"""
Response decorators for standardizing API responses.
Provides decorators to automatically wrap responses in standard format.
"""

from functools import wraps
from typing import Any, Callable, Optional
from fastapi import HTTPException
from fastapi.responses import JSONResponse

from .responses import create_success_json_response, create_error_json_response


def standardize_response(
    success_message: Optional[str] = None,
    success_status_code: int = 200
):
    """
    Decorator to standardize endpoint responses.
    
    Automatically wraps successful responses in the standard format.
    Exceptions should be handled by the global exception handlers.
    
    Args:
        success_message: Optional success message
        success_status_code: HTTP status code for success
    
    Example:
        @router.get("/users/{user_id}")
        @standardize_response("User retrieved successfully")
        async def get_user(user_id: int):
            user = get_user_by_id(user_id)
            return user  # Will be wrapped as {"success": True, "data": user, "message": "..."}
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                # Call the original function
                result = await func(*args, **kwargs)
                
                # If result is already a Response object, return as-is
                if isinstance(result, (JSONResponse, dict)) and hasattr(result, 'status_code'):
                    return result
                
                # If result is a dict with standardized format, return as JSONResponse
                if isinstance(result, dict) and 'success' in result:
                    return JSONResponse(
                        status_code=success_status_code,
                        content=result
                    )
                
                # Otherwise, wrap in standard success format
                return create_success_json_response(
                    data=result,
                    message=success_message,
                    status_code=success_status_code
                )
                
            except HTTPException:
                # Re-raise HTTPExceptions to be handled by global handlers
                raise
            except Exception as e:
                # Let global exception handler deal with unexpected errors
                raise
                
        return wrapper
    return decorator


def api_response(
    success_message: Optional[str] = None,
    error_message: Optional[str] = None,
    success_status_code: int = 200
):
    """
    Enhanced response decorator with error handling.
    
    Provides both success and error response standardization.
    
    Args:
        success_message: Message for successful responses
        error_message: Message for error responses  
        success_status_code: HTTP status code for success
    
    Example:
        @router.post("/users")
        @api_response("User created successfully", "Failed to create user", 201)
        async def create_user(user_data: UserCreate):
            return create_new_user(user_data)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                result = await func(*args, **kwargs)
                
                # If result is already a Response object, return as-is
                if isinstance(result, (JSONResponse, dict)) and hasattr(result, 'status_code'):
                    return result
                    
                # If result is a dict with standardized format, return as JSONResponse
                if isinstance(result, dict) and 'success' in result:
                    return JSONResponse(
                        status_code=success_status_code,
                        content=result
                    )
                
                # Wrap in standard success format
                return create_success_json_response(
                    data=result,
                    message=success_message,
                    status_code=success_status_code
                )
                
            except HTTPException:
                # Re-raise HTTPExceptions to be handled by global handlers
                raise
            except Exception as e:
                # Convert unexpected exceptions to standardized error  
                import logging
                logger = logging.getLogger(__name__)
                logger.exception(f"Unexpected error in {func.__name__}: {e}")
                
                error_response_content = create_error_json_response(
                    message=error_message or "An unexpected error occurred",
                    error_code="INTERNAL_ERROR",
                    status_code=500,
                    details={"error": str(e)}
                )
                
                raise HTTPException(
                    status_code=500,
                    detail=error_response_content.content
                )
                
        return wrapper
    return decorator