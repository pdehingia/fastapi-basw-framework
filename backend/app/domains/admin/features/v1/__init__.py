"""Admin domain API v1 features."""

from .auth import auth_router
from .user_management import router as user_management_router
from .business_operations import router as business_operations_router
from .business_management import business_management_router
from .review_management import review_management_router
from .artist_verification import artist_verification_router
from .support_management import support_management_router
from .analytics_reports import analytics_reports_router
from .academy_management import router as academy_management_router
from .roles_permissions import roles_permissions_router
from .course_management import router as course_management_router
from .user_sessions import router as user_sessions_router
from .audit_logs import router as audit_logs_router
from .campaigns import router as campaigns_router
from .marketing import router as marketing_router
from .system import router as system_router
from .platform_analytics import platform_analytics_router

__all__ = [
    "auth_router",
    "user_management_router",
    "business_operations_router",
    "business_management_router",
    "review_management_router",
    "artist_verification_router",
    "support_management_router",
    "analytics_reports_router",
    "academy_management_router",
    "roles_permissions_router",
    "course_management_router",
    "user_sessions_router",
    "audit_logs_router",
    "campaigns_router",
    "marketing_router",
    "system_router",
    "platform_analytics_router"
]