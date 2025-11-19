"""Email Campaign Schemas."""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class EmailCampaignBase(BaseModel):
    """Base email campaign schema."""
    
    campaign_name: str = Field(..., max_length=255, description="Name of the campaign")
    campaign_type: str = Field(..., max_length=50, description="Type: promotional, newsletter, notification")
    subject_line: str = Field(..., max_length=255, description="Email subject line")
    template_id: Optional[UUID] = Field(None, description="Email template ID")
    sender_name: str = Field(..., max_length=100, description="Sender name")
    sender_email: str = Field(..., max_length=255, description="Sender email address")
    target_audience: str = Field(..., max_length=50, description="Target: all_users, academies, artists, customers")
    segment_criteria: Optional[Dict[str, Any]] = Field(None, description="Segment criteria for targeting")
    scheduled_at: Optional[datetime] = Field(None, description="Schedule datetime for campaign")

    @field_validator("campaign_type")
    @classmethod
    def validate_campaign_type(cls, v: str) -> str:
        """Validate campaign type."""
        allowed_types = {"promotional", "newsletter", "notification"}
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


class EmailCampaignCreate(EmailCampaignBase):
    """Schema for creating email campaign."""
    pass


class EmailCampaignUpdate(BaseModel):
    """Schema for updating email campaign."""
    
    campaign_name: Optional[str] = Field(None, max_length=255)
    campaign_type: Optional[str] = Field(None, max_length=50)
    subject_line: Optional[str] = Field(None, max_length=255)
    template_id: Optional[UUID] = None
    sender_name: Optional[str] = Field(None, max_length=100)
    sender_email: Optional[str] = Field(None, max_length=255)
    target_audience: Optional[str] = Field(None, max_length=50)
    segment_criteria: Optional[Dict[str, Any]] = None
    campaign_status: Optional[str] = Field(None, max_length=30)
    scheduled_at: Optional[datetime] = None

    @field_validator("campaign_type")
    @classmethod
    def validate_campaign_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate campaign type."""
        if v is not None:
            allowed_types = {"promotional", "newsletter", "notification"}
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


class EmailCampaignResponse(EmailCampaignBase):
    """Schema for email campaign response."""
    
    id: UUID
    campaign_status: str
    sent_at: Optional[datetime]
    total_recipients: int
    total_sent: int
    total_delivered: int
    total_opened: int
    total_clicked: int
    total_unsubscribed: int
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class EmailCampaignListResponse(BaseModel):
    """Schema for paginated email campaign list."""
    
    items: list[EmailCampaignResponse]
    total: int
    page: int
    size: int
    pages: int


class EmailCampaignFilters(BaseModel):
    """Schema for filtering email campaigns."""
    
    campaign_type: Optional[str] = None
    campaign_status: Optional[str] = None
    target_audience: Optional[str] = None
    created_by: Optional[UUID] = None
    scheduled_from: Optional[datetime] = None
    scheduled_to: Optional[datetime] = None


class EmailCampaignStatistics(BaseModel):
    """Schema for email campaign statistics."""
    
    total_campaigns: int
    draft_campaigns: int
    scheduled_campaigns: int
    sent_campaigns: int
    total_recipients: int
    total_sent: int
    total_delivered: int
    total_opened: int
    total_clicked: int
    total_unsubscribed: int
    average_open_rate: float
    average_click_rate: float


class SendCampaignRequest(BaseModel):
    """Schema for sending campaign immediately."""
    
    send_test: bool = Field(False, description="Send as test to admins only")
    test_emails: Optional[list[str]] = Field(None, description="Test email addresses")
