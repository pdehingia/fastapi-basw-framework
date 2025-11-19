"""Roles & Permissions Management Module."""
from fastapi import APIRouter
from app.domains.admin.features.v1.roles_permissions_management.api import router as rbac_router

__all__ = ["router"]

router = APIRouter()
router.include_router(rbac_router)
