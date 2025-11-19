"""
Marketing Management Dependencies

This module provides dependency injection for marketing management services.
"""

from functools import lru_cache
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.marketing_management.service import MarketingManagementService


@lru_cache()
def get_marketing_management_service(
    db: Annotated[Session, Depends(get_db)]
) -> MarketingManagementService:
    """Get marketing management service instance."""
    return MarketingManagementService(db)


# Type alias for dependency injection
MarketingManagementServiceDep = Annotated[
    MarketingManagementService, 
    Depends(get_marketing_management_service)
]