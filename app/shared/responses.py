"""
Standardized API response models.
Ensures consistent response format across the API.
"""

from typing import TypeVar, Generic, Optional, Any, Dict
from pydantic import BaseModel, Field

T = TypeVar('T')


class SuccessResponse(BaseModel, Generic[T]):
    """
    Standard success response.

    Attributes:
        success: Always True for success responses
        data: Response data
        message: Optional success message
    """

    success: bool = Field(default=True, description="Success indicator")
    data: T = Field(description="Response data")
    message: Optional[str] = Field(default=None, description="Success message")


class ErrorResponse(BaseModel):
    """
    Standard error response.

    Attributes:
        success: Always False for error responses
        error: Error message
        code: Error code for client handling
        details: Additional error details
    """

    success: bool = Field(default=False, description="Success indicator")
    error: str = Field(description="Error message")
    code: str = Field(description="Error code")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Error details")


class MessageResponse(BaseModel):
    """
    Simple message response.

    Attributes:
        message: Response message
        success: Success indicator
    """

    success: bool = Field(default=True, description="Success indicator")
    message: str = Field(description="Response message")


class CreatedResponse(BaseModel, Generic[T]):
    """
    Response for resource creation.

    Attributes:
        success: Always True
        data: Created resource data
        message: Creation success message
    """

    success: bool = Field(default=True, description="Success indicator")
    data: T = Field(description="Created resource")
    message: str = Field(default="Resource created successfully", description="Success message")


class DeletedResponse(BaseModel):
    """
    Response for resource deletion.

    Attributes:
        success: Always True
        message: Deletion success message
        id: ID of deleted resource
    """

    success: bool = Field(default=True, description="Success indicator")
    message: str = Field(default="Resource deleted successfully", description="Success message")
    id: Optional[int] = Field(default=None, description="ID of deleted resource")


class BulkOperationResponse(BaseModel):
    """
    Response for bulk operations.

    Attributes:
        success: Operation success status
        total: Total number of items processed
        succeeded: Number of successful operations
        failed: Number of failed operations
        errors: List of errors if any
    """

    success: bool = Field(description="Overall success status")
    total: int = Field(description="Total items processed")
    succeeded: int = Field(description="Number of successful operations")
    failed: int = Field(description="Number of failed operations")
    errors: Optional[list[Dict[str, Any]]] = Field(default=None, description="List of errors")


def success_response(data: Any, message: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a success response dictionary.

    Args:
        data: Response data
        message: Optional success message

    Returns:
        Success response dictionary
    """
    response = {
        "success": True,
        "data": data
    }
    if message:
        response["message"] = message
    return response


def error_response(
    error: str,
    code: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create an error response dictionary.

    Args:
        error: Error message
        code: Error code
        details: Additional error details

    Returns:
        Error response dictionary
    """
    response = {
        "success": False,
        "error": error,
        "code": code
    }
    if details:
        response["details"] = details
    return response
