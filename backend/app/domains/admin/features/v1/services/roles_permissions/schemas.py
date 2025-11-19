"""Roles and Permissions Management schemas."""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, validator


# Role Schemas
class RoleBase(BaseModel):
    """Base role schema."""
    role_name: str = Field(..., min_length=1, max_length=100, description="Role name")
    role_slug: str = Field(..., min_length=1, max_length=100, description="Role slug (URL-friendly)")
    description: Optional[str] = Field(None, description="Role description")
    parent_role_id: Optional[int] = Field(None, description="Parent role ID for hierarchy")
    level: int = Field(1, ge=1, le=10, description="Role hierarchy level")
    is_active: bool = Field(True, description="Whether role is active")


class RoleCreate(RoleBase):
    """Schema for creating a role."""
    pass


class RoleUpdate(BaseModel):
    """Schema for updating a role."""
    role_name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_role_id: Optional[int] = None
    level: Optional[int] = Field(None, ge=1, le=10)
    is_active: Optional[bool] = None


class RoleResponse(RoleBase):
    """Schema for role response."""
    id: int
    is_system_role: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RoleWithPermissions(RoleResponse):
    """Role with associated permissions."""
    permissions: List['PermissionResponse'] = []


class RoleHierarchyNode(BaseModel):
    """Role hierarchy node."""
    id: int
    role_name: str
    role_slug: str
    level: int
    children: List['RoleHierarchyNode'] = []
    
    class Config:
        from_attributes = True


# Permission Schemas
class PermissionBase(BaseModel):
    """Base permission schema."""
    permission_name: str = Field(..., min_length=1, max_length=120, description="Permission name")
    permission_slug: str = Field(..., min_length=1, max_length=120, description="Permission slug")
    category: str = Field(..., min_length=1, max_length=60, description="Permission category")
    description: Optional[str] = Field(None, description="Permission description")
    is_active: bool = Field(True, description="Whether permission is active")


class PermissionCreate(PermissionBase):
    """Schema for creating a permission."""
    pass


class PermissionUpdate(BaseModel):
    """Schema for updating a permission."""
    permission_name: Optional[str] = Field(None, min_length=1, max_length=120)
    category: Optional[str] = Field(None, min_length=1, max_length=60)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class PermissionResponse(PermissionBase):
    """Schema for permission response."""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Role-Permission Association Schemas
class RolePermissionAssign(BaseModel):
    """Schema for assigning permissions to a role."""
    permission_ids: List[int] = Field(..., min_items=1, description="List of permission IDs to assign")


class RolePermissionRemove(BaseModel):
    """Schema for removing permissions from a role."""
    permission_ids: List[int] = Field(..., min_items=1, description="List of permission IDs to remove")


class RolePermissionResponse(BaseModel):
    """Schema for role-permission association response."""
    id: int
    role_id: int
    permission_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# List/Filter Schemas
class RoleFilterParams(BaseModel):
    """Filters for role list."""
    search: Optional[str] = Field(None, description="Search in role name and description")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    is_system_role: Optional[bool] = Field(None, description="Filter by system role flag")
    parent_role_id: Optional[int] = Field(None, description="Filter by parent role")
    level: Optional[int] = Field(None, ge=1, le=10, description="Filter by hierarchy level")


class PermissionFilterParams(BaseModel):
    """Filters for permission list."""
    search: Optional[str] = Field(None, description="Search in permission name and description")
    category: Optional[str] = Field(None, description="Filter by category")
    is_active: Optional[bool] = Field(None, description="Filter by active status")


class RoleListResponse(BaseModel):
    """Response for role list."""
    roles: List[RoleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PermissionListResponse(BaseModel):
    """Response for permission list."""
    permissions: List[PermissionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class RoleStatistics(BaseModel):
    """Role statistics."""
    total_roles: int
    active_roles: int
    system_roles: int
    custom_roles: int
    roles_by_level: dict


class PermissionStatistics(BaseModel):
    """Permission statistics."""
    total_permissions: int
    active_permissions: int
    permissions_by_category: dict


# Forward references
RoleHierarchyNode.model_rebuild()
