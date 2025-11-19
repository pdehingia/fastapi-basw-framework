"""Roles & Permissions Dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.database import get_db
from app.domains.admin.features.v1.roles_permissions_management.service import RolesPermissionsService
from app.domains.admin.features.v1.auth.dependencies import get_current_admin


async def get_rbac_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> RolesPermissionsService:
    """Get roles and permissions service instance."""
    return RolesPermissionsService(db)


# Require admin authentication
RequireAuth = Annotated[dict, Depends(get_current_admin)]
