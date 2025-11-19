"""SMS Campaign Schemas."""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class SMSCampaignBase(BaseModel):
    """Base SMS campaign schema."""
    
    campaign_name: str = Field(..., max_length=255, description="Name of the campaign")
    campaign_type: str = Field(..., max_length=50, description="Type: promotional, reminder, notification")
    message_content: str = Field(..., max_length=1600, description="SMS message content")
    target_audience: str = Field(..., max_length=50, description="Target: all_users, academies, artists, customers")
    segment_criteria: Optional[Dict[str, Any]] = Field(None, description="Segment criteria for targeting")
    scheduled_at: Optional[datetime] = Field(None, description="Schedule datetime for campaign")

    @field_validator("campaign_type")
    @classmethod
    def validate_campaign_type(cls, v: str) -> str:
        """Validate campaign type."""
        allowed_types = {"promotional", "reminder", "notification"}
        if v not in allowed_types:
            raise ValueError(f"campaign_type must be one of {allowed_types}")
        return v

    @field_validator("target_audience")
    @classmethod
    def validate_target_audience(cls, v: str) -> str:
        """Validate target audience."""
        allowed_audiences = {"all_users", "academies", "artists", "customers"}
        if v not in allowed_audiences:
            raise ValueError(f"target_audience must be one of {allowed_audiences}")
        return v


class SMSCampaignCreate(SMSCampaignBase):
    """Schema for creating SMS campaign."""
    pass


class SMSCampaignUpdate(BaseModel):
    """Schema for updating SMS campaign."""
    
    campaign_name: Optional[str] = Field(None, max_length=255)
    campaign_type: Optional[str] = Field(None, max_length=50)
    message_content: Optional[str] = Field(None, max_length=1600)
    target_audience: Optional[str] = Field(None, max_length=50)
    segment_criteria: Optional[Dict[str, Any]] = None
    campaign_status: Optional[str] = Field(None, max_length=30)
    scheduled_at: Optional[datetime] = None

    @field_validator("campaign_type")
    @classmethod
    def validate_campaign_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate campaign type."""
        if v is not None:
            allowed_types = {"promotional", "reminder", "notification"}
            if v not in allowed_types:
                raise ValueError(f"campaign_type must be one of {allowed_types}")
        return v

    @field_validator("target_audience")
    @classmethod
    def validate_target_audience(cls, v: Optional[str]) -> Optional[str]:
        """Validate target audience."""
        if v is not None:
            allowed_audiences = {"all_users", "academies", "artists", "customers"}
            if v not in allowed_audiences:
                raise ValueError(f"target_audience must be one of {allowed_audiences}")
        return v

    @field_validator("campaign_status")
    @classmethod
    def validate_campaign_status(cls, v: Optional[str]) -> Optional[str]:
        """Validate campaign status."""
        if v is not None:
            allowed_statuses = {"draft", "scheduled", "sending", "sent", "paused", "cancelled"}
            if v not in allowed_statuses:
                raise ValueError(f"campaign_status must be one of {allowed_statuses}")
        return v


class SMSCampaignResponse(SMSCampaignBase):
    """Schema for SMS campaign response."""
    
    id: UUID
    campaign_status: str
    sent_at: Optional[datetime]
    total_recipients: int
    total_sent: int
    total_delivered: int
    total_failed: int
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class SMSCampaignListResponse(BaseModel):
    """Schema for paginated SMS campaign list."""
    
    items: list[SMSCampaignResponse]
    total: int
    page: int
    size: int
    pages: int


class SMSCampaignFilters(BaseModel):
    """Schema for filtering SMS campaigns."""
    
    campaign_type: Optional[str] = None
    campaign_status: Optional[str] = None
    target_audience: Optional[str] = None
    created_by: Optional[UUID] = None
    scheduled_from: Optional[datetime] = None
    scheduled_to: Optional[datetime] = None


class SMSCampaignStatistics(BaseModel):
    """Schema for SMS campaign statistics."""
    
    total_campaigns: int
    draft_campaigns: int
    scheduled_campaigns: int
    sent_campaigns: int
    total_recipients: int
    total_sent: int
    total_delivered: int
    total_failed: int
    average_delivery_rate: float


class SendSMSCampaignRequest(BaseModel):
    """Schema for sending SMS campaign immediately."""
    
    send_test: bool = Field(False, description="Send as test to admins only")
    test_numbers: Optional[list[str]] = Field(None, description="Test phone numbers")
