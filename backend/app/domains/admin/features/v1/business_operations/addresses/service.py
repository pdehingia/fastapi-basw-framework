"""Address Management service."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime
from decimal import Decimal
from geoalchemy2.functions import ST_SetSRID, ST_MakePoint

from app.shared.models.address import Address
from app.shared.models.user import AdminUser, ProviderUser, CustomerUser
from app.shared.exceptions import NotFoundError, ValidationException, ConflictError
from app.shared.pagination import PaginationParams
from .schemas import (
    AddressCreate, AddressUpdate, AddressResponse, AddressDetailResponse,
    AddressFilterParams, AddressListResponse, AddressStatistics,
    AddressVerify, AddressVerificationResponse, SetDefaultRequest,
    AddressBulkImport, AddressBulkImportResult
)


class AddressManagementService:
    """Service for managing addresses across all user types."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _get_owner_details(self, owner_user_id: str, owner_type: str) -> Dict[str, Optional[str]]:
        """Get owner details based on owner type."""
        owner_name = None
        owner_email = None
        owner_phone = None
        
        if owner_type == "admin":
            owner = self.db.query(AdminUser).filter(AdminUser.id == owner_user_id).first()
            if owner:
                owner_name = owner.full_name
                owner_email = owner.email
                owner_phone = owner.phone_number
        elif owner_type == "provider":
            owner = self.db.query(ProviderUser).filter(ProviderUser.id == owner_user_id).first()
            if owner:
                owner_name = owner.full_name
                owner_email = owner.email
                owner_phone = owner.phone_number
        elif owner_type == "customer":
            owner = self.db.query(CustomerUser).filter(CustomerUser.id == owner_user_id).first()
            if owner:
                owner_name = owner.full_name
                owner_email = owner.email
                owner_phone = owner.phone_number
        
        return {
            "owner_name": owner_name,
            "owner_email": owner_email,
            "owner_phone": owner_phone
        }
    
    def _validate_owner_exists(self, owner_user_id: str, owner_type: str) -> bool:
        """Validate that the owner user exists."""
        if owner_type == "admin":
            exists = self.db.query(AdminUser).filter(AdminUser.id == owner_user_id).first() is not None
        elif owner_type == "provider":
            exists = self.db.query(ProviderUser).filter(ProviderUser.id == owner_user_id).first() is not None
        elif owner_type == "customer":
            exists = self.db.query(CustomerUser).filter(CustomerUser.id == owner_user_id).first() is not None
        else:
            exists = False
        
        if not exists:
            raise NotFoundError(f"{owner_type.capitalize()} user with ID {owner_user_id} not found")
        
        return True
    
    def _set_location(self, address: Address, latitude: Optional[Decimal], longitude: Optional[Decimal]):
        """Set PostGIS location from lat/long."""
        if latitude is not None and longitude is not None:
            # Create PostGIS POINT
            address.location = ST_SetSRID(ST_MakePoint(float(longitude), float(latitude)), 4326)
    
    def _get_lat_long(self, address: Address) -> tuple:
        """Extract latitude and longitude from PostGIS location."""
        if address.location:
            # Extract from WKB format
            try:
                from geoalchemy2.shape import to_shape
                point = to_shape(address.location)
                return (Decimal(str(point.y)), Decimal(str(point.x)))
            except:
                return (None, None)
        return (None, None)
    
    # ===== ADDRESS CRUD =====
    
    def create_address(self, address_data: AddressCreate) -> AddressResponse:
        """Create a new address."""
        # Validate owner exists
        self._validate_owner_exists(address_data.owner_user_id, address_data.owner_type.value)
        
        # If setting as default, unset other defaults for this user
        if address_data.is_default:
            self.db.query(Address).filter(
                and_(
                    Address.owner_user_id == address_data.owner_user_id,
                    Address.owner_type == address_data.owner_type.value
                )
            ).update({"is_default": False})
        
        # Create address
        address_dict = address_data.model_dump(exclude={'latitude', 'longitude', 'owner_type'})
        address_dict['owner_type'] = address_data.owner_type.value
        
        db_address = Address(**address_dict)
        
        # Set location if coordinates provided
        self._set_location(db_address, address_data.latitude, address_data.longitude)
        
        self.db.add(db_address)
        self.db.commit()
        self.db.refresh(db_address)
        
        # Build response with lat/long
        lat, lon = self._get_lat_long(db_address)
        response_dict = {
            "id": str(db_address.id),
            "owner_user_id": str(db_address.owner_user_id),
            "owner_type": db_address.owner_type,
            "label": db_address.label,
            "address_line1": db_address.address_line1,
            "address_line2": db_address.address_line2,
            "city": db_address.city,
            "state": db_address.state,
            "pincode": db_address.pincode,
            "country": db_address.country,
            "contact_name": db_address.contact_name,
            "contact_phone": db_address.contact_phone,
            "latitude": lat,
            "longitude": lon,
            "is_verified": db_address.is_verified,
            "is_default": db_address.is_default,
            "created_at": db_address.created_at,
            "updated_at": db_address.updated_at
        }
        
        return AddressResponse(**response_dict)
    
    def get_address_by_id(self, address_id: str) -> AddressDetailResponse:
        """Get address by ID with owner details."""
        address = self.db.query(Address).filter(Address.id == address_id).first()
        if not address:
            raise NotFoundError(f"Address with ID {address_id} not found")
        
        # Get owner details
        owner_details = self._get_owner_details(str(address.owner_user_id), address.owner_type)
        
        # Get lat/long
        lat, lon = self._get_lat_long(address)
        
        response_dict = {
            "id": str(address.id),
            "owner_user_id": str(address.owner_user_id),
            "owner_type": address.owner_type,
            "label": address.label,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2,
            "city": address.city,
            "state": address.state,
            "pincode": address.pincode,
            "country": address.country,
            "contact_name": address.contact_name,
            "contact_phone": address.contact_phone,
            "latitude": lat,
            "longitude": lon,
            "is_verified": address.is_verified,
            "is_default": address.is_default,
            "created_at": address.created_at,
            "updated_at": address.updated_at,
            **owner_details
        }
        
        return AddressDetailResponse(**response_dict)
    
    def get_addresses_list(
        self,
        filters: AddressFilterParams,
        pagination: PaginationParams
    ) -> AddressListResponse:
        """Get paginated list of addresses with filters."""
        query = self.db.query(Address)
        
        # Apply filters
        if filters.owner_user_id:
            query = query.filter(Address.owner_user_id == filters.owner_user_id)
        
        if filters.owner_type:
            query = query.filter(Address.owner_type == filters.owner_type.value)
        
        if filters.city:
            query = query.filter(Address.city.ilike(f"%{filters.city}%"))
        
        if filters.state:
            query = query.filter(Address.state.ilike(f"%{filters.state}%"))
        
        if filters.pincode:
            query = query.filter(Address.pincode == filters.pincode)
        
        if filters.is_verified is not None:
            query = query.filter(Address.is_verified == filters.is_verified)
        
        if filters.is_default is not None:
            query = query.filter(Address.is_default == filters.is_default)
        
        # Search across multiple fields
        if filters.search:
            search_filter = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Address.label.ilike(search_filter),
                    Address.address_line1.ilike(search_filter),
                    Address.address_line2.ilike(search_filter),
                    Address.city.ilike(search_filter),
                    Address.state.ilike(search_filter),
                    Address.pincode.ilike(search_filter),
                    Address.contact_name.ilike(search_filter)
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        addresses = query.offset(pagination.skip).limit(pagination.page_size).all()
        
        # Build detailed responses
        detailed_addresses = []
        for address in addresses:
            owner_details = self._get_owner_details(str(address.owner_user_id), address.owner_type)
            lat, lon = self._get_lat_long(address)
            
            response_dict = {
                "id": str(address.id),
                "owner_user_id": str(address.owner_user_id),
                "owner_type": address.owner_type,
                "label": address.label,
                "address_line1": address.address_line1,
                "address_line2": address.address_line2,
                "city": address.city,
                "state": address.state,
                "pincode": address.pincode,
                "country": address.country,
                "contact_name": address.contact_name,
                "contact_phone": address.contact_phone,
                "latitude": lat,
                "longitude": lon,
                "is_verified": address.is_verified,
                "is_default": address.is_default,
                "created_at": address.created_at,
                "updated_at": address.updated_at,
                **owner_details
            }
            
            detailed_addresses.append(AddressDetailResponse(**response_dict))
        
        total_pages = (total + pagination.page_size - 1) // pagination.page_size
        
        return AddressListResponse(
            addresses=detailed_addresses,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages
        )
    
    def update_address(self, address_id: str, address_data: AddressUpdate) -> AddressResponse:
        """Update address."""
        address = self.db.query(Address).filter(Address.id == address_id).first()
        if not address:
            raise NotFoundError(f"Address with ID {address_id} not found")
        
        # Update fields
        update_data = address_data.model_dump(exclude_unset=True, exclude={'latitude', 'longitude'})
        for field, value in update_data.items():
            setattr(address, field, value)
        
        # Update location if coordinates provided
        if address_data.latitude is not None and address_data.longitude is not None:
            self._set_location(address, address_data.latitude, address_data.longitude)
        
        address.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(address)
        
        lat, lon = self._get_lat_long(address)
        response_dict = {
            "id": str(address.id),
            "owner_user_id": str(address.owner_user_id),
            "owner_type": address.owner_type,
            "label": address.label,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2,
            "city": address.city,
            "state": address.state,
            "pincode": address.pincode,
            "country": address.country,
            "contact_name": address.contact_name,
            "contact_phone": address.contact_phone,
            "latitude": lat,
            "longitude": lon,
            "is_verified": address.is_verified,
            "is_default": address.is_default,
            "created_at": address.created_at,
            "updated_at": address.updated_at
        }
        
        return AddressResponse(**response_dict)
    
    def delete_address(self, address_id: str) -> bool:
        """Delete address."""
        address = self.db.query(Address).filter(Address.id == address_id).first()
        if not address:
            raise NotFoundError(f"Address with ID {address_id} not found")
        
        self.db.delete(address)
        self.db.commit()
        
        return True
    
    # ===== ADDRESS ACTIONS =====
    
    def get_user_addresses(self, user_id: str, owner_type: str) -> List[AddressDetailResponse]:
        """Get all addresses for a specific user."""
        addresses = self.db.query(Address).filter(
            and_(
                Address.owner_user_id == user_id,
                Address.owner_type == owner_type
            )
        ).order_by(Address.is_default.desc(), Address.created_at.desc()).all()
        
        owner_details = self._get_owner_details(user_id, owner_type)
        
        result = []
        for address in addresses:
            lat, lon = self._get_lat_long(address)
            response_dict = {
                "id": str(address.id),
                "owner_user_id": str(address.owner_user_id),
                "owner_type": address.owner_type,
                "label": address.label,
                "address_line1": address.address_line1,
                "address_line2": address.address_line2,
                "city": address.city,
                "state": address.state,
                "pincode": address.pincode,
                "country": address.country,
                "contact_name": address.contact_name,
                "contact_phone": address.contact_phone,
                "latitude": lat,
                "longitude": lon,
                "is_verified": address.is_verified,
                "is_default": address.is_default,
                "created_at": address.created_at,
                "updated_at": address.updated_at,
                **owner_details
            }
            result.append(AddressDetailResponse(**response_dict))
        
        return result
    
    def set_default_address(self, address_id: str, request_data: SetDefaultRequest) -> AddressResponse:
        """Set address as default for user."""
        address = self.db.query(Address).filter(Address.id == address_id).first()
        if not address:
            raise NotFoundError(f"Address with ID {address_id} not found")
        
        # Verify address belongs to the user
        if str(address.owner_user_id) != request_data.user_id or address.owner_type != request_data.owner_type.value:
            raise ValidationException("Address does not belong to the specified user")
        
        # Unset all other defaults for this user
        self.db.query(Address).filter(
            and_(
                Address.owner_user_id == request_data.user_id,
                Address.owner_type == request_data.owner_type.value,
                Address.id != address_id
            )
        ).update({"is_default": False})
        
        # Set this address as default
        address.is_default = True
        address.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(address)
        
        lat, lon = self._get_lat_long(address)
        response_dict = {
            "id": str(address.id),
            "owner_user_id": str(address.owner_user_id),
            "owner_type": address.owner_type,
            "label": address.label,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2,
            "city": address.city,
            "state": address.state,
            "pincode": address.pincode,
            "country": address.country,
            "contact_name": address.contact_name,
            "contact_phone": address.contact_phone,
            "latitude": lat,
            "longitude": lon,
            "is_verified": address.is_verified,
            "is_default": address.is_default,
            "created_at": address.created_at,
            "updated_at": address.updated_at
        }
        
        return AddressResponse(**response_dict)
    
    def verify_address(self, address_id: str, verify_data: AddressVerify) -> AddressVerificationResponse:
        """Verify address with geocoding."""
        address = self.db.query(Address).filter(Address.id == address_id).first()
        if not address:
            raise NotFoundError(f"Address with ID {address_id} not found")
        
        # Set verified location
        self._set_location(address, verify_data.latitude, verify_data.longitude)
        address.is_verified = True
        address.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(address)
        
        return AddressVerificationResponse(
            address_id=str(address.id),
            is_verified=True,
            verified_at=datetime.utcnow(),
            latitude=verify_data.latitude,
            longitude=verify_data.longitude,
            verification_notes=verify_data.verification_notes
        )
    
    def bulk_import_addresses(self, bulk_data: AddressBulkImport) -> AddressBulkImportResult:
        """Bulk import addresses."""
        total_submitted = len(bulk_data.addresses)
        successful_imports = 0
        failed_imports = 0
        imported_addresses = []
        errors = []
        
        for idx, address_item in enumerate(bulk_data.addresses):
            try:
                # Validate owner exists
                self._validate_owner_exists(address_item.owner_user_id, address_item.owner_type.value)
                
                # Create address
                address_dict = address_item.model_dump(exclude={'latitude', 'longitude', 'owner_type'})
                address_dict['owner_type'] = address_item.owner_type.value
                
                db_address = Address(**address_dict)
                self._set_location(db_address, address_item.latitude, address_item.longitude)
                
                self.db.add(db_address)
                self.db.flush()  # Flush to get ID but don't commit yet
                
                lat, lon = self._get_lat_long(db_address)
                response_dict = {
                    "id": str(db_address.id),
                    "owner_user_id": str(db_address.owner_user_id),
                    "owner_type": db_address.owner_type,
                    "label": db_address.label,
                    "address_line1": db_address.address_line1,
                    "address_line2": db_address.address_line2,
                    "city": db_address.city,
                    "state": db_address.state,
                    "pincode": db_address.pincode,
                    "country": db_address.country,
                    "contact_name": db_address.contact_name,
                    "contact_phone": db_address.contact_phone,
                    "latitude": lat,
                    "longitude": lon,
                    "is_verified": db_address.is_verified,
                    "is_default": db_address.is_default,
                    "created_at": db_address.created_at,
                    "updated_at": db_address.updated_at
                }
                
                imported_addresses.append(AddressResponse(**response_dict))
                successful_imports += 1
                
            except Exception as e:
                failed_imports += 1
                errors.append({
                    "index": idx,
                    "address_line1": address_item.address_line1,
                    "error": str(e)
                })
        
        # Commit all successful imports
        if successful_imports > 0:
            self.db.commit()
        else:
            self.db.rollback()
        
        return AddressBulkImportResult(
            total_submitted=total_submitted,
            successful_imports=successful_imports,
            failed_imports=failed_imports,
            imported_addresses=imported_addresses,
            errors=errors
        )
    
    # ===== STATISTICS =====
    
    def get_address_statistics(self) -> AddressStatistics:
        """Get address statistics."""
        total = self.db.query(Address).count()
        verified = self.db.query(Address).filter(Address.is_verified == True).count()
        unverified = total - verified
        default_count = self.db.query(Address).filter(Address.is_default == True).count()
        
        # By owner type
        by_owner_type = {}
        owner_type_counts = self.db.query(
            Address.owner_type, func.count(Address.id)
        ).group_by(Address.owner_type).all()
        
        for owner_type, count in owner_type_counts:
            by_owner_type[owner_type] = count
        
        # By state
        by_state = {}
        state_counts = self.db.query(
            Address.state, func.count(Address.id)
        ).group_by(Address.state).order_by(func.count(Address.id).desc()).limit(10).all()
        
        for state, count in state_counts:
            by_state[state or "Unknown"] = count
        
        # By city
        by_city = {}
        city_counts = self.db.query(
            Address.city, func.count(Address.id)
        ).group_by(Address.city).order_by(func.count(Address.id).desc()).limit(10).all()
        
        for city, count in city_counts:
            by_city[city or "Unknown"] = count
        
        return AddressStatistics(
            total_addresses=total,
            verified_addresses=verified,
            unverified_addresses=unverified,
            default_addresses=default_count,
            addresses_by_owner_type=by_owner_type,
            addresses_by_state=by_state,
            addresses_by_city=by_city
        )
