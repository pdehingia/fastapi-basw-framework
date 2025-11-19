"""Email Templates API endpoints."""
from typing import Annotated, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from math import ceil

from app.domains.admin.features.v1.email_templates.dependencies import (
    get_email_templates_service,
    RequireAuth
)
from app.domains.admin.features.v1.email_templates.service import EmailTemplatesService
from app.domains.admin.features.v1.email_templates.schemas import (
    EmailTemplateCreate,
    EmailTemplateUpdate,
    EmailTemplateResponse,
    EmailTemplateListResponse,
    EmailTemplateFilters,
    EmailTemplatePreviewRequest,
    EmailTemplatePreviewResponse,
    EmailTemplateStatistics
)

router = APIRouter(prefix="/email-templates", tags=["Email Templates"])


@router.post(
    "",
    response_model=EmailTemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create email template"
)
async def create_email_template(
    data: EmailTemplateCreate,
    current_admin: RequireAuth,
    service: Annotated[EmailTemplatesService, Depends(get_email_templates_service)]
) -> EmailTemplateResponse:
    """Create a new email template."""
    template = await service.create_template(data, current_admin["user_id"])
    return EmailTemplateResponse.model_validate(template)


@router.get(
    "",
    response_model=EmailTemplateListResponse,
    summary="List email templates"
)
async def list_email_templates(
    current_admin: RequireAuth,
    service: Annotated[EmailTemplatesService, Depends(get_email_templates_service)],
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Page size"),
    template_category: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_system_template: Optional[bool] = Query(None, description="Filter by system template"),
    created_by: Optional[UUID] = Query(None, description="Filter by creator")
) -> EmailTemplateListResponse:
    """Get paginated list of email templates with filters."""
    filters = EmailTemplateFilters(
        template_category=template_category,
        is_active=is_active,
        is_system_template=is_system_template,
        created_by=created_by
    )
    
    skip = (page - 1) * size
    templates, total = await service.get_templates(filters, skip, size)
    
    return EmailTemplateListResponse(
        items=[EmailTemplateResponse.model_validate(t) for t in templates],
        total=total,
        page=page,
        size=size,
        pages=ceil(total / size) if total > 0 else 0
    )


@router.get(
    "/statistics",
    response_model=EmailTemplateStatistics,
    summary="Get email template statistics"
)
async def get_email_template_statistics(
    current_admin: RequireAuth,
    service: Annotated[EmailTemplatesService, Depends(get_email_templates_service)]
) -> EmailTemplateStatistics:
    """Get comprehensive email template statistics."""
    return await service.get_statistics()


@router.get(
    "/{template_id}",
    response_model=EmailTemplateResponse,
    summary="Get email template"
)
async def get_email_template(
    template_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[EmailTemplatesService, Depends(get_email_templates_service)]
) -> EmailTemplateResponse:
    """Get email template by ID."""
    template = await service.get_template_by_id(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email template not found"
        )
    return EmailTemplateResponse.model_validate(template)


@router.put(
    "/{template_id}",
    response_model=EmailTemplateResponse,
    summary="Update email template"
)
async def update_email_template(
    template_id: UUID,
    data: EmailTemplateUpdate,
    current_admin: RequireAuth,
    service: Annotated[EmailTemplatesService, Depends(get_email_templates_service)]
) -> EmailTemplateResponse:
    """Update email template (cannot update system templates)."""
    template = await service.update_template(template_id, data)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email template not found or is a system template"
        )
    return EmailTemplateResponse.model_validate(template)


@router.delete(
    "/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete email template"
)
async def delete_email_template(
    template_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[EmailTemplatesService, Depends(get_email_templates_service)]
) -> None:
    """Delete email template (cannot delete system templates)."""
    success = await service.delete_template(template_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete template - either not found or is a system template"
        )


@router.post(
    "/{template_id}/preview",
    response_model=EmailTemplatePreviewResponse,
    summary="Preview email template"
)
async def preview_email_template(
    template_id: UUID,
    request: EmailTemplatePreviewRequest,
    current_admin: RequireAuth,
    service: Annotated[EmailTemplatesService, Depends(get_email_templates_service)]
) -> EmailTemplatePreviewResponse:
    """Preview email template with test data."""
    preview = await service.preview_template(template_id, request)
    if not preview:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template not found or failed to render with provided data"
        )
    return preview


@router.post(
    "/{template_id}/duplicate",
    response_model=EmailTemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate email template"
)
async def duplicate_email_template(
    template_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[EmailTemplatesService, Depends(get_email_templates_service)]
) -> EmailTemplateResponse:
    """Duplicate an existing email template."""
    template = await service.duplicate_template(template_id, current_admin["user_id"])
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email template not found"
        )
    return EmailTemplateResponse.model_validate(template)
