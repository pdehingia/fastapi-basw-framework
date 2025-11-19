"""
Device and Platform Type Constants

All device types, platforms, and browser constants for client identification.
"""

from typing import List


# ===== DEVICE TYPES =====
class DeviceTypes:
    """Device type constants for client identification."""
    
    MOBILE = "mobile"
    TABLET = "tablet"
    DESKTOP = "desktop"
    LAPTOP = "laptop"
    SMART_TV = "smart_tv"
    WEARABLE = "wearable"
    IOT_DEVICE = "iot_device"
    UNKNOWN = "unknown"

    @classmethod
    def get_all(cls) -> List[str]:
        """Get all device types."""
        return [
            cls.MOBILE, cls.TABLET, cls.DESKTOP, cls.LAPTOP,
            cls.SMART_TV, cls.WEARABLE, cls.IOT_DEVICE, cls.UNKNOWN
        ]

    @classmethod
    def get_mobile_devices(cls) -> List[str]:
        """Get mobile device types."""
        return [cls.MOBILE, cls.TABLET]

    @classmethod
    def get_desktop_devices(cls) -> List[str]:
        """Get desktop device types."""
        return [cls.DESKTOP, cls.LAPTOP]


# ===== PLATFORM TYPES =====
class PlatformTypes:
    """Platform/OS type constants."""
    
    # Mobile Platforms
    ANDROID = "android"
    IOS = "ios"
    
    # Desktop Platforms
    WINDOWS = "windows"
    MACOS = "macos"
    LINUX = "linux"
    
    # Web Platforms
    WEB = "web"
    PWA = "pwa"  # Progressive Web App
    
    # Others
    UNKNOWN = "unknown"

    @classmethod
    def get_all(cls) -> List[str]:
        """Get all platform types."""
        return [
            cls.ANDROID, cls.IOS, cls.WINDOWS, cls.MACOS,
            cls.LINUX, cls.WEB, cls.PWA, cls.UNKNOWN
        ]

    @classmethod
    def get_mobile_platforms(cls) -> List[str]:
        """Get mobile platform types."""
        return [cls.ANDROID, cls.IOS]

    @classmethod
    def get_desktop_platforms(cls) -> List[str]:
        """Get desktop platform types."""
        return [cls.WINDOWS, cls.MACOS, cls.LINUX]

    @classmethod
    def get_web_platforms(cls) -> List[str]:
        """Get web platform types."""
        return [cls.WEB, cls.PWA]


# ===== BROWSER TYPES =====
class BrowserTypes:
    """Browser type constants."""
    
    # Major Browsers
    CHROME = "chrome"
    FIREFOX = "firefox"
    SAFARI = "safari"
    EDGE = "edge"
    OPERA = "opera"
    
    # Mobile Browsers
    CHROME_MOBILE = "chrome_mobile"
    SAFARI_MOBILE = "safari_mobile"
    FIREFOX_MOBILE = "firefox_mobile"
    SAMSUNG_BROWSER = "samsung_browser"
    UC_BROWSER = "uc_browser"
    
    # In-App Browsers
    FACEBOOK_BROWSER = "facebook_browser"
    INSTAGRAM_BROWSER = "instagram_browser"
    TWITTER_BROWSER = "twitter_browser"
    WHATSAPP_BROWSER = "whatsapp_browser"
    
    # Others
    IE = "internet_explorer"
    UNKNOWN = "unknown"

    @classmethod
    def get_all(cls) -> List[str]:
        """Get all browser types."""
        return [
            cls.CHROME, cls.FIREFOX, cls.SAFARI, cls.EDGE, cls.OPERA,
            cls.CHROME_MOBILE, cls.SAFARI_MOBILE, cls.FIREFOX_MOBILE,
            cls.SAMSUNG_BROWSER, cls.UC_BROWSER,
            cls.FACEBOOK_BROWSER, cls.INSTAGRAM_BROWSER,
            cls.TWITTER_BROWSER, cls.WHATSAPP_BROWSER,
            cls.IE, cls.UNKNOWN
        ]

    @classmethod
    def get_desktop_browsers(cls) -> List[str]:
        """Get desktop browser types."""
        return [cls.CHROME, cls.FIREFOX, cls.SAFARI, cls.EDGE, cls.OPERA, cls.IE]

    @classmethod
    def get_mobile_browsers(cls) -> List[str]:
        """Get mobile browser types."""
        return [
            cls.CHROME_MOBILE, cls.SAFARI_MOBILE, cls.FIREFOX_MOBILE,
            cls.SAMSUNG_BROWSER, cls.UC_BROWSER
        ]

    @classmethod
    def get_inapp_browsers(cls) -> List[str]:
        """Get in-app browser types."""
        return [
            cls.FACEBOOK_BROWSER, cls.INSTAGRAM_BROWSER,
            cls.TWITTER_BROWSER, cls.WHATSAPP_BROWSER
        ]


# ===== APP TYPES =====
class AppTypes:
    """Application type constants."""
    
    # Native Apps
    NATIVE_ANDROID = "native_android"
    NATIVE_IOS = "native_ios"
    
    # Web Apps
    WEB_APP = "web_app"
    PWA = "pwa"
    
    # Hybrid Apps
    REACT_NATIVE = "react_native"
    FLUTTER = "flutter"
    IONIC = "ionic"
    CORDOVA = "cordova"
    
    # API Clients
    API_CLIENT = "api_client"
    THIRD_PARTY_APP = "third_party_app"

    @classmethod
    def get_all(cls) -> List[str]:
        """Get all app types."""
        return [
            cls.NATIVE_ANDROID, cls.NATIVE_IOS, cls.WEB_APP, cls.PWA,
            cls.REACT_NATIVE, cls.FLUTTER, cls.IONIC, cls.CORDOVA,
            cls.API_CLIENT, cls.THIRD_PARTY_APP
        ]

    @classmethod
    def get_native_apps(cls) -> List[str]:
        """Get native app types."""
        return [cls.NATIVE_ANDROID, cls.NATIVE_IOS]

    @classmethod
    def get_web_apps(cls) -> List[str]:
        """Get web app types."""
        return [cls.WEB_APP, cls.PWA]

    @classmethod
    def get_hybrid_apps(cls) -> List[str]:
        """Get hybrid app types."""
        return [cls.REACT_NATIVE, cls.FLUTTER, cls.IONIC, cls.CORDOVA]


# ===== CLIENT CAPABILITIES =====
class ClientCapabilities:
    """Client capability constants."""
    
    # Features
    PUSH_NOTIFICATIONS = "push_notifications"
    GEOLOCATION = "geolocation"
    CAMERA_ACCESS = "camera_access"
    MICROPHONE_ACCESS = "microphone_access"
    FILE_UPLOAD = "file_upload"
    OFFLINE_MODE = "offline_mode"
    BIOMETRIC_AUTH = "biometric_auth"
    NFC = "nfc"
    BLUETOOTH = "bluetooth"
    
    # Web Features
    SERVICE_WORKER = "service_worker"
    WEB_PUSH = "web_push"
    BACKGROUND_SYNC = "background_sync"
    PAYMENT_REQUEST = "payment_request"
    WEBRTC = "webrtc"

    @classmethod
    def get_all(cls) -> List[str]:
        """Get all client capabilities."""
        return [
            cls.PUSH_NOTIFICATIONS, cls.GEOLOCATION, cls.CAMERA_ACCESS,
            cls.MICROPHONE_ACCESS, cls.FILE_UPLOAD, cls.OFFLINE_MODE,
            cls.BIOMETRIC_AUTH, cls.NFC, cls.BLUETOOTH,
            cls.SERVICE_WORKER, cls.WEB_PUSH, cls.BACKGROUND_SYNC,
            cls.PAYMENT_REQUEST, cls.WEBRTC
        ]

    @classmethod
    def get_mobile_capabilities(cls) -> List[str]:
        """Get capabilities typically available on mobile."""
        return [
            cls.PUSH_NOTIFICATIONS, cls.GEOLOCATION, cls.CAMERA_ACCESS,
            cls.MICROPHONE_ACCESS, cls.FILE_UPLOAD, cls.BIOMETRIC_AUTH,
            cls.NFC, cls.BLUETOOTH
        ]

    @classmethod
    def get_web_capabilities(cls) -> List[str]:
        """Get capabilities available in web browsers."""
        return [
            cls.GEOLOCATION, cls.CAMERA_ACCESS, cls.MICROPHONE_ACCESS,
            cls.FILE_UPLOAD, cls.SERVICE_WORKER, cls.WEB_PUSH,
            cls.BACKGROUND_SYNC, cls.PAYMENT_REQUEST, cls.WEBRTC
        ]


# ===== EXPORT CONSTANTS =====
DEVICE_TYPES = DeviceTypes()
PLATFORM_TYPES = PlatformTypes()
BROWSER_TYPES = BrowserTypes()
APP_TYPES = AppTypes()
CLIENT_CAPABILITIES = ClientCapabilities()