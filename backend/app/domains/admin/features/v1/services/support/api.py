"""Support management API endpoints."""

from typing import Annotated, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse

from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS
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
    CannedResponse,
    TicketMessageCreate,
    TicketMessageUpdate,
    TicketMessageResponse,
    TicketMessageListResponse
)

router = APIRouter(prefix="/support", tags=[API_TAGS.SUPPORT_MANAGEMENT])


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
        skip=pagination.offset,
        limit=pagination.page_size,
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
        raise HTTPException(status_code=HTTP_STATUS_CODES.NOT_FOUND, detail=ERROR_MESSAGES.TICKET_NOT_FOUND)
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
        raise HTTPException(status_code=HTTP_STATUS_CODES.NOT_FOUND, detail=ERROR_MESSAGES.TICKET_NOT_FOUND)
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
        raise HTTPException(status_code=HTTP_STATUS_CODES.NOT_FOUND, detail=ERROR_MESSAGES.TICKET_NOT_FOUND)
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
        raise HTTPException(status_code=HTTP_STATUS_CODES.NOT_FOUND, detail=ERROR_MESSAGES.TICKET_NOT_FOUND)
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


@router.post("/tickets/{ticket_id}/internal-note", response_model=SuccessResponse[dict])
async def add_internal_note(
    ticket_id: int,
    request: dict,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Add internal note to ticket (only visible to admin users)."""
    note = request.get("note", "")
    if not note or len(note.strip()) < 5:
        raise HTTPException(status_code=HTTP_STATUS_CODES.BAD_REQUEST, detail=ERROR_MESSAGES.NOTE_TOO_SHORT)
    
    success = service.add_internal_note(ticket_id, note.strip())
    if not success:
        raise HTTPException(status_code=HTTP_STATUS_CODES.NOT_FOUND, detail=ERROR_MESSAGES.TICKET_NOT_FOUND)
    
    return SuccessResponse(
        data={"message": "Internal note added successfully", "ticket_id": ticket_id},
        message="Internal note added to ticket"
    )


@router.post("/tickets/merge", response_model=SuccessResponse[dict])
async def merge_tickets(
    request: dict,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Merge multiple tickets into a primary ticket."""
    primary_ticket_id = request.get("primary_ticket_id")
    secondary_ticket_ids = request.get("secondary_ticket_ids", [])
    merge_reason = request.get("merge_reason", "")
    
    if not primary_ticket_id:
        raise HTTPException(status_code=HTTP_STATUS_CODES.BAD_REQUEST, detail=ERROR_MESSAGES.PRIMARY_TICKET_ID_REQUIRED)
    if not secondary_ticket_ids or len(secondary_ticket_ids) == 0:
        raise HTTPException(status_code=HTTP_STATUS_CODES.BAD_REQUEST, detail=ERROR_MESSAGES.SECONDARY_TICKET_IDS_REQUIRED)
    if not merge_reason or len(merge_reason.strip()) < 10:
        raise HTTPException(status_code=HTTP_STATUS_CODES.BAD_REQUEST, detail=ERROR_MESSAGES.MERGE_REASON_TOO_SHORT)
    
    result = service.merge_tickets(primary_ticket_id, secondary_ticket_ids, merge_reason.strip())
    
    return SuccessResponse(
        data=result,
        message="Tickets merged successfully"
    )


@router.post("/tickets/{ticket_id}/close", response_model=SuccessResponse[dict])
async def close_ticket(
    ticket_id: int,
    request: dict,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Close ticket with resolution summary."""
    resolution_summary = request.get("resolution_summary", "")
    send_survey = request.get("send_survey", True)
    resolution_category = request.get("resolution_category")
    
    if not resolution_summary or len(resolution_summary.strip()) < 20:
        raise HTTPException(status_code=HTTP_STATUS_CODES.BAD_REQUEST, detail=ERROR_MESSAGES.RESOLUTION_SUMMARY_TOO_SHORT)
    
    success = service.close_ticket(
        ticket_id, 
        resolution_summary.strip(), 
        send_survey, 
        resolution_category
    )
    
    if not success:
        raise HTTPException(status_code=HTTP_STATUS_CODES.NOT_FOUND, detail=ERROR_MESSAGES.TICKET_NOT_FOUND)
    
    return SuccessResponse(
        data={
            "message": "Ticket closed successfully", 
            "ticket_id": ticket_id,
            "survey_sent": send_survey
        },
        message="Ticket closed and customer notified"
    )


@router.get("/analytics", response_model=SuccessResponse[dict])
async def get_support_analytics(
    service: Annotated[SupportManagementService, Depends(get_support_service)],
    timeframe: str = Query(default="this_month", description="Analytics timeframe")
):
    """Get comprehensive support analytics and performance metrics."""
    valid_timeframes = ["today", "this_week", "this_month", "last_month", "last_3_months"]
    
    if timeframe not in valid_timeframes:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST, 
            detail=ERROR_MESSAGES.INVALID_TIMEFRAME
        )
    
    analytics = service.get_support_analytics(timeframe)
    
    return SuccessResponse(
        data=analytics,
        message="Support analytics retrieved successfully"
    )


# ========== TICKET MESSAGES ENDPOINTS ==========

@router.get("/tickets/{ticket_id}/messages", response_model=SuccessResponse[TicketMessageListResponse])
async def get_ticket_messages(
    ticket_id: int,
    service: Annotated[SupportManagementService, Depends(get_support_service)],
    include_internal: bool = Query(True, description="Include internal notes")
):
    """Get all messages for a specific support ticket."""
    messages = service.get_ticket_messages(ticket_id, include_internal=include_internal)
    if messages is None:
        raise HTTPException(status_code=HTTP_STATUS_CODES.NOT_FOUND, detail=ERROR_MESSAGES.TICKET_NOT_FOUND)
    
    return SuccessResponse(
        data=TicketMessageListResponse(
            messages=messages,
            total=len(messages),
            ticket_id=ticket_id
        ),
        message="Ticket messages retrieved successfully"
    )


@router.post("/tickets/{ticket_id}/messages", response_model=SuccessResponse[TicketMessageResponse])
async def add_ticket_message(
    ticket_id: int,
    message_data: TicketMessageCreate,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Add a new message to a support ticket."""
    message = service.add_ticket_message(ticket_id, message_data)
    if not message:
        raise HTTPException(status_code=HTTP_STATUS_CODES.NOT_FOUND, detail=ERROR_MESSAGES.TICKET_NOT_FOUND)
    
    return SuccessResponse(
        data=message,
        message="Message added to ticket successfully"
    )


@router.put("/tickets/{ticket_id}/messages/{message_id}", response_model=SuccessResponse[TicketMessageResponse])
async def update_ticket_message(
    ticket_id: int,
    message_id: int,
    message_data: TicketMessageUpdate,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Update a ticket message (only admin messages can be edited)."""
    message = service.update_ticket_message(ticket_id, message_id, message_data)
    if not message:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND, 
            detail="Ticket or message not found, or message cannot be edited"
        )
    
    return SuccessResponse(
        data=message,
        message="Ticket message updated successfully"
    )


@router.delete("/tickets/{ticket_id}/messages/{message_id}", response_model=SuccessResponse[dict])
async def delete_ticket_message(
    ticket_id: int,
    message_id: int,
    service: Annotated[SupportManagementService, Depends(get_support_service)]
):
    """Delete a ticket message (only internal notes can be deleted)."""
    success = service.delete_ticket_message(ticket_id, message_id)
    if not success:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail="Ticket or message not found, or message cannot be deleted"
        )
    
    return SuccessResponse(
        data={"deleted": True, "message_id": message_id},
        message="Ticket message deleted successfully"
    )