"""
Base models for Maya Platform with UUID primary keys and audit fields.
All models inherit from these base classes to ensure consistency with the hybrid schema.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Boolean, func, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr

from app.core.database import Base


class UUIDMixin:
    """Mixin for UUID primary key."""
    
    @declared_attr
    def id(cls):
        return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4())


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""
    
    @declared_attr
    def created_at(cls):
        return Column(DateTime(timezone=True), nullable=False, default=func.now(), server_default=func.now())
    
    @declared_attr
    def updated_at(cls):
        return Column(DateTime(timezone=True), nullable=False, default=func.now(), server_default=func.now())


class SoftDeleteMixin:
    """Mixin for soft delete functionality."""
    
    @declared_attr
    def is_deleted(cls):
        return Column(Boolean, nullable=False, default=False, server_default='false')
    
    @declared_attr
    def deleted_at(cls):
        return Column(DateTime(timezone=True), nullable=True)
    
    def soft_delete(self):
        """Mark record as deleted."""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()

    def restore(self):
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None


class AuditMixin:
    """Mixin for audit fields (who created/modified)."""
    
    @declared_attr
    def created_by(cls):
        return Column(UUID(as_uuid=True), nullable=True)
    
    @declared_attr
    def updated_by(cls):
        return Column(UUID(as_uuid=True), nullable=True)


class UUIDBase(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """
    Abstract base class with UUID primary key, timestamps, and soft delete.
    
    All main entities (users, bookings, etc.) should inherit from this class.
    This matches the Maya Platform hybrid database schema.
    """
    __abstract__ = True
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

    def __repr__(self):
        """String representation of model."""
        return f"<{self.__class__.__name__}(id={self.id})>"


class BaseModel(TimestampMixin, Base):
    """
    Base class with integer primary key and timestamps.
    
    For lookup tables and entities that don't need UUID (roles, permissions, etc.)
    """
    __abstract__ = True
    
    @declared_attr
    def id(cls):
        return Column(Integer, primary_key=True, autoincrement=True)
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

    def __repr__(self):
        """String representation of model."""
        return f"<{self.__class__.__name__}(id={self.id})>"


class BaseModelWithAudit(UUIDBase, AuditMixin):
    """
    Base model with UUID, timestamps, soft delete, and audit trail.
    Use this when you need to track who created/updated records.
    """
    __abstract__ = True
