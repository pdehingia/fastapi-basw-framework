"""Customer Audit Logs Management dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from .service import CustomerAuditLogsService


def get_customer_audit_logs_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user)]
) -> CustomerAuditLogsService:
    """Get customer audit logs service instance."""
    return CustomerAuditLogsService(db=db)
