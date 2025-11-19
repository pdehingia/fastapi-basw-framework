"""Email Template Schemas."""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class EmailTemplateBase(BaseModel):
    """Base email template schema."""
    
    template_name: str = Field(..., max_length=255, description="Template name")
    template_category: str = Field(..., max_length=100, description="Template category (e.g., transactional, marketing)")
    subject_template: str = Field(..., max_length=255, description="Email subject template with placeholders")
    html_content: str = Field(..., description="HTML email content")
    text_content: Optional[str] = Field(None, description="Plain text fallback content")
    template_variables: Optional[Dict[str, Any]] = Field(None, description="Available template variables")
    is_active: bool = Field(True, description="Whether template is active")

    @field_validator("template_category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        """Validate template category."""
        allowed_categories = {
            "transactional", "marketing", "notification", "promotional",
            "newsletter", "welcome", "reminder", "confirmation"
        }
        if v not in allowed_categories:
            raise ValueError(f"template_category must be one of {allowed_categories}")
        return v


class EmailTemplateCreate(EmailTemplateBase):
    """Schema for creating email template."""
    pass


class EmailTemplateUpdate(BaseModel):
    """Schema for updating email template."""
    
    template_name: Optional[str] = Field(None, max_length=255)
    template_category: Optional[str] = Field(None, max_length=100)
    subject_template: Optional[str] = Field(None, max_length=255)
    html_content: Optional[str] = None
    text_content: Optional[str] = None
    template_variables: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

    @field_validator("template_category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        """Validate template category."""
        if v is not None:
            allowed_categories = {
                "transactional", "marketing", "notification", "promotional",
                "newsletter", "welcome", "reminder", "confirmation"
            }
            if v not in allowed_categories:
                raise ValueError(f"template_category must be one of {allowed_categories}")
        return v


class EmailTemplateResponse(EmailTemplateBase):
    """Schema for email template response."""
    
    id: UUID
    is_system_template: bool
    usage_count: int
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class EmailTemplateListResponse(BaseModel):
    """Schema for paginated email template list."""
    
    items: list[EmailTemplateResponse]
    total: int
    page: int
    size: int
    pages: int


class EmailTemplateFilters(BaseModel):
    """Schema for filtering email templates."""
    
    template_category: Optional[str] = None
    is_active: Optional[bool] = None
    is_system_template: Optional[bool] = None
    created_by: Optional[UUID] = None


class EmailTemplatePreviewRequest(BaseModel):
    """Schema for previewing email template."""
    
    test_data: Dict[str, Any] = Field(..., description="Test data for template variables")


class EmailTemplatePreviewResponse(BaseModel):
    """Schema for email template preview response."""
    
    subject: str
    html_content: str
    text_content: Optional[str]


class EmailTemplateStatistics(BaseModel):
    """Schema for email template statistics."""
    
    total_templates: int
    active_templates: int
    inactive_templates: int
    system_templates: int
    custom_templates: int
    templates_by_category: Dict[str, int]
    most_used_templates: list[tuple[str, int]]
