"""
Shared constants for the Maya platform.

This module contains all static values, paths, and text used throughout the application.
All hardcoded strings should be imported from these constants to maintain consistency.
"""

from .api import *
from .business import *
from .status import *
from .user_roles import *
from .device_types import *
from .response_messages import *
from .paths import *
from .ui import *

__all__ = [
    # API Constants
    "API_ROUTES",
    "API_PREFIXES", 
    "API_TAGS",
    "HTTP_STATUS_CODES",
    
    # Business Constants
    "BUSINESS_TYPES",
    "SERVICE_CATEGORIES",
    "BOOKING_POLICIES",
    "PAYMENT_METHODS",
    "COMMISSION_RATES",
    
    # Status Constants
    "BOOKING_STATUS", 
    "PAYMENT_STATUS",
    "VERIFICATION_STATUS",
    "USER_STATUS",
    "REFERRAL_STATUS",
    "AD_STATUS",
    "NOTIFICATION_STATUS",
    
    # User Role Constants
    "USER_ROLES",
    "PERMISSION_LEVELS",
    "ROLE_HIERARCHIES",
    
    # Device & Platform Constants
    "DEVICE_TYPES",
    "PLATFORM_TYPES",
    "BROWSER_TYPES",
    
    # Response Message Constants
    "SUCCESS_MESSAGES",
    "ERROR_MESSAGES", 
    "VALIDATION_MESSAGES",
    "NOTIFICATION_MESSAGES",
    
    # Path Constants
    "API_PATHS",
    "UPLOAD_PATHS",
    "STATIC_PATHS",
    "EXTERNAL_URLS",
    
    # UI Constants
    "UI_COLORS",
    "UI_SIZES",
    "UI_ICONS",
    "UI_THEMES"
]