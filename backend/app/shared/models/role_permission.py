"""RolePermission Model for RBAC system."""
from sqlalchemy import (
    Column, Integer, ForeignKey, TIMESTAMP, func, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.shared.database import Base


class RolePermission(Base):
    """Role-Permission mapping for RBAC."""
    
    __tablename__ = "role_permissions"
    __table_args__ = (UniqueConstraint('role_id', 'permission_id'),)

    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationships
    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")
