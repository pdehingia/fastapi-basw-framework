"""
Business Constants

All business-related constants including types, categories, policies, and configurations.
"""

from typing import Dict, List
from decimal import Decimal


# ===== BUSINESS TYPES =====
class BusinessTypes:
    """Business category constants."""
    
    SALON = "salon"
    BARBERSHOP = "barbershop"
    BEAUTY_PARLOR = "beauty_parlor"
    SPA = "spa"
    WELLNESS_CENTER = "wellness_center"
    FITNESS_CENTER = "fitness_center"
    NAIL_STUDIO = "nail_studio"
    MASSAGE_THERAPY = "massage_therapy"
    ACADEMY = "academy"
    TRAINING_CENTER = "training_center"
    FREELANCE = "freelance"

    @classmethod
    def get_all(cls) -> List[str]:
        """Get all business types."""
        return [
            cls.SALON, cls.BARBERSHOP, cls.BEAUTY_PARLOR, cls.SPA,
            cls.WELLNESS_CENTER, cls.FITNESS_CENTER, cls.NAIL_STUDIO,
            cls.MASSAGE_THERAPY, cls.ACADEMY, cls.TRAINING_CENTER, cls.FREELANCE
        ]

    @classmethod
    def get_service_providers(cls) -> List[str]:
        """Get business types that provide direct services."""
        return [
            cls.SALON, cls.BARBERSHOP, cls.BEAUTY_PARLOR, cls.SPA,
            cls.WELLNESS_CENTER, cls.FITNESS_CENTER, cls.NAIL_STUDIO,
            cls.MASSAGE_THERAPY, cls.FREELANCE
        ]

    @classmethod
    def get_training_providers(cls) -> List[str]:
        """Get business types that provide training/education."""
        return [cls.ACADEMY, cls.TRAINING_CENTER]


# ===== SERVICE CATEGORIES =====
class ServiceCategories:
    """Service category constants."""
    
    # Hair Services
    HAIR_CUT = "hair_cut"
    HAIR_STYLING = "hair_styling"
    HAIR_COLORING = "hair_coloring"
    HAIR_TREATMENT = "hair_treatment"
    HAIR_EXTENSION = "hair_extension"
    HAIR_WASH = "hair_wash"
    
    # Skin Care
    FACIAL = "facial"
    SKIN_TREATMENT = "skin_treatment"
    ACNE_TREATMENT = "acne_treatment"
    ANTI_AGING = "anti_aging"
    SKIN_CLEANSING = "skin_cleansing"
    
    # Beauty Services
    MAKEUP = "makeup"
    BRIDAL_MAKEUP = "bridal_makeup"
    PARTY_MAKEUP = "party_makeup"
    EYEBROW_THREADING = "eyebrow_threading"
    EYELASH_EXTENSION = "eyelash_extension"
    
    # Nail Services
    MANICURE = "manicure"
    PEDICURE = "pedicure"
    NAIL_ART = "nail_art"
    GEL_NAILS = "gel_nails"
    NAIL_EXTENSION = "nail_extension"
    
    # Body Services
    MASSAGE = "massage"
    BODY_TREATMENT = "body_treatment"
    WAXING = "waxing"
    BODY_SCRUB = "body_scrub"
    AROMATHERAPY = "aromatherapy"
    
    # Wellness Services
    YOGA = "yoga"
    MEDITATION = "meditation"
    FITNESS_TRAINING = "fitness_training"
    PHYSIOTHERAPY = "physiotherapy"
    
    # Training Services
    BEAUTY_COURSE = "beauty_course"
    HAIR_STYLING_COURSE = "hair_styling_course"
    MAKEUP_COURSE = "makeup_course"
    NAIL_ART_COURSE = "nail_art_course"
    CERTIFICATION_PROGRAM = "certification_program"

    @classmethod
    def get_all(cls) -> List[str]:
        """Get all service categories."""
        return [
            # Hair Services
            cls.HAIR_CUT, cls.HAIR_STYLING, cls.HAIR_COLORING, 
            cls.HAIR_TREATMENT, cls.HAIR_EXTENSION, cls.HAIR_WASH,
            # Skin Care
            cls.FACIAL, cls.SKIN_TREATMENT, cls.ACNE_TREATMENT,
            cls.ANTI_AGING, cls.SKIN_CLEANSING,
            # Beauty Services
            cls.MAKEUP, cls.BRIDAL_MAKEUP, cls.PARTY_MAKEUP,
            cls.EYEBROW_THREADING, cls.EYELASH_EXTENSION,
            # Nail Services
            cls.MANICURE, cls.PEDICURE, cls.NAIL_ART,
            cls.GEL_NAILS, cls.NAIL_EXTENSION,
            # Body Services
            cls.MASSAGE, cls.BODY_TREATMENT, cls.WAXING,
            cls.BODY_SCRUB, cls.AROMATHERAPY,
            # Wellness Services
            cls.YOGA, cls.MEDITATION, cls.FITNESS_TRAINING, cls.PHYSIOTHERAPY,
            # Training Services
            cls.BEAUTY_COURSE, cls.HAIR_STYLING_COURSE, cls.MAKEUP_COURSE,
            cls.NAIL_ART_COURSE, cls.CERTIFICATION_PROGRAM
        ]

    @classmethod
    def get_beauty_services(cls) -> List[str]:
        """Get beauty-focused services."""
        return [
            cls.HAIR_CUT, cls.HAIR_STYLING, cls.HAIR_COLORING,
            cls.FACIAL, cls.MAKEUP, cls.BRIDAL_MAKEUP,
            cls.MANICURE, cls.PEDICURE, cls.NAIL_ART
        ]

    @classmethod
    def get_wellness_services(cls) -> List[str]:
        """Get wellness-focused services."""
        return [
            cls.MASSAGE, cls.BODY_TREATMENT, cls.YOGA,
            cls.MEDITATION, cls.FITNESS_TRAINING, cls.PHYSIOTHERAPY
        ]


# ===== BOOKING POLICIES =====
class BookingPolicies:
    """Booking policy constants."""
    
    # Cancellation Policies
    class CancellationPolicy:
        NO_CANCELLATION = "no_cancellation"
        FLEXIBLE = "flexible"  # Cancel up to 1 hour before
        MODERATE = "moderate"  # Cancel up to 24 hours before
        STRICT = "strict"      # Cancel up to 7 days before
        CUSTOM = "custom"      # Custom cancellation terms

    # Rescheduling Policies
    class ReschedulingPolicy:
        NOT_ALLOWED = "not_allowed"
        ONCE_FREE = "once_free"        # One free reschedule
        MULTIPLE_FREE = "multiple_free" # Multiple free reschedules
        PAID_RESCHEDULE = "paid_reschedule" # Paid rescheduling
        CUSTOM = "custom"

    # Advance Booking Requirements
    MINIMUM_ADVANCE_HOURS = 1
    MAXIMUM_ADVANCE_DAYS = 90
    
    # Default time slots
    DEFAULT_SLOT_DURATION = 60  # minutes
    MINIMUM_SLOT_DURATION = 15  # minutes
    MAXIMUM_SLOT_DURATION = 480 # minutes (8 hours)


# ===== PAYMENT METHODS =====
class PaymentMethods:
    """Payment method constants."""
    
    # Digital Payment Methods
    UPI = "upi"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    NET_BANKING = "net_banking"
    DIGITAL_WALLET = "digital_wallet"
    MAYA_WALLET = "maya_wallet"
    
    # Traditional Payment Methods
    CASH = "cash"
    CASH_ON_SERVICE = "cash_on_service"
    
    # Business Payment Methods
    BANK_TRANSFER = "bank_transfer"
    CHEQUE = "cheque"
    
    @classmethod
    def get_all(cls) -> List[str]:
        """Get all payment methods."""
        return [
            cls.UPI, cls.CREDIT_CARD, cls.DEBIT_CARD, cls.NET_BANKING,
            cls.DIGITAL_WALLET, cls.MAYA_WALLET, cls.CASH,
            cls.CASH_ON_SERVICE, cls.BANK_TRANSFER, cls.CHEQUE
        ]

    @classmethod
    def get_online_methods(cls) -> List[str]:
        """Get online payment methods."""
        return [
            cls.UPI, cls.CREDIT_CARD, cls.DEBIT_CARD, 
            cls.NET_BANKING, cls.DIGITAL_WALLET, cls.MAYA_WALLET
        ]

    @classmethod
    def get_offline_methods(cls) -> List[str]:
        """Get offline payment methods."""
        return [cls.CASH, cls.CASH_ON_SERVICE, cls.BANK_TRANSFER, cls.CHEQUE]


# ===== COMMISSION RATES =====
class CommissionRates:
    """Platform commission rates."""
    
    # Service Commission Rates (as decimals)
    BEAUTY_SERVICES = Decimal('0.15')     # 15%
    WELLNESS_SERVICES = Decimal('0.12')   # 12%
    TRAINING_COURSES = Decimal('0.20')    # 20%
    PREMIUM_SERVICES = Decimal('0.10')    # 10%
    
    # Payment Processing Fees
    PAYMENT_GATEWAY_FEE = Decimal('0.025') # 2.5%
    MAYA_WALLET_FEE = Decimal('0.01')      # 1%
    
    # Referral Commissions
    CUSTOMER_REFERRAL = Decimal('0.05')    # 5%
    PROVIDER_REFERRAL = Decimal('0.10')    # 10%
    
    # Loyalty Program
    LOYALTY_POINTS_RATE = Decimal('0.02')  # 2% back as points
    
    @classmethod
    def get_commission_rate(cls, service_category: str) -> Decimal:
        """Get commission rate for service category."""
        training_services = ServiceCategories.get_wellness_services()
        wellness_services = ServiceCategories.get_wellness_services()
        
        if service_category in training_services:
            return cls.TRAINING_COURSES
        elif service_category in wellness_services:
            return cls.WELLNESS_SERVICES
        else:
            return cls.BEAUTY_SERVICES


# ===== BUSINESS HOURS =====
class BusinessHours:
    """Standard business hours configuration."""
    
    # Default operating hours (24-hour format)
    DEFAULT_OPEN_TIME = "09:00"
    DEFAULT_CLOSE_TIME = "21:00"
    
    # Days of week
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"
    
    WEEKDAYS = [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY]
    WEEKENDS = [SATURDAY, SUNDAY]
    ALL_DAYS = WEEKDAYS + WEEKENDS
    
    # Special hours
    EXTENDED_HOURS_START = "08:00"
    EXTENDED_HOURS_END = "23:00"
    EARLY_CLOSE = "18:00"
    LATE_OPEN = "12:00"


# ===== QUALITY STANDARDS =====
class QualityStandards:
    """Quality and rating standards."""
    
    # Rating Scale
    MIN_RATING = 1
    MAX_RATING = 5
    DEFAULT_RATING = 3
    
    # Quality Thresholds
    EXCELLENT_RATING = 4.5
    GOOD_RATING = 4.0
    AVERAGE_RATING = 3.0
    POOR_RATING = 2.0
    
    # Minimum Requirements
    MIN_REVIEWS_FOR_RATING = 5
    MIN_COMPLETION_RATE = 0.8  # 80%
    MIN_RESPONSE_TIME_HOURS = 24


# ===== EXPORT CONSTANTS =====
BUSINESS_TYPES = BusinessTypes()
SERVICE_CATEGORIES = ServiceCategories()
BOOKING_POLICIES = BookingPolicies()
PAYMENT_METHODS = PaymentMethods()
COMMISSION_RATES = CommissionRates()
BUSINESS_HOURS = BusinessHours()
QUALITY_STANDARDS = QualityStandards()