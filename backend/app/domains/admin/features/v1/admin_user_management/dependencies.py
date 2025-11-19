"""Admin user management dependencies."""

from typing import Annotated, Dict, Any
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.domains.admin.features.v1.auth.dependencies import require_admin_permissions
from .service import AdminUserManagementService


async def require_user_management_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require user management access permissions."""
    return await require_admin_permissions("can_manage_users", current_user)


async def require_system_admin_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require system admin access permissions."""
    return await require_admin_permissions("is_system_admin", current_user)


async def get_admin_user_management_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user)]
) -> AdminUserManagementService:
    """Get admin user management service instance."""
    return AdminUserManagementService(db=db, admin_user_id=admin_user["id"])