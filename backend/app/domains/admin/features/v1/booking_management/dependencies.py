"""Booking management feature dependencies."""

from typing import Dict, Any

from fastapi import Depends

from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user, require_admin_permissions


async def require_booking_management_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require booking management access permissions."""
    # All admin users can access booking management
    # In the future, we might want more granular permissions
    return current_user


async def require_booking_dispute_resolution(
    current_user: Dict[str, Any] = Depends(require_admin_permissions)
) -> Dict[str, Any]:
    """Require permissions to resolve booking disputes."""
    # Only users with system management permissions can resolve disputes
    return await require_admin_permissions("can_manage_system", current_user)