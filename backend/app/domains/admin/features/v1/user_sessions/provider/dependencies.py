"""Provider User Sessions Management dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from .service import ProviderUserSessionsService


def get_provider_user_sessions_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user)]
) -> ProviderUserSessionsService:
    """Get provider user sessions service instance."""
    return ProviderUserSessionsService(db=db)
