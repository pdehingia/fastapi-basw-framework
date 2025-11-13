"""Admin user management dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from .service import AdminUserManagementService


async def get_admin_user_management_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user)]
) -> AdminUserManagementService:
    """Get admin user management service instance."""
    return AdminUserManagementService(db=db, admin_user_id=admin_user["id"])