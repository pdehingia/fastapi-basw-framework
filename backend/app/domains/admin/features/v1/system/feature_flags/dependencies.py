"""Feature Flags Dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.admin.features.v1.feature_flags.service import FeatureFlagsService
from app.domains.admin.features.v1.auth.dependencies import get_current_admin


async def get_feature_flags_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> FeatureFlagsService:
    """Get feature flags service instance."""
    return FeatureFlagsService(db)


# Require admin authentication
RequireAuth = Annotated[dict, Depends(get_current_admin)]
