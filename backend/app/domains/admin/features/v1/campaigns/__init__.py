"""Unified Campaigns module with sub-routers for email campaigns, SMS campaigns, and email templates."""

from fastapi import APIRouter

# Import from subdirectories
from .email import api as email_campaigns_api
from .sms import api as sms_campaigns_api
from .templates import api as email_templates_api

# Create unified router
router = APIRouter(prefix="/campaigns", tags=["Campaigns & Templates"])

# Create sub-routers with modified prefixes
email_campaigns_router = APIRouter(prefix="/email", tags=["Email Campaigns"])
sms_campaigns_router = APIRouter(prefix="/sms", tags=["SMS Campaigns"])
email_templates_router = APIRouter(prefix="/templates", tags=["Email Templates"])

# Copy routes from original routers
email_campaigns_router.routes = email_campaigns_api.router.routes
sms_campaigns_router.routes = sms_campaigns_api.router.routes
email_templates_router.routes = email_templates_api.router.routes

# Include all sub-routers
router.include_router(email_campaigns_router)
router.include_router(sms_campaigns_router)
router.include_router(email_templates_router)

__all__ = ["router"]
