"""Roles & Permissions Schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
import re


class RoleBase(BaseModel):
    """Base role schema."""
    
    role_name: str = Field(..., min_length=3, max_length=100, description="Role name")
    role_slug: str = Field(..., min_length=3, max_length=100, description="URL-friendly slug")
    description: Optional[str] = Field(None, description="Role description")
    parent_role_id: Optional[int] = Field(None, description="Parent role ID for hierarchy")
    level: int = Field(1, ge=1, le=10, description="Role level in hierarchy")
    is_active: bool = Field(True, description="Whether role is active")

    @field_validator("role_slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Validate slug format."""
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError("role_slug must contain only lowercase letters, numbers, and hyphens")
        return v


class RoleCreate(RoleBase):
    """Schema for creating role."""
    permission_ids: Optional[List[int]] = Field(None, description="Initial permission IDs to assign")


class RoleUpdate(BaseModel):
    """Schema for updating role."""
    
    role_name: Optional[str] = Field(None, min_length=3, max_length=100)
    role_slug: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    parent_role_id: Optional[int] = None
    level: Optional[int] = Field(None, ge=1, le=10)
    is_active: Optional[bool] = None

    @field_validator("role_slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        """Validate slug format."""
        if v is not None and not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError("role_slug must contain only lowercase letters, numbers, and hyphens")
        return v


class PermissionResponse(BaseModel):
    """Schema for permission response."""
    
    id: int
    permission_name: str
    permission_slug: str
    category: str
    description: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class RoleResponse(RoleBase):
    """Schema for role response."""
    
    id: int
    is_system_role: bool
    created_at: datetime
    updated_at: datetime
    permissions: Optional[List[PermissionResponse]] = None

    class Config:
        """Pydantic config."""
        from_attributes = True


class RoleListResponse(BaseModel):
    """Schema for paginated role list."""
    
    items: List[RoleResponse]
    total: int
    page: int
    size: int
    pages: int


class PermissionListResponse(BaseModel):
    """Schema for paginated permission list."""
    
    items: List[PermissionResponse]
    total: int
    page: int
    size: int
    pages: int


class AssignPermissionsRequest(BaseModel):
    """Schema for assigning permissions to role."""
    
    permission_ids: List[int] = Field(..., min_items=1, description="Permission IDs to assign")


class RoleHierarchyNode(BaseModel):
    """Schema for role hierarchy tree node."""
    
    id: int
    role_name: str
    role_slug: str
    level: int
    children: List['RoleHierarchyNode'] = []

    class Config:
        """Pydantic config."""
        from_attributes = True


class RoleStatistics(BaseModel):
    """Schema for role statistics."""
    
    total_roles: int
    active_roles: int
    inactive_roles: int
    system_roles: int
    custom_roles: int
    roles_with_permissions: int
    total_permissions: int
    active_permissions: int
