"""Support and ticket management service layer."""

import io
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from .schemas import (
    TicketReplyRequest, TicketUpdateRequest, EscalateTicketRequest,
    TicketResponse, TicketDetailResponse, CannedResponse,
    UserInfo, AdminInfo, TicketMessage, TicketTimeline,
    SLAInfo, TicketStatus, TicketPriority, IssueType, UserType,
    InternalNoteRequest, MergeTicketsRequest, CloseTicketRequest,
    SupportAnalytics, TicketSummary, TicketFilters
)


class SupportManagementService:
    """Service class for support ticket management operations."""

    def __init__(self, db: Session, admin_user_id: str):
        self.db = db
        self.admin_user_id = admin_user_id

    def get_tickets(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[TicketStatus] = None,
        priority: Optional[TicketPriority] = None,
        issue_type: Optional[IssueType] = None,
        assigned_to: Optional[str] = None,
        created_after: Optional[datetime] = None,
        search: Optional[str] = None
    ) -> List[TicketResponse]:
        """Get support tickets with filtering."""
        # Mock ticket data
        tickets = self._mock_ticket_data()
        
        # Apply filters
        if status:
            tickets = [t for t in tickets if t.status == status]
        if priority:
            tickets = [t for t in tickets if t.priority == priority]
        if issue_type:
            tickets = [t for t in tickets if t.issue_type == issue_type]
        if search:
            tickets = [
                t for t in tickets 
                if search.lower() in t.subject.lower() or search.lower() in t.description.lower()
            ]
        
        # Apply pagination
        return tickets[skip:skip + limit]

    def get_ticket(self, ticket_id: str) -> Optional[TicketDetailResponse]:
        """Get specific support ticket with full details."""
        tickets = self._mock_ticket_data()
        for ticket in tickets:
            if str(ticket.id) == ticket_id:
                # Convert to detailed response with additional data
                return TicketDetailResponse(
                    **ticket.model_dump(),
                    messages=[],
                    timeline=[],
                    internal_notes=[],
                    related_tickets=[],
                    escalation_history=[],
                    customer_info={},
                    technical_details={}
                )
        return None

    def reply_to_ticket(self, ticket_id: str, reply_data: TicketReplyRequest) -> bool:
        """Reply to support ticket."""
        # Mock reply - in real implementation, save to database
        return True

    def update_ticket(self, ticket_id: str, ticket_data: TicketUpdateRequest) -> Optional[TicketResponse]:
        """Update support ticket."""
        # Mock update - in real implementation, update database
        ticket = self.get_ticket_simple(ticket_id)
        if ticket:
            # Apply updates
            if ticket_data.status:
                ticket.status = ticket_data.status
            if ticket_data.priority:
                ticket.priority = ticket_data.priority
            ticket.updated_at = datetime.utcnow()
            return ticket
        return None

    def get_ticket_simple(self, ticket_id: str) -> Optional[TicketResponse]:
        """Get ticket as simple response."""
        tickets = self._mock_ticket_data()
        for ticket in tickets:
            if str(ticket.id) == ticket_id:
                return ticket
        return None

    def escalate_ticket(self, ticket_id: str, escalation_data: EscalateTicketRequest) -> bool:
        """Escalate support ticket."""
        # Mock escalation - in real implementation, update database
        return True

    def get_canned_responses(
        self,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[CannedResponse]:
        """Get canned responses."""
        # Mock data
        responses = [
            CannedResponse(
                id=1,
                title="Welcome Response",
                content="Thank you for contacting Maya Beauty support. We'll get back to you within 24 hours.",
                category="general",
                tags=["welcome", "general"],
                usage_count=150,
                created_at=datetime(2024, 1, 1),
                created_by=self.admin_user_id,
                is_active=True
            ),
            CannedResponse(
                id=2,
                title="Booking Issue",
                content="We understand your booking concern. Let me help you resolve this immediately.",
                category="booking",
                tags=["booking", "issue"],
                usage_count=85,
                created_at=datetime(2024, 1, 5),
                created_by=self.admin_user_id,
                is_active=True
            )
        ]
        
        # Apply filters
        if category:
            responses = [r for r in responses if r.category == category]
        if search:
            responses = [
                r for r in responses 
                if search.lower() in r.title.lower() or search.lower() in r.content.lower()
            ]
        
        return responses[skip:skip + limit]

    def export_tickets(
        self,
        status: Optional[TicketStatus] = None,
        priority: Optional[TicketPriority] = None,
        issue_type: Optional[IssueType] = None
    ) -> Tuple[io.BytesIO, str]:
        """Export support tickets to Excel."""
        try:
            import pandas as pd
            
            # Get tickets data
            tickets = self.get_tickets(limit=1000, status=status, priority=priority, issue_type=issue_type)
            
            # Convert to DataFrame
            data = []
            for ticket in tickets:
                data.append({
                    "Ticket #": ticket.ticket_number,
                    "Subject": ticket.subject,
                    "Status": ticket.status.value,
                    "Priority": ticket.priority.value,
                    "Issue Type": ticket.issue_type.value,
                    "Customer": ticket.user.name,
                    "Assigned To": ticket.assigned_to.name if ticket.assigned_to else "Unassigned",
                    "Created": ticket.created_at.strftime("%Y-%m-%d %H:%M"),
                    "Last Updated": ticket.updated_at.strftime("%Y-%m-%d %H:%M"),
                    "Messages": ticket.message_count,
                    "SLA Status": "Overdue" if ticket.sla.is_overdue else "On Time"
                })
            
            df = pd.DataFrame(data)
            
            # Create Excel file
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Support Tickets', index=False)
            
            output.seek(0)
            filename = f"support_tickets_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            return output, filename
            
        except ImportError:
            # Fallback: create CSV
            import csv
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                "Ticket #", "Subject", "Status", "Priority", "Issue Type", 
                "Customer", "Assigned To", "Created", "Last Updated"
            ])
            
            # Write data
            tickets = self.get_tickets(limit=1000, status=status, priority=priority, issue_type=issue_type)
            for ticket in tickets:
                writer.writerow([
                    ticket.ticket_number, ticket.subject, ticket.status.value,
                    ticket.priority.value, ticket.issue_type.value,
                    ticket.user.name, ticket.assigned_to.name if ticket.assigned_to else "Unassigned",
                    ticket.created_at.strftime("%Y-%m-%d %H:%M"),
                    ticket.updated_at.strftime("%Y-%m-%d %H:%M")
                ])
            
            # Convert to BytesIO
            csv_content = output.getvalue()
            bytes_output = io.BytesIO(csv_content.encode('utf-8'))
            filename = f"support_tickets_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            return bytes_output, filename

    def _mock_ticket_data(self) -> List[TicketResponse]:
        """Generate mock ticket data."""
        return [
            TicketResponse(
                id=1,
                ticket_number="SUP-001",
                subject="Booking Payment Issue",
                description="Customer unable to complete payment for bridal makeup booking",
                status=TicketStatus.OPEN,
                priority=TicketPriority.HIGH,
                issue_type=IssueType.PAYMENT,
                user=UserInfo(
                    id=101,
                    name="Priya Sharma",
                    email="priya@example.com",
                    phone="+91-9876543210",
                    user_type="customer",
                    registration_date=datetime(2023, 6, 15),
                    total_bookings=5,
                    account_status="active"
                ),
                assigned_to=AdminInfo(
                    id=1,
                    name="Admin User",
                    email="admin@maya.beauty",
                    role="Support Manager",
                    team="Customer Support",
                    online_status=True
                ),
                sla=SLAInfo(
                    response_due_at=datetime(2024, 1, 15, 18, 0),
                    resolution_due_at=datetime(2024, 1, 16, 18, 0),
                    first_response_at=datetime(2024, 1, 15, 16, 30),
                    is_overdue=False,
                    time_to_first_response_minutes=30,
                    time_to_resolution_minutes=None
                ),
                tags=["payment", "urgent", "bridal"],
                message_count=3,
                last_message_at=datetime(2024, 1, 15, 17, 45),
                created_at=datetime(2024, 1, 15, 16, 0),
                updated_at=datetime(2024, 1, 15, 17, 45)
            ),
            TicketResponse(
                id=2,
                ticket_number="SUP-002",
                subject="Artist Verification Delay",
                description="Artist verification taking longer than expected",
                status=TicketStatus.IN_PROGRESS,
                priority=TicketPriority.MEDIUM,
                issue_type=IssueType.VERIFICATION,
                user=UserInfo(
                    id=102,
                    name="Neha Patel",
                    email="neha@example.com",
                    phone="+91-9876543211",
                    user_type="artist",
                    registration_date=datetime(2023, 8, 20),
                    total_bookings=0,
                    account_status="pending_verification"
                ),
                assigned_to=None,
                sla=SLAInfo(
                    response_due_at=datetime(2024, 1, 16, 10, 0),
                    resolution_due_at=datetime(2024, 1, 18, 10, 0),
                    first_response_at=None,
                    is_overdue=True,
                    time_to_first_response_minutes=None,
                    time_to_resolution_minutes=None
                ),
                tags=["verification", "artist"],
                message_count=1,
                last_message_at=datetime(2024, 1, 15, 14, 20),
                created_at=datetime(2024, 1, 15, 14, 20),
                updated_at=datetime(2024, 1, 15, 14, 20)
            )
        ]
        
        summary = TicketSummary(
            total_tickets=len(tickets),
            new_tickets=len([t for t in tickets if t.status == TicketStatus.NEW]),
            open_tickets=len([t for t in tickets if t.status == TicketStatus.OPEN]),
            overdue_tickets=len([t for t in tickets if t.sla.is_overdue]),
            resolved_today=5,
            avg_response_time_hours=2.3,
            customer_satisfaction=4.2
        )
        
        pagination = {
            "total": len(tickets),
            "pages": (len(tickets) + filters.limit - 1) // filters.limit,
            "has_next": filters.page * filters.limit < len(tickets),
            "has_prev": filters.page > 1
        }
        
        # Paginate results
        start_idx = (filters.page - 1) * filters.limit
        end_idx = start_idx + filters.limit
        paginated_tickets = tickets[start_idx:end_idx]
        
        return paginated_tickets, summary, pagination

    def get_ticket_detail(self, ticket_id: int) -> Optional[TicketDetailResponse]:
        """Get detailed information about a specific support ticket."""
        return TicketDetailResponse(
            id=ticket_id,
            ticket_number=f"MAYA-{ticket_id:06d}",
            subject="Unable to complete booking payment",
            description="Customer is experiencing issues with payment processing during booking confirmation.",
            status=TicketStatus.OPEN,
            priority=TicketPriority.HIGH,
            issue_type=IssueType.PAYMENT,
            user=UserInfo(
                id=1,
                name="John Customer",
                email="john@example.com",
                phone="+91-9876543210",
                user_type=UserType.CUSTOMER,
                profile_image="https://example.com/john.jpg",
                is_verified=True,
                registration_date=datetime(2025, 10, 1)
            ),
            assigned_to=AdminInfo(
                id=self.admin_user_id,
                name="Support Agent",
                email="agent@maya.com",
                department="Customer Support",
                role="Support Specialist"
            ),
            sla=SLAInfo(
                response_due_at=datetime.now() + timedelta(hours=2),
                resolution_due_at=datetime.now() + timedelta(hours=24),
                first_response_at=datetime.now() - timedelta(minutes=30),
                is_overdue=False,
                time_to_first_response_minutes=30,
                time_to_resolution_minutes=None
            ),
            tags=["payment", "booking", "technical"],
            message_count=3,
            last_message_at=datetime.now(),
            created_at=datetime.now() - timedelta(hours=2),
            updated_at=datetime.now(),
            messages=[
                TicketMessage(
                    id=1,
                    message="I'm having trouble completing my booking payment. The page keeps loading but never completes.",
                    sender_type="customer",
                    sender_id=1,
                    sender_name="John Customer",
                    is_internal=False,
                    attachments=["https://example.com/screenshot.png"],
                    created_at=datetime.now() - timedelta(hours=2),
                    read_at=datetime.now() - timedelta(hours=1, minutes=30)
                ),
                TicketMessage(
                    id=2,
                    message="Thank you for contacting us. I'll help you resolve this payment issue. Can you please try using a different browser or clearing your cache?",
                    sender_type="admin",
                    sender_id=self.admin_user_id,
                    sender_name="Support Agent",
                    is_internal=False,
                    attachments=[],
                    created_at=datetime.now() - timedelta(hours=1),
                    read_at=datetime.now() - timedelta(minutes=30)
                ),
                TicketMessage(
                    id=3,
                    message="Customer mentioned using Chrome. Need to check payment gateway logs.",
                    sender_type="admin",
                    sender_id=self.admin_user_id,
                    sender_name="Support Agent",
                    is_internal=True,
                    attachments=[],
                    created_at=datetime.now() - timedelta(minutes=45),
                    read_at=None
                )
            ],
            timeline=[
                TicketTimeline(
                    id=1,
                    action="Ticket Created",
                    description="Customer submitted support request",
                    performed_by="System",
                    performed_at=datetime.now() - timedelta(hours=2),
                    metadata={"source": "web_form"}
                ),
                TicketTimeline(
                    id=2,
                    action="Assigned",
                    description="Ticket assigned to Support Agent",
                    performed_by="Auto-Assignment",
                    performed_at=datetime.now() - timedelta(hours=1, minutes=30),
                    metadata={"assignment_rule": "payment_issues"}
                ),
                TicketTimeline(
                    id=3,
                    action="First Response",
                    description="Initial response sent to customer",
                    performed_by="Support Agent",
                    performed_at=datetime.now() - timedelta(hours=1),
                    metadata={"response_time_minutes": 30}
                )
            ],
            internal_notes=[
                {
                    "id": 1,
                    "note": "Customer is using Chrome browser version 119. Payment gateway shows timeout errors.",
                    "created_by": "Support Agent",
                    "created_at": datetime.now() - timedelta(minutes=45)
                }
            ],
            related_tickets=[
                {
                    "id": 123,
                    "ticket_number": "MAYA-000123",
                    "subject": "Payment timeout issues",
                    "status": "resolved",
                    "created_at": datetime.now() - timedelta(days=3)
                }
            ],
            escalation_history=[],
            customer_info={
                "total_bookings": 5,
                "total_spent": 25000,
                "account_status": "active",
                "last_booking": datetime.now() - timedelta(days=15),
                "preferred_contact": "email"
            },
            technical_details={
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "ip_address": "192.168.1.100",
                "session_id": "sess_abc123",
                "error_logs": ["Payment gateway timeout", "Connection reset by peer"]
            }
        )

    def reply_to_ticket(self, ticket_id: int, reply: TicketReplyRequest) -> TicketMessage:
        """Reply to a support ticket."""
        # In production, this would:
        # 1. Create new message record
        # 2. Update ticket status and last activity
        # 3. Send email notification if requested
        # 4. Update SLA timers
        # 5. Log admin action
        
        return TicketMessage(
            id=999,
            message=reply.message,
            sender_type="admin",
            sender_id=self.admin_user_id,
            sender_name="Support Agent",
            is_internal=reply.is_internal,
            attachments=reply.attachments or [],
            created_at=datetime.now(),
            read_at=None
        )

    def add_internal_note(self, ticket_id: int, note: InternalNoteRequest) -> Dict[str, Any]:
        """Add an internal note to a ticket."""
        return {
            "id": 999,
            "note": note.note,
            "created_by": f"admin_{self.admin_user_id}",
            "created_at": datetime.now()
        }

    def update_ticket(self, ticket_id: int, update: TicketUpdateRequest) -> TicketResponse:
        """Update ticket properties."""
        # In production, this would update the ticket in database
        # and trigger appropriate notifications and SLA updates
        
        return self._mock_ticket_data()[0]  # Return updated ticket

    def escalate_ticket(self, ticket_id: int, escalation: EscalateTicketRequest) -> Dict[str, Any]:
        """Escalate a ticket to higher level support."""
        # In production, this would:
        # 1. Update ticket escalation level
        # 2. Reassign to appropriate team/agent
        # 3. Update SLA timers for escalated priority
        # 4. Send escalation notifications
        # 5. Log escalation reason and timeline
        
        return {
            "ticket_id": ticket_id,
            "escalated_to": escalation.escalate_to.value,
            "escalated_by": f"admin_{self.admin_user_id}",
            "escalated_at": datetime.now(),
            "reason": escalation.reason,
            "new_sla": {
                "response_due_minutes": 30 if escalation.urgent else 60,
                "resolution_due_hours": 4 if escalation.urgent else 8
            }
        }

    def merge_tickets(self, merge_request: MergeTicketsRequest) -> Dict[str, Any]:
        """Merge multiple tickets into one primary ticket."""
        # In production, this would:
        # 1. Move all messages from secondary tickets to primary
        # 2. Merge contact information and timeline
        # 3. Close secondary tickets with merge reference
        # 4. Update tags and metadata
        # 5. Notify all participants
        
        return {
            "primary_ticket_id": merge_request.primary_ticket_id,
            "merged_tickets": merge_request.secondary_ticket_ids,
            "merged_by": f"admin_{self.admin_user_id}",
            "merged_at": datetime.now(),
            "reason": merge_request.merge_reason,
            "total_messages_merged": len(merge_request.secondary_ticket_ids) * 3  # Mock count
        }

    def close_ticket(self, ticket_id: int, close_request: CloseTicketRequest) -> Dict[str, Any]:
        """Close a support ticket with resolution summary."""
        # In production, this would:
        # 1. Update ticket status to closed
        # 2. Record resolution summary and category
        # 3. Calculate final SLA metrics
        # 4. Send closure notification to customer
        # 5. Optionally send satisfaction survey
        # 6. Update agent performance metrics
        
        return {
            "ticket_id": ticket_id,
            "closed_by": f"admin_{self.admin_user_id}",
            "closed_at": datetime.now(),
            "resolution_summary": close_request.resolution_summary,
            "resolution_time_hours": 6.5,  # Mock calculation
            "satisfaction_survey_sent": close_request.send_survey,
            "final_status": "closed"
        }

    def get_canned_responses(self, category: Optional[str] = None, page: int = 1, limit: int = 20) -> Tuple[List[CannedResponse], Dict[str, Any]]:
        """Get pre-written canned responses for quick replies."""
        canned_responses = [
            CannedResponse(
                id=i,
                title=f"Payment Issue Resolution {i}",
                content=f"Thank you for contacting us about your payment issue. We understand how frustrating this can be. Let me help you resolve this quickly. Response {i}",
                category="payment" if i % 2 == 0 else "technical",
                tags=["payment", "resolution", "quick"],
                usage_count=50 + i,
                created_by="Support Manager",
                created_at=datetime.now() - timedelta(days=30),
                is_active=True
            )
            for i in range(1, 21)
        ]
        
        if category:
            canned_responses = [r for r in canned_responses if r.category == category]
        
        pagination = {
            "page": page,
            "limit": limit,
            "total": len(canned_responses),
            "pages": (len(canned_responses) + limit - 1) // limit,
            "has_next": page * limit < len(canned_responses),
            "has_prev": page > 1
        }
        
        # Paginate results
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_responses = canned_responses[start_idx:end_idx]
        
        return paginated_responses, pagination

    def get_support_analytics(self, period: str = "this_month") -> SupportAnalytics:
        """Get support performance analytics and metrics."""
        return SupportAnalytics(
            total_tickets=1250,
            open_tickets=85,
            resolved_today=32,
            avg_response_time_minutes=45.5,
            avg_resolution_time_hours=8.2,
            satisfaction_score=4.3,
            escalation_rate=12.5,
            overdue_tickets=8,
            tickets_by_priority={
                "low": 450,
                "medium": 600,
                "high": 150,
                "urgent": 40,
                "critical": 10
            },
            tickets_by_status={
                "new": 25,
                "open": 60,
                "in_progress": 40,
                "resolved": 1100,
                "closed": 25
            },
            tickets_by_issue_type={
                "technical": 400,
                "billing": 300,
                "booking": 250,
                "payment": 200,
                "account": 100
            },
            top_agents=[
                {"name": "Alice Smith", "tickets_resolved": 125, "avg_rating": 4.8},
                {"name": "Bob Johnson", "tickets_resolved": 110, "avg_rating": 4.6},
                {"name": "Carol Davis", "tickets_resolved": 95, "avg_rating": 4.7}
            ],
            resolution_rate=88.0
        )

    def export_tickets(self, filters: TicketFilters) -> bytes:
        """Export filtered tickets to Excel."""
        # Mock Excel generation
        mock_excel_content = b"Mock Excel Content for Support Tickets Export"
        return mock_excel_content

    def _mock_ticket_data(self) -> List[TicketResponse]:
        """Mock ticket data for development."""
        return [
            TicketResponse(
                id=i,
                ticket_number=f"MAYA-{i:06d}",
                subject=f"Support Request {i}",
                description=f"Customer issue description {i}",
                status=TicketStatus.OPEN if i % 3 == 0 else TicketStatus.NEW,
                priority=TicketPriority.HIGH if i % 5 == 0 else TicketPriority.MEDIUM,
                issue_type=IssueType.PAYMENT if i % 2 == 0 else IssueType.TECHNICAL,
                user=UserInfo(
                    id=i,
                    name=f"Customer {i}",
                    email=f"customer{i}@example.com",
                    phone=f"+91-987654321{i}",
                    user_type=UserType.CUSTOMER,
                    profile_image=f"https://example.com/customer{i}.jpg",
                    is_verified=i % 3 == 0,
                    registration_date=datetime.now() - timedelta(days=30 + i)
                ),
                assigned_to=AdminInfo(
                    id=self.admin_user_id,
                    name="Support Agent",
                    email="agent@maya.com",
                    department="Customer Support",
                    role="Support Specialist"
                ) if i % 2 == 0 else None,
                sla=SLAInfo(
                    response_due_at=datetime.now() + timedelta(hours=2 - (i % 3)),
                    resolution_due_at=datetime.now() + timedelta(hours=24 - (i % 5)),
                    first_response_at=datetime.now() - timedelta(minutes=30) if i % 2 == 0 else None,
                    is_overdue=i % 7 == 0,
                    time_to_first_response_minutes=30 + (i % 60) if i % 2 == 0 else None,
                    time_to_resolution_minutes=None
                ),
                tags=["urgent"] if i % 5 == 0 else ["standard"],
                message_count=2 + (i % 5),
                last_message_at=datetime.now() - timedelta(minutes=30 + (i % 120)),
                created_at=datetime.now() - timedelta(hours=2 + i),
                updated_at=datetime.now() - timedelta(minutes=15 + (i % 30))
            )
            for i in range(1, 31)
        ]
    
    def add_internal_note(self, ticket_id: int, note: str) -> bool:
        """Add internal note to ticket (only visible to admin users)"""
        # In real implementation, save to database
        # For now, return success
        return True
    
    def merge_tickets(self, primary_ticket_id: int, secondary_ticket_ids: List[int], merge_reason: str) -> Dict[str, Any]:
        """Merge multiple tickets into a primary ticket"""
        # In real implementation:
        # 1. Validate all tickets exist and can be merged
        # 2. Move all messages from secondary tickets to primary
        # 3. Update references and close secondary tickets
        # 4. Add merge activity to ticket history
        
        return {
            "primary_ticket_id": primary_ticket_id,
            "merged_ticket_ids": secondary_ticket_ids,
            "merge_summary": f"Successfully merged {len(secondary_ticket_ids)} tickets. Reason: {merge_reason}",
            "created_at": datetime.now()
        }
    
    def close_ticket(self, ticket_id: int, resolution_summary: str, send_survey: bool, resolution_category: Optional[str] = None) -> bool:
        """Close ticket with resolution summary"""
        # In real implementation:
        # 1. Update ticket status to RESOLVED
        # 2. Add resolution summary to ticket
        # 3. Send customer satisfaction survey if requested
        # 4. Update SLA completion metrics
        # 5. Notify stakeholders
        
        return True
    
    def get_support_analytics(self, timeframe: str = "this_month") -> Dict[str, Any]:
        """Get comprehensive support analytics and performance metrics"""
        # Mock analytics data based on timeframe
        base_multiplier = 1.0
        if timeframe == "today":
            base_multiplier = 0.1
        elif timeframe == "this_week":
            base_multiplier = 0.3
        elif timeframe == "last_month":
            base_multiplier = 0.9
        elif timeframe == "last_3_months":
            base_multiplier = 2.5
        
        total_tickets = int(500 * base_multiplier)
        open_tickets = int(total_tickets * 0.15)
        resolved_today = int(25 * base_multiplier)
        
        return {
            "timeframe": timeframe,
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "resolved_today": resolved_today,
            "avg_response_time_minutes": 45.5,
            "avg_resolution_time_hours": 8.2,
            "satisfaction_score": 4.6,
            "escalation_rate": 0.12,
            "overdue_tickets": int(open_tickets * 0.1),
            "tickets_by_priority": {
                "low": int(total_tickets * 0.4),
                "medium": int(total_tickets * 0.35),
                "high": int(total_tickets * 0.2),
                "critical": int(total_tickets * 0.05)
            },
            "tickets_by_status": {
                "new": int(total_tickets * 0.05),
                "open": int(total_tickets * 0.1),
                "in_progress": int(total_tickets * 0.08),
                "waiting_customer": int(total_tickets * 0.02),
                "resolved": int(total_tickets * 0.7),
                "closed": int(total_tickets * 0.05)
            },
            "tickets_by_issue_type": {
                "booking": int(total_tickets * 0.3),
                "payment": int(total_tickets * 0.25),
                "account": int(total_tickets * 0.2),
                "technical": int(total_tickets * 0.15),
                "general": int(total_tickets * 0.1)
            },
            "agent_performance": [
                {
                    "agent_id": 1,
                    "agent_name": "Sarah Johnson",
                    "tickets_handled": int(80 * base_multiplier),
                    "avg_response_time_minutes": 35.2,
                    "avg_resolution_time_hours": 6.8,
                    "satisfaction_score": 4.8,
                    "escalation_count": int(3 * base_multiplier)
                },
                {
                    "agent_id": 2,
                    "agent_name": "Mike Chen",
                    "tickets_handled": int(75 * base_multiplier),
                    "avg_response_time_minutes": 42.1,
                    "avg_resolution_time_hours": 7.5,
                    "satisfaction_score": 4.7,
                    "escalation_count": int(2 * base_multiplier)
                },
                {
                    "agent_id": 3,
                    "agent_name": "Emma Davis",
                    "tickets_handled": int(95 * base_multiplier),
                    "avg_response_time_minutes": 28.5,
                    "avg_resolution_time_hours": 5.9,
                    "satisfaction_score": 4.9,
                    "escalation_count": int(1 * base_multiplier)
                }
            ],
            "resolution_rate": 0.85,
            "first_response_sla": 0.92,  # 92% of tickets responded within SLA
            "resolution_sla": 0.88  # 88% of tickets resolved within SLA
        }