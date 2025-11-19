"""
Financial Management Schemas

Pydantic schemas for financial management API endpoints including
transactions, bank accounts, wallets, and earnings.
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, validator
from enum import Enum


# Enums
class TransactionTypeEnum(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"


class TransactionStatusEnum(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WalletTransactionTypeEnum(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"
    REFUND = "refund"
    BONUS = "bonus"
    PENALTY = "penalty"
    WITHDRAWAL = "withdrawal"


class UserTypeEnum(str, Enum):
    ADMIN = "admin"
    PROVIDER = "provider"
    CUSTOMER = "customer"


# Bank Account Schemas
class BankAccountBase(BaseModel):
    """Base bank account schema."""
    user_id: UUID
    user_type: UserTypeEnum
    account_holder_name: str = Field(..., min_length=2, max_length=255)
    account_number_last4: str = Field(..., min_length=4, max_length=4)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    bank_name: str = Field(..., min_length=2, max_length=255)
    branch_name: Optional[str] = Field(None, max_length=255)
    account_type: str = Field("savings", max_length=20)
    is_primary: bool = False


class BankAccountCreate(BankAccountBase):
    """Schema for creating bank account."""
    account_number: str = Field(..., min_length=8, max_length=20)
    
    @validator('ifsc_code')
    def validate_ifsc(cls, v):
        if not v.isalnum() or len(v) != 11:
            raise ValueError('IFSC code must be 11 alphanumeric characters')
        return v.upper()
    
    @validator('account_number_last4')
    def validate_last4(cls, v):
        if not v.isdigit():
            raise ValueError('Last 4 digits must be numeric')
        return v


class BankAccountUpdate(BaseModel):
    """Schema for updating bank account."""
    account_holder_name: Optional[str] = Field(None, min_length=2, max_length=255)
    bank_name: Optional[str] = Field(None, min_length=2, max_length=255)
    branch_name: Optional[str] = Field(None, max_length=255)
    account_type: Optional[str] = Field(None, max_length=20)
    is_primary: Optional[bool] = None
    is_active: Optional[bool] = None


class BankAccountResponse(BankAccountBase):
    """Schema for bank account response."""
    id: UUID
    account_number_last4: str
    razorpay_fund_account_id: Optional[str]
    razorpay_contact_id: Optional[str]
    is_verified: bool
    verified_at: Optional[datetime]
    verification_reference: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionBase(BaseModel):
    """Base transaction schema."""
    user_id: UUID
    user_type: UserTypeEnum
    wallet_id: UUID
    booking_id: Optional[UUID] = None
    transaction_type: TransactionTypeEnum
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    description: str = Field(..., min_length=1, max_length=500)
    reference_type: str = Field(..., max_length=50)
    reference_id: Optional[str] = Field(None, max_length=100)


class TransactionCreate(TransactionBase):
    """Schema for creating transaction."""
    gateway_transaction_id: Optional[str] = Field(None, max_length=100)


class TransactionUpdate(BaseModel):
    """Schema for updating transaction."""
    status: Optional[TransactionStatusEnum] = None
    gateway_transaction_id: Optional[str] = Field(None, max_length=100)
    processed_at: Optional[datetime] = None


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""
    id: UUID
    transaction_id: str
    status: TransactionStatusEnum
    gateway_transaction_id: Optional[str]
    processed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Wallet Schemas
class WalletBase(BaseModel):
    """Base wallet schema."""
    user_id: UUID
    user_type: UserTypeEnum
    currency: str = Field("INR", max_length=3)


class WalletCreate(WalletBase):
    """Schema for creating wallet."""
    pass


class WalletUpdate(BaseModel):
    """Schema for updating wallet."""
    is_active: Optional[bool] = None


class WalletResponse(WalletBase):
    """Schema for wallet response."""
    id: UUID
    balance: Decimal
    pending_balance: Decimal
    lifetime_earnings: Decimal
    total_withdrawn: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Wallet Transaction Schemas
class WalletTransactionBase(BaseModel):
    """Base wallet transaction schema."""
    wallet_id: UUID
    user_id: UUID
    user_type: UserTypeEnum
    transaction_type: WalletTransactionTypeEnum
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    description: str = Field(..., min_length=1, max_length=500)
    reference_type: Optional[str] = Field(None, max_length=50)
    reference_id: Optional[UUID] = None


class WalletTransactionCreate(WalletTransactionBase):
    """Schema for creating wallet transaction."""
    balance_before: Decimal = Field(..., decimal_places=2)
    balance_after: Decimal = Field(..., decimal_places=2)
    transaction_id: Optional[UUID] = None
    wallet_metadata: Optional[Dict[str, Any]] = None


class WalletTransactionResponse(WalletTransactionBase):
    """Schema for wallet transaction response."""
    id: UUID
    balance_before: Decimal
    balance_after: Decimal
    transaction_id: Optional[UUID]
    wallet_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Financial Analytics Schemas
class EarningsSummaryResponse(BaseModel):
    """Schema for earnings summary response."""
    total_earnings: Decimal
    total_transactions: int
    average_transaction: Decimal
    period_start: Optional[date]
    period_end: Optional[date]


class DailyEarningsResponse(BaseModel):
    """Schema for daily earnings response."""
    date: date
    earnings: Decimal
    transaction_count: int


class MonthlyEarningsResponse(BaseModel):
    """Schema for monthly earnings response."""
    month: str
    earnings: Decimal
    booking_count: int
    avg_booking_value: Decimal


class TopEarnerResponse(BaseModel):
    """Schema for top earner response."""
    provider_id: UUID
    total_earnings: Decimal
    booking_count: int
    avg_booking_value: Decimal


class ProviderEarningsResponse(BaseModel):
    """Schema for comprehensive provider earnings response."""
    total_earnings: Decimal
    total_bookings: int
    total_commission: Decimal
    average_booking_value: Decimal
    commission_rate: float


# Filter and Search Schemas
class TransactionFilters(BaseModel):
    """Schema for transaction filtering."""
    user_id: Optional[UUID] = None
    user_type: Optional[UserTypeEnum] = None
    transaction_type: Optional[TransactionTypeEnum] = None
    status: Optional[TransactionStatusEnum] = None
    booking_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None


class WalletFilters(BaseModel):
    """Schema for wallet filtering."""
    user_type: Optional[UserTypeEnum] = None
    is_active: Optional[bool] = None
    min_balance: Optional[Decimal] = None
    max_balance: Optional[Decimal] = None


class BankAccountFilters(BaseModel):
    """Schema for bank account filtering."""
    user_id: Optional[UUID] = None
    user_type: Optional[UserTypeEnum] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None
    bank_name: Optional[str] = None


class EarningsFilters(BaseModel):
    """Schema for earnings filtering."""
    provider_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    min_earnings: Optional[Decimal] = None


# Bulk Operations Schemas
class BulkTransactionCreate(BaseModel):
    """Schema for bulk transaction creation."""
    transactions: List[TransactionCreate]


class BulkTransactionResponse(BaseModel):
    """Schema for bulk transaction response."""
    created_transactions: List[TransactionResponse]
    failed_transactions: List[Dict[str, Any]]
    success_count: int
    failure_count: int


# Statistics Schemas
class FinancialStatsResponse(BaseModel):
    """Schema for financial statistics response."""
    total_transactions: int
    total_transaction_volume: Decimal
    total_active_wallets: int
    total_verified_bank_accounts: int
    avg_wallet_balance: Decimal
    avg_transaction_amount: Decimal
    daily_transaction_count: int
    monthly_growth_rate: float


class WalletStatsResponse(BaseModel):
    """Schema for wallet statistics response."""
    total_wallets: int
    active_wallets: int
    total_balance: Decimal
    avg_balance: Decimal
    top_wallets: List[WalletResponse]


class TransactionStatsResponse(BaseModel):
    """Schema for transaction statistics response."""
    total_transactions: int
    completed_transactions: int
    pending_transactions: int
    failed_transactions: int
    total_volume: Decimal
    avg_transaction_amount: Decimal
    success_rate: float


# Pagination Schemas
class FinancialPaginatedResponse(BaseModel):
    """Schema for paginated financial responses."""
    items: List[Union[TransactionResponse, WalletResponse, BankAccountResponse, WalletTransactionResponse]]
    total: int
    page: int
    size: int
    pages: int