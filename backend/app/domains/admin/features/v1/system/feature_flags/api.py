"""Feature Flags API endpoints."""
from typing import Annotated, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from math import ceil

from app.domains.admin.features.v1.feature_flags.dependencies import (
    get_feature_flags_service,
    RequireAuth
)
from app.domains.admin.features.v1.feature_flags.service import FeatureFlagsService
from app.domains.admin.features.v1.feature_flags.schemas import (
    FeatureFlagCreate,
    FeatureFlagUpdate,
    FeatureFlagResponse,
    FeatureFlagListResponse,
    FeatureFlagFilters,
    FeatureFlagToggleRequest,
    FeatureFlagToggleResponse
)

router = APIRouter(prefix="/feature-flags", tags=["Feature Flags"])


@router.post(
    "",
    response_model=FeatureFlagResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create feature flag"
)
async def create_feature_flag(
    data: FeatureFlagCreate,
    current_admin: RequireAuth,
    service: Annotated[FeatureFlagsService, Depends(get_feature_flags_service)]
) -> FeatureFlagResponse:
    """Create a new feature flag."""
    # Check if key already exists
    existing = await service.get_flag_by_key(data.key)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Feature flag with key '{data.key}' already exists"
        )
    
    flag = await service.create_flag(data, current_admin["user_id"])
    return FeatureFlagResponse.model_validate(flag)


@router.get(
    "",
    response_model=FeatureFlagListResponse,
    summary="List feature flags"
)
async def list_feature_flags(
    current_admin: RequireAuth,
    service: Annotated[FeatureFlagsService, Depends(get_feature_flags_service)],
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Page size"),
    is_enabled: Optional[bool] = Query(None, description="Filter by enabled status"),
    user_segment: Optional[str] = Query(None, description="Filter by user segment"),
    search: Optional[str] = Query(None, description="Search in name, key, description")
) -> FeatureFlagListResponse:
    """Get paginated list of feature flags with filters."""
    filters = FeatureFlagFilters(
        is_enabled=is_enabled,
        user_segment=user_segment,
        search=search
    )
    
    skip = (page - 1) * size
    flags, total = await service.get_flags(filters, skip, size)
    
    return FeatureFlagListResponse(
        items=[FeatureFlagResponse.model_validate(f) for f in flags],
        total=total,
        page=page,
        size=size,
        pages=ceil(total / size) if total > 0 else 0
    )


@router.get(
    "/{flag_id}",
    response_model=FeatureFlagResponse,
    summary="Get feature flag"
)
async def get_feature_flag(
    flag_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[FeatureFlagsService, Depends(get_feature_flags_service)]
) -> FeatureFlagResponse:
    """Get feature flag by ID."""
    flag = await service.get_flag_by_id(flag_id)
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found"
        )
    return FeatureFlagResponse.model_validate(flag)


@router.put(
    "/{flag_id}",
    response_model=FeatureFlagResponse,
    summary="Update feature flag"
)
async def update_feature_flag(
    flag_id: UUID,
    data: FeatureFlagUpdate,
    current_admin: RequireAuth,
    service: Annotated[FeatureFlagsService, Depends(get_feature_flags_service)]
) -> FeatureFlagResponse:
    """Update feature flag."""
    flag = await service.update_flag(flag_id, data, current_admin["user_id"])
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found"
        )
    return FeatureFlagResponse.model_validate(flag)


@router.delete(
    "/{flag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete feature flag"
)
async def delete_feature_flag(
    flag_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[FeatureFlagsService, Depends(get_feature_flags_service)]
) -> None:
    """Delete feature flag."""
    success = await service.delete_flag(flag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found"
        )


@router.post(
    "/{flag_id}/toggle",
    response_model=FeatureFlagToggleResponse,
    summary="Toggle feature flag"
)
async def toggle_feature_flag(
    flag_id: UUID,
    toggle_data: FeatureFlagToggleRequest,
    current_admin: RequireAuth,
    service: Annotated[FeatureFlagsService, Depends(get_feature_flags_service)]
) -> FeatureFlagToggleResponse:
    """Quick toggle to enable/disable feature flag."""
    flag = await service.toggle_flag(flag_id, toggle_data, current_admin["user_id"])
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found"
        )
    
    return FeatureFlagToggleResponse(
        id=flag.id,
        key=flag.key,
        is_enabled=flag.is_enabled,
        message=f"Feature flag '{flag.key}' {'enabled' if flag.is_enabled else 'disabled'} successfully"
    )
