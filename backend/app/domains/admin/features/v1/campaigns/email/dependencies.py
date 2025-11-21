"""Email Campaigns Dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.domains.admin.features.v1.campaigns.email.service import EmailCampaignsService
from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user


async def get_email_campaigns_service(
    db: Annotated[AsyncSession, Depends(get_async_db)]
) -> EmailCampaignsService:
    """Get email campaigns service instance."""
    return EmailCampaignsService(db)


# Require admin authentication
RequireAuth = Annotated[dict, Depends(get_current_admin_user)]
