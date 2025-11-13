"""Admin authentication schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, validator

from app.shared.schemas.base import BaseResponse


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"


class AdminLoginRequest(BaseModel):
    """Admin login request schema."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class AdminLoginResponse(BaseModel):
    """Admin login response schema."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "AdminUserResponse"


class AdminRegisterRequest(BaseModel):
    """Admin registration request schema."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    role: str = Field(default="admin", pattern="^(super_admin|admin|moderator)$")
    
    @validator("confirm_password")
    def passwords_match(cls, v, values, **kwargs):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v
    
    @validator("password")
    def password_strength(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        
        if not (has_upper and has_lower and has_digit):
            raise ValueError(
                "Password must contain at least one uppercase letter, "
                "one lowercase letter, and one digit"
            )
        
        return v


class AdminUserResponse(BaseModel):
    """Admin user response schema."""
    id: UUID
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    is_superuser: bool = False
    department: Optional[str] = None
    employee_id: Optional[str] = None
    can_manage_users: bool = False
    can_manage_system: bool = False
    can_view_reports: bool = False
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v)
        }


class AdminUserUpdateRequest(BaseModel):
    """Admin user update request schema."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    department: Optional[str] = Field(None, max_length=100)
    employee_id: Optional[str] = Field(None, max_length=20)
    can_manage_users: Optional[bool] = None
    can_manage_system: Optional[bool] = None
    can_view_reports: Optional[bool] = None
    # For superuser updates
    is_superuser: Optional[bool] = None


class ChangePasswordRequest(BaseModel):
    """Change password request schema."""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    
    @validator("confirm_password")
    def passwords_match(cls, v, values, **kwargs):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("Passwords do not match")
        return v
    
    @validator("new_password")
    def password_strength(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        
        if not (has_upper and has_lower and has_digit):
            raise ValueError(
                "Password must contain at least one uppercase letter, "
                "one lowercase letter, and one digit"
            )
        
        return v


class AdminDashboardStats(BaseModel):
    """Admin dashboard statistics schema."""
    total_admin_users: int
    total_provider_users: int
    total_customers: int
    active_sessions: int
    recent_logins: int
    system_alerts: int


# Forward reference resolution
AdminLoginResponse.model_rebuild()