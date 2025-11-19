"""
Marketing Management Module

This module provides comprehensive marketing management functionality for the admin panel.
Includes promo codes, referrals, and advertisements management.
"""

from app.domains.admin.features.v1.marketing_management.api import router as marketing_management_router
from app.domains.admin.features.v1.marketing_management.service import MarketingManagementService
from app.domains.admin.features.v1.marketing_management.dependencies import (
    get_marketing_management_service,
    MarketingManagementServiceDep
)

__all__ = [
    "marketing_management_router",
    "MarketingManagementService", 
    "get_marketing_management_service",
    "MarketingManagementServiceDep"
]