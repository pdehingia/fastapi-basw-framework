"""Support management dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from app.shared.models.user import AdminUser
from .service import SupportManagementService


def get_support_service(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[AdminUser, Depends(get_current_admin_user)]
) -> SupportManagementService:
    """Get support management service with admin context."""
    return SupportManagementService(db, current_admin.id)