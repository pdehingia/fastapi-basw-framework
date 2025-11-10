"""User models."""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class CreateUserDto(BaseModel):
    """Data transfer object for creating a user."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    roles: List[str] = Field(default=["user"])


class UpdateUserDto(BaseModel):
    """Data transfer object for updating a user."""

    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    roles: Optional[List[str]] = None


class UserResponse(BaseModel):
    """User response model."""

    id: int
    username: str
    email: str
    roles: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginDto(BaseModel):
    """Login credentials."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
