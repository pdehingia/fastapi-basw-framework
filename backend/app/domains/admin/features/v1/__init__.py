"""Admin domain API v1 features."""

from .auth import auth_router
from .user_management import router as user_management_router
from .business_operations import router as business_operations_router
from .content_management import router as content_management_router
from .analytics import router as analytics_router
from .academy_management import router as academy_management_router
from .services import router as services_router
from .user_sessions import router as user_sessions_router
from .audit_logs import router as audit_logs_router
from .campaigns import router as campaigns_router
# from .marketing import router as marketing_router  # TODO: Fix import paths
# from .system import router as system_router  # TODO: Fix import paths

__all__ = [
    "auth_router",
    "user_management_router",
    "business_operations_router",
    "content_management_router",
    "analytics_router",
    "academy_management_router",
    "services_router",
    "user_sessions_router",
    "audit_logs_router",
    "campaigns_router",
    # "marketing_router",  # TODO: Fix import paths
    # "system_router"  # TODO: Fix import paths
]