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

# Create sub-routers
bookings_router = APIRouter(prefix="/bookings", tags=["Booking Management"])
payments_router = APIRouter(prefix="/payments", tags=["Payment Management"])
financial_router = APIRouter(prefix="/financial", tags=["Financial Management"])
subscriptions_router = APIRouter(prefix="/subscriptions", tags=["Subscription Management"])
addresses_router = APIRouter(prefix="/addresses", tags=["Address Management"])

# Copy routes
bookings_router.routes = booking_management_api.router.routes
payments_router.routes = payment_management_api.router.routes
financial_router.routes = financial_management_api.router.routes
subscriptions_router.routes = subscription_management_api.router.routes
addresses_router.routes = address_management_api.router.routes

# Include all sub-routers
router.include_router(bookings_router)
router.include_router(payments_router)
router.include_router(financial_router)
router.include_router(subscriptions_router)
router.include_router(addresses_router)

__all__ = ["router"]
