"""Email Templates Dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.admin.features.v1.email_templates.service import EmailTemplatesService
from app.domains.admin.features.v1.auth.dependencies import get_current_admin


async def get_email_templates_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> EmailTemplatesService:
    """Get email templates service instance."""
    return EmailTemplatesService(db)


# Require admin authentication
RequireAuth = Annotated[dict, Depends(get_current_admin)]
