"""
Financial Management Dependencies

This module provides dependency injection for financial management services.
"""

from functools import lru_cache
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.business_operations.financial.service import FinancialManagementService


@lru_cache()
def get_financial_management_service(
    db: Annotated[Session, Depends(get_db)]
) -> FinancialManagementService:
    """Get financial management service instance."""
    return FinancialManagementService(db)


# Type alias for dependency injection
FinancialManagementServiceDep = Annotated[
    FinancialManagementService, 
    Depends(get_financial_management_service)
]