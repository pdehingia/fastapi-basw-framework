"""Feature Flags Service Layer."""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models.feature_flag import FeatureFlag
from app.domains.admin.features.v1.feature_flags.schemas import (
    FeatureFlagCreate,
    FeatureFlagUpdate,
    FeatureFlagFilters,
    FeatureFlagToggleRequest
)


class FeatureFlagsService:
    """Service for managing feature flags."""

    def __init__(self, db: AsyncSession):
        """Initialize service."""
        self.db = db

    async def create_flag(
        self,
        data: FeatureFlagCreate,
        created_by: UUID
    ) -> FeatureFlag:
        """Create new feature flag."""
        flag = FeatureFlag(
            **data.model_dump(),
            created_by=created_by
        )
        self.db.add(flag)
        await self.db.commit()
        await self.db.refresh(flag)
        return flag

    async def get_flags(
        self,
        filters: Optional[FeatureFlagFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[FeatureFlag], int]:
        """Get paginated list of feature flags."""
        query = select(FeatureFlag)
        
        # Apply filters
        if filters:
            conditions = []
            if filters.is_enabled is not None:
                conditions.append(FeatureFlag.is_enabled == filters.is_enabled)
            if filters.user_segment:
                conditions.append(FeatureFlag.user_segments.contains([filters.user_segment]))
            if filters.search:
                search_pattern = f"%{filters.search}%"
                conditions.append(
                    or_(
                        FeatureFlag.name.ilike(search_pattern),
                        FeatureFlag.key.ilike(search_pattern),
                        FeatureFlag.description.ilike(search_pattern)
                    )
                )
            
            if conditions:
                query = query.where(and_(*conditions))
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)
        
        # Apply pagination and ordering
        query = query.order_by(FeatureFlag.name).offset(skip).limit(limit)
        result = await self.db.execute(query)
        flags = result.scalars().all()
        
        return list(flags), total or 0

    async def get_flag_by_id(self, flag_id: UUID) -> Optional[FeatureFlag]:
        """Get feature flag by ID."""
        query = select(FeatureFlag).where(FeatureFlag.id == flag_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_flag_by_key(self, key: str) -> Optional[FeatureFlag]:
        """Get feature flag by key."""
        query = select(FeatureFlag).where(FeatureFlag.key == key.lower())
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_flag(
        self,
        flag_id: UUID,
        data: FeatureFlagUpdate,
        updated_by: UUID
    ) -> Optional[FeatureFlag]:
        """Update feature flag."""
        flag = await self.get_flag_by_id(flag_id)
        if not flag:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(flag, field, value)
        
        flag.updated_by = updated_by
        flag.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(flag)
        return flag

    async def delete_flag(self, flag_id: UUID) -> bool:
        """Delete feature flag."""
        flag = await self.get_flag_by_id(flag_id)
        if not flag:
            return False
        
        await self.db.delete(flag)
        await self.db.commit()
        return True

    async def toggle_flag(
        self,
        flag_id: UUID,
        toggle_data: FeatureFlagToggleRequest,
        updated_by: UUID
    ) -> Optional[FeatureFlag]:
        """Toggle feature flag on/off."""
        flag = await self.get_flag_by_id(flag_id)
        if not flag:
            return None
        
        flag.is_enabled = toggle_data.is_enabled
        flag.updated_by = updated_by
        flag.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(flag)
        return flag

    async def is_feature_enabled(
        self,
        key: str,
        user_id: Optional[UUID] = None,
        user_segment: Optional[str] = None
    ) -> bool:
        """Check if feature is enabled for a user."""
        flag = await self.get_flag_by_key(key)
        if not flag or not flag.is_enabled:
            return False
        
        # If 100% rollout, return True
        if flag.rollout_percentage >= 100:
            return True
        
        # If 0% rollout, return False
        if flag.rollout_percentage <= 0:
            return False
        
        # Check user segment targeting
        if flag.user_segments and user_segment:
            if user_segment not in flag.user_segments:
                return False
        
        # Implement percentage-based rollout using user_id
        if user_id and flag.rollout_percentage > 0:
            # Use hash of user_id to determine if user is in rollout percentage
            user_hash = hash(str(user_id))
            rollout_threshold = (user_hash % 100) < flag.rollout_percentage
            return rollout_threshold
        
        return flag.rollout_percentage >= 100
