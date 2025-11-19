"""Email Templates Management Module."""
from fastapi import APIRouter
from app.domains.admin.features.v1.email_templates.api import router as templates_router

__all__ = ["router"]

router = APIRouter()
router.include_router(templates_router)
