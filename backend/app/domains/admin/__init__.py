"""Admin domain initialization."""

# This domain handles:
# - System administration
# - User management across all domains  
# - Provider approval and oversight
# - Customer management and support
# - Analytics and reporting
# - System configuration

from .router import admin_router

__version__ = "1.0.0"
__all__ = ["admin_router"]