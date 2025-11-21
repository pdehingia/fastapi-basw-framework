"""Provider business details dependencies."""

from typing import Annotated
from uuid import UUID
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from .service import BusinessDetailsService


def get_business_details_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user)]
) -> BusinessDetailsService:
    """Get business details service instance."""
    admin_user_id = admin_user.get("id") if isinstance(admin_user, dict) else admin_user.id
    return BusinessDetailsService(db=db, admin_user_id=admin_user_id)
