"""PPC Campaigns Management dependencies."""

from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from .service import PPCCampaignsService


def get_ppc_campaigns_service(
    db: Annotated[Session, Depends(get_db)],
    admin_user: Annotated[dict, Depends(get_current_admin_user)]
) -> PPCCampaignsService:
    """Get PPC campaigns service instance."""
    return PPCCampaignsService(db=db)
