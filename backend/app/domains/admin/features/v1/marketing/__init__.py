"""Unified Marketing module with sub-routers for campaigns, PPC, inquiries, segments, and promotions."""

from fastapi import APIRouter

# Import from subdirectories
from .campaigns import api as marketing_campaigns_api
from .ppc import api as ppc_campaigns_api
from .inquiries import api as admission_inquiries_api
from .segments import api as user_segments_api
from .promotions import api as promotions_api

# Create unified router
router = APIRouter(prefix="/marketing", tags=["Marketing"])

# Create sub-routers
campaigns_router = APIRouter(prefix="/campaigns", tags=["Marketing Campaigns"])
ppc_router = APIRouter(prefix="/ppc", tags=["PPC Campaigns"])
inquiries_router = APIRouter(prefix="/inquiries", tags=["Admission Inquiries"])
segments_router = APIRouter(prefix="/segments", tags=["User Segments"])
promotions_router = APIRouter(prefix="/promotions", tags=["Promotions"])

# Copy routes
campaigns_router.routes = marketing_campaigns_api.router.routes
ppc_router.routes = ppc_campaigns_api.router.routes
inquiries_router.routes = admission_inquiries_api.router.routes
segments_router.routes = user_segments_api.router.routes
promotions_router.routes = promotions_api.router.routes

# Include all sub-routers
router.include_router(campaigns_router)
router.include_router(ppc_router)
router.include_router(inquiries_router)
router.include_router(segments_router)
router.include_router(promotions_router)

__all__ = ["router"]
