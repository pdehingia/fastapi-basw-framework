"""Email Campaigns Module for marketing campaigns."""
from fastapi import APIRouter
from app.domains.admin.features.v1.email_campaigns.api import router as email_campaigns_router

__all__ = ["router"]

router = APIRouter()
router.include_router(email_campaigns_router)
