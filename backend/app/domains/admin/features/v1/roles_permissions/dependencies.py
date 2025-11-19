"""Dependencies for roles and permissions management."""

from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from app.shared.models.user import AdminUser, Role, Permission, RolePermission
from app.core.exceptions import UnauthorizedException as UnauthorizedError


def require_permission(permission_slug: str):
    """
    Dependency to check if current admin user has specific permission.
    
    Args:
        permission_slug: The permission slug required
    
    Returns:
        Dependency function that validates permission
    """
    async def check_permission(
        current_admin: AdminUser = Depends(get_current_admin_user),
        db: Session = Depends(get_db)
    ) -> AdminUser:
        # Super admin bypass
        if hasattr(current_admin, 'is_super_admin') and current_admin.is_super_admin:
            return current_admin
        
        # Check if user's role has the required permission
        has_permission = (
            db.query(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .filter(
                Role.id == current_admin.role_id,
                Permission.permission_slug == permission_slug,
                Permission.is_active == True,
                Role.is_active == True
            )
            .first()
        )
        
        if not has_permission:
            raise UnauthorizedError(
                f"Missing required permission: {permission_slug}"
            )
        
        return current_admin
    
    return check_permission


def require_any_permission(*permission_slugs: str):
    """
    Dependency to check if current admin user has ANY of the specified permissions.
    
    Args:
        permission_slugs: Variable number of permission slugs (user needs at least one)
    
    Returns:
        Dependency function that validates permissions
    """
    async def check_any_permission(
        current_admin: AdminUser = Depends(get_current_admin_user),
        db: Session = Depends(get_db)
    ) -> AdminUser:
        # Super admin bypass
        if hasattr(current_admin, 'is_super_admin') and current_admin.is_super_admin:
            return current_admin
        
        # Check if user's role has any of the required permissions
        has_permission = (
            db.query(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .filter(
                Role.id == current_admin.role_id,
                Permission.permission_slug.in_(permission_slugs),
                Permission.is_active == True,
                Role.is_active == True
            )
            .first()
        )
        
        if not has_permission:
            raise UnauthorizedError(
                f"Missing required permissions. Need one of: {', '.join(permission_slugs)}"
            )
        
        return current_admin
    
    return check_any_permission


def require_all_permissions(*permission_slugs: str):
    """
    Dependency to check if current admin user has ALL of the specified permissions.
    
    Args:
        permission_slugs: Variable number of permission slugs (user needs all of them)
    
    Returns:
        Dependency function that validates permissions
    """
    async def check_all_permissions(
        current_admin: AdminUser = Depends(get_current_admin_user),
        db: Session = Depends(get_db)
    ) -> AdminUser:
        # Super admin bypass
        if hasattr(current_admin, 'is_super_admin') and current_admin.is_super_admin:
            return current_admin
        
        # Check if user's role has all required permissions
        permissions_count = (
            db.query(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .filter(
                Role.id == current_admin.role_id,
                Permission.permission_slug.in_(permission_slugs),
                Permission.is_active == True,
                Role.is_active == True
            )
            .count()
        )
        
        if permissions_count < len(permission_slugs):
            raise UnauthorizedError(
                f"Missing required permissions. Need all of: {', '.join(permission_slugs)}"
            )
        
        return current_admin
    
    return check_all_permissions


# Specific permission dependencies for roles and permissions management
def require_roles_management(
    current_admin: AdminUser = Depends(require_permission("roles.manage"))
) -> AdminUser:
    """Require roles management permission."""
    return current_admin


def require_permissions_management(
    current_admin: AdminUser = Depends(require_permission("permissions.manage"))
) -> AdminUser:
    """Require permissions management permission."""
    return current_admin


def require_role_permissions_management(
    current_admin: AdminUser = Depends(
        require_any_permission("roles.manage", "permissions.manage")
    )
) -> AdminUser:
    """Require either roles or permissions management permission."""
    return current_admin
