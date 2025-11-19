"""Analytics and reports dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user_from_cookie
from .service import AnalyticsReportsService


async def get_analytics_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user_from_cookie)]
) -> AnalyticsReportsService:
    """Get analytics and reports service instance."""
    return AnalyticsReportsService(db=db, admin_user_id=admin_user.id)