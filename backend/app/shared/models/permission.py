"""Permission Model for RBAC system."""
from sqlalchemy import (
    Column, Integer, String, Boolean, Text, TIMESTAMP, func
)
from sqlalchemy.orm import relationship

from app.shared.database import Base


class Permission(Base):
    """Permission model for role-based access control."""
    
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True)
    permission_name = Column(String(120), nullable=False, unique=True)
    permission_slug = Column(String(120), nullable=False, unique=True)
    category = Column(String(60), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=True, server_default="true")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationships
    role_permissions = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")
