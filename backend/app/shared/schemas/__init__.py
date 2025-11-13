"""
Shared schemas initialization.
"""

from app.shared.schemas.base import BaseSchema, TimestampSchema, BaseDBSchema
from app.shared.schemas.user import (
    # Base schemas
    BaseUserSchema,
    BaseUserCreate,
    BaseUserUpdate,
    BaseUserInDB,
    
    # Admin schemas
    AdminUserCreate,
    AdminUserUpdate, 
    AdminUserResponse,
    
    # Provider schemas
    ProviderUserCreate,
    ProviderUserUpdate,
    ProviderUserResponse,
    
    # Customer schemas
    CustomerUserCreate,
    CustomerUserUpdate,
    CustomerUserResponse,
    
    # Audit schemas
    UserAuditLogCreate,
    UserAuditLogResponse,
    
    # Auth schemas
    LoginRequest,
    LoginResponse,
    PasswordChangeRequest
)

__all__ = [
    # Base schemas
    "BaseSchema",
    "TimestampSchema", 
    "BaseDBSchema",
    "BaseUserSchema",
    "BaseUserCreate",
    "BaseUserUpdate",
    "BaseUserInDB",
    
    # Admin schemas
    "AdminUserCreate",
    "AdminUserUpdate",
    "AdminUserResponse",
    
    # Provider schemas  
    "ProviderUserCreate",
    "ProviderUserUpdate",
    "ProviderUserResponse",
    
    # Customer schemas
    "CustomerUserCreate",
    "CustomerUserUpdate", 
    "CustomerUserResponse",
    
    # Audit schemas
    "UserAuditLogCreate",
    "UserAuditLogResponse",
    
    # Auth schemas
    "LoginRequest",
    "LoginResponse",
    "PasswordChangeRequest"
]