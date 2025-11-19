"""Feature Flag Schemas."""
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class FeatureFlagBase(BaseModel):
    """Base feature flag schema."""
    
    name: str = Field(..., max_length=255, description="Feature flag display name")
    key: str = Field(..., max_length=100, description="Unique feature flag key")
    description: Optional[str] = Field(None, description="Feature flag description")
    is_enabled: bool = Field(False, description="Whether feature is enabled globally")
    rollout_percentage: int = Field(0, ge=0, le=100, description="Percentage rollout (0-100)")
    user_segments: Optional[List[str]] = Field(None, description="Target specific user segments")
    conditions: Optional[Dict[str, Any]] = Field(None, description="Additional targeting conditions")

    @field_validator("key")
    @classmethod
    def validate_key(cls, v: str) -> str:
        """Validate feature flag key format."""
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("key must contain only alphanumeric characters, hyphens, and underscores")
        return v.lower()

    @field_validator("rollout_percentage")
    @classmethod
    def validate_rollout(cls, v: int) -> int:
        """Validate rollout percentage."""
        if v < 0 or v > 100:
            raise ValueError("rollout_percentage must be between 0 and 100")
        return v


class FeatureFlagCreate(FeatureFlagBase):
    """Schema for creating feature flag."""
    pass


class FeatureFlagUpdate(BaseModel):
    """Schema for updating feature flag."""
    
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    rollout_percentage: Optional[int] = Field(None, ge=0, le=100)
    user_segments: Optional[List[str]] = None
    conditions: Optional[Dict[str, Any]] = None

    @field_validator("rollout_percentage")
    @classmethod
    def validate_rollout(cls, v: Optional[int]) -> Optional[int]:
        """Validate rollout percentage."""
        if v is not None and (v < 0 or v > 100):
            raise ValueError("rollout_percentage must be between 0 and 100")
        return v


class FeatureFlagResponse(FeatureFlagBase):
    """Schema for feature flag response."""
    
    id: UUID
    created_by: Optional[UUID]
    updated_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class FeatureFlagListResponse(BaseModel):
    """Schema for paginated feature flag list."""
    
    items: List[FeatureFlagResponse]
    total: int
    page: int
    size: int
    pages: int


class FeatureFlagFilters(BaseModel):
    """Schema for filtering feature flags."""
    
    is_enabled: Optional[bool] = None
    user_segment: Optional[str] = None
    search: Optional[str] = None  # Search in name, key, description


class FeatureFlagToggleRequest(BaseModel):
    """Schema for toggling feature flag."""
    
    is_enabled: bool = Field(..., description="Enable or disable feature flag")


class FeatureFlagToggleResponse(BaseModel):
    """Schema for feature flag toggle response."""
    
    id: UUID
    key: str
    is_enabled: bool
    message: str
