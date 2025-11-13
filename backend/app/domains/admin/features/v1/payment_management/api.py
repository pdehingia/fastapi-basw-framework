"""Payment and wallet management API endpoints."""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.shared.responses import SuccessResponse
from .dependencies import get_payment_service
from .service import PaymentManagementService
from .schemas import (
    TransactionFilters, WalletFilters, WithdrawalFilters,
    ProcessWithdrawalRequest, WalletAdjustmentRequest,
    TransactionListResponse, TransactionDetailResponse,
    WalletListResponse, WalletTransactionListResponse,
    WithdrawalRequestListResponse, WalletResponse
)


router = APIRouter(prefix="/payment-management", tags=["Admin Payment Management"])


@router.get("/transactions", response_model=SuccessResponse[TransactionListResponse])
async def get_transactions(
    payment_service: Annotated[PaymentManagementService, Depends(get_payment_service)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    transaction_type: str = Query(None, description="Filter by transaction type"),
    status: str = Query(None, description="Filter by status"),
    user_id: int = Query(None, description="Filter by user ID"),
    start_date: str = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Get paginated list of all transactions with filtering options.
    
    **Required Permission:** admin.payments.view
    
    **Filters:**
    - transaction_type: booking_payment, commission, withdrawal, refund, etc.
    - status: pending, completed, failed, cancelled
    - user_id: Filter by specific user
    - Date range: start_date and end_date
    
    **Response includes:**
    - Paginated transaction list
    - Summary statistics (total amount, pending, completed, failed)
    - Pagination metadata
    """
    try:
        filters = TransactionFilters(
            page=page,
            limit=limit,
            transaction_type=transaction_type,
            status=status,
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        transactions, summary, pagination = payment_service.get_transactions(filters)
        
        return SuccessResponse(
            data=TransactionListResponse(
                transactions=transactions,
                summary=summary,
                pagination=pagination
            ),
            message="Transactions retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve transactions: {str(e)}")


@router.get("/transactions/{transaction_id}", response_model=SuccessResponse[TransactionDetailResponse])
async def get_transaction_detail(
    transaction_id: int,
    payment_service: Annotated[PaymentManagementService, Depends(get_payment_service)]
):
    """
    Get detailed information about a specific transaction.
    
    **Required Permission:** admin.payments.view
    
    **Returns:**
    - Complete transaction details
    - Gateway response data
    - Booking information (if applicable)
    - Wallet information
    - Commission and fee breakdown
    - Admin notes and audit trail
    """
    transaction = payment_service.get_transaction_detail(transaction_id)
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return SuccessResponse(
        data=transaction,
        message="Transaction details retrieved successfully"
    )


@router.get("/wallets", response_model=SuccessResponse[WalletListResponse])
async def get_wallets_overview(
    payment_service: Annotated[PaymentManagementService, Depends(get_payment_service)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    user_type: str = Query(None, description="Filter by user type: artist, customer, academy"),
    min_balance: float = Query(None, description="Minimum balance filter"),
    max_balance: float = Query(None, description="Maximum balance filter")
):
    """
    Get overview of all user wallets with filtering options.
    
    **Required Permission:** admin.wallets.view
    
    **Filters:**
    - user_type: artist, customer, academy
    - Balance range: min_balance and max_balance
    
    **Response includes:**
    - Paginated wallet list with balances
    - Summary statistics (total wallets, total balance, by user type)
    - Pagination metadata
    """
    try:
        filters = WalletFilters(
            page=page,
            limit=limit,
            user_type=user_type,
            min_balance=min_balance,
            max_balance=max_balance
        )
        
        wallets, summary, pagination = payment_service.get_wallets(filters)
        
        return SuccessResponse(
            data=WalletListResponse(
                wallets=wallets,
                summary=summary,
                pagination=pagination
            ),
            message="Wallets retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve wallets: {str(e)}")


@router.get("/wallets/{wallet_id}/transactions", response_model=SuccessResponse[WalletTransactionListResponse])
async def get_wallet_transactions(
    wallet_id: int,
    payment_service: Annotated[PaymentManagementService, Depends(get_payment_service)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get transaction history for a specific wallet.
    
    **Required Permission:** admin.wallets.view
    
    **Returns:**
    - Paginated transaction history
    - Balance before/after each transaction
    - Transaction types and amounts
    """
    transactions, pagination = payment_service.get_wallet_transactions(wallet_id, page, limit)
    
    return SuccessResponse(
        data=WalletTransactionListResponse(
            transactions=transactions,
            pagination=pagination
        ),
        message="Wallet transactions retrieved successfully"
    )


@router.get("/withdrawal-requests", response_model=SuccessResponse[WithdrawalRequestListResponse])
async def get_withdrawal_requests(
    payment_service: Annotated[PaymentManagementService, Depends(get_payment_service)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status: str = Query(None, description="Filter by status: pending, approved, rejected, processed"),
    user_type: str = Query(None, description="Filter by user type: artist, academy"),
    min_amount: float = Query(None, description="Minimum amount filter"),
    max_amount: float = Query(None, description="Maximum amount filter")
):
    """
    Get list of withdrawal requests pending approval.
    
    **Required Permission:** admin.withdrawals.view
    
    **Filters:**
    - status: pending, approved, rejected, processed
    - user_type: artist, academy
    - Amount range: min_amount and max_amount
    
    **Response includes:**
    - Withdrawal requests with bank details
    - Summary statistics
    - Approval/rejection status
    """
    try:
        filters = WithdrawalFilters(
            page=page,
            limit=limit,
            status=status,
            user_type=user_type,
            min_amount=min_amount,
            max_amount=max_amount
        )
        
        requests, summary, pagination = payment_service.get_withdrawal_requests(filters)
        
        return SuccessResponse(
            data=WithdrawalRequestListResponse(
                withdrawal_requests=requests,
                summary=summary,
                pagination=pagination
            ),
            message="Withdrawal requests retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve withdrawal requests: {str(e)}")


@router.post("/withdrawal-requests/{withdrawal_id}/process", response_model=SuccessResponse[str])
async def process_withdrawal_request(
    withdrawal_id: int,
    request: ProcessWithdrawalRequest,
    payment_service: Annotated[PaymentManagementService, Depends(get_payment_service)]
):
    """
    Process a withdrawal request - approve or reject.
    
    **Required Permission:** admin.withdrawals.process
    
    **Actions:**
    - approve: Approve and optionally process payment (requires UTR number)
    - reject: Reject with reason
    
    **For approval:**
    - UTR number is required
    - Funds will be marked as processed
    
    **For rejection:**
    - Rejection reason is required
    - Funds will be credited back to wallet
    """
    if request.action == "approve" and not request.utr_number:
        raise HTTPException(status_code=400, detail="UTR number is required for approval")
    
    if request.action == "reject" and not request.rejection_reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")
    
    try:
        withdrawal = payment_service.process_withdrawal_request(withdrawal_id, request)
        
        action_message = "approved" if request.action == "approve" else "rejected"
        return SuccessResponse(
            data=f"Withdrawal request {action_message} successfully",
            message=f"Withdrawal request has been {action_message}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process withdrawal: {str(e)}")


@router.post("/wallets/{wallet_id}/adjust", response_model=SuccessResponse[WalletResponse])
async def manual_wallet_adjustment(
    wallet_id: int,
    request: WalletAdjustmentRequest,
    payment_service: Annotated[PaymentManagementService, Depends(get_payment_service)]
):
    """
    Manually adjust wallet balance - credit or debit.
    
    **Required Permission:** admin.wallets.adjust
    
    **CAUTION:** This is a powerful feature for manual corrections.
    
    **Types:**
    - credit: Add money to wallet
    - debit: Remove money from wallet
    
    **Required fields:**
    - type: credit or debit
    - amount: Amount to adjust (positive value)
    - reason: Detailed reason for adjustment (minimum 10 characters)
    
    **Audit trail:**
    - All adjustments are logged with admin user ID
    - Reason and notes are stored for compliance
    """
    try:
        wallet = payment_service.adjust_wallet_balance(wallet_id, request)
        
        return SuccessResponse(
            data=wallet,
            message=f"Wallet balance {request.type.value}ed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to adjust wallet balance: {str(e)}")


@router.get("/transactions/export")
async def export_transactions(
    payment_service: Annotated[PaymentManagementService, Depends(get_payment_service)],
    transaction_type: str = Query(None, description="Filter by transaction type"),
    status: str = Query(None, description="Filter by status"),
    start_date: str = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Export filtered transactions to Excel file.
    
    **Required Permission:** admin.payments.export
    
    **Filters:** Same as transaction list endpoint
    
    **Returns:** Excel file download with transaction data
    """
    try:
        filters = TransactionFilters(
            page=1,
            limit=10000,  # Export all matching records
            transaction_type=transaction_type,
            status=status,
            start_date=start_date,
            end_date=end_date
        )
        
        excel_content = payment_service.export_transactions(filters)
        
        return StreamingResponse(
            io.BytesIO(excel_content),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=transactions_export.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export transactions: {str(e)}")


# Add missing import
import io