"""Customer user sessions service."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import Session

from app.shared.models.user import CustomerUserSession, CustomerUser
from app.core.exceptions import NotFoundException
from .schemas import (
    CustomerUserSessionResponse, CustomerUserSessionListResponse,
    CustomerUserSessionFilters, SessionStatistics, ActiveSessionInfo
)


class CustomerUserSessionsService:
    """Service for managing customer user sessions."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_sessions(
        self,
        filters: CustomerUserSessionFilters,
        page: int = 1,
        size: int = 20
    ) -> CustomerUserSessionListResponse:
        """Get customer user sessions with filtering and pagination."""
        query = self.db.query(CustomerUserSession)
        
        # Apply filters
        if filters.user_id:
            query = query.filter(CustomerUserSession.user_id == filters.user_id)
        
        if filters.device_type:
            query = query.filter(CustomerUserSession.device_type == filters.device_type)
        
        if filters.is_active is not None:
            query = query.filter(CustomerUserSession.is_active == filters.is_active)
        
        if filters.created_from:
            query = query.filter(CustomerUserSession.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(CustomerUserSession.created_at <= filters.created_to)
        
        if filters.city:
            query = query.filter(CustomerUserSession.city.ilike(f"%{filters.city}%"))
        
        if filters.country:
            query = query.filter(CustomerUserSession.country.ilike(f"%{filters.country}%"))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(CustomerUserSession.last_active_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return CustomerUserSessionListResponse(
            items=[CustomerUserSessionResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_session_by_id(self, session_id: UUID) -> CustomerUserSessionResponse:
        """Get customer user session by ID."""
        session = self.db.query(CustomerUserSession).filter(
            CustomerUserSession.id == session_id
        ).first()
        
        if not session:
            raise NotFoundException(f"Session with ID {session_id} not found")
        
        return CustomerUserSessionResponse.model_validate(session)

    def revoke_session(self, session_id: UUID) -> dict:
        """Revoke (terminate) a customer user session."""
        session = self.db.query(CustomerUserSession).filter(
            CustomerUserSession.id == session_id
        ).first()
        
        if not session:
            raise NotFoundException(f"Session with ID {session_id} not found")
        
        session.is_active = False
        session.logged_out_at = datetime.utcnow()
        
        self.db.commit()
        
        return {
            "message": "Session revoked successfully",
            "session_id": str(session_id)
        }

    def revoke_user_sessions(self, user_id: UUID) -> dict:
        """Revoke all active sessions for a customer user."""
        sessions = self.db.query(CustomerUserSession).filter(
            and_(
                CustomerUserSession.user_id == user_id,
                CustomerUserSession.is_active == True
            )
        ).all()
        
        if not sessions:
            raise NotFoundException(f"No active sessions found for user {user_id}")
        
        revoked_count = 0
        for session in sessions:
            session.is_active = False
            session.logged_out_at = datetime.utcnow()
            revoked_count += 1
        
        self.db.commit()
        
        return {
            "message": "All user sessions revoked successfully",
            "user_id": str(user_id),
            "revoked_count": revoked_count
        }

    def get_statistics(self) -> SessionStatistics:
        """Get customer session statistics."""
        # Total sessions
        total_sessions = self.db.query(func.count(CustomerUserSession.id)).scalar()
        
        # Active sessions
        active_sessions = self.db.query(func.count(CustomerUserSession.id)).filter(
            CustomerUserSession.is_active == True
        ).scalar()
        
        # Expired sessions (not active OR past expires_at)
        expired_sessions = self.db.query(func.count(CustomerUserSession.id)).filter(
            or_(
                CustomerUserSession.is_active == False,
                and_(
                    CustomerUserSession.expires_at.isnot(None),
                    CustomerUserSession.expires_at < datetime.utcnow()
                )
            )
        ).scalar()
        
        # By device type
        by_device_data = self.db.query(
            CustomerUserSession.device_type,
            func.count(CustomerUserSession.id)
        ).filter(CustomerUserSession.device_type.isnot(None))\
         .group_by(CustomerUserSession.device_type).all()
        by_device_type = {device: count for device, count in by_device_data}
        
        # By country
        by_country_data = self.db.query(
            CustomerUserSession.country,
            func.count(CustomerUserSession.id)
        ).filter(CustomerUserSession.country.isnot(None))\
         .group_by(CustomerUserSession.country)\
         .order_by(desc(func.count(CustomerUserSession.id)))\
         .limit(10).all()
        by_country = {country: count for country, count in by_country_data}
        
        # Average session duration (for completed sessions)
        avg_duration_data = self.db.query(
            func.avg(
                func.extract('epoch', CustomerUserSession.logged_out_at - CustomerUserSession.created_at) / 3600
            )
        ).filter(
            CustomerUserSession.logged_out_at.isnot(None)
        ).scalar()
        
        # Sessions per user
        total_users = self.db.query(func.count(func.distinct(CustomerUserSession.user_id))).scalar()
        sessions_per_user = (total_sessions / total_users) if total_users > 0 else 0.0
        
        return SessionStatistics(
            total_sessions=total_sessions or 0,
            active_sessions=active_sessions or 0,
            expired_sessions=expired_sessions or 0,
            by_device_type=by_device_type,
            by_country=by_country,
            avg_session_duration_hours=round(float(avg_duration_data), 2) if avg_duration_data else None,
            sessions_per_user=round(sessions_per_user, 2)
        )

    def get_active_sessions(self) -> List[ActiveSessionInfo]:
        """Get list of customer users with active sessions."""
        # Get active sessions with user info
        results = self.db.query(
            CustomerUserSession.user_id,
            CustomerUser.email,
            func.count(CustomerUserSession.id).label('session_count'),
            func.max(CustomerUserSession.last_active_at).label('latest_active'),
            func.array_agg(CustomerUserSession.device_type).label('devices')
        ).join(
            CustomerUser, CustomerUserSession.user_id == CustomerUser.id
        ).filter(
            CustomerUserSession.is_active == True
        ).group_by(
            CustomerUserSession.user_id,
            CustomerUser.email
        ).order_by(
            desc('latest_active')
        ).all()
        
        active_sessions = []
        for result in results:
            # Filter out None values from devices array and get unique devices
            devices = list(set([d for d in result.devices if d]))
            
            active_sessions.append(ActiveSessionInfo(
                user_id=result.user_id,
                user_email=result.email,
                active_session_count=result.session_count,
                latest_session_at=result.latest_active,
                devices=devices
            ))
        
        return active_sessions
