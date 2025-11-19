"""Provider user sessions service."""

from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import Session

from app.shared.models.provider_session import ProviderUserSession
from app.shared.models.user import ProviderUser
from app.core.exceptions import NotFoundException
from .schemas import (
    ProviderUserSessionResponse, ProviderUserSessionListResponse,
    ProviderUserSessionFilters, SessionStatistics, ActiveSessionInfo
)


class ProviderUserSessionsService:
    """Service for managing provider user sessions."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_sessions(
        self,
        filters: ProviderUserSessionFilters,
        page: int = 1,
        size: int = 20
    ) -> ProviderUserSessionListResponse:
        """Get provider user sessions with filtering and pagination."""
        query = self.db.query(ProviderUserSession)
        
        # Apply filters
        if filters.user_id:
            query = query.filter(ProviderUserSession.user_id == filters.user_id)
        
        if filters.device_type:
            query = query.filter(ProviderUserSession.device_type == filters.device_type)
        
        if filters.is_active is not None:
            query = query.filter(ProviderUserSession.is_active == filters.is_active)
        
        if filters.created_from:
            query = query.filter(ProviderUserSession.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(ProviderUserSession.created_at <= filters.created_to)
        
        if filters.city:
            query = query.filter(ProviderUserSession.city.ilike(f"%{filters.city}%"))
        
        if filters.country:
            query = query.filter(ProviderUserSession.country.ilike(f"%{filters.country}%"))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(ProviderUserSession.last_active_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return ProviderUserSessionListResponse(
            items=[ProviderUserSessionResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_session_by_id(self, session_id: UUID) -> ProviderUserSessionResponse:
        """Get provider user session by ID."""
        session = self.db.query(ProviderUserSession).filter(
            ProviderUserSession.id == session_id
        ).first()
        
        if not session:
            raise NotFoundException(f"Session with ID {session_id} not found")
        
        return ProviderUserSessionResponse.model_validate(session)

    def revoke_session(self, session_id: UUID) -> dict:
        """Revoke (terminate) a provider user session."""
        session = self.db.query(ProviderUserSession).filter(
            ProviderUserSession.id == session_id
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
        """Revoke all active sessions for a provider user."""
        sessions = self.db.query(ProviderUserSession).filter(
            and_(
                ProviderUserSession.user_id == user_id,
                ProviderUserSession.is_active == True
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
        """Get provider session statistics."""
        # Total sessions
        total_sessions = self.db.query(func.count(ProviderUserSession.id)).scalar()
        
        # Active sessions
        active_sessions = self.db.query(func.count(ProviderUserSession.id)).filter(
            ProviderUserSession.is_active == True
        ).scalar()
        
        # Expired sessions (not active OR past expires_at)
        expired_sessions = self.db.query(func.count(ProviderUserSession.id)).filter(
            or_(
                ProviderUserSession.is_active == False,
                and_(
                    ProviderUserSession.expires_at.isnot(None),
                    ProviderUserSession.expires_at < datetime.utcnow()
                )
            )
        ).scalar()
        
        # By device type
        by_device_data = self.db.query(
            ProviderUserSession.device_type,
            func.count(ProviderUserSession.id)
        ).filter(ProviderUserSession.device_type.isnot(None))\
         .group_by(ProviderUserSession.device_type).all()
        by_device_type = {device: count for device, count in by_device_data}
        
        # By country
        by_country_data = self.db.query(
            ProviderUserSession.country,
            func.count(ProviderUserSession.id)
        ).filter(ProviderUserSession.country.isnot(None))\
         .group_by(ProviderUserSession.country)\
         .order_by(desc(func.count(ProviderUserSession.id)))\
         .limit(10).all()
        by_country = {country: count for country, count in by_country_data}
        
        # Average session duration (for completed sessions)
        avg_duration_data = self.db.query(
            func.avg(
                func.extract('epoch', ProviderUserSession.logged_out_at - ProviderUserSession.created_at) / 3600
            )
        ).filter(
            ProviderUserSession.logged_out_at.isnot(None)
        ).scalar()
        
        # Sessions per user
        total_users = self.db.query(func.count(func.distinct(ProviderUserSession.user_id))).scalar()
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
        """Get list of users with active sessions."""
        # Get active sessions with user info
        results = self.db.query(
            ProviderUserSession.user_id,
            ProviderUser.email,
            func.count(ProviderUserSession.id).label('session_count'),
            func.max(ProviderUserSession.last_active_at).label('latest_active'),
            func.array_agg(ProviderUserSession.device_type).label('devices')
        ).join(
            ProviderUser, ProviderUserSession.user_id == ProviderUser.id
        ).filter(
            ProviderUserSession.is_active == True
        ).group_by(
            ProviderUserSession.user_id,
            ProviderUser.email
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
