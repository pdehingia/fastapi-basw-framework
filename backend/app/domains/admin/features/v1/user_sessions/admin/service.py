"""Admin user sessions service."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import Session

from app.shared.models.user import AdminUserSession, AdminUser
from app.core.exceptions import NotFoundException
from .schemas import (
    AdminUserSessionResponse, AdminUserSessionListResponse,
    AdminUserSessionFilters, SessionStatistics, ActiveSessionInfo
)


class AdminUserSessionsService:
    """Service for managing admin user sessions."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_sessions(
        self,
        filters: AdminUserSessionFilters,
        page: int = 1,
        size: int = 20
    ) -> AdminUserSessionListResponse:
        """Get admin user sessions with filtering and pagination."""
        query = self.db.query(AdminUserSession)
        
        # Apply filters
        if filters.user_id:
            query = query.filter(AdminUserSession.user_id == filters.user_id)
        
        if filters.device_type:
            query = query.filter(AdminUserSession.device_type == filters.device_type)
        
        if filters.is_active is not None:
            query = query.filter(AdminUserSession.is_active == filters.is_active)
        
        if filters.created_from:
            query = query.filter(AdminUserSession.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(AdminUserSession.created_at <= filters.created_to)
        
        if filters.city:
            query = query.filter(AdminUserSession.city.ilike(f"%{filters.city}%"))
        
        if filters.country:
            query = query.filter(AdminUserSession.country.ilike(f"%{filters.country}%"))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(AdminUserSession.last_active_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return AdminUserSessionListResponse(
            items=[AdminUserSessionResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_session_by_id(self, session_id: UUID) -> AdminUserSessionResponse:
        """Get admin user session by ID."""
        session = self.db.query(AdminUserSession).filter(
            AdminUserSession.id == session_id
        ).first()
        
        if not session:
            raise NotFoundException(f"Session with ID {session_id} not found")
        
        return AdminUserSessionResponse.model_validate(session)

    def revoke_session(self, session_id: UUID) -> dict:
        """Revoke (terminate) an admin user session."""
        session = self.db.query(AdminUserSession).filter(
            AdminUserSession.id == session_id
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
        """Revoke all active sessions for an admin user."""
        sessions = self.db.query(AdminUserSession).filter(
            and_(
                AdminUserSession.user_id == user_id,
                AdminUserSession.is_active == True
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
        """Get admin session statistics."""
        # Total sessions
        total_sessions = self.db.query(func.count(AdminUserSession.id)).scalar()
        
        # Active sessions
        active_sessions = self.db.query(func.count(AdminUserSession.id)).filter(
            AdminUserSession.is_active == True
        ).scalar()
        
        # Expired sessions (not active OR past expires_at)
        expired_sessions = self.db.query(func.count(AdminUserSession.id)).filter(
            or_(
                AdminUserSession.is_active == False,
                and_(
                    AdminUserSession.expires_at.isnot(None),
                    AdminUserSession.expires_at < datetime.utcnow()
                )
            )
        ).scalar()
        
        # By device type
        by_device_data = self.db.query(
            AdminUserSession.device_type,
            func.count(AdminUserSession.id)
        ).filter(AdminUserSession.device_type.isnot(None))\
         .group_by(AdminUserSession.device_type).all()
        by_device_type = {device: count for device, count in by_device_data}
        
        # By country
        by_country_data = self.db.query(
            AdminUserSession.country,
            func.count(AdminUserSession.id)
        ).filter(AdminUserSession.country.isnot(None))\
         .group_by(AdminUserSession.country)\
         .order_by(desc(func.count(AdminUserSession.id)))\
         .limit(10).all()
        by_country = {country: count for country, count in by_country_data}
        
        # Average session duration (for completed sessions)
        avg_duration_data = self.db.query(
            func.avg(
                func.extract('epoch', AdminUserSession.logged_out_at - AdminUserSession.created_at) / 3600
            )
        ).filter(
            AdminUserSession.logged_out_at.isnot(None)
        ).scalar()
        
        # Sessions per user
        total_users = self.db.query(func.count(func.distinct(AdminUserSession.user_id))).scalar()
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
        """Get list of admin users with active sessions."""
        # Get active sessions with user info
        results = self.db.query(
            AdminUserSession.user_id,
            AdminUser.email,
            func.count(AdminUserSession.id).label('session_count'),
            func.max(AdminUserSession.last_active_at).label('latest_active'),
            func.array_agg(AdminUserSession.device_type).label('devices')
        ).join(
            AdminUser, AdminUserSession.user_id == AdminUser.id
        ).filter(
            AdminUserSession.is_active == True
        ).group_by(
            AdminUserSession.user_id,
            AdminUser.email
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
