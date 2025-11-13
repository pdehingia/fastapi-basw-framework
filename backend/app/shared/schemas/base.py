"""
Base schema classes for API serialization.
"""

from typing import Optional
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    
    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True
    )


class TimestampSchema(BaseModel):
    """Schema mixin for timestamp fields."""
    
    created_at: datetime
    updated_at: datetime


class BaseDBSchema(BaseSchema, TimestampSchema):
    """Base schema for database entities."""
    
    id: UUID


class BaseResponse(BaseSchema):
    """Base response schema for API endpoints."""
    
    success: bool = True
    message: str = "Operation successful"