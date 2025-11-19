"""User Segments Management dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from .service import UserSegmentsService


def get_user_segments_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user)]
) -> UserSegmentsService:
    """Get user segments service instance."""
    return UserSegmentsService(db=db)
