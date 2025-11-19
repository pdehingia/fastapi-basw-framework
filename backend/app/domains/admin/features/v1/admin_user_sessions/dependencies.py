"""Admin user sessions dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.shared.database import get_db
from .service import AdminUserSessionsService


def get_admin_user_sessions_service(
    db: Annotated[Session, Depends(get_db)]
) -> AdminUserSessionsService:
    """Get admin user sessions service instance."""
    return AdminUserSessionsService(db)
