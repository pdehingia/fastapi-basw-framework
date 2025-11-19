"""Payment and wallet management service layer."""

from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, text

from app.shared.models.user import CustomerUser, ProviderUser
from app.shared.models.booking import Booking
from .schemas import (
    TransactionFilters, WalletFilters, WithdrawalFilters,
    ProcessWithdrawalRequest, WalletAdjustmentRequest,
    TransactionSummary, WalletSummary, WithdrawalSummary,
    TransactionResponse, TransactionDetailResponse,
    WalletResponse, WalletTransactionResponse,
    WithdrawalRequestResponse, TransactionType, TransactionStatus,
    WithdrawalStatus, WalletAdjustmentType
)


class PaymentManagementService:
    """Service class for payment and wallet management operations."""

    def __init__(self, db: Session, admin_user_id: int):
        self.db = db
        self.admin_user_id = admin_user_id

    def get_transactions(self, filters: TransactionFilters) -> Tuple[List[TransactionResponse], TransactionSummary, Dict[str, Any]]:
        """Get paginated list of transactions with filters and summary."""
        # Note: This is a simplified implementation
        # In production, you would have proper Transaction and Wallet models
        
        # Mock query building - replace with actual SQLAlchemy queries
        base_query = """
        SELECT t.*, 
               COALESCE(cu.full_name, pu.full_name) as user_name,
               CASE 
                   WHEN cu.id IS NOT NULL THEN 'customer'
                   WHEN pu.id IS NOT NULL THEN 'artist'
                   ELSE 'unknown'
               END as user_type
        FROM transactions t
        LEFT JOIN customer_users cu ON t.user_id = cu.id AND t.user_type = 'customer'
        LEFT JOIN provider_users pu ON t.user_id = pu.id AND t.user_type = 'artist'
        WHERE 1=1
        """
        
        conditions = []
        params = {}
        
        if filters.transaction_type:
            conditions.append("t.transaction_type = :transaction_type")
            params["transaction_type"] = filters.transaction_type.value
            
        if filters.status:
            conditions.append("t.status = :status")
            params["status"] = filters.status.value
            
        if filters.user_id:
            conditions.append("t.user_id = :user_id")
            params["user_id"] = filters.user_id
            
        if filters.start_date:
            conditions.append("t.created_at >= :start_date")
            params["start_date"] = filters.start_date
            
        if filters.end_date:
            conditions.append("t.created_at <= :end_date")
            params["end_date"] = filters.end_date

        if conditions:
            base_query += " AND " + " AND ".join(conditions)
            
        # Get total count for pagination
        count_query = f"SELECT COUNT(*) as total FROM ({base_query}) as filtered"
        
        # Add ordering and pagination
        base_query += " ORDER BY t.created_at DESC"
        base_query += f" LIMIT {filters.limit} OFFSET {(filters.page - 1) * filters.limit}"
        
        # Mock execution - replace with actual database execution
        transactions = self._mock_transaction_data()
        
        # Mock summary calculation
        summary = TransactionSummary(
            total_transactions=150,
            total_amount=Decimal("125000.50"),
            pending_amount=Decimal("15000.00"),
            completed_amount=Decimal("100000.50"),
            failed_amount=Decimal("10000.00")
        )
        
        # Mock pagination
        pagination = {
            "page": filters.page,
            "limit": filters.limit,
            "total": 150,
            "pages": 8,
            "has_next": filters.page < 8,
            "has_prev": filters.page > 1
        }
        
        return transactions, summary, pagination

    def get_transaction_detail(self, transaction_id: int) -> Optional[TransactionDetailResponse]:
        """Get detailed information about a specific transaction."""
        # Mock detailed transaction data
        return TransactionDetailResponse(
            id=transaction_id,
            transaction_id=f"TXN_{transaction_id:06d}",
            user_id=1,
            user_name="John Doe",
            user_type="customer",
            transaction_type=TransactionType.BOOKING_PAYMENT,
            status=TransactionStatus.COMPLETED,
            amount=Decimal("5000.00"),
            currency="INR",
            description="Payment for wedding photoshoot",
            reference_id="BOOK_001",
            gateway="razorpay",
            gateway_transaction_id="pay_abc123",
            gateway_response={"payment_id": "pay_abc123", "status": "captured"},
            created_at=datetime.now(),
            updated_at=datetime.now(),
            booking_id=1,
            booking_details={"event_type": "Wedding", "date": "2025-12-01"},
            wallet_id=1,
            commission_rate=Decimal("10.0"),
            fees=Decimal("50.00"),
            tax_amount=Decimal("90.00"),
            net_amount=Decimal("4860.00"),
            failure_reason=None,
            admin_notes="Payment processed successfully",
            created_by="system",
            updated_by="admin_user"
        )

    def get_wallets(self, filters: WalletFilters) -> Tuple[List[WalletResponse], WalletSummary, Dict[str, Any]]:
        """Get paginated list of wallets with summary."""
        # Mock wallet data
        wallets = self._mock_wallet_data()
        
        summary = WalletSummary(
            total_wallets=50,
            total_balance=Decimal("250000.00"),
            total_pending=Decimal("25000.00"),
            artist_wallets=30,
            customer_wallets=15,
            academy_wallets=5
        )
        
        pagination = {
            "page": filters.page,
            "limit": filters.limit,
            "total": 50,
            "pages": 3,
            "has_next": filters.page < 3,
            "has_prev": filters.page > 1
        }
        
        return wallets, summary, pagination

    def get_wallet_transactions(self, wallet_id: int, page: int = 1, limit: int = 20) -> Tuple[List[WalletTransactionResponse], Dict[str, Any]]:
        """Get transaction history for a specific wallet."""
        # Mock wallet transaction data
        transactions = [
            WalletTransactionResponse(
                id=i,
                transaction_id=f"TXN_{i:06d}",
                transaction_type=TransactionType.BOOKING_PAYMENT,
                amount=Decimal("1000.00") * i,
                balance_before=Decimal("5000.00"),
                balance_after=Decimal("6000.00"),
                description=f"Booking payment #{i}",
                created_at=datetime.now()
            )
            for i in range(1, 11)
        ]
        
        pagination = {
            "page": page,
            "limit": limit,
            "total": 25,
            "pages": 3,
            "has_next": page < 3,
            "has_prev": page > 1
        }
        
        return transactions, pagination

    def get_withdrawal_requests(self, filters: WithdrawalFilters) -> Tuple[List[WithdrawalRequestResponse], WithdrawalSummary, Dict[str, Any]]:
        """Get paginated list of withdrawal requests."""
        # Mock withdrawal requests
        withdrawal_requests = [
            WithdrawalRequestResponse(
                id=i,
                user_id=i,
                user_name=f"User {i}",
                user_type="artist",
                amount=Decimal("5000.00") * i,
                bank_account={
                    "account_number": "****1234",
                    "ifsc": "HDFC0001234",
                    "bank_name": "HDFC Bank"
                },
                status=WithdrawalStatus.PENDING if i % 3 == 0 else WithdrawalStatus.APPROVED,
                requested_at=datetime.now(),
                processed_at=None if i % 3 == 0 else datetime.now(),
                utr_number=None if i % 3 == 0 else f"UTR{i:06d}",
                rejection_reason=None,
                admin_notes=None,
                processed_by=None if i % 3 == 0 else "admin_user"
            )
            for i in range(1, 11)
        ]
        
        summary = WithdrawalSummary(
            pending_count=10,
            pending_amount=Decimal("50000.00"),
            approved_count=5,
            approved_amount=Decimal("25000.00"),
            processed_today=3,
            processed_amount_today=Decimal("15000.00")
        )
        
        pagination = {
            "page": filters.page,
            "limit": filters.limit,
            "total": 25,
            "pages": 3,
            "has_next": filters.page < 3,
            "has_prev": filters.page > 1
        }
        
        return withdrawal_requests, summary, pagination

    def process_withdrawal_request(self, withdrawal_id: int, request: ProcessWithdrawalRequest) -> WithdrawalRequestResponse:
        """Process a withdrawal request (approve/reject)."""
        # In production, this would update the withdrawal request in database
        # and possibly trigger payment processing
        
        return WithdrawalRequestResponse(
            id=withdrawal_id,
            user_id=1,
            user_name="John Artist",
            user_type="artist",
            amount=Decimal("10000.00"),
            bank_account={
                "account_number": "****1234",
                "ifsc": "HDFC0001234",
                "bank_name": "HDFC Bank"
            },
            status=WithdrawalStatus.APPROVED if request.action == "approve" else WithdrawalStatus.REJECTED,
            requested_at=datetime.now(),
            processed_at=datetime.now(),
            utr_number=request.utr_number,
            rejection_reason=request.rejection_reason,
            admin_notes=request.admin_notes,
            processed_by=f"admin_{self.admin_user_id}"
        )

    def adjust_wallet_balance(self, wallet_id: int, request: WalletAdjustmentRequest) -> WalletResponse:
        """Manually adjust wallet balance (credit/debit)."""
        # In production, this would:
        # 1. Update wallet balance
        # 2. Create transaction record
        # 3. Log admin action for audit
        
        return WalletResponse(
            id=wallet_id,
            user_id=1,
            user_name="John Artist",
            user_type="artist",
            balance=Decimal("15000.00"),  # New balance after adjustment
            pending_balance=Decimal("2000.00"),
            total_earned=Decimal("50000.00"),
            total_withdrawn=Decimal("35000.00"),
            last_transaction_at=datetime.now(),
            created_at=datetime.now(),
            is_active=True
        )

    def export_transactions(self, filters: TransactionFilters) -> bytes:
        """Export filtered transactions to Excel."""
        # Mock Excel generation
        # In production, use pandas or openpyxl to generate actual Excel file
        mock_excel_content = b"Mock Excel Content for Transactions Export"
        return mock_excel_content

    def _mock_transaction_data(self) -> List[TransactionResponse]:
        """Mock transaction data for development."""
        return [
            TransactionResponse(
                id=i,
                transaction_id=f"TXN_{i:06d}",
                user_id=i,
                user_name=f"User {i}",
                user_type="artist" if i % 2 == 0 else "customer",
                transaction_type=TransactionType.BOOKING_PAYMENT,
                status=TransactionStatus.COMPLETED,
                amount=Decimal("1000.00") * i,
                currency="INR",
                description=f"Transaction {i}",
                reference_id=f"REF_{i}",
                gateway="razorpay",
                gateway_transaction_id=f"pay_{i}",
                gateway_response={"status": "captured"},
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            for i in range(1, 21)
        ]

    def _mock_wallet_data(self) -> List[WalletResponse]:
        """Mock wallet data for development."""
        return [
            WalletResponse(
                id=i,
                user_id=i,
                user_name=f"User {i}",
                user_type="artist" if i % 2 == 0 else "customer",
                balance=Decimal("5000.00") * i,
                pending_balance=Decimal("500.00") * i,
                total_earned=Decimal("10000.00") * i,
                total_withdrawn=Decimal("3000.00") * i,
                last_transaction_at=datetime.now(),
                created_at=datetime.now(),
                is_active=True
            )
            for i in range(1, 21)
        ]