"""Email Templates Service Layer."""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy import select, func, and_, case
from sqlalchemy.ext.asyncio import AsyncSession
from jinja2 import Template as Jinja2Template

from app.shared.models.email_template import EmailTemplate
from app.domains.admin.features.v1.email_templates.schemas import (
    EmailTemplateCreate,
    EmailTemplateUpdate,
    EmailTemplateFilters,
    EmailTemplatePreviewRequest,
    EmailTemplatePreviewResponse,
    EmailTemplateStatistics
)


class EmailTemplatesService:
    """Service for managing email templates."""

    def __init__(self, db: AsyncSession):
        """Initialize service."""
        self.db = db

    async def create_template(
        self,
        data: EmailTemplateCreate,
        created_by: UUID
    ) -> EmailTemplate:
        """Create new email template."""
        template = EmailTemplate(
            **data.model_dump(),
            created_by=created_by,
            is_system_template=False,
            usage_count=0
        )
        self.db.add(template)
        await self.db.commit()
        await self.db.refresh(template)
        return template

    async def get_templates(
        self,
        filters: Optional[EmailTemplateFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[list[EmailTemplate], int]:
        """Get paginated list of email templates."""
        query = select(EmailTemplate)
        
        # Apply filters
        if filters:
            conditions = []
            if filters.template_category:
                conditions.append(EmailTemplate.template_category == filters.template_category)
            if filters.is_active is not None:
                conditions.append(EmailTemplate.is_active == filters.is_active)
            if filters.is_system_template is not None:
                conditions.append(EmailTemplate.is_system_template == filters.is_system_template)
            if filters.created_by:
                conditions.append(EmailTemplate.created_by == filters.created_by)
            
            if conditions:
                query = query.where(and_(*conditions))
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)
        
        # Apply pagination and ordering
        query = query.order_by(EmailTemplate.template_category, EmailTemplate.template_name).offset(skip).limit(limit)
        result = await self.db.execute(query)
        templates = result.scalars().all()
        
        return list(templates), total or 0

    async def get_template_by_id(self, template_id: UUID) -> Optional[EmailTemplate]:
        """Get email template by ID."""
        query = select(EmailTemplate).where(EmailTemplate.id == template_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_template(
        self,
        template_id: UUID,
        data: EmailTemplateUpdate
    ) -> Optional[EmailTemplate]:
        """Update email template."""
        template = await self.get_template_by_id(template_id)
        if not template:
            return None
        
        # Don't allow editing system templates
        if template.is_system_template:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(template, field, value)
        
        template.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(template)
        return template

    async def delete_template(self, template_id: UUID) -> bool:
        """Delete email template."""
        template = await self.get_template_by_id(template_id)
        if not template:
            return False
        
        # Don't allow deleting system templates or templates in use
        if template.is_system_template:
            return False
        
        await self.db.delete(template)
        await self.db.commit()
        return True

    async def preview_template(
        self,
        template_id: UUID,
        request: EmailTemplatePreviewRequest
    ) -> Optional[EmailTemplatePreviewResponse]:
        """Preview email template with test data."""
        template = await self.get_template_by_id(template_id)
        if not template:
            return None
        
        try:
            # Render subject
            subject_template = Jinja2Template(template.subject_template)
            subject = subject_template.render(**request.test_data)
            
            # Render HTML content
            html_template = Jinja2Template(template.html_content)
            html_content = html_template.render(**request.test_data)
            
            # Render text content if exists
            text_content = None
            if template.text_content:
                text_template = Jinja2Template(template.text_content)
                text_content = text_template.render(**request.test_data)
            
            return EmailTemplatePreviewResponse(
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
        except Exception as e:
            # Handle template rendering errors
            return None

    async def duplicate_template(
        self,
        template_id: UUID,
        created_by: UUID
    ) -> Optional[EmailTemplate]:
        """Duplicate an existing template."""
        original = await self.get_template_by_id(template_id)
        if not original:
            return None
        
        # Create duplicate
        duplicate = EmailTemplate(
            template_name=f"{original.template_name} (Copy)",
            template_category=original.template_category,
            subject_template=original.subject_template,
            html_content=original.html_content,
            text_content=original.text_content,
            template_variables=original.template_variables,
            is_active=False,  # Start as inactive
            is_system_template=False,
            usage_count=0,
            created_by=created_by
        )
        
        self.db.add(duplicate)
        await self.db.commit()
        await self.db.refresh(duplicate)
        return duplicate

    async def get_statistics(self) -> EmailTemplateStatistics:
        """Get email template statistics."""
        # Count templates by status and type
        stats_query = select(
            func.count(EmailTemplate.id).label("total"),
            func.count(case((EmailTemplate.is_active == True, 1))).label("active"),
            func.count(case((EmailTemplate.is_active == False, 1))).label("inactive"),
            func.count(case((EmailTemplate.is_system_template == True, 1))).label("system"),
            func.count(case((EmailTemplate.is_system_template == False, 1))).label("custom")
        )
        
        result = await self.db.execute(stats_query)
        stats = result.one()
        
        # Count by category
        category_query = select(
            EmailTemplate.template_category,
            func.count(EmailTemplate.id).label("count")
        ).group_by(EmailTemplate.template_category)
        
        category_result = await self.db.execute(category_query)
        templates_by_category = {row.template_category: row.count for row in category_result}
        
        # Get most used templates
        most_used_query = select(
            EmailTemplate.template_name,
            EmailTemplate.usage_count
        ).where(
            EmailTemplate.usage_count > 0
        ).order_by(
            EmailTemplate.usage_count.desc()
        ).limit(10)
        
        most_used_result = await self.db.execute(most_used_query)
        most_used_templates = [(row.template_name, row.usage_count) for row in most_used_result]
        
        return EmailTemplateStatistics(
            total_templates=stats.total or 0,
            active_templates=stats.active or 0,
            inactive_templates=stats.inactive or 0,
            system_templates=stats.system or 0,
            custom_templates=stats.custom or 0,
            templates_by_category=templates_by_category,
            most_used_templates=most_used_templates
        )

    async def increment_usage_count(self, template_id: UUID) -> None:
        """Increment template usage count."""
        template = await self.get_template_by_id(template_id)
        if template:
            template.usage_count += 1
            await self.db.commit()
