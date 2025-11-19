"""SMS Campaigns Dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.database import get_db
from app.domains.admin.features.v1.sms_campaigns.service import SMSCampaignsService
from app.domains.admin.features.v1.auth.dependencies import get_current_admin


async def get_sms_campaigns_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> SMSCampaignsService:
    """Get SMS campaigns service instance."""
    return SMSCampaignsService(db)


# Require admin authentication
RequireAuth = Annotated[dict, Depends(get_current_admin)]
