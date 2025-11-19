"""Provider Management Dependencies for Admin Panel."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.shared.repositories.user import ProviderUserRepository
from .service import ProviderManagementService


def get_provider_repository(db: Session = Depends(get_db)) -> ProviderUserRepository:
    """Get provider user repository."""
    return ProviderUserRepository(db)


def get_provider_management_service(
    provider_repo: ProviderUserRepository = Depends(get_provider_repository)
) -> ProviderManagementService:
    """Get provider management service."""
    return ProviderManagementService(provider_repo)