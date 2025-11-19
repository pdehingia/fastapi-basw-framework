"""
Customer management service for admin domain.
Handles CRUD operations and business logic for customer users.
"""

from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID
import csv
import io
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, desc, or_, text

from app.shared.models.user import CustomerUser, CustomerAuditLog, CustomerUserSession
from app.shared.repositories.user import CustomerUserRepository
from .schemas import (
    CustomerFilterParams,
    CustomerUserCreate,
    CustomerUserUpdate,
    CustomerUserResponse,
    CustomerDetailResponse,
    CustomerStatistics,
    CustomerStatusUpdate,
    CustomerVerificationUpdate,
    BulkCustomerOperation,
    BulkCustomerOperationResponse,
    CustomerNotification,
    CustomerExportRequest,
    CustomerSessionResponse,
    CustomerActivityLog
)
from app.shared.pagination import PaginationParams, PaginatedResponse, PageMetadata
from app.core.security import get_password_hash
from app.shared.exceptions import ValidationException, NotFoundError, ConflictError


class CustomerManagementService:
    """Service for managing customer users in Maya platform."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.customer_repo = CustomerUserRepository(db)

    async def get_customers_list(
        self, 
        filters: CustomerFilterParams,
        pagination: PaginationParams
    ) -> PaginatedResponse[CustomerUserResponse]:
        """
        Get paginated list of customers with filtering and search.
        """
        try:
            # Build base query
            query = self.db.query(CustomerUser)
            
            # Apply filters
            if filters.search:
                search_term = f"%{filters.search.lower()}%"
                query = query.filter(
                    or_(
                        func.lower(CustomerUser.full_name).like(search_term),
                        func.lower(CustomerUser.email).like(search_term),
                        CustomerUser.phone.like(search_term)
                    )
                )
            
            if filters.status:
                if filters.status == "active":
                    query = query.filter(CustomerUser.is_active == True)
                elif filters.status == "inactive":
                    query = query.filter(CustomerUser.is_active == False)
            
            if filters.is_verified is not None:
                query = query.filter(CustomerUser.is_verified == filters.is_verified)
                
            if filters.city:
                # Note: city field may need to be added to customer model or fetched from addresses
                pass
                
            if filters.gender:
                query = query.filter(CustomerUser.gender == filters.gender)
                
            if filters.created_after:
                query = query.filter(CustomerUser.created_at >= filters.created_after)
                
            if filters.created_before:
                query = query.filter(CustomerUser.created_at <= filters.created_before)
                
            if filters.last_login_after:
                query = query.filter(CustomerUser.last_login >= filters.last_login_after)
                
            if filters.last_login_before:
                query = query.filter(CustomerUser.last_login <= filters.last_login_before)
                
            if filters.min_bookings is not None:
                query = query.filter(CustomerUser.total_bookings >= filters.min_bookings)
                
            if filters.max_bookings is not None:
                query = query.filter(CustomerUser.total_bookings <= filters.max_bookings)
                
            if filters.min_spent is not None:
                query = query.filter(CustomerUser.total_spent >= str(filters.min_spent))
                
            if filters.max_spent is not None:
                query = query.filter(CustomerUser.total_spent <= str(filters.max_spent))
                
            if filters.has_oauth is not None:
                if filters.has_oauth:
                    query = query.filter(
                        or_(
                            CustomerUser.oauth_google_id.isnot(None),
                            CustomerUser.oauth_facebook_id.isnot(None),
                            CustomerUser.oauth_apple_id.isnot(None)
                        )
                    )
                else:
                    query = query.filter(
                        and_(
                            CustomerUser.oauth_google_id.is_(None),
                            CustomerUser.oauth_facebook_id.is_(None),
                            CustomerUser.oauth_apple_id.is_(None)
                        )
                    )
            
            # Apply sorting
            sort_column = getattr(CustomerUser, filters.sort_by, CustomerUser.created_at)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(sort_column)
            
            # Get total count before pagination
            total_items = query.count()
            
            # Apply pagination
            skip = (pagination.page - 1) * pagination.page_size
            customers = query.offset(skip).limit(pagination.page_size).all()
            
            # Calculate pagination metadata
            total_pages = (total_items + pagination.page_size - 1) // pagination.page_size
            
            metadata = PageMetadata(
                page=pagination.page,
                page_size=pagination.page_size,
                total_items=total_items,
                total_pages=total_pages,
                has_next=pagination.page < total_pages,
                has_previous=pagination.page > 1
            )
            
            # Convert to response models
            customer_responses = [
                CustomerUserResponse.model_validate(customer) 
                for customer in customers
            ]
            
            return PaginatedResponse[CustomerUserResponse](
                items=customer_responses,
                metadata=metadata
            )
            
        except Exception as e:
            raise ValidationException(f"Error retrieving customers: {str(e)}")

    async def get_customer_by_id(self, customer_id: UUID) -> CustomerDetailResponse:
        """
        Get detailed customer information by ID.
        """
        try:
            # Get customer with related data
            customer = self.db.query(CustomerUser)\
                .filter(CustomerUser.id == customer_id)\
                .first()
            
            if not customer:
                raise NotFoundError(f"Customer with ID {customer_id} not found")
            
            # Get recent bookings (would need booking model)
            recent_bookings = []  # TODO: Implement when booking model is available
            
            # Get recent reviews (would need review model)
            recent_reviews = []  # TODO: Implement when review model is available
            
            # Get recent activity
            recent_activity = self._get_customer_activity(customer_id)
            
            # Get addresses (would need address model)
            addresses = []  # TODO: Implement when address model is available
            
            # Calculate additional metrics
            avg_booking_value = self._calculate_avg_booking_value(customer_id)
            customer_lifetime_value = self._calculate_lifetime_value(customer_id)
            
            # Convert customer to response model
            customer_data = CustomerUserResponse.model_validate(customer).model_dump()
            
            # Add extended data
            extended_data = {
                **customer_data,
                "recent_bookings": recent_bookings,
                "recent_reviews": recent_reviews,
                "recent_activity": recent_activity,
                "addresses": addresses,
                "avg_booking_value": avg_booking_value,
                "customer_lifetime_value": customer_lifetime_value,
                "favorite_occasions": [],  # TODO: Implement
                "booking_frequency": self._calculate_booking_frequency(customer),
                "referral_code": None,  # TODO: Implement when referral model is available
                "referred_customers": 0,  # TODO: Implement
                "total_referral_rewards": None  # TODO: Implement
            }
            
            return CustomerDetailResponse(**extended_data)
            
        except NotFoundError:
            raise
        except Exception as e:
            raise ValidationException(f"Error retrieving customer details: {str(e)}")

    async def create_customer(self, customer_data: CustomerUserCreate) -> CustomerUserResponse:
        """
        Create a new customer user.
        """
        try:
            # Check if email already exists (if provided)
            if customer_data.email:
                existing_customer = self.customer_repo.get_by_email(customer_data.email)
                if existing_customer:
                    raise ConflictError(f"Customer with email {customer_data.email} already exists")
            
            # Check if phone already exists
            existing_phone = self.customer_repo.get_by_phone(customer_data.phone)
            if existing_phone:
                raise ConflictError(f"Customer with phone {customer_data.phone} already exists")
            
            # Hash password if provided
            hashed_password = None
            if customer_data.password:
                hashed_password = get_password_hash(customer_data.password)
            
            # Create customer data
            customer_dict = customer_data.model_dump(exclude={"password"})
            customer_dict["hashed_password"] = hashed_password
            customer_dict["total_spent"] = str(Decimal("0.00"))
            customer_dict["created_at"] = datetime.utcnow()
            customer_dict["updated_at"] = datetime.utcnow()
            
            # Create customer
            customer = CustomerUser(**customer_dict)
            self.db.add(customer)
            self.db.commit()
            self.db.refresh(customer)
            
            # Log the creation
            await self._log_customer_action(
                customer.id,
                "customer_created",
                f"Customer created by admin"
            )
            
            return CustomerUserResponse.model_validate(customer)
            
        except (ConflictError, ValidationException):
            raise
        except Exception as e:
            self.db.rollback()
            raise ValidationException(f"Error creating customer: {str(e)}")

    async def update_customer(
        self, 
        customer_id: UUID, 
        update_data: CustomerUserUpdate
    ) -> CustomerUserResponse:
        """
        Update customer information.
        """
        try:
            customer = self.customer_repo.get_by_id(customer_id)
            if not customer:
                raise NotFoundError(f"Customer with ID {customer_id} not found")
            
            # Store original data for audit
            original_data = {
                "email": customer.email,
                "phone": customer.phone,
                "full_name": customer.full_name,
                "is_active": customer.is_active,
                "is_verified": customer.is_verified
            }
            
            # Check for conflicts on unique fields
            update_dict = update_data.model_dump(exclude_unset=True)
            
            if "email" in update_dict and update_dict["email"]:
                existing_customer = self.customer_repo.get_by_email(update_dict["email"])
                if existing_customer and existing_customer.id != customer_id:
                    raise ConflictError(f"Email {update_dict['email']} is already in use")
            
            if "phone" in update_dict:
                existing_phone = self.customer_repo.get_by_phone(update_dict["phone"])
                if existing_phone and existing_phone.id != customer_id:
                    raise ConflictError(f"Phone {update_dict['phone']} is already in use")
            
            # Update customer
            for field, value in update_dict.items():
                if hasattr(customer, field) and value is not None:
                    if field == "total_spent" and isinstance(value, Decimal):
                        setattr(customer, field, str(value))
                    else:
                        setattr(customer, field, value)
            
            customer.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(customer)
            
            # Log the update
            await self._log_customer_action(
                customer_id,
                "customer_updated",
                f"Customer updated by admin",
                before=original_data,
                after=update_dict
            )
            
            return CustomerUserResponse.model_validate(customer)
            
        except (NotFoundError, ConflictError, ValidationException):
            raise
        except Exception as e:
            self.db.rollback()
            raise ValidationException(f"Error updating customer: {str(e)}")

    async def update_customer_status(
        self,
        customer_id: UUID,
        status_update: CustomerStatusUpdate
    ) -> CustomerUserResponse:
        """
        Update customer status (active/inactive/suspended).
        """
        try:
            customer = self.customer_repo.get_by_id(customer_id)
            if not customer:
                raise NotFoundError(f"Customer with ID {customer_id} not found")
            
            original_status = customer.is_active
            
            # Update status based on the status_update
            if status_update.status == "active":
                customer.is_active = True
            elif status_update.status in ["inactive", "suspended"]:
                customer.is_active = False
            
            customer.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(customer)
            
            # Log the status change
            await self._log_customer_action(
                customer_id,
                "status_updated",
                f"Status changed from {'active' if original_status else 'inactive'} to {status_update.status}. Reason: {status_update.reason or 'No reason provided'}"
            )
            
            return CustomerUserResponse.model_validate(customer)
            
        except (NotFoundError, ValidationException):
            raise
        except Exception as e:
            self.db.rollback()
            raise ValidationException(f"Error updating customer status: {str(e)}")

    async def get_customer_statistics(self) -> CustomerStatistics:
        """
        Get customer statistics for the admin dashboard.
        """
        try:
            # Basic counts
            total_customers = self.db.query(CustomerUser).count()
            active_customers = self.db.query(CustomerUser).filter(CustomerUser.is_active == True).count()
            inactive_customers = total_customers - active_customers
            verified_customers = self.db.query(CustomerUser).filter(CustomerUser.is_verified == True).count()
            pending_verification = total_customers - verified_customers
            
            # Time-based counts
            today = datetime.utcnow().date()
            week_ago = datetime.utcnow() - timedelta(days=7)
            month_ago = datetime.utcnow() - timedelta(days=30)
            
            new_today = self.db.query(CustomerUser)\
                .filter(func.date(CustomerUser.created_at) == today)\
                .count()
                
            new_this_week = self.db.query(CustomerUser)\
                .filter(CustomerUser.created_at >= week_ago)\
                .count()
                
            new_this_month = self.db.query(CustomerUser)\
                .filter(CustomerUser.created_at >= month_ago)\
                .count()
            
            # Calculate growth percentage
            previous_month = datetime.utcnow() - timedelta(days=60)
            previous_month_customers = self.db.query(CustomerUser)\
                .filter(CustomerUser.created_at.between(previous_month, month_ago))\
                .count()
            
            growth_percentage = 0.0
            if previous_month_customers > 0:
                growth_percentage = ((new_this_month / previous_month_customers) - 1) * 100
            
            # Calculate averages
            avg_bookings = self.db.query(func.avg(CustomerUser.total_bookings)).scalar() or 0
            avg_spent = self.db.query(func.avg(func.cast(CustomerUser.total_spent, text("DECIMAL")))).scalar() or Decimal("0")
            
            return CustomerStatistics(
                total_customers=total_customers,
                active_customers=active_customers,
                inactive_customers=inactive_customers,
                verified_customers=verified_customers,
                pending_verification=pending_verification,
                vip_customers=0,  # TODO: Implement VIP logic
                new_customers_today=new_today,
                new_customers_this_week=new_this_week,
                new_customers_this_month=new_this_month,
                customer_growth_percentage=growth_percentage,
                average_bookings_per_customer=float(avg_bookings),
                average_customer_value=avg_spent,
                top_spending_customers=[],  # TODO: Implement
                most_active_customers=[],  # TODO: Implement
                customers_by_city=[],  # TODO: Implement when address model is available
                customers_by_state=[],  # TODO: Implement when address model is available
                customers_by_gender=self._get_customers_by_gender(),
                customers_by_age_group=[]  # TODO: Implement
            )
            
        except Exception as e:
            raise ValidationException(f"Error calculating customer statistics: {str(e)}")

    async def get_customer_sessions(self, customer_id: UUID) -> List[CustomerSessionResponse]:
        """
        Get active sessions for a customer.
        """
        try:
            sessions = self.db.query(CustomerUserSession)\
                .filter(CustomerUserSession.user_id == customer_id)\
                .filter(CustomerUserSession.is_active == True)\
                .order_by(desc(CustomerUserSession.last_active_at))\
                .all()
            
            return [
                CustomerSessionResponse.model_validate(session)
                for session in sessions
            ]
            
        except Exception as e:
            raise ValidationException(f"Error retrieving customer sessions: {str(e)}")

    def _get_customer_activity(self, customer_id: UUID) -> List[Dict[str, Any]]:
        """Get recent customer activity."""
        try:
            # Get from customer audit logs
            activities = self.db.query(CustomerAuditLog)\
                .filter(CustomerAuditLog.customer_user_id == customer_id)\
                .order_by(desc(CustomerAuditLog.created_at))\
                .limit(20)\
                .all()
            
            return [
                {
                    "id": activity.id,
                    "activity_type": activity.action,
                    "activity_category": activity.entity,
                    "description": f"{activity.action} on {activity.entity}",
                    "created_at": activity.created_at
                }
                for activity in activities
            ]
        except Exception:
            return []

    def _calculate_avg_booking_value(self, customer_id: UUID) -> Optional[Decimal]:
        """Calculate average booking value for customer."""
        # TODO: Implement when booking model is available
        return None

    def _calculate_lifetime_value(self, customer_id: UUID) -> Optional[Decimal]:
        """Calculate customer lifetime value."""
        try:
            customer = self.customer_repo.get_by_id(customer_id)
            if customer and customer.total_spent:
                return Decimal(customer.total_spent)
            return Decimal("0.00")
        except Exception:
            return None

    def _calculate_booking_frequency(self, customer: CustomerUser) -> Optional[str]:
        """Calculate customer booking frequency."""
        if customer.total_bookings == 0:
            return "Never booked"
        
        # Simple frequency calculation based on account age and bookings
        account_days = (datetime.utcnow() - customer.created_at).days
        if account_days == 0:
            account_days = 1
        
        bookings_per_month = (customer.total_bookings / account_days) * 30
        
        if bookings_per_month >= 4:
            return "Weekly"
        elif bookings_per_month >= 1:
            return "Monthly"
        elif bookings_per_month >= 0.25:
            return "Quarterly"
        else:
            return "Rarely"

    def _get_customers_by_gender(self) -> List[Dict[str, Any]]:
        """Get customer distribution by gender."""
        try:
            gender_stats = self.db.query(
                CustomerUser.gender,
                func.count(CustomerUser.id).label("count")
            )\
            .group_by(CustomerUser.gender)\
            .all()
            
            return [
                {"gender": gender or "Not specified", "count": count}
                for gender, count in gender_stats
            ]
        except Exception:
            return []

    async def _log_customer_action(
        self, 
        customer_user_id: UUID, 
        action: str, 
        description: str,
        before: Optional[Dict] = None,
        after: Optional[Dict] = None
    ):
        """Log customer-related actions for audit purposes."""
        try:
            audit_log = CustomerAuditLog(
                customer_user_id=customer_user_id,
                action=action,
                entity="customer",
                entity_id=customer_user_id,
                before=before,
                after=after,
                created_at=datetime.utcnow()
            )
            self.db.add(audit_log)
            self.db.commit()
        except Exception:
            # Don't fail the main operation if logging fails
            pass