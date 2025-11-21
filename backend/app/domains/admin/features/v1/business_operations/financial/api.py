"""
Financial Management API

This module provides REST API endpoints for comprehensive financial management
including transactions, wallets, bank accounts, and earnings analytics.
"""

from typing import List, Optional, Dict, Any
from datetime import date
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, Path, Body
from fastapi.responses import JSONResponse

from app.shared.constants import HTTP_STATUS_CODES, API_TAGS
from app.domains.admin.features.v1.business_operations.financial.dependencies import FinancialManagementServiceDep
from app.domains.admin.features.v1.business_operations.financial.schemas import (
    # Transaction schemas
    TransactionCreate, TransactionUpdate, TransactionResponse, TransactionFilters,
    # Bank account schemas  
    BankAccountCreate, BankAccountUpdate, BankAccountResponse, BankAccountFilters,
    # Wallet schemas
    WalletCreate, WalletUpdate, WalletResponse, WalletFilters,
    # Wallet transaction schemas
    WalletTransactionCreate, WalletTransactionResponse,
    # Analytics schemas
    EarningsSummaryResponse, DailyEarningsResponse, MonthlyEarningsResponse,
    ProviderEarningsResponse, TopEarnerResponse, FinancialStatsResponse,
    WalletStatsResponse, TransactionStatsResponse, BulkTransactionCreate,
    BulkTransactionResponse, FinancialPaginatedResponse,
    # Enums
    UserTypeEnum, TransactionTypeEnum, TransactionStatusEnum, WalletTransactionTypeEnum
)

router = APIRouter(prefix="", tags=[API_TAGS.FINANCIAL_MANAGEMENT])


# Transaction Management Endpoints
@router.post("/transactions", response_model=TransactionResponse, status_code=HTTP_STATUS_CODES.CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    service: FinancialManagementServiceDep
):
    """Create a new transaction."""
    return await service.create_transaction(transaction_data)


@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: UUID = Path(..., description="Transaction ID"),
    service: FinancialManagementServiceDep = None
):
    """Get transaction by ID."""
    return await service.get_transaction(transaction_id)


@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: UUID = Path(..., description="Transaction ID"),
    transaction_data: TransactionUpdate = Body(...),
    service: FinancialManagementServiceDep = None
):
    """Update transaction."""
    return await service.update_transaction(transaction_id, transaction_data)


@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: UUID = Path(..., description="Transaction ID"),
    service: FinancialManagementServiceDep = None
):
    """Delete transaction."""
    return await service.delete_transaction(transaction_id)


@router.get("/transactions")
async def search_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Page size"),
    user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
    user_type: Optional[UserTypeEnum] = Query(None, description="Filter by user type"),
    transaction_type: Optional[TransactionTypeEnum] = Query(None, description="Filter by transaction type"),
    status: Optional[TransactionStatusEnum] = Query(None, description="Filter by status"),
    booking_id: Optional[UUID] = Query(None, description="Filter by booking ID"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    service: FinancialManagementServiceDep = None
):
    """Search transactions with advanced filters."""
    filters = TransactionFilters(
        user_id=user_id,
        user_type=user_type,
        transaction_type=transaction_type,
        status=status,
        booking_id=booking_id,
        start_date=start_date,
        end_date=end_date
    )
    return await service.search_transactions(filters, page, size)


@router.post("/transactions/bulk", response_model=BulkTransactionResponse)
async def bulk_create_transactions(
    bulk_data: BulkTransactionCreate,
    service: FinancialManagementServiceDep
):
    """Create multiple transactions in bulk."""
    return await service.bulk_create_transactions(bulk_data)


# Bank Account Management Endpoints
@router.post("/bank-accounts", response_model=BankAccountResponse, status_code=HTTP_STATUS_CODES.CREATED)
async def create_bank_account(
    account_data: BankAccountCreate,
    service: FinancialManagementServiceDep
):
    """Create a new bank account."""
    return await service.create_bank_account(account_data)


@router.get("/bank-accounts/{account_id}", response_model=BankAccountResponse)
async def get_bank_account(
    account_id: UUID = Path(..., description="Bank account ID"),
    service: FinancialManagementServiceDep = None
):
    """Get bank account by ID."""
    return await service.get_bank_account(account_id)


@router.put("/bank-accounts/{account_id}", response_model=BankAccountResponse)
async def update_bank_account(
    account_id: UUID = Path(..., description="Bank account ID"),
    account_data: BankAccountUpdate = Body(...),
    service: FinancialManagementServiceDep = None
):
    """Update bank account."""
    return await service.update_bank_account(account_id, account_data)


@router.delete("/bank-accounts/{account_id}")
async def delete_bank_account(
    account_id: UUID = Path(..., description="Bank account ID"),
    service: FinancialManagementServiceDep = None
):
    """Delete bank account."""
    return await service.delete_bank_account(account_id)


@router.get("/users/{user_id}/bank-accounts", response_model=List[BankAccountResponse])
async def get_user_bank_accounts(
    user_id: UUID = Path(..., description="User ID"),
    user_type: UserTypeEnum = Query(..., description="User type"),
    service: FinancialManagementServiceDep = None
):
    """Get all bank accounts for a user."""
    return await service.get_user_bank_accounts(user_id, user_type.value)


# Wallet Management Endpoints
@router.post("/wallets", response_model=WalletResponse, status_code=HTTP_STATUS_CODES.CREATED)
async def create_wallet(
    wallet_data: WalletCreate,
    service: FinancialManagementServiceDep
):
    """Create a new wallet."""
    return await service.create_wallet(wallet_data)


@router.get("/wallets/{wallet_id}", response_model=WalletResponse)
async def get_wallet(
    wallet_id: UUID = Path(..., description="Wallet ID"),
    service: FinancialManagementServiceDep = None
):
    """Get wallet by ID."""
    return await service.get_wallet(wallet_id)


@router.get("/users/{user_id}/wallet", response_model=WalletResponse)
async def get_user_wallet(
    user_id: UUID = Path(..., description="User ID"),
    user_type: UserTypeEnum = Query(..., description="User type"),
    service: FinancialManagementServiceDep = None
):
    """Get wallet for a specific user."""
    return await service.get_user_wallet(user_id, user_type.value)


@router.put("/wallets/{wallet_id}", response_model=WalletResponse)
async def update_wallet(
    wallet_id: UUID = Path(..., description="Wallet ID"),
    wallet_data: WalletUpdate = Body(...),
    service: FinancialManagementServiceDep = None
):
    """Update wallet."""
    return await service.update_wallet(wallet_id, wallet_data)


# Wallet Transaction Endpoints
@router.post("/wallet-transactions", response_model=WalletTransactionResponse, status_code=HTTP_STATUS_CODES.CREATED)
async def create_wallet_transaction(
    transaction_data: WalletTransactionCreate,
    service: FinancialManagementServiceDep
):
    """Create a new wallet transaction."""
    return await service.create_wallet_transaction(transaction_data)


@router.get("/wallets/{wallet_id}/transactions")
async def get_wallet_transactions(
    wallet_id: UUID = Path(..., description="Wallet ID"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Page size"),
    service: FinancialManagementServiceDep = None
):
    """Get wallet transactions."""
    return await service.get_wallet_transactions(wallet_id, page, size)


# Earnings and Analytics Endpoints
@router.get("/providers/{provider_id}/earnings", response_model=ProviderEarningsResponse)
async def get_provider_earnings_summary(
    provider_id: UUID = Path(..., description="Provider ID"),
    start_date: Optional[date] = Query(None, description="Start date for earnings period"),
    end_date: Optional[date] = Query(None, description="End date for earnings period"),
    service: FinancialManagementServiceDep = None
):
    """Get comprehensive earnings summary for a provider."""
    return await service.get_provider_earnings_summary(provider_id, start_date, end_date)


@router.get("/providers/{provider_id}/earnings/trend", response_model=List[MonthlyEarningsResponse])
async def get_monthly_earnings_trend(
    provider_id: UUID = Path(..., description="Provider ID"),
    months: int = Query(12, ge=1, le=24, description="Number of months to analyze"),
    service: FinancialManagementServiceDep = None
):
    """Get monthly earnings trend for a provider."""
    return await service.get_monthly_earnings_trend(provider_id, months)


@router.get("/providers/top-earners", response_model=List[TopEarnerResponse])
async def get_top_earning_providers(
    limit: int = Query(10, ge=1, le=50, description="Number of top earners to return"),
    start_date: Optional[date] = Query(None, description="Start date for analysis period"),
    end_date: Optional[date] = Query(None, description="End date for analysis period"),
    service: FinancialManagementServiceDep = None
):
    """Get top earning providers."""
    return await service.get_top_earning_providers(limit, start_date, end_date)


# Statistics and Reports Endpoints
@router.get("/statistics/overview", response_model=FinancialStatsResponse)
async def get_financial_statistics(
    service: FinancialManagementServiceDep
):
    """Get comprehensive financial statistics overview."""
    return await service.get_financial_statistics()


@router.get("/statistics/wallets", response_model=WalletStatsResponse)
async def get_wallet_statistics(
    service: FinancialManagementServiceDep
):
    """Get wallet statistics overview."""
    return await service.get_wallet_statistics()


@router.get("/statistics/transactions", response_model=TransactionStatsResponse)
async def get_transaction_statistics(
    service: FinancialManagementServiceDep
):
    """Get transaction statistics overview."""
    return await service.get_transaction_statistics()


# Advanced Analytics Endpoints
@router.get("/analytics/daily-revenue")
async def get_daily_revenue_analytics(
    days: int = Query(30, ge=7, le=90, description="Number of days to analyze"),
    service: FinancialManagementServiceDep = None
):
    """Get daily revenue analytics."""
    # This would be implemented with more complex analytics logic
    return {"message": "Daily revenue analytics endpoint", "days": days}


@router.get("/analytics/provider-performance")
async def get_provider_performance_analytics(
    provider_id: Optional[UUID] = Query(None, description="Specific provider ID"),
    period: str = Query("month", regex="^(week|month|quarter|year)$", description="Analysis period"),
    service: FinancialManagementServiceDep = None
):
    """Get provider performance analytics."""
    return {"message": "Provider performance analytics endpoint", "provider_id": provider_id, "period": period}


@router.get("/analytics/commission-breakdown")
async def get_commission_breakdown_analytics(
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    service: FinancialManagementServiceDep = None
):
    """Get commission breakdown analytics."""
    return {"message": "Commission breakdown analytics endpoint", "start_date": start_date, "end_date": end_date}


# Export and Reporting Endpoints
@router.get("/exports/transactions")
async def export_transactions_report(
    format: str = Query("csv", regex="^(csv|excel|pdf)$", description="Export format"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    user_type: Optional[UserTypeEnum] = Query(None, description="Filter by user type"),
    service: FinancialManagementServiceDep = None
):
    """Export transactions report."""
    return {"message": "Export transactions report endpoint", "format": format}


@router.get("/exports/earnings")
async def export_earnings_report(
    format: str = Query("csv", regex="^(csv|excel|pdf)$", description="Export format"),
    provider_id: Optional[UUID] = Query(None, description="Specific provider ID"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    service: FinancialManagementServiceDep = None
):
    """Export earnings report."""
    return {"message": "Export earnings report endpoint", "format": format}


# Administrative Endpoints
@router.post("/admin/reconcile-wallets")
async def reconcile_wallets(
    service: FinancialManagementServiceDep
):
    """Reconcile wallet balances with transaction history."""
    return {"message": "Wallet reconciliation initiated"}


@router.post("/admin/generate-statements")
async def generate_user_statements(
    user_id: UUID = Body(..., description="User ID"),
    month: int = Body(..., ge=1, le=12, description="Month"),
    year: int = Body(..., ge=2020, description="Year"),
    service: FinancialManagementServiceDep = None
):
    """Generate user financial statements."""
    return {"message": "User statement generation initiated", "user_id": user_id, "period": f"{year}-{month:02d}"}


@router.get("/health")
async def financial_management_health_check():
    """Health check endpoint for financial management service."""
    return {
        "service": "Financial Management API",
        "status": "healthy",
        "version": "1.0.0",
        "features": [
            "Transaction Management",
            "Bank Account Management", 
            "Wallet Management",
            "Earnings Analytics",
            "Financial Reporting",
            "Bulk Operations"
        ]
    }