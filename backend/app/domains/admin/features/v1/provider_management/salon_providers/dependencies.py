"""
Dependency injection for Salon Provider Management
"""

from typing import Optional
from uuid import UUID
from datetime import date

from fastapi import Query

from .schemas import SalonProviderFilters


def get_salon_provider_filters(
    salon_id: Optional[UUID] = Query(None),
    provider_user_id: Optional[UUID] = Query(None),
    employment_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    joined_after: Optional[date] = Query(None),
    joined_before: Optional[date] = Query(None),
    search: Optional[str] = Query(None)
) -> SalonProviderFilters:
    """Dependency to extract salon provider filters from query params"""
    return SalonProviderFilters(
        salon_id=salon_id,
        provider_user_id=provider_user_id,
        employment_type=employment_type,
        is_active=is_active,
        joined_after=joined_after,
        joined_before=joined_before,
        search=search
    )
