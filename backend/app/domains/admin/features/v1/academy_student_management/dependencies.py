"""Academy student management feature dependencies."""

from typing import Dict, Any

from fastapi import Depends

from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user, require_admin_permissions


async def require_academy_student_management_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require academy student management access permissions."""
    return await require_admin_permissions("can_manage_academy_students", current_user)


async def require_academy_management_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require academy management access permissions."""
    return await require_admin_permissions("can_manage_academies", current_user)