"""Dependencies for address management."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from app.shared.models.user import AdminUser


def require_address_management(
    current_admin: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> AdminUser:
    """Require address management permission."""
    return current_admin
