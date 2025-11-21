"""Unified Campaigns module with sub-routers for email campaigns, SMS campaigns, and email templates."""

from fastapi import APIRouter

# Import from subdirectories
from .email import router as email_campaigns_api
from .sms import router as sms_campaigns_api
# from .templates import router as email_templates_api  # TODO: Fix import paths

# Create unified router
router = APIRouter(prefix="/campaigns", tags=["Campaigns & Templates"])

# Create sub-routers with modified prefixes
email_campaigns_router = APIRouter(prefix="/email", tags=["Email Campaigns"])
sms_campaigns_router = APIRouter(prefix="/sms", tags=["SMS Campaigns"])
# email_templates_router = APIRouter(prefix="/templates", tags=["Email Templates"])  # TODO: Fix import paths

# Copy routes from original routers
email_campaigns_router.routes = email_campaigns_api.routes
sms_campaigns_router.routes = sms_campaigns_api.routes
# email_templates_router.routes = email_templates_api.routes  # TODO: Fix import paths

# Include all sub-routers
router.include_router(email_campaigns_router)
router.include_router(sms_campaigns_router)
# router.include_router(email_templates_router)  # TODO: Fix import paths

__all__ = ["router"]
