"""
Admin user management service.
Handles CRUD operations for all user types in the Maya platform.
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc

from app.shared.repositories.user import (
    AdminUserRepository,
    ProviderUserRepository,
    CustomerUserRepository
)
from app.shared.models.user import AdminUser, ProviderUser, CustomerUser
from .schemas import (
    UserFilterParams,
    AdminUserCreate,
    AdminUserUpdate,
    AdminUserResponse,
    ProviderUserCreate,
    ProviderUserUpdate,
    ProviderUserResponse,
    CustomerUserCreate,
    CustomerUserUpdate,
    CustomerUserResponse,
    BulkUserOperation,
    UserStatistics,
    UserType,
    UserStatus,
    AdminRole,
    ProviderStatus
)
from app.shared.pagination import PaginatedResponse
from app.core.security import get_password_hash, verify_password
from app.shared.exceptions import (
    ValidationError,
    NotFoundError,
    ConflictError
)


class UserManagementService:
    """Service for managing all user types in Maya platform."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.admin_repo = AdminUserRepository(db)
        self.provider_repo = ProviderUserRepository(db)
        self.customer_repo = CustomerUserRepository(db)

    # Admin User Management
    async def get_admin_users(
        self,
        filters: UserFilterParams,
        skip: int = 0,
        limit: int = 20
    ) -> PaginatedResponse[AdminUserResponse]:
        """Get paginated list of admin users with filters."""
        query = self.db.query(AdminUser)
        
        # Apply filters
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                AdminUser.email.ilike(search_term) |
                AdminUser.first_name.ilike(search_term) |
                AdminUser.last_name.ilike(search_term)
            )
        
        if filters.status:
            query = query.filter(AdminUser.status == filters.status)
            
        if filters.role:
            query = query.filter(AdminUser.role == filters.role)
        
        if filters.is_active is not None:
            query = query.filter(AdminUser.is_active == filters.is_active)
        
        if filters.created_after:
            query = query.filter(AdminUser.created_at >= filters.created_after)
        
        if filters.created_before:
            query = query.filter(AdminUser.created_at <= filters.created_before)

        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        users = query.order_by(desc(AdminUser.created_at)).offset(skip).limit(limit).all()
        
        # Convert to response schemas
        items = [AdminUserResponse.from_orm(user) for user in users]
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=skip // limit + 1,
            per_page=limit,
            pages=(total + limit - 1) // limit
        )

    async def create_admin_user(self, user_data: AdminUserCreate) -> AdminUserResponse:
        """Create new admin user."""
        # Check if email already exists
        existing_user = self.admin_repo.get_by_email(user_data.email)
        if existing_user:
            raise ConflictError("Email already registered")
        
        # Create admin user
        admin_user = AdminUser(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            hashed_password=get_password_hash(user_data.password),
            role=user_data.role,
            status=user_data.status or UserStatus.PENDING,
            is_active=user_data.is_active if user_data.is_active is not None else True,
            permissions=user_data.permissions or [],
            department=user_data.department,
            employee_id=user_data.employee_id
        )
        
        self.db.add(admin_user)
        self.db.commit()
        self.db.refresh(admin_user)
        
        return AdminUserResponse.from_orm(admin_user)

    async def get_admin_user(self, user_id: int) -> AdminUserResponse:
        """Get admin user by ID."""
        user = self.admin_repo.get(user_id)
        if not user:
            raise NotFoundError("Admin user not found")
        return AdminUserResponse.from_orm(user)

    async def update_admin_user(self, user_id: int, user_data: AdminUserUpdate) -> AdminUserResponse:
        """Update admin user."""
        user = self.admin_repo.get(user_id)
        if not user:
            raise NotFoundError("Admin user not found")
        
        # Update fields
        update_data = user_data.dict(exclude_unset=True)
        if 'password' in update_data:
            update_data['hashed_password'] = get_password_hash(update_data.pop('password'))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        
        return AdminUserResponse.from_orm(user)

    async def delete_admin_user(self, user_id: int) -> bool:
        """Delete admin user."""
        user = self.admin_repo.get(user_id)
        if not user:
            raise NotFoundError("Admin user not found")
        
        self.db.delete(user)
        self.db.commit()
        return True

    # Provider User Management
    async def get_provider_users(
        self,
        filters: UserFilterParams,
        skip: int = 0,
        limit: int = 20
    ) -> PaginatedResponse[ProviderUserResponse]:
        """Get paginated list of provider users with filters."""
        query = self.db.query(ProviderUser)
        
        # Apply filters
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                ProviderUser.email.ilike(search_term) |
                ProviderUser.first_name.ilike(search_term) |
                ProviderUser.last_name.ilike(search_term) |
                ProviderUser.business_name.ilike(search_term)
            )
        
        if filters.status:
            query = query.filter(ProviderUser.status == filters.status)
        
        if filters.is_active is not None:
            query = query.filter(ProviderUser.is_active == filters.is_active)
        
        if filters.created_after:
            query = query.filter(ProviderUser.created_at >= filters.created_after)
        
        if filters.created_before:
            query = query.filter(ProviderUser.created_at <= filters.created_before)

        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        users = query.order_by(desc(ProviderUser.created_at)).offset(skip).limit(limit).all()
        
        # Convert to response schemas
        items = [ProviderUserResponse.from_orm(user) for user in users]
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=skip // limit + 1,
            per_page=limit,
            pages=(total + limit - 1) // limit
        )

    async def create_provider_user(self, user_data: ProviderUserCreate) -> ProviderUserResponse:
        """Create new provider user."""
        # Check if email already exists
        existing_user = self.provider_repo.get_by_email(user_data.email)
        if existing_user:
            raise ConflictError("Email already registered")
        
        # Create provider user
        provider_user = ProviderUser(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            hashed_password=get_password_hash(user_data.password),
            business_name=user_data.business_name,
            business_type=user_data.business_type,
            business_registration_number=user_data.business_registration_number,
            tax_id=user_data.tax_id,
            phone=user_data.phone,
            address=user_data.address,
            city=user_data.city,
            state=user_data.state,
            country=user_data.country,
            postal_code=user_data.postal_code,
            website=user_data.website,
            description=user_data.description,
            status=user_data.status or ProviderStatus.PENDING,
            is_active=user_data.is_active if user_data.is_active is not None else True,
            services_offered=user_data.services_offered or [],
            operating_hours=user_data.operating_hours or {}
        )
        
        self.db.add(provider_user)
        self.db.commit()
        self.db.refresh(provider_user)
        
        return ProviderUserResponse.from_orm(provider_user)

    async def get_provider_user(self, user_id: int) -> ProviderUserResponse:
        """Get provider user by ID."""
        user = self.provider_repo.get(user_id)
        if not user:
            raise NotFoundError("Provider user not found")
        return ProviderUserResponse.from_orm(user)

    async def update_provider_user(self, user_id: int, user_data: ProviderUserUpdate) -> ProviderUserResponse:
        """Update provider user."""
        user = self.provider_repo.get(user_id)
        if not user:
            raise NotFoundError("Provider user not found")
        
        # Update fields
        update_data = user_data.dict(exclude_unset=True)
        if 'password' in update_data:
            update_data['hashed_password'] = get_password_hash(update_data.pop('password'))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        
        return ProviderUserResponse.from_orm(user)

    async def delete_provider_user(self, user_id: int) -> bool:
        """Delete provider user."""
        user = self.provider_repo.get(user_id)
        if not user:
            raise NotFoundError("Provider user not found")
        
        self.db.delete(user)
        self.db.commit()
        return True

    # Customer User Management
    async def get_customer_users(
        self,
        filters: UserFilterParams,
        skip: int = 0,
        limit: int = 20
    ) -> PaginatedResponse[CustomerUserResponse]:
        """Get paginated list of customer users with filters."""
        query = self.db.query(CustomerUser)
        
        # Apply filters
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                CustomerUser.email.ilike(search_term) |
                CustomerUser.first_name.ilike(search_term) |
                CustomerUser.last_name.ilike(search_term)
            )
        
        if filters.status:
            query = query.filter(CustomerUser.status == filters.status)
        
        if filters.is_active is not None:
            query = query.filter(CustomerUser.is_active == filters.is_active)
        
        if filters.created_after:
            query = query.filter(CustomerUser.created_at >= filters.created_after)
        
        if filters.created_before:
            query = query.filter(CustomerUser.created_at <= filters.created_before)

        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        users = query.order_by(desc(CustomerUser.created_at)).offset(skip).limit(limit).all()
        
        # Convert to response schemas
        items = [CustomerUserResponse.from_orm(user) for user in users]
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=skip // limit + 1,
            per_page=limit,
            pages=(total + limit - 1) // limit
        )

    async def create_customer_user(self, user_data: CustomerUserCreate) -> CustomerUserResponse:
        """Create new customer user."""
        # Check if email already exists
        existing_user = self.customer_repo.get_by_email(user_data.email)
        if existing_user:
            raise ConflictError("Email already registered")
        
        # Create customer user
        customer_user = CustomerUser(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            hashed_password=get_password_hash(user_data.password),
            phone=user_data.phone,
            date_of_birth=user_data.date_of_birth,
            gender=user_data.gender,
            address=user_data.address,
            city=user_data.city,
            state=user_data.state,
            country=user_data.country,
            postal_code=user_data.postal_code,
            status=user_data.status or UserStatus.ACTIVE,
            is_active=user_data.is_active if user_data.is_active is not None else True,
            preferences=user_data.preferences or {},
            marketing_consent=user_data.marketing_consent or False
        )
        
        self.db.add(customer_user)
        self.db.commit()
        self.db.refresh(customer_user)
        
        return CustomerUserResponse.from_orm(customer_user)

    async def get_customer_user(self, user_id: int) -> CustomerUserResponse:
        """Get customer user by ID."""
        user = self.customer_repo.get(user_id)
        if not user:
            raise NotFoundError("Customer user not found")
        return CustomerUserResponse.from_orm(user)

    async def update_customer_user(self, user_id: int, user_data: CustomerUserUpdate) -> CustomerUserResponse:
        """Update customer user."""
        user = self.customer_repo.get(user_id)
        if not user:
            raise NotFoundError("Customer user not found")
        
        # Update fields
        update_data = user_data.dict(exclude_unset=True)
        if 'password' in update_data:
            update_data['hashed_password'] = get_password_hash(update_data.pop('password'))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        
        return CustomerUserResponse.from_orm(user)

    async def delete_customer_user(self, user_id: int) -> bool:
        """Delete customer user."""
        user = self.customer_repo.get(user_id)
        if not user:
            raise NotFoundError("Customer user not found")
        
        self.db.delete(user)
        self.db.commit()
        return True

    # Bulk Operations
    async def bulk_user_operation(self, operation: BulkUserOperation) -> Dict[str, int]:
        """Perform bulk operations on users."""
        results = {"success": 0, "failed": 0}
        
        for user_id in operation.user_ids:
            try:
                if operation.user_type == UserType.ADMIN:
                    user = self.admin_repo.get(user_id)
                elif operation.user_type == UserType.PROVIDER:
                    user = self.provider_repo.get(user_id)
                elif operation.user_type == UserType.CUSTOMER:
                    user = self.customer_repo.get(user_id)
                else:
                    results["failed"] += 1
                    continue
                
                if not user:
                    results["failed"] += 1
                    continue
                
                if operation.operation == "activate":
                    user.is_active = True
                    user.status = UserStatus.ACTIVE
                elif operation.operation == "deactivate":
                    user.is_active = False
                    user.status = UserStatus.INACTIVE
                elif operation.operation == "delete":
                    self.db.delete(user)
                else:
                    results["failed"] += 1
                    continue
                
                user.updated_at = datetime.utcnow()
                results["success"] += 1
                
            except Exception:
                results["failed"] += 1
                continue
        
        self.db.commit()
        return results

    # Statistics
    async def get_user_statistics(self) -> UserStatistics:
        """Get comprehensive user statistics."""
        # Admin statistics
        admin_total = self.db.query(AdminUser).count()
        admin_active = self.db.query(AdminUser).filter(AdminUser.is_active == True).count()
        admin_inactive = admin_total - admin_active
        
        # Provider statistics
        provider_total = self.db.query(ProviderUser).count()
        provider_active = self.db.query(ProviderUser).filter(ProviderUser.is_active == True).count()
        provider_inactive = provider_total - provider_active
        
        # Customer statistics
        customer_total = self.db.query(CustomerUser).count()
        customer_active = self.db.query(CustomerUser).filter(CustomerUser.is_active == True).count()
        customer_inactive = customer_total - customer_active
        
        # Recent registrations (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_admins = self.db.query(AdminUser).filter(
            AdminUser.created_at >= thirty_days_ago
        ).count()
        
        recent_providers = self.db.query(ProviderUser).filter(
            ProviderUser.created_at >= thirty_days_ago
        ).count()
        
        recent_customers = self.db.query(CustomerUser).filter(
            CustomerUser.created_at >= thirty_days_ago
        ).count()
        
        return UserStatistics(
            total_users=admin_total + provider_total + customer_total,
            admin_users=admin_total,
            provider_users=provider_total,
            customer_users=customer_total,
            active_users=admin_active + provider_active + customer_active,
            inactive_users=admin_inactive + provider_inactive + customer_inactive,
            recent_registrations=recent_admins + recent_providers + recent_customers
        )