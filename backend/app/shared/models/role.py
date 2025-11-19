"""Role Model for RBAC system."""
from sqlalchemy import (
    Column, Integer, String, Boolean, Text, ForeignKey, TIMESTAMP, func, text
)
from sqlalchemy.orm import relationship

from app.shared.database import Base


class Role(Base):
    """Role model for role-based access control."""
    
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    role_name = Column(String(100), nullable=False, unique=True)
    role_slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    parent_role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    level = Column(Integer, nullable=False, server_default="1")
    is_active = Column(Boolean, nullable=True, server_default="true")
    is_system_role = Column(Boolean, nullable=True, server_default="false")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    parent_role = relationship("Role", remote_side=[id], backref="child_roles")
    role_permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")
