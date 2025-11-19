"""Address model."""

import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP
from geoalchemy2 import Geography

from app.shared.models.base import Base


class Address(Base):
    """Address model supporting all user types (polymorphic)."""
    
    __tablename__ = "addresses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4())
    
    # Polymorphic owner relationship
    owner_user_id = Column(UUID(as_uuid=True), nullable=True)
    owner_type = Column(String(20), nullable=True)  # 'admin', 'provider', 'customer'
    
    # Address details
    label = Column(String(100), nullable=True)  # Home, Office, etc.
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(120), nullable=True)
    state = Column(String(120), nullable=True)
    pincode = Column(String(20), nullable=True)
    country = Column(String(60), server_default='India', nullable=True)
    
    # Geolocation (PostGIS)
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable=True)
    
    # Contact details
    contact_name = Column(String(120), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    
    # Status flags
    is_verified = Column(Boolean, server_default='false', nullable=True)
    is_default = Column(Boolean, server_default='false', nullable=True)
    
    # Timestamps
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_addresses_owner', 'owner_user_id', 'owner_type'),
        Index('idx_addresses_geo', 'location', postgresql_using='gist'),
    )
