"""
Financial Repository

This module provides data access layer for financial entities including
transactions, bank accounts, wallets, and earnings.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, text
from sqlalchemy.dialects.postgresql import JSONB

from app.shared.models.booking import (
    Transaction, BankAccount, Wallet, WalletTransaction, Booking, 
    TransactionType, TransactionStatus, WalletTransactionType,
    WalletUserType
)
from app.shared.repositories.base import BaseRepository


class TransactionRepository:
    """Repository for transaction operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.model = Transaction
    
    def create(self, obj):
        """Create new record."""
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def get_by_id(self, id):
        """Get record by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(self, limit: int = 100, offset: int = 0):
        """Get all records."""
        return self.db.query(self.model).offset(offset).limit(limit).all()
    
    def update(self, obj):
        """Update record."""
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def delete(self, obj):
        """Delete record."""
        self.db.delete(obj)
        self.db.commit()
    
    def count(self):
        """Count total records."""
        return self.db.query(self.model).count()
    
    def get_by_transaction_number(self, transaction_number: str) -> Optional[Transaction]:
        """Get transaction by transaction number."""
        return self.db.query(Transaction).filter(
            Transaction.transaction_id == transaction_number
        ).first()
    
    def get_by_user(
        self, 
        user_id: UUID, 
        user_type: str,
        status: Optional[TransactionStatus] = None,
        transaction_type: Optional[TransactionType] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Transaction]:
        """Get transactions for a specific user."""
        query = self.db.query(Transaction).filter(
            and_(
                Transaction.wallet_id.in_(
                    self.db.query(Wallet.id).filter(
                        and_(Wallet.user_id == user_id, Wallet.user_type == user_type)
                    )
                )
            )
        )
        
        if status:
            query = query.filter(Transaction.status == status)
        if transaction_type:
            query = query.filter(Transaction.transaction_type == transaction_type)
        
        return query.order_by(desc(Transaction.created_at)).offset(offset).limit(limit).all()
    
    def get_by_booking(self, booking_id: UUID) -> List[Transaction]:
        """Get transactions for a specific booking."""
        return self.db.query(Transaction).filter(
            Transaction.booking_id == booking_id
        ).order_by(desc(Transaction.created_at)).all()
    
    def get_earnings_summary(
        self, 
        user_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Get earnings summary for a provider."""
        query = self.db.query(
            func.sum(Transaction.amount).label('total_earnings'),
            func.count(Transaction.id).label('total_transactions'),
            func.avg(Transaction.amount).label('average_transaction')
        ).filter(
            and_(
                Transaction.wallet_id.in_(
                    self.db.query(Wallet.id).filter(
                        and_(Wallet.user_id == user_id, Wallet.user_type == 'provider')
                    )
                ),
                Transaction.transaction_type == TransactionType.CREDIT,
                Transaction.status == TransactionStatus.COMPLETED
            )
        )
        
        if start_date:
            query = query.filter(Transaction.created_at >= start_date)
        if end_date:
            query = query.filter(Transaction.created_at <= end_date)
        
        result = query.first()
        return {
            'total_earnings': float(result.total_earnings or 0),
            'total_transactions': result.total_transactions or 0,
            'average_transaction': float(result.average_transaction or 0)
        }
    
    def get_daily_earnings(
        self, 
        user_id: UUID,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get daily earnings for the last N days."""
        query = self.db.query(
            func.date(Transaction.created_at).label('date'),
            func.sum(Transaction.amount).label('earnings'),
            func.count(Transaction.id).label('transaction_count')
        ).filter(
            and_(
                Transaction.wallet_id.in_(
                    self.db.query(Wallet.id).filter(
                        and_(Wallet.user_id == user_id, Wallet.user_type == 'provider')
                    )
                ),
                Transaction.transaction_type == TransactionType.CREDIT,
                Transaction.status == TransactionStatus.COMPLETED,
                Transaction.created_at >= func.current_date() - text(f'INTERVAL \'{days} days\'')
            )
        ).group_by(func.date(Transaction.created_at)).order_by(
            func.date(Transaction.created_at)
        ).all()
        
        return [
            {
                'date': str(row.date),
                'earnings': float(row.earnings),
                'transaction_count': row.transaction_count
            }
            for row in query
        ]


class BankAccountRepository(BaseRepository[BankAccount, dict, dict]):
    """Repository for bank account operations."""
    
    def __init__(self, db: Session):
        super().__init__(db, BankAccount)
    
    def get_by_user(self, user_id: UUID, user_type: str) -> List[BankAccount]:
        """Get bank accounts for a specific user."""
        return self.db.query(BankAccount).filter(
            and_(
                BankAccount.user_id == user_id,
                BankAccount.user_type == user_type,
                BankAccount.is_active == True
            )
        ).order_by(desc(BankAccount.is_primary), desc(BankAccount.created_at)).all()
    
    def get_primary_account(self, user_id: UUID, user_type: str) -> Optional[BankAccount]:
        """Get primary bank account for a user."""
        return self.db.query(BankAccount).filter(
            and_(
                BankAccount.user_id == user_id,
                BankAccount.user_type == user_type,
                BankAccount.is_primary == True,
                BankAccount.is_active == True
            )
        ).first()
    
    def get_by_account_hash(self, account_hash: str) -> Optional[BankAccount]:
        """Get bank account by account number hash."""
        return self.db.query(BankAccount).filter(
            BankAccount.account_number_hash == account_hash
        ).first()
    
    def get_verified_accounts(self, user_id: UUID, user_type: str) -> List[BankAccount]:
        """Get verified bank accounts for a user."""
        return self.db.query(BankAccount).filter(
            and_(
                BankAccount.user_id == user_id,
                BankAccount.user_type == user_type,
                BankAccount.is_verified == True,
                BankAccount.is_active == True
            )
        ).order_by(desc(BankAccount.is_primary)).all()


class WalletRepository(BaseRepository[Wallet, dict, dict]):
    """Repository for wallet operations."""
    
    def __init__(self, db: Session):
        super().__init__(db, Wallet)
    
    def get_by_user(self, user_id: UUID, user_type: str) -> Optional[Wallet]:
        """Get wallet for a specific user."""
        return self.db.query(Wallet).filter(
            and_(
                Wallet.user_id == user_id,
                Wallet.user_type == user_type
            )
        ).first()
    
    def get_wallets_by_type(self, user_type: str) -> List[Wallet]:
        """Get all wallets by user type."""
        return self.db.query(Wallet).filter(
            Wallet.user_type == user_type
        ).order_by(desc(Wallet.balance)).all()
    
    def get_low_balance_wallets(self, threshold: Decimal = Decimal('100.00')) -> List[Wallet]:
        """Get wallets with balance below threshold."""
        return self.db.query(Wallet).filter(
            and_(
                Wallet.balance < threshold,
                Wallet.is_active == True
            )
        ).order_by(asc(Wallet.balance)).all()
    
    def update_balance(
        self, 
        wallet_id: UUID, 
        amount: Decimal, 
        transaction_type: WalletTransactionType
    ) -> bool:
        """Update wallet balance atomically."""
        wallet = self.get_by_id(wallet_id)
        if not wallet:
            return False
        
        if transaction_type in [WalletTransactionType.CREDIT, WalletTransactionType.REFUND, WalletTransactionType.BONUS]:
            new_balance = wallet.balance + amount
            wallet.total_credited += amount
        else:
            if wallet.balance < amount:
                return False  # Insufficient funds
            new_balance = wallet.balance - amount
            wallet.total_debited += amount
        
        wallet.balance = new_balance
        self.db.commit()
        return True


class WalletTransactionRepository(BaseRepository[WalletTransaction, dict, dict]):
    """Repository for wallet transaction operations."""
    
    def __init__(self, db: Session):
        super().__init__(db, WalletTransaction)
    
    def get_by_wallet(
        self, 
        wallet_id: UUID,
        transaction_type: Optional[WalletTransactionType] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[WalletTransaction]:
        """Get wallet transactions for a specific wallet."""
        query = self.db.query(WalletTransaction).filter(
            WalletTransaction.wallet_id == wallet_id
        )
        
        if transaction_type:
            query = query.filter(WalletTransaction.transaction_type == transaction_type)
        
        return query.order_by(desc(WalletTransaction.created_at)).offset(offset).limit(limit).all()
    
    def get_by_user(
        self, 
        user_id: UUID, 
        user_type: str,
        transaction_type: Optional[WalletTransactionType] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[WalletTransaction]:
        """Get wallet transactions for a specific user."""
        query = self.db.query(WalletTransaction).filter(
            and_(
                WalletTransaction.user_id == user_id,
                WalletTransaction.user_type == user_type
            )
        )
        
        if transaction_type:
            query = query.filter(WalletTransaction.transaction_type == transaction_type)
        
        return query.order_by(desc(WalletTransaction.created_at)).offset(offset).limit(limit).all()
    
    def get_by_reference(
        self, 
        reference_type: str, 
        reference_id: UUID
    ) -> List[WalletTransaction]:
        """Get wallet transactions by reference."""
        return self.db.query(WalletTransaction).filter(
            and_(
                WalletTransaction.reference_type == reference_type,
                WalletTransaction.reference_id == reference_id
            )
        ).order_by(desc(WalletTransaction.created_at)).all()


class EarningsRepository:
    """Repository for earnings analytics and reporting."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_provider_earnings_summary(
        self, 
        provider_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Get comprehensive earnings summary for a provider."""
        # Base query for completed bookings
        query = self.db.query(Booking).filter(
            and_(
                Booking.provider_user_id == provider_id,
                Booking.status == 'completed'
            )
        )
        
        if start_date:
            query = query.filter(Booking.booking_date >= start_date)
        if end_date:
            query = query.filter(Booking.booking_date <= end_date)
        
        bookings = query.all()
        
        total_earnings = sum(booking.provider_payout for booking in bookings)
        total_bookings = len(bookings)
        total_commission = sum(booking.platform_commission for booking in bookings)
        avg_booking_value = total_earnings / total_bookings if total_bookings > 0 else 0
        
        return {
            'total_earnings': float(total_earnings),
            'total_bookings': total_bookings,
            'total_commission': float(total_commission),
            'average_booking_value': float(avg_booking_value),
            'commission_rate': float(total_commission / (total_earnings + total_commission)) * 100 if total_earnings > 0 else 0
        }
    
    def get_monthly_earnings_trend(
        self, 
        provider_id: UUID,
        months: int = 12
    ) -> List[Dict[str, Any]]:
        """Get monthly earnings trend for a provider."""
        query = self.db.query(
            func.date_trunc('month', Booking.booking_date).label('month'),
            func.sum(Booking.provider_payout).label('earnings'),
            func.count(Booking.id).label('booking_count'),
            func.avg(Booking.provider_payout).label('avg_booking_value')
        ).filter(
            and_(
                Booking.provider_user_id == provider_id,
                Booking.status == 'completed',
                Booking.booking_date >= func.current_date() - text(f'INTERVAL \'{months} months\'')
            )
        ).group_by(func.date_trunc('month', Booking.booking_date)).order_by(
            func.date_trunc('month', Booking.booking_date)
        ).all()
        
        return [
            {
                'month': row.month.strftime('%Y-%m'),
                'earnings': float(row.earnings or 0),
                'booking_count': row.booking_count or 0,
                'avg_booking_value': float(row.avg_booking_value or 0)
            }
            for row in query
        ]
    
    def get_top_earning_providers(
        self, 
        limit: int = 10,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """Get top earning providers."""
        query = self.db.query(
            Booking.provider_user_id,
            func.sum(Booking.provider_payout).label('total_earnings'),
            func.count(Booking.id).label('booking_count'),
            func.avg(Booking.provider_payout).label('avg_booking_value')
        ).filter(
            Booking.status == 'completed'
        )
        
        if start_date:
            query = query.filter(Booking.booking_date >= start_date)
        if end_date:
            query = query.filter(Booking.booking_date <= end_date)
        
        results = query.group_by(Booking.provider_user_id).order_by(
            desc(func.sum(Booking.provider_payout))
        ).limit(limit).all()
        
        return [
            {
                'provider_id': str(row.provider_user_id),
                'total_earnings': float(row.total_earnings),
                'booking_count': row.booking_count,
                'avg_booking_value': float(row.avg_booking_value)
            }
            for row in results
        ]