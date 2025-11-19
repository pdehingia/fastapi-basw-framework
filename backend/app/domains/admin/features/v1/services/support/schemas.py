"""Support and ticket management schemas."""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TicketStatus(str, Enum):
    NEW = "new"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_FOR_CUSTOMER = "waiting_for_customer"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"


class IssueType(str, Enum):
    TECHNICAL = "technical"
    BILLING = "billing"
    BOOKING = "booking"
    ACCOUNT = "account"
    PAYMENT = "payment"
    REFUND = "refund"
    VERIFICATION = "verification"
    PLATFORM = "platform"
    FEATURE_REQUEST = "feature_request"
    BUG_REPORT = "bug_report"
    COMPLAINT = "complaint"
    GENERAL = "general"


class TicketCategory(str, Enum):
    BOOKING_ISSUES = "booking_issues"
    PAYMENT_PROBLEMS = "payment_problems"
    ACCOUNT_MANAGEMENT = "account_management"
    TECHNICAL_SUPPORT = "technical_support"
    BILLING_INQUIRIES = "billing_inquiries"
    PLATFORM_FEEDBACK = "platform_feedback"
    VERIFICATION_HELP = "verification_help"
    GENERAL_INQUIRY = "general_inquiry"


class UserType(str, Enum):
    CUSTOMER = "customer"
    ARTIST = "artist"
    ACADEMY = "academy"
    GUEST = "guest"


class EscalationLevel(str, Enum):
    LEVEL_1 = "level_1"  # Standard support
    LEVEL_2 = "level_2"  # Technical specialist
    LEVEL_3 = "level_3"  # Senior technical
    MANAGER = "manager"  # Support manager
    DIRECTOR = "director"  # Support director


# Request Schemas
class TicketFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    issue_type: Optional[IssueType] = None
    assigned_to: Optional[int] = None
    user_type: Optional[UserType] = None
    created_date_start: Optional[datetime] = None
    created_date_end: Optional[datetime] = None
    search: Optional[str] = Field(None, description="Search in ticket number, subject, or description")
    overdue_only: Optional[bool] = Field(default=False)


class TicketReplyRequest(BaseModel):
    message: str = Field(..., min_length=10, max_length=5000)
    send_email: bool = Field(default=True, description="Send email notification to customer")
    attachments: Optional[List[str]] = Field(None, description="List of attachment URLs")
    is_internal: bool = Field(default=False, description="Internal note visible only to admins")


class InternalNoteRequest(BaseModel):
    note: str = Field(..., min_length=5, max_length=2000)


class TicketUpdateRequest(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assigned_to: Optional[int] = None
    issue_type: Optional[IssueType] = None
    tags: Optional[List[str]] = None


class EscalateTicketRequest(BaseModel):
    escalate_to: EscalationLevel
    reason: str = Field(..., min_length=10, max_length=500)
    assign_to: Optional[int] = Field(None, description="Specific admin to assign to")
    urgent: bool = Field(default=False, description="Mark as urgent escalation")


class MergeTicketsRequest(BaseModel):
    primary_ticket_id: int = Field(..., description="Primary ticket to merge into")
    secondary_ticket_ids: List[int] = Field(..., min_items=1, max_items=10, description="Tickets to merge")
    merge_reason: str = Field(..., min_length=10, max_length=500)


class CloseTicketRequest(BaseModel):
    resolution_summary: str = Field(..., min_length=20, max_length=1000)
    send_survey: bool = Field(default=True, description="Send satisfaction survey to customer")
    resolution_category: Optional[str] = Field(None, description="Category of resolution")


class AnalyticsTimeframe(str, Enum):
    TODAY = "today"
    THIS_WEEK = "this_week"  
    THIS_MONTH = "this_month"
    LAST_MONTH = "last_month"
    LAST_3_MONTHS = "last_3_months"


class AgentPerformance(BaseModel):
    agent_id: int
    agent_name: str
    tickets_handled: int
    avg_response_time_minutes: float
    avg_resolution_time_hours: float
    satisfaction_score: float
    escalation_count: int


class SupportAnalyticsResponse(BaseModel):
    timeframe: AnalyticsTimeframe
    total_tickets: int
    open_tickets: int
    resolved_today: int
    avg_response_time_minutes: float
    avg_resolution_time_hours: float
    satisfaction_score: float
    escalation_rate: float
    overdue_tickets: int
    tickets_by_priority: Dict[str, int]
    tickets_by_status: Dict[str, int]
    tickets_by_issue_type: Dict[str, int]
    agent_performance: List[AgentPerformance]
    resolution_rate: float
    first_response_sla: float
    resolution_sla: float


class MergeTicketsResponse(BaseModel):
    primary_ticket_id: int
    merged_ticket_ids: List[int]
    merge_summary: str
    created_at: datetime


# Response Schemas
class UserInfo(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    user_type: UserType
    profile_image: Optional[str]
    is_verified: bool
    registration_date: datetime


class AdminInfo(BaseModel):
    id: int
    name: str
    email: str
    department: str
    role: str


class TicketMessage(BaseModel):
    id: int
    message: str
    sender_type: str  # customer, admin
    sender_id: int
    sender_name: str
    is_internal: bool
    attachments: List[str]
    created_at: datetime
    read_at: Optional[datetime]


class TicketTimeline(BaseModel):
    id: int
    action: str
    description: str
    performed_by: str
    performed_at: datetime
    metadata: Optional[Dict[str, Any]]


class SLAInfo(BaseModel):
    response_due_at: datetime
    resolution_due_at: datetime
    first_response_at: Optional[datetime]
    is_overdue: bool
    time_to_first_response_minutes: Optional[int]
    time_to_resolution_minutes: Optional[int]


class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    subject: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    issue_type: IssueType
    user: UserInfo
    assigned_to: Optional[AdminInfo]
    sla: SLAInfo
    tags: List[str]
    message_count: int
    last_message_at: datetime
    created_at: datetime
    updated_at: datetime


class TicketDetailResponse(TicketResponse):
    messages: List[TicketMessage]
    timeline: List[TicketTimeline]
    internal_notes: List[Dict[str, Any]]
    related_tickets: List[Dict[str, Any]]
    escalation_history: List[Dict[str, Any]]
    customer_info: Dict[str, Any]
    technical_details: Optional[Dict[str, Any]]


class CannedResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    tags: List[str]
    usage_count: int
    created_by: str
    created_at: datetime
    is_active: bool


class SupportAnalytics(BaseModel):
    total_tickets: int
    open_tickets: int
    resolved_today: int
    avg_response_time_minutes: float
    avg_resolution_time_hours: float
    satisfaction_score: float
    escalation_rate: float
    overdue_tickets: int
    tickets_by_priority: Dict[str, int]
    tickets_by_status: Dict[str, int]
    tickets_by_issue_type: Dict[str, int]
    top_agents: List[Dict[str, Any]]
    resolution_rate: float


class TicketSummary(BaseModel):
    total_tickets: int
    new_tickets: int
    open_tickets: int
    overdue_tickets: int
    resolved_today: int
    avg_response_time_hours: float
    customer_satisfaction: float


# List Response Schemas
class TicketListResponse(BaseModel):
    tickets: List[TicketResponse]
    summary: TicketSummary
    pagination: Dict[str, Any]


class CannedResponseListResponse(BaseModel):
    canned_responses: List[CannedResponse]
    categories: List[str]
    pagination: Dict[str, Any]


# Support Ticket Message Schemas
class TicketMessageCreate(BaseModel):
    """Schema for creating a ticket message."""
    message: str = Field(..., min_length=1, max_length=5000, description="Message content")
    is_internal: bool = Field(False, description="Whether message is internal note")
    attachments: Optional[List[str]] = Field(None, description="Attachment URLs")


class TicketMessageUpdate(BaseModel):
    """Schema for updating a ticket message."""
    message: Optional[str] = Field(None, min_length=1, max_length=5000)
    is_internal: Optional[bool] = None


class TicketMessageResponse(BaseModel):
    """Schema for ticket message response."""
    id: int
    ticket_id: int
    message: str
    sender_type: str
    sender_id: int
    sender_name: str
    is_internal: bool
    attachments: List[str]
    created_at: datetime
    updated_at: Optional[datetime]
    read_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class TicketMessageListResponse(BaseModel):
    """Schema for paginated ticket message list."""
    messages: List[TicketMessageResponse]
    total: int
    ticket_id: int