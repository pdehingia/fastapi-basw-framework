"""Roles and Permissions Management API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from app.shared.models.user import AdminUser
from app.shared.pagination import PaginationParams
from app.shared.responses import SuccessResponse

from .schemas import (
    RoleCreate, RoleUpdate, RoleResponse, RoleWithPermissions,
    PermissionCreate, PermissionUpdate, PermissionResponse,
    RoleFilterParams, PermissionFilterParams,
    RoleListResponse, PermissionListResponse,
    RoleHierarchyNode, RoleStatistics, PermissionStatistics,
    RolePermissionAssign
)
from .service import RolesPermissionsService
from .dependencies import (
    require_roles_management,
    require_permissions_management,
    require_role_permissions_management
)


router = APIRouter(prefix="/roles-permissions", tags=["Roles & Permissions Management"])


# ===== ROLE MANAGEMENT ENDPOINTS =====

@router.post(
    "/roles",
    response_model=SuccessResponse[RoleResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create new role",
    description="Create a new role with specified permissions and hierarchy level"
)
async def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_roles_management)
):
    """Create a new role."""
    service = RolesPermissionsService(db)
    role = service.create_role(role_data)
    
    return SuccessResponse(
        data=role,
        message="Role created successfully"
    )


@router.get(
    "/roles",
    response_model=SuccessResponse[RoleListResponse],
    summary="List all roles",
    description="Get paginated list of all roles with optional filters"
)
async def list_roles(
    search: str = Query(None, description="Search in role name and description"),
    is_active: bool = Query(None, description="Filter by active status"),
    is_system_role: bool = Query(None, description="Filter by system role flag"),
    parent_role_id: int = Query(None, description="Filter by parent role"),
    level: int = Query(None, ge=1, le=10, description="Filter by hierarchy level"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_role_permissions_management)
):
    """Get paginated list of roles with filters."""
    service = RolesPermissionsService(db)
    
    filters = RoleFilterParams(
        search=search,
        is_active=is_active,
        is_system_role=is_system_role,
        parent_role_id=parent_role_id,
        level=level
    )
    
    pagination = PaginationParams(page=page, page_size=page_size)
    
    result = service.get_roles_list(filters, pagination)
    
    return SuccessResponse(
        data=result,
        message="Roles retrieved successfully"
    )


@router.get(
    "/roles/{role_id}",
    response_model=SuccessResponse[RoleWithPermissions],
    summary="Get role details",
    description="Get detailed information about a specific role including its permissions"
)
async def get_role_details(
    role_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_role_permissions_management)
):
    """Get role details with permissions."""
    service = RolesPermissionsService(db)
    role = service.get_role_with_permissions(role_id)
    
    return SuccessResponse(
        data=role,
        message="Role details retrieved successfully"
    )


@router.put(
    "/roles/{role_id}",
    response_model=SuccessResponse[RoleResponse],
    summary="Update role",
    description="Update role details (cannot modify system roles)"
)
async def update_role(
    role_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_roles_management)
):
    """Update role details."""
    service = RolesPermissionsService(db)
    role = service.update_role(role_id, role_data)
    
    return SuccessResponse(
        data=role,
        message="Role updated successfully"
    )


@router.delete(
    "/roles/{role_id}",
    response_model=SuccessResponse[dict],
    summary="Delete role",
    description="Delete (deactivate) a role. Cannot delete system roles or roles with children."
)
async def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_roles_management)
):
    """Delete (deactivate) a role."""
    service = RolesPermissionsService(db)
    service.delete_role(role_id)
    
    return SuccessResponse(
        data={"role_id": role_id, "deleted": True},
        message="Role deleted successfully"
    )


# ===== ROLE-PERMISSION ASSOCIATION ENDPOINTS =====

@router.post(
    "/roles/{role_id}/permissions",
    response_model=SuccessResponse[RoleWithPermissions],
    summary="Assign permissions to role",
    description="Assign one or more permissions to a role"
)
async def assign_permissions_to_role(
    role_id: int,
    permission_data: RolePermissionAssign,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_roles_management)
):
    """Assign permissions to a role."""
    service = RolesPermissionsService(db)
    role = service.assign_permissions_to_role(role_id, permission_data.permission_ids)
    
    return SuccessResponse(
        data=role,
        message=f"Assigned {len(permission_data.permission_ids)} permission(s) to role"
    )


@router.delete(
    "/roles/{role_id}/permissions/{permission_id}",
    response_model=SuccessResponse[dict],
    summary="Remove permission from role",
    description="Remove a specific permission from a role"
)
async def remove_permission_from_role(
    role_id: int,
    permission_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_roles_management)
):
    """Remove a permission from a role."""
    service = RolesPermissionsService(db)
    service.remove_single_permission_from_role(role_id, permission_id)
    
    return SuccessResponse(
        data={"role_id": role_id, "permission_id": permission_id, "removed": True},
        message="Permission removed from role successfully"
    )


# ===== PERMISSION MANAGEMENT ENDPOINTS =====

@router.get(
    "/permissions",
    response_model=SuccessResponse[PermissionListResponse],
    summary="List all permissions",
    description="Get paginated list of all permissions with optional filters"
)
async def list_permissions(
    search: str = Query(None, description="Search in permission name and description"),
    category: str = Query(None, description="Filter by category"),
    is_active: bool = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_role_permissions_management)
):
    """Get paginated list of permissions with filters."""
    service = RolesPermissionsService(db)
    
    filters = PermissionFilterParams(
        search=search,
        category=category,
        is_active=is_active
    )
    
    pagination = PaginationParams(page=page, page_size=page_size)
    
    result = service.get_permissions_list(filters, pagination)
    
    return SuccessResponse(
        data=result,
        message="Permissions retrieved successfully"
    )


# ===== HIERARCHY & STATISTICS ENDPOINTS =====

@router.get(
    "/roles/hierarchy",
    response_model=SuccessResponse[List[RoleHierarchyNode]],
    summary="Get role hierarchy",
    description="Get complete role hierarchy tree structure"
)
async def get_role_hierarchy(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_role_permissions_management)
):
    """Get role hierarchy tree."""
    service = RolesPermissionsService(db)
    hierarchy = service.get_role_hierarchy()
    
    return SuccessResponse(
        data=hierarchy,
        message="Role hierarchy retrieved successfully"
    )


@router.get(
    "/roles/statistics",
    response_model=SuccessResponse[RoleStatistics],
    summary="Get role statistics",
    description="Get statistical overview of roles"
)
async def get_role_statistics(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_role_permissions_management)
):
    """Get role statistics."""
    service = RolesPermissionsService(db)
    stats = service.get_role_statistics()
    
    return SuccessResponse(
        data=stats,
        message="Role statistics retrieved successfully"
    )


@router.get(
    "/permissions/statistics",
    response_model=SuccessResponse[PermissionStatistics],
    summary="Get permission statistics",
    description="Get statistical overview of permissions"
)
async def get_permission_statistics(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_role_permissions_management)
):
    """Get permission statistics."""
    service = RolesPermissionsService(db)
    stats = service.get_permission_statistics()
    
    return SuccessResponse(
        data=stats,
        message="Permission statistics retrieved successfully"
    )
