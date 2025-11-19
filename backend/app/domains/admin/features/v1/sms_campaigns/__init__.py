"""SMS Campaigns Module for marketing campaigns."""
from fastapi import APIRouter
from app.domains.admin.features.v1.sms_campaigns.api import router as sms_campaigns_router

__all__ = ["router"]

router = APIRouter()
router.include_router(sms_campaigns_router)
