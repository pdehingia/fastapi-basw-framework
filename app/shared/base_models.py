"""
Base models with common fields for all entities.
Provides timestamp, soft delete, and audit trail functionality.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, Boolean
from sqlalchemy.ext.declarative import declared_attr

from app.core.database import Base


class TimestampMixin:
    """Mixin that adds created_at and updated_at timestamps."""

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )


class SoftDeleteMixin:
    """
    Mixin that adds soft delete capability.
    Instead of deleting records, mark them as deleted.
    """

    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)

    def soft_delete(self):
        """Mark record as deleted."""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()

    def restore(self):
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None


class AuditMixin:
    """
    Mixin that adds audit trail fields.
    Tracks who created and updated records.
    """

    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)


class BaseModel(Base, TimestampMixin, SoftDeleteMixin):
    """
    Base model class that all models should inherit from.
    Provides: id, timestamps, and soft delete functionality.
    """

    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

    def __repr__(self):
        """String representation of model."""
        return f"<{self.__class__.__name__}(id={self.id})>"


class BaseModelWithAudit(BaseModel, AuditMixin):
    """
    Base model with audit trail.
    Use this when you need to track who created/updated records.
    """

    __abstract__ = True
