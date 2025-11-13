"""Shared dependencies and utilities for admin domain."""

from typing import Dict, Any

from fastapi import Depends, HTTPException, status

from app.domains.admin.features.auth.dependencies import get_current_admin_user


async def require_admin_role(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require basic admin role."""
    return current_user


async def require_super_admin(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require super admin privileges."""
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required"
        )
    return current_user