"""System configuration dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from .service import SystemConfigurationService


async def get_system_config_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user)]
) -> SystemConfigurationService:
    """Get system configuration service instance."""
    return SystemConfigurationService(db=db, admin_user_id=admin_user["id"])