"""Unified Business Operations module with sub-routers for bookings, payments, financial, subscriptions, and addresses."""

from fastapi import APIRouter

# Import from subdirectories
from .bookings import api as booking_management_api
from .payments import api as payment_management_api
from .financial import api as financial_management_api
from .subscriptions import api as subscription_management_api
from .addresses import api as address_management_api

# Create unified router
router = APIRouter(prefix="/business-operations", tags=["Business Operations"])

# Include all sub-routers
router.include_router(booking_management_api.router)
router.include_router(payment_management_api.router)
router.include_router(financial_management_api.router, prefix="/financial", tags=["Financial Management"])
router.include_router(subscription_management_api.router)
router.include_router(address_management_api.router)

__all__ = ["router"]
