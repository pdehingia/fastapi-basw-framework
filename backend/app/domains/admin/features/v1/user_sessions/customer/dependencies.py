"""Customer user sessions dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from .service import CustomerUserSessionsService


def get_customer_user_sessions_service(
    db: Annotated[Session, Depends(get_db)]
) -> CustomerUserSessionsService:
    """Get customer user sessions service instance."""
    return CustomerUserSessionsService(db)
