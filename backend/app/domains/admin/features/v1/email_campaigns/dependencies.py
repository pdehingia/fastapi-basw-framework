"""Email Campaigns Dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.database import get_db
from app.domains.admin.features.v1.email_campaigns.service import EmailCampaignsService
from app.domains.admin.features.v1.auth.dependencies import get_current_admin


async def get_email_campaigns_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> EmailCampaignsService:
    """Get email campaigns service instance."""
    return EmailCampaignsService(db)


# Require admin authentication
RequireAuth = Annotated[dict, Depends(get_current_admin)]
