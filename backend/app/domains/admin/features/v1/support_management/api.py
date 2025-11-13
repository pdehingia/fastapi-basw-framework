"""Support management API endpoints."""

from typing import Annotated, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse

from app.shared.responses import SuccessResponse
from app.shared.pagination import PaginationParams
from .dependencies import get_support_service
from .service import SupportManagementService
from .schemas import (
    TicketResponse,
    TicketDetailResponse,
    TicketReplyRequest,
    TicketUpdateRequest,
    EscalateTicketRequest,
    TicketPriority,
    TicketStatus,
    TicketCategory,
    IssueType,
    CannedResponse
)

router = APIRouter(prefix="/support", tags=["Support Management"])


@router.get("/tickets", response_model=SuccessResponse[list[TicketResponse]])
async def get_support_tickets(
    service: Annotated[SupportManagementService, Depends(get_support_service)],
    pagination: Annotated[PaginationParams, Depends()],
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    issue_type: Optional[IssueType] = None,
    assigned_to: Optional[str] = None,
    created_after: Optional[datetime] = None,
    search: Optional[str] = None
):
    """Get support tickets with filtering."""
    tickets = service.get_tickets(
        skip=pagination.skip,
        limit=pagination.limit,
        status=status,
        priority=priority,
        issue_type=issue_type,
        assigned_to=assigned_to,
        created_after=created_after,
        search=search
    )
    return SuccessResponse(data=tickets)


@router.get("/tickets/{ticket_id}", response_model=SuccessResponse[TicketDetailResponse])
async def get_support_ticket(
    ticket_id: str,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Get specific support ticket."""
    ticket = service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return SuccessResponse(data=ticket)


@router.post("/tickets/{ticket_id}/reply", response_model=SuccessResponse[dict])
async def reply_to_ticket(
    ticket_id: str,
    reply_data: TicketReplyRequest,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Reply to support ticket."""
    success = service.reply_to_ticket(ticket_id, reply_data)
    if not success:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return SuccessResponse(data={"replied": True})


@router.put("/tickets/{ticket_id}", response_model=SuccessResponse[TicketResponse])
async def update_support_ticket(
    ticket_id: str,
    ticket_data: TicketUpdateRequest,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Update support ticket."""
    ticket = service.update_ticket(ticket_id, ticket_data)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return SuccessResponse(data=ticket)


@router.post("/tickets/{ticket_id}/escalate", response_model=SuccessResponse[dict])
async def escalate_ticket(
    ticket_id: str,
    escalation_data: EscalateTicketRequest,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Escalate support ticket."""
    success = service.escalate_ticket(ticket_id, escalation_data)
    if not success:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return SuccessResponse(data={"escalated": True})


@router.get("/canned-responses", response_model=SuccessResponse[list[CannedResponse]])
async def get_canned_responses(
    service: Annotated[SupportManagementService, Depends(get_support_service)],
    pagination: Annotated[PaginationParams, Depends()],
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """Get canned responses."""
    responses = service.get_canned_responses(
        skip=pagination.skip,
        limit=pagination.limit,
        category=category,
        search=search
    )
    return SuccessResponse(data=responses)


@router.get("/export/tickets")
async def export_support_tickets(
    service: Annotated[SupportManagementService, Depends(get_support_service)],
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    issue_type: Optional[IssueType] = None
):
    """Export support tickets to Excel."""
    file_stream, filename = service.export_tickets(
        status=status,
        priority=priority,
        issue_type=issue_type
    )
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/tickets")
async def export_support_tickets(
    service: Annotated[SupportManagementService, Depends(get_support_service)],
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    category: Optional[TicketCategory] = None
):
    """Export support tickets to Excel."""
    file_stream, filename = service.export_tickets(
        status=status,
        priority=priority,
        category=category
    )
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )