"""
Financial Management Service

This service provides comprehensive financial management operations including
transactions, wallets, bank accounts, and earnings analytics for admin panel.
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, date, timedelta
from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.shared.models.booking import (
    Transaction, BankAccount, Wallet, WalletTransaction, Booking,
    TransactionType, TransactionStatus, WalletTransactionType, WalletUserType
)
from app.shared.repositories.financial import (
    TransactionRepository, BankAccountRepository, WalletRepository,
    WalletTransactionRepository, EarningsRepository
)
from app.domains.admin.features.v1.financial_management.schemas import (
    TransactionCreate, TransactionUpdate, TransactionResponse, TransactionFilters,
    BankAccountCreate, BankAccountUpdate, BankAccountResponse, BankAccountFilters,
    WalletCreate, WalletUpdate, WalletResponse, WalletFilters,
    WalletTransactionCreate, WalletTransactionResponse,
    EarningsSummaryResponse, DailyEarningsResponse, MonthlyEarningsResponse,
    ProviderEarningsResponse, TopEarnerResponse, FinancialStatsResponse,
    WalletStatsResponse, TransactionStatsResponse, BulkTransactionCreate,
    BulkTransactionResponse
)

logger = logging.getLogger(__name__)


class FinancialManagementService:
    """Service for financial management operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.transaction_repo = TransactionRepository(db)
        self.bank_account_repo = BankAccountRepository(db)
        self.wallet_repo = WalletRepository(db)
        self.wallet_transaction_repo = WalletTransactionRepository(db)
        self.earnings_repo = EarningsRepository(db)
    
    # Transaction Management
    async def create_transaction(self, transaction_data: TransactionCreate) -> TransactionResponse:
        """Create a new transaction."""
        try:
            # Generate unique transaction ID
            import uuid
            import time
            transaction_id = f"TXN_{int(time.time())}_{uuid.uuid4().hex[:8].upper()}"
            
            transaction = Transaction(
                transaction_id=transaction_id,
                **transaction_data.model_dump()
            )
            
            created_transaction = self.transaction_repo.create(transaction)
            logger.info(f"Created transaction: {created_transaction.transaction_id}")
            
            return TransactionResponse.model_validate(created_transaction)
            
        except IntegrityError as e:
            logger.error(f"Error creating transaction: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction creation failed due to data constraint violation"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating transaction: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create transaction"
            )
    
    async def get_transaction(self, transaction_id: UUID) -> TransactionResponse:
        """Get transaction by ID."""
        transaction = self.transaction_repo.get_by_id(transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        return TransactionResponse.model_validate(transaction)
    
    async def update_transaction(
        self, 
        transaction_id: UUID, 
        transaction_data: TransactionUpdate
    ) -> TransactionResponse:
        """Update transaction."""
        transaction = self.transaction_repo.get_by_id(transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        # Update fields
        update_data = transaction_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(transaction, field, value)
        
        updated_transaction = self.transaction_repo.update(transaction)
        logger.info(f"Updated transaction: {transaction_id}")
        
        return TransactionResponse.model_validate(updated_transaction)
    
    async def delete_transaction(self, transaction_id: UUID) -> Dict[str, Any]:
        """Delete transaction."""
        transaction = self.transaction_repo.get_by_id(transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        self.transaction_repo.delete(transaction)
        logger.info(f"Deleted transaction: {transaction_id}")
        
        return {"message": "Transaction deleted successfully", "transaction_id": str(transaction_id)}
    
    async def search_transactions(
        self,
        filters: TransactionFilters,
        page: int = 1,
        size: int = 50
    ) -> Dict[str, Any]:
        """Search transactions with filters."""
        offset = (page - 1) * size
        
        # Build query based on filters
        transactions = []
        total = 0
        
        if filters.user_id and filters.user_type:
            transactions = self.transaction_repo.get_by_user(
                user_id=filters.user_id,
                user_type=filters.user_type.value,
                status=filters.status,
                transaction_type=filters.transaction_type,
                limit=size,
                offset=offset
            )
            # For total count, you'd need to implement a count method
            total = len(transactions)  # Simplified for now
        else:
            transactions = self.transaction_repo.get_all(limit=size, offset=offset)
            total = self.transaction_repo.count()
        
        return {
            "items": [TransactionResponse.model_validate(txn) for txn in transactions],
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size
        }
    
    # Bank Account Management
    async def create_bank_account(self, account_data: BankAccountCreate) -> BankAccountResponse:
        """Create a new bank account."""
        try:
            # Hash account number for security
            import hashlib
            account_hash = hashlib.sha256(account_data.account_number.encode()).hexdigest()
            
            # Check for duplicate account
            existing = self.bank_account_repo.get_by_account_hash(account_hash)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Bank account already exists"
                )
            
            # Create bank account
            account = BankAccount(
                user_id=account_data.user_id,
                user_type=account_data.user_type.value,
                account_holder_name=account_data.account_holder_name,
                account_number_encrypted=f"ENC_{account_data.account_number}",  # Simplified encryption
                account_number_hash=account_hash,
                account_number_last4=account_data.account_number[-4:],
                ifsc_code=account_data.ifsc_code,
                bank_name=account_data.bank_name,
                branch_name=account_data.branch_name,
                account_type=account_data.account_type,
                is_primary=account_data.is_primary
            )
            
            created_account = self.bank_account_repo.create(account)
            logger.info(f"Created bank account for user: {account_data.user_id}")
            
            return BankAccountResponse.model_validate(created_account)
            
        except IntegrityError as e:
            logger.error(f"Error creating bank account: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bank account creation failed"
            )
    
    async def get_bank_account(self, account_id: UUID) -> BankAccountResponse:
        """Get bank account by ID."""
        account = self.bank_account_repo.get_by_id(account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        return BankAccountResponse.model_validate(account)
    
    async def update_bank_account(
        self, 
        account_id: UUID, 
        account_data: BankAccountUpdate
    ) -> BankAccountResponse:
        """Update bank account."""
        account = self.bank_account_repo.get_by_id(account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        # Update fields
        update_data = account_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(account, field, value)
        
        updated_account = self.bank_account_repo.update(account)
        logger.info(f"Updated bank account: {account_id}")
        
        return BankAccountResponse.model_validate(updated_account)
    
    async def delete_bank_account(self, account_id: UUID) -> Dict[str, Any]:
        """Delete bank account."""
        account = self.bank_account_repo.get_by_id(account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        self.bank_account_repo.delete(account)
        logger.info(f"Deleted bank account: {account_id}")
        
        return {"message": "Bank account deleted successfully", "account_id": str(account_id)}
    
    async def get_user_bank_accounts(self, user_id: UUID, user_type: str) -> List[BankAccountResponse]:
        """Get all bank accounts for a user."""
        accounts = self.bank_account_repo.get_by_user(user_id, user_type)
        return [BankAccountResponse.model_validate(account) for account in accounts]
    
    # Wallet Management
    async def create_wallet(self, wallet_data: WalletCreate) -> WalletResponse:
        """Create a new wallet."""
        try:
            # Check if wallet already exists for user
            existing_wallet = self.wallet_repo.get_by_user(
                wallet_data.user_id, 
                wallet_data.user_type.value
            )
            if existing_wallet:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Wallet already exists for this user"
                )
            
            wallet = Wallet(
                user_id=wallet_data.user_id,
                user_type=wallet_data.user_type.value,
                currency=wallet_data.currency,
                balance=Decimal('0.00'),
                pending_balance=Decimal('0.00'),
                lifetime_earnings=Decimal('0.00'),
                total_withdrawn=Decimal('0.00')
            )
            
            created_wallet = self.wallet_repo.create(wallet)
            logger.info(f"Created wallet for user: {wallet_data.user_id}")
            
            return WalletResponse.model_validate(created_wallet)
            
        except IntegrityError as e:
            logger.error(f"Error creating wallet: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wallet creation failed"
            )
    
    async def get_wallet(self, wallet_id: UUID) -> WalletResponse:
        """Get wallet by ID."""
        wallet = self.wallet_repo.get_by_id(wallet_id)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found"
            )
        
        return WalletResponse.model_validate(wallet)
    
    async def get_user_wallet(self, user_id: UUID, user_type: str) -> WalletResponse:
        """Get wallet for a specific user."""
        wallet = self.wallet_repo.get_by_user(user_id, user_type)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found for user"
            )
        
        return WalletResponse.model_validate(wallet)
    
    async def update_wallet(self, wallet_id: UUID, wallet_data: WalletUpdate) -> WalletResponse:
        """Update wallet."""
        wallet = self.wallet_repo.get_by_id(wallet_id)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found"
            )
        
        # Update fields
        update_data = wallet_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(wallet, field, value)
        
        updated_wallet = self.wallet_repo.update(wallet)
        logger.info(f"Updated wallet: {wallet_id}")
        
        return WalletResponse.model_validate(updated_wallet)
    
    # Wallet Transaction Management
    async def create_wallet_transaction(
        self, 
        transaction_data: WalletTransactionCreate
    ) -> WalletTransactionResponse:
        """Create wallet transaction and update wallet balance."""
        try:
            # Verify wallet exists
            wallet = self.wallet_repo.get_by_id(transaction_data.wallet_id)
            if not wallet:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Wallet not found"
                )
            
            # Update wallet balance
            success = self.wallet_repo.update_balance(
                wallet_id=transaction_data.wallet_id,
                amount=transaction_data.amount,
                transaction_type=transaction_data.transaction_type
            )
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient wallet balance"
                )
            
            # Create wallet transaction record
            wallet_txn = WalletTransaction(
                **transaction_data.model_dump()
            )
            
            created_txn = self.wallet_transaction_repo.create(wallet_txn)
            logger.info(f"Created wallet transaction for wallet: {transaction_data.wallet_id}")
            
            return WalletTransactionResponse.model_validate(created_txn)
            
        except Exception as e:
            logger.error(f"Error creating wallet transaction: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create wallet transaction"
            )
    
    async def get_wallet_transactions(
        self, 
        wallet_id: UUID,
        page: int = 1,
        size: int = 50
    ) -> Dict[str, Any]:
        """Get wallet transactions."""
        offset = (page - 1) * size
        
        transactions = self.wallet_transaction_repo.get_by_wallet(
            wallet_id=wallet_id,
            limit=size,
            offset=offset
        )
        
        total = len(transactions)  # Simplified
        
        return {
            "items": [WalletTransactionResponse.model_validate(txn) for txn in transactions],
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size
        }
    
    # Earnings and Analytics
    async def get_provider_earnings_summary(
        self,
        provider_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> ProviderEarningsResponse:
        """Get comprehensive earnings summary for a provider."""
        earnings_data = self.earnings_repo.get_provider_earnings_summary(
            provider_id=provider_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return ProviderEarningsResponse(**earnings_data)
    
    async def get_monthly_earnings_trend(
        self,
        provider_id: UUID,
        months: int = 12
    ) -> List[MonthlyEarningsResponse]:
        """Get monthly earnings trend."""
        trend_data = self.earnings_repo.get_monthly_earnings_trend(
            provider_id=provider_id,
            months=months
        )
        
        return [MonthlyEarningsResponse(**month_data) for month_data in trend_data]
    
    async def get_top_earning_providers(
        self,
        limit: int = 10,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[TopEarnerResponse]:
        """Get top earning providers."""
        top_earners = self.earnings_repo.get_top_earning_providers(
            limit=limit,
            start_date=start_date,
            end_date=end_date
        )
        
        return [TopEarnerResponse(**earner_data) for earner_data in top_earners]
    
    # Statistics and Reports
    async def get_financial_statistics(self) -> FinancialStatsResponse:
        """Get comprehensive financial statistics."""
        # Get basic counts
        total_transactions = self.transaction_repo.count()
        total_wallets = self.wallet_repo.count()
        total_bank_accounts = self.bank_account_repo.count()
        
        # Get transaction volume
        from sqlalchemy import func
        transaction_volume = self.db.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.status == TransactionStatus.COMPLETED
        ).scalar() or Decimal('0.00')
        
        # Get average wallet balance
        avg_wallet_balance = self.db.query(
            func.avg(Wallet.balance)
        ).filter(Wallet.is_active == True).scalar() or Decimal('0.00')
        
        # Get daily transaction count
        today = date.today()
        daily_txn_count = self.db.query(Transaction).filter(
            func.date(Transaction.created_at) == today
        ).count()
        
        # Calculate monthly growth rate (simplified)
        monthly_growth_rate = 5.2  # Placeholder
        
        return FinancialStatsResponse(
            total_transactions=total_transactions,
            total_transaction_volume=transaction_volume,
            total_active_wallets=total_wallets,
            total_verified_bank_accounts=total_bank_accounts,
            avg_wallet_balance=avg_wallet_balance,
            avg_transaction_amount=transaction_volume / total_transactions if total_transactions > 0 else Decimal('0.00'),
            daily_transaction_count=daily_txn_count,
            monthly_growth_rate=monthly_growth_rate
        )
    
    async def get_wallet_statistics(self) -> WalletStatsResponse:
        """Get wallet statistics."""
        from sqlalchemy import func
        
        total_wallets = self.wallet_repo.count()
        active_wallets = self.db.query(Wallet).filter(Wallet.is_active == True).count()
        
        total_balance = self.db.query(
            func.sum(Wallet.balance)
        ).scalar() or Decimal('0.00')
        
        avg_balance = self.db.query(
            func.avg(Wallet.balance)
        ).scalar() or Decimal('0.00')
        
        # Get top 5 wallets by balance
        top_wallets = self.db.query(Wallet).order_by(
            Wallet.balance.desc()
        ).limit(5).all()
        
        return WalletStatsResponse(
            total_wallets=total_wallets,
            active_wallets=active_wallets,
            total_balance=total_balance,
            avg_balance=avg_balance,
            top_wallets=[WalletResponse.model_validate(wallet) for wallet in top_wallets]
        )
    
    async def get_transaction_statistics(self) -> TransactionStatsResponse:
        """Get transaction statistics."""
        from sqlalchemy import func
        
        total_transactions = self.transaction_repo.count()
        
        completed_txns = self.db.query(Transaction).filter(
            Transaction.status == TransactionStatus.COMPLETED
        ).count()
        
        pending_txns = self.db.query(Transaction).filter(
            Transaction.status == TransactionStatus.PENDING
        ).count()
        
        failed_txns = self.db.query(Transaction).filter(
            Transaction.status == TransactionStatus.FAILED
        ).count()
        
        total_volume = self.db.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.status == TransactionStatus.COMPLETED
        ).scalar() or Decimal('0.00')
        
        avg_amount = total_volume / completed_txns if completed_txns > 0 else Decimal('0.00')
        success_rate = (completed_txns / total_transactions * 100) if total_transactions > 0 else 0.0
        
        return TransactionStatsResponse(
            total_transactions=total_transactions,
            completed_transactions=completed_txns,
            pending_transactions=pending_txns,
            failed_transactions=failed_txns,
            total_volume=total_volume,
            avg_transaction_amount=avg_amount,
            success_rate=success_rate
        )
    
    # Bulk Operations
    async def bulk_create_transactions(
        self, 
        bulk_data: BulkTransactionCreate
    ) -> BulkTransactionResponse:
        """Create multiple transactions in bulk."""
        created_transactions = []
        failed_transactions = []
        
        for txn_data in bulk_data.transactions:
            try:
                created_txn = await self.create_transaction(txn_data)
                created_transactions.append(created_txn)
            except Exception as e:
                failed_transactions.append({
                    "transaction_data": txn_data.model_dump(),
                    "error": str(e)
                })
        
        return BulkTransactionResponse(
            created_transactions=created_transactions,
            failed_transactions=failed_transactions,
            success_count=len(created_transactions),
            failure_count=len(failed_transactions)
        )