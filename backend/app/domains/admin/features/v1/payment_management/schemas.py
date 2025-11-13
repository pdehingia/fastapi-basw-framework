"""Payment and wallet management schemas."""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TransactionType(str, Enum):
    BOOKING_PAYMENT = "booking_payment"
    COMMISSION = "commission"
    WITHDRAWAL = "withdrawal"
    REFUND = "refund"
    WALLET_CREDIT = "wallet_credit"
    WALLET_DEBIT = "wallet_debit"
    PENALTY = "penalty"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WithdrawalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PROCESSED = "processed"


class WalletAdjustmentType(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"


# Request Schemas
class TransactionFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    transaction_type: Optional[TransactionType] = None
    status: Optional[TransactionStatus] = None
    user_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class WalletFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    user_type: Optional[str] = Field(default=None, description="artist, customer, academy")
    min_balance: Optional[Decimal] = None
    max_balance: Optional[Decimal] = None


class ProcessWithdrawalRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$")
    utr_number: Optional[str] = Field(None, description="Required for approve action")
    rejection_reason: Optional[str] = Field(None, description="Required for reject action")
    admin_notes: Optional[str] = None


class WalletAdjustmentRequest(BaseModel):
    type: WalletAdjustmentType
    amount: Decimal = Field(..., gt=0)
    reason: str = Field(..., min_length=10, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)


class WithdrawalFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    status: Optional[WithdrawalStatus] = None
    user_type: Optional[str] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None


# Response Schemas
class TransactionSummary(BaseModel):
    total_transactions: int
    total_amount: Decimal
    pending_amount: Decimal
    completed_amount: Decimal
    failed_amount: Decimal


class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    user_id: int
    user_name: str
    user_type: str
    transaction_type: TransactionType
    status: TransactionStatus
    amount: Decimal
    currency: str
    description: str
    reference_id: Optional[str]
    gateway: Optional[str]
    gateway_transaction_id: Optional[str]
    gateway_response: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class TransactionDetailResponse(TransactionResponse):
    booking_id: Optional[int]
    booking_details: Optional[Dict[str, Any]]
    wallet_id: Optional[int]
    commission_rate: Optional[Decimal]
    fees: Optional[Decimal]
    tax_amount: Optional[Decimal]
    net_amount: Optional[Decimal]
    failure_reason: Optional[str]
    admin_notes: Optional[str]
    created_by: Optional[str]
    updated_by: Optional[str]


class WalletResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_type: str
    balance: Decimal
    pending_balance: Decimal
    total_earned: Decimal
    total_withdrawn: Decimal
    last_transaction_at: Optional[datetime]
    created_at: datetime
    is_active: bool


class WalletTransactionResponse(BaseModel):
    id: int
    transaction_id: str
    transaction_type: TransactionType
    amount: Decimal
    balance_before: Decimal
    balance_after: Decimal
    description: str
    created_at: datetime


class WithdrawalRequestResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_type: str
    amount: Decimal
    bank_account: Dict[str, str]
    status: WithdrawalStatus
    requested_at: datetime
    processed_at: Optional[datetime]
    utr_number: Optional[str]
    rejection_reason: Optional[str]
    admin_notes: Optional[str]
    processed_by: Optional[str]


class WalletSummary(BaseModel):
    total_wallets: int
    total_balance: Decimal
    total_pending: Decimal
    artist_wallets: int
    customer_wallets: int
    academy_wallets: int


class WithdrawalSummary(BaseModel):
    pending_count: int
    pending_amount: Decimal
    approved_count: int
    approved_amount: Decimal
    processed_today: int
    processed_amount_today: Decimal


# List Response Schemas
class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    summary: TransactionSummary
    pagination: Dict[str, Any]


class WalletListResponse(BaseModel):
    wallets: List[WalletResponse]
    summary: WalletSummary
    pagination: Dict[str, Any]


class WalletTransactionListResponse(BaseModel):
    transactions: List[WalletTransactionResponse]
    pagination: Dict[str, Any]


class WithdrawalRequestListResponse(BaseModel):
    withdrawal_requests: List[WithdrawalRequestResponse]
    summary: WithdrawalSummary
    pagination: Dict[str, Any]