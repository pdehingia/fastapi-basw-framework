"""Payment management dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_admin_user
from app.shared.models.user import AdminUser
from .service import PaymentManagementService


def get_payment_service(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[AdminUser, Depends(get_current_admin_user)]
) -> PaymentManagementService:
    """Get payment management service with admin context."""
    return PaymentManagementService(db, current_admin.id)