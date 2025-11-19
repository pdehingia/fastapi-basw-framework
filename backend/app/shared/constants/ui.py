"""
UI Constants

All user interface constants including colors, sizes, icons, and themes.
"""

from typing import Dict, List


# ===== UI COLORS =====
class UIColors:
    """UI color constants for consistent theming."""
    
    # Primary Brand Colors
    PRIMARY = "#6366F1"      # Indigo
    PRIMARY_LIGHT = "#818CF8"
    PRIMARY_DARK = "#4F46E5"
    
    # Secondary Colors
    SECONDARY = "#EC4899"    # Pink
    SECONDARY_LIGHT = "#F472B6"
    SECONDARY_DARK = "#DB2777"
    
    # Accent Colors
    ACCENT = "#F59E0B"       # Amber
    ACCENT_LIGHT = "#FBBF24"
    ACCENT_DARK = "#D97706"
    
    # Neutral Colors
    WHITE = "#FFFFFF"
    BLACK = "#000000"
    GRAY_50 = "#F9FAFB"
    GRAY_100 = "#F3F4F6"
    GRAY_200 = "#E5E7EB"
    GRAY_300 = "#D1D5DB"
    GRAY_400 = "#9CA3AF"
    GRAY_500 = "#6B7280"
    GRAY_600 = "#4B5563"
    GRAY_700 = "#374151"
    GRAY_800 = "#1F2937"
    GRAY_900 = "#111827"
    
    # Status Colors
    SUCCESS = "#10B981"      # Emerald
    SUCCESS_LIGHT = "#34D399"
    SUCCESS_DARK = "#059669"
    
    WARNING = "#F59E0B"      # Amber
    WARNING_LIGHT = "#FBBF24"
    WARNING_DARK = "#D97706"
    
    ERROR = "#EF4444"        # Red
    ERROR_LIGHT = "#F87171"
    ERROR_DARK = "#DC2626"
    
    INFO = "#3B82F6"         # Blue
    INFO_LIGHT = "#60A5FA"
    INFO_DARK = "#2563EB"
    
    # Background Colors
    BACKGROUND = "#FFFFFF"
    BACKGROUND_SECONDARY = "#F9FAFB"
    BACKGROUND_TERTIARY = "#F3F4F6"
    
    # Text Colors
    TEXT_PRIMARY = "#111827"
    TEXT_SECONDARY = "#6B7280"
    TEXT_TERTIARY = "#9CA3AF"
    TEXT_INVERSE = "#FFFFFF"
    
    # Border Colors
    BORDER_LIGHT = "#E5E7EB"
    BORDER_DEFAULT = "#D1D5DB"
    BORDER_DARK = "#9CA3AF"


# ===== UI SIZES =====
class UISizes:
    """UI size constants for consistent spacing and layout."""
    
    # Spacing Scale (in pixels)
    SPACE_0 = 0
    SPACE_1 = 4      # 0.25rem
    SPACE_2 = 8      # 0.5rem
    SPACE_3 = 12     # 0.75rem
    SPACE_4 = 16     # 1rem
    SPACE_5 = 20     # 1.25rem
    SPACE_6 = 24     # 1.5rem
    SPACE_8 = 32     # 2rem
    SPACE_10 = 40    # 2.5rem
    SPACE_12 = 48    # 3rem
    SPACE_16 = 64    # 4rem
    SPACE_20 = 80    # 5rem
    SPACE_24 = 96    # 6rem
    SPACE_32 = 128   # 8rem
    SPACE_40 = 160   # 10rem
    SPACE_48 = 192   # 12rem
    SPACE_56 = 224   # 14rem
    SPACE_64 = 256   # 16rem
    
    # Border Radius
    RADIUS_NONE = 0
    RADIUS_SM = 2
    RADIUS_DEFAULT = 4
    RADIUS_MD = 6
    RADIUS_LG = 8
    RADIUS_XL = 12
    RADIUS_2XL = 16
    RADIUS_FULL = 9999
    
    # Font Sizes
    TEXT_XS = 12
    TEXT_SM = 14
    TEXT_BASE = 16
    TEXT_LG = 18
    TEXT_XL = 20
    TEXT_2XL = 24
    TEXT_3XL = 30
    TEXT_4XL = 36
    TEXT_5XL = 48
    TEXT_6XL = 60
    
    # Component Sizes
    BUTTON_SM = 32
    BUTTON_MD = 40
    BUTTON_LG = 48
    BUTTON_XL = 56
    
    INPUT_SM = 32
    INPUT_MD = 40
    INPUT_LG = 48
    
    AVATAR_XS = 24
    AVATAR_SM = 32
    AVATAR_MD = 40
    AVATAR_LG = 48
    AVATAR_XL = 64
    AVATAR_2XL = 80
    
    # Layout Sizes
    SIDEBAR_WIDTH = 256
    HEADER_HEIGHT = 64
    FOOTER_HEIGHT = 60
    MOBILE_BREAKPOINT = 768
    TABLET_BREAKPOINT = 1024
    DESKTOP_BREAKPOINT = 1280


# ===== UI ICONS =====
class UIIcons:
    """UI icon name constants for consistent icon usage."""
    
    # Navigation Icons
    HOME = "home"
    MENU = "menu"
    BACK = "arrow-left"
    FORWARD = "arrow-right"
    UP = "arrow-up"
    DOWN = "arrow-down"
    CLOSE = "x"
    
    # Action Icons
    ADD = "plus"
    EDIT = "edit"
    DELETE = "trash"
    SAVE = "save"
    CANCEL = "x"
    CONFIRM = "check"
    REFRESH = "refresh"
    SEARCH = "search"
    FILTER = "filter"
    SORT = "sort"
    
    # Status Icons
    SUCCESS = "check-circle"
    ERROR = "x-circle"
    WARNING = "exclamation-triangle"
    INFO = "information-circle"
    LOADING = "spinner"
    
    # User Icons
    USER = "user"
    USERS = "users"
    PROFILE = "user-circle"
    SETTINGS = "cog"
    LOGOUT = "logout"
    LOGIN = "login"
    
    # Business Icons
    SALON = "building-office"
    SERVICE = "sparkles"
    CALENDAR = "calendar"
    CLOCK = "clock"
    STAR = "star"
    HEART = "heart"
    
    # Communication Icons
    EMAIL = "envelope"
    PHONE = "phone"
    SMS = "chat-bubble-left"
    NOTIFICATION = "bell"
    
    # Financial Icons
    MONEY = "banknotes"
    CREDIT_CARD = "credit-card"
    WALLET = "wallet"
    CHART = "chart-bar"
    
    # File Icons
    IMAGE = "photo"
    DOCUMENT = "document"
    DOWNLOAD = "arrow-down-tray"
    UPLOAD = "arrow-up-tray"
    
    # Location Icons
    LOCATION = "map-pin"
    MAP = "map"
    GLOBE = "globe-alt"
    
    # Social Icons
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"


# ===== UI THEMES =====
class UIThemes:
    """UI theme constants for theme switching."""
    
    # Theme Names
    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"
    
    # Theme Definitions
    LIGHT_THEME = {
        "name": LIGHT,
        "primary": UIColors.PRIMARY,
        "secondary": UIColors.SECONDARY,
        "background": UIColors.WHITE,
        "surface": UIColors.GRAY_50,
        "text": UIColors.TEXT_PRIMARY,
        "text_secondary": UIColors.TEXT_SECONDARY,
        "border": UIColors.BORDER_LIGHT,
        "success": UIColors.SUCCESS,
        "warning": UIColors.WARNING,
        "error": UIColors.ERROR,
        "info": UIColors.INFO
    }
    
    DARK_THEME = {
        "name": DARK,
        "primary": UIColors.PRIMARY_LIGHT,
        "secondary": UIColors.SECONDARY_LIGHT,
        "background": UIColors.GRAY_900,
        "surface": UIColors.GRAY_800,
        "text": UIColors.WHITE,
        "text_secondary": UIColors.GRAY_300,
        "border": UIColors.GRAY_700,
        "success": UIColors.SUCCESS_LIGHT,
        "warning": UIColors.WARNING_LIGHT,
        "error": UIColors.ERROR_LIGHT,
        "info": UIColors.INFO_LIGHT
    }
    
    @classmethod
    def get_theme(cls, theme_name: str) -> Dict:
        """Get theme configuration by name."""
        themes = {
            cls.LIGHT: cls.LIGHT_THEME,
            cls.DARK: cls.DARK_THEME
        }
        return themes.get(theme_name, cls.LIGHT_THEME)


# ===== ANIMATION CONSTANTS =====
class UIAnimations:
    """UI animation constants for consistent animations."""
    
    # Duration (in milliseconds)
    DURATION_FAST = 150
    DURATION_DEFAULT = 250
    DURATION_SLOW = 500
    
    # Easing Functions
    EASE_IN = "ease-in"
    EASE_OUT = "ease-out"
    EASE_IN_OUT = "ease-in-out"
    EASE_LINEAR = "linear"
    
    # Animation Types
    FADE_IN = "fadeIn"
    FADE_OUT = "fadeOut"
    SLIDE_IN = "slideIn"
    SLIDE_OUT = "slideOut"
    SCALE_IN = "scaleIn"
    SCALE_OUT = "scaleOut"
    BOUNCE = "bounce"
    SHAKE = "shake"


# ===== LAYOUT CONSTANTS =====
class UILayout:
    """UI layout constants for responsive design."""
    
    # Container Max Widths
    CONTAINER_SM = 640   # Small screens
    CONTAINER_MD = 768   # Medium screens
    CONTAINER_LG = 1024  # Large screens
    CONTAINER_XL = 1280  # Extra large screens
    CONTAINER_2XL = 1536 # 2x Extra large screens
    
    # Grid System
    GRID_COLUMNS = 12
    GRID_GAP = 16
    
    # Z-Index Layers
    Z_DROPDOWN = 1000
    Z_TOOLTIP = 1100
    Z_MODAL = 1200
    Z_POPOVER = 1300
    Z_NOTIFICATION = 1400
    Z_LOADING_OVERLAY = 1500


# ===== EXPORT CONSTANTS =====
UI_COLORS = UIColors()
UI_SIZES = UISizes()
UI_ICONS = UIIcons()
UI_THEMES = UIThemes()
UI_ANIMATIONS = UIAnimations()
UI_LAYOUT = UILayout()