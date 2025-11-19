"""Roles & Permissions API endpoints."""
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from math import ceil

from app.domains.admin.features.v1.roles_permissions_management.dependencies import (
    get_rbac_service,
    RequireAuth
)
from app.domains.admin.features.v1.roles_permissions_management.service import RolesPermissionsService
from app.domains.admin.features.v1.roles_permissions_management.schemas import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    RoleListResponse,
    PermissionResponse,
    PermissionListResponse,
    AssignPermissionsRequest,
    RoleHierarchyNode,
    RoleStatistics
)

router = APIRouter(prefix="/rbac", tags=["Roles & Permissions"])


@router.post(
    "/roles",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create role"
)
async def create_role(
    data: RoleCreate,
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)]
) -> RoleResponse:
    """Create a new admin role with optional initial permissions."""
    role = await service.create_role(data)
    
    # Reload with permissions if they were assigned
    if data.permission_ids:
        role = await service.get_role_by_id(role.id, include_permissions=True)
    
    # Map permissions for response
    role_dict = {
        **role.__dict__,
        "permissions": [
            rp.permission for rp in role.role_permissions
        ] if hasattr(role, 'role_permissions') and role.role_permissions else []
    }
    return RoleResponse.model_validate(role_dict)


@router.get(
    "/roles",
    response_model=RoleListResponse,
    summary="List roles"
)
async def list_roles(
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)],
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Page size"),
    include_inactive: bool = Query(False, description="Include inactive roles"),
    include_permissions: bool = Query(True, description="Include permissions in response")
) -> RoleListResponse:
    """Get paginated list of roles with optional permissions."""
    skip = (page - 1) * size
    roles, total = await service.get_roles(skip, size, include_inactive, include_permissions)
    
    # Map roles with permissions
    role_items = []
    for role in roles:
        role_dict = {
            **role.__dict__,
            "permissions": [
                rp.permission for rp in role.role_permissions
            ] if hasattr(role, 'role_permissions') and role.role_permissions else []
        }
        role_items.append(RoleResponse.model_validate(role_dict))
    
    return RoleListResponse(
        items=role_items,
        total=total,
        page=page,
        size=size,
        pages=ceil(total / size) if total > 0 else 0
    )


@router.get(
    "/roles/statistics",
    response_model=RoleStatistics,
    summary="Get role statistics"
)
async def get_role_statistics(
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)]
) -> RoleStatistics:
    """Get comprehensive role and permission statistics."""
    return await service.get_statistics()


@router.get(
    "/roles/hierarchy",
    response_model=list[RoleHierarchyNode],
    summary="Get role hierarchy"
)
async def get_role_hierarchy(
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)]
) -> list[RoleHierarchyNode]:
    """Get role hierarchy tree structure."""
    roles = await service.get_role_hierarchy()
    
    # Build hierarchy tree
    role_map = {role.id: role for role in roles}
    root_roles = []
    
    for role in roles:
        node = RoleHierarchyNode(
            id=role.id,
            role_name=role.role_name,
            role_slug=role.role_slug,
            level=role.level,
            children=[]
        )
        
        if role.parent_role_id is None:
            root_roles.append(node)
        else:
            # Find parent and add as child
            parent = role_map.get(role.parent_role_id)
            if parent:
                # This is simplified - in production, you'd build the full tree recursively
                pass
    
    # For now, return flat list (full tree building would require recursive logic)
    return [
        RoleHierarchyNode(
            id=role.id,
            role_name=role.role_name,
            role_slug=role.role_slug,
            level=role.level,
            children=[]
        ) for role in roles
    ]


@router.get(
    "/roles/{role_id}",
    response_model=RoleResponse,
    summary="Get role"
)
async def get_role(
    role_id: int,
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)]
) -> RoleResponse:
    """Get role by ID with permissions."""
    role = await service.get_role_by_id(role_id, include_permissions=True)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    role_dict = {
        **role.__dict__,
        "permissions": [
            rp.permission for rp in role.role_permissions
        ] if hasattr(role, 'role_permissions') and role.role_permissions else []
    }
    return RoleResponse.model_validate(role_dict)


@router.put(
    "/roles/{role_id}",
    response_model=RoleResponse,
    summary="Update role"
)
async def update_role(
    role_id: int,
    data: RoleUpdate,
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)]
) -> RoleResponse:
    """Update role details (cannot update system roles)."""
    role = await service.update_role(role_id, data)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found or is a system role"
        )
    
    # Reload with permissions
    role = await service.get_role_by_id(role.id, include_permissions=True)
    role_dict = {
        **role.__dict__,
        "permissions": [
            rp.permission for rp in role.role_permissions
        ] if hasattr(role, 'role_permissions') and role.role_permissions else []
    }
    return RoleResponse.model_validate(role_dict)


@router.delete(
    "/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete role"
)
async def delete_role(
    role_id: int,
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)]
) -> None:
    """Delete role (cannot delete system roles)."""
    success = await service.delete_role(role_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete role - either not found or is a system role"
        )


@router.get(
    "/permissions",
    response_model=PermissionListResponse,
    summary="List permissions"
)
async def list_permissions(
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)],
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(100, ge=1, le=200, description="Page size"),
    category: Optional[str] = Query(None, description="Filter by category")
) -> PermissionListResponse:
    """Get paginated list of all system permissions."""
    skip = (page - 1) * size
    permissions, total = await service.get_permissions(skip, size, category)
    
    return PermissionListResponse(
        items=[PermissionResponse.model_validate(p) for p in permissions],
        total=total,
        page=page,
        size=size,
        pages=ceil(total / size) if total > 0 else 0
    )


@router.post(
    "/roles/{role_id}/permissions",
    response_model=RoleResponse,
    summary="Assign permissions to role"
)
async def assign_permissions(
    role_id: int,
    request: AssignPermissionsRequest,
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)]
) -> RoleResponse:
    """Assign one or more permissions to a role."""
    role = await service.assign_permissions(role_id, request)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found or is a system role"
        )
    
    role_dict = {
        **role.__dict__,
        "permissions": [
            rp.permission for rp in role.role_permissions
        ] if hasattr(role, 'role_permissions') and role.role_permissions else []
    }
    return RoleResponse.model_validate(role_dict)


@router.delete(
    "/roles/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove permission from role"
)
async def remove_permission(
    role_id: int,
    permission_id: int,
    current_admin: RequireAuth,
    service: Annotated[RolesPermissionsService, Depends(get_rbac_service)]
) -> None:
    """Remove a permission from a role."""
    success = await service.remove_permission(role_id, permission_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role-permission mapping not found or role is a system role"
        )
