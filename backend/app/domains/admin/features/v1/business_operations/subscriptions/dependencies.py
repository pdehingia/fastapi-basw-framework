"""Dependencies for subscription management."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from app.shared.models.user import AdminUser


def require_subscription_management(
    current_admin: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> AdminUser:
    """Require subscription management permission."""
    # Permission check can be added here if needed
    # For now, any authenticated admin can manage subscriptions
    return current_admin
