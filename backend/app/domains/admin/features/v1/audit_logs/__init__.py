"""Unified Audit Logs module with sub-routers for provider, customer, and user activity logs."""

from fastapi import APIRouter

# Import schemas and services from original modules
from ..provider_audit_logs import api as provider_audit_api
from ..customer_audit_logs import api as customer_audit_api  
from ..user_activity_logs import api as user_activity_api

# Create unified router
router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

# Create sub-routers with modified prefixes
provider_router = APIRouter(prefix="/providers", tags=["Provider Audit Logs"])
customer_router = APIRouter(prefix="/customers", tags=["Customer Audit Logs"])
activity_router = APIRouter(prefix="/activity", tags=["User Activity Logs"])

# Copy routes from original routers (they'll maintain their endpoints)
provider_router.routes = provider_audit_api.router.routes
customer_router.routes = customer_audit_api.router.routes
activity_router.routes = user_activity_api.router.routes

# Include all sub-routers
router.include_router(provider_router)
router.include_router(customer_router)
router.include_router(activity_router)

__all__ = ["router"]
