# MAYA ADMIN PANELS - COMPLETE TECHNICAL BREAKDOWN
## Backend APIs | Frontend Flows | Database Changes

**Document Version:** 1.0  
**Date:** November 12, 2025

---

## EXECUTIVE SUMMARY

This document provides a complete technical breakdown of the MAYA Admin Panels (Academy Dashboard and Super Admin Panel) into:

1. **Backend APIs** (~140 endpoints total)
2. **Frontend Flow Stories** (User stories with acceptance criteria)
3. **Database Schema Changes** (14 new tables + 4 modifications)

### Quick Stats
- **Academy Dashboard:** ~60 API endpoints, 7 main sections
- **Super Admin Panel:** ~80 API endpoints, 10 main sections
- **New PostgreSQL Tables:** 14
- **Modified PostgreSQL Tables:** 4
- **New MongoDB Collections:** 2
- **Development Timeline:** 3 months (Month 3-5)

---

## TABLE OF CONTENTS

### PART 1: ACADEMY DASHBOARD
1. [Dashboard Home](#academy-dashboard-home)
2. [Student Management](#academy-student-management)
3. [Performance Analytics](#academy-performance-analytics)
4. [Revenue Dashboard](#academy-revenue-dashboard)
5. [Course Promotion & PPC](#academy-course-promotion-ppc)
6. [Admission Inquiries](#academy-admission-inquiries)

### PART 2: SUPER ADMIN PANEL
1. [User Management](#admin-user-management)
2. [Booking Management](#admin-booking-management)
3. [Payment & Wallet](#admin-payment-wallet)
4. [Reviews & Ratings](#admin-reviews-ratings)
5. [Artist Verification](#admin-artist-verification)
6. [Promotions & Marketing](#admin-promotions-marketing)
7. [Support & Tickets](#admin-support-tickets)
8. [Analytics & Reports](#admin-analytics-reports)
9. [System Configuration](#admin-system-configuration)
10. [Admin User Management](#admin-admin-management)

### PART 3: DATABASE CHANGES
1. [New Tables](#new-tables)
2. [Table Modifications](#table-modifications)
3. [MongoDB Collections](#mongodb-collections)

### PART 4: IMPLEMENTATION GUIDE
1. [API Standards](#api-standards)
2. [Frontend Architecture](#frontend-architecture)
3. [Implementation Checklist](#implementation-checklist)
4. [Testing Strategy](#testing-strategy)

---

# PART 1: ACADEMY DASHBOARD

## 1. ACADEMY DASHBOARD HOME <a name="academy-dashboard-home"></a>

### Backend APIs (5 endpoints)

#### 1.1 Get Dashboard Statistics
```
GET /api/v1/academy/dashboard/stats?time_period=this_month
Auth: Bearer Token (Academy Role)
Response: {
  total_students_onboarded: 156,
  trend_from_last_month: 12.5,
  active_students_this_month: 87,
  total_revenue_earned: {...},
  average_student_rating: 4.6
}
```

#### 1.2 Get Activity Feed
```
GET /api/v1/academy/activity-feed?limit=10
Response: Recent activities (student registered, booking completed, etc.)
```

#### 1.3 Get Earnings Trend
```
GET /api/v1/academy/analytics/earnings-trend?period=6_months
Response: Monthly earnings data for charts
```

#### 1.4 Get Bookings Trend
```
GET /api/v1/academy/analytics/bookings-trend
Response: Monthly booking counts
```

#### 1.5 Get Course Distribution
```
GET /api/v1/academy/analytics/course-distribution
Response: Student distribution by course
```

### Frontend Flow

**Story:** Dashboard Home View Load  
**Acceptance Criteria:**
- Dashboard loads within 2 seconds
- All widget cards display current data
- Charts render with smooth animations
- Activity feed shows last 10 activities
- Color-coded rating system (green >4.5, yellow 3.5-4.5, red <3.5)

**Components:**
- `DashboardHome.jsx`
- `StatCard.jsx`
- `EarningsTrendChart.jsx`
- `BookingsChart.jsx`
- `ActivityFeed.jsx`

---

## 2. ACADEMY STUDENT MANAGEMENT <a name="academy-student-management"></a>

### Backend APIs (11 endpoints)

#### 2.1 Get Student List
```
GET /api/v1/academy/students?page=1&limit=20&search=&course=&status=
Response: Paginated student list with filters
```

#### 2.2 Add Student
```
POST /api/v1/academy/students
Body: { full_name, email, phone, course_id, graduation_date, photo, certificate }
Response: Student created, invitation sent
```

#### 2.3 Bulk Upload Students
```
POST /api/v1/academy/students/bulk-upload
Body: CSV file
Response: Import summary with success/errors
```

#### 2.4 Get Student Detail
```
GET /api/v1/academy/students/{student_id}
Response: Complete student profile with tabs data
```

#### 2.5 Get Student Booking History
```
GET /api/v1/academy/students/{student_id}/bookings?page=1
Response: Booking history with pagination
```

#### 2.6 Get Student Reviews
```
GET /api/v1/academy/students/{student_id}/reviews
Response: All reviews with rating distribution
```

#### 2.7 Get Student Earnings
```
GET /api/v1/academy/students/{student_id}/earnings?period=monthly
Response: Monthly earnings and transactions
```

#### 2.8 Update Student
```
PUT /api/v1/academy/students/{student_id}
Body: Updated student data
```

#### 2.9 Remove Student
```
DELETE /api/v1/academy/students/{student_id}
Response: Student unlinked from academy
```

#### 2.10 Send Notification
```
POST /api/v1/academy/students/{student_id}/notify
Body: { title, message, channels: [push, email, sms] }
```

#### 2.11 Export Students
```
GET /api/v1/academy/students/export?filters...
Response: Excel file download
```

### Frontend Flows

**Story 2.1:** View Student List  
**Components:** `StudentList.jsx`, `StudentTable.jsx`, `StudentFilters.jsx`

**Story 2.2:** Add New Student  
**Components:** `AddStudentForm.jsx`, `FileUploadField.jsx`

**Story 2.3:** Bulk Upload Students  
**Components:** `BulkUploadStudents.jsx`, `CSVUploadZone.jsx`

**Story 2.4:** View Student Detail (5 tabs)  
**Components:** `StudentDetail.jsx`, `StudentProfile.jsx`, `StudentPerformance.jsx`, `StudentBookingHistory.jsx`, `StudentReviews.jsx`, `StudentEarnings.jsx`

---

## 3. ACADEMY PERFORMANCE ANALYTICS <a name="academy-performance-analytics"></a>

### Backend APIs (7 endpoints)

#### 3.1 Top Performing Students
```
GET /api/v1/academy/analytics/top-students?limit=10&metric=earnings
Response: Leaderboard of top students
```

#### 3.2 Course-wise Performance
```
GET /api/v1/academy/analytics/course-performance
Response: Performance metrics by course
```

#### 3.3 Monthly Comparison
```
GET /api/v1/academy/analytics/monthly-comparison
Response: Current vs last month comparison
```

#### 3.4 Student Funnel
```
GET /api/v1/academy/analytics/student-funnel
Response: Conversion funnel data
```

#### 3.5 Geographic Distribution
```
GET /api/v1/academy/analytics/geographic-distribution
Response: City-wise student and booking distribution
```

#### 3.6 Time-based Analysis
```
GET /api/v1/academy/analytics/time-analysis
Response: Peak days, hours, months analysis
```

#### 3.7 Service Type Analysis
```
GET /api/v1/academy/analytics/service-analysis
Response: Booking breakdown by service type
```

### Frontend Flows

**Story:** View Performance Analytics  
**Components:** `PerformanceAnalytics.jsx`, `TopStudentsLeaderboard.jsx`, `CoursePerformanceTable.jsx`, `StudentFunnelChart.jsx`, `GeographicMap.jsx`

---

## 4. ACADEMY REVENUE DASHBOARD <a name="academy-revenue-dashboard"></a>

### Backend APIs (8 endpoints)

#### 4.1 Revenue Summary
```
GET /api/v1/academy/revenue/summary
Response: Total revenue, this month, pending payout
```

#### 4.2 Monthly Revenue Trend
```
GET /api/v1/academy/revenue/monthly-trend?months=12
Response: 12-month revenue data
```

#### 4.3 Student-wise Earnings
```
GET /api/v1/academy/revenue/student-earnings?page=1
Response: Each student's contribution to revenue
```

#### 4.4 Payout History
```
GET /api/v1/academy/revenue/payout-history?page=1
Response: All past payouts with UTR details
```

#### 4.5 Download Payout Statement
```
GET /api/v1/academy/revenue/payout-statement/{payout_id}
Response: PDF download
```

#### 4.6 Download Invoice
```
GET /api/v1/academy/revenue/invoice/{payout_id}
Response: PDF invoice
```

#### 4.7 Email Invoice
```
POST /api/v1/academy/revenue/invoice/{payout_id}/email
Body: { recipient_email }
```

#### 4.8 Export Student Earnings
```
GET /api/v1/academy/revenue/student-earnings/export
Response: Excel download
```

### Frontend Flows

**Story:** View Revenue Dashboard  
**Components:** `RevenueDashboard.jsx`, `RevenueSummaryCards.jsx`, `MonthlyRevenueChart.jsx`, `StudentEarningsTable.jsx`, `PayoutHistory.jsx`

---

## 5. ACADEMY COURSE PROMOTION & PPC <a name="academy-course-promotion-ppc"></a>

### Backend APIs (9 endpoints)

#### 5.1 Get Courses
```
GET /api/v1/academy/courses?page=1&status=active
Response: Course list
```

#### 5.2 Add/Edit Course
```
POST /api/v1/academy/courses
PUT /api/v1/academy/courses/{course_id}
Body: Course details with images, brochure, testimonials
```

#### 5.3 Deactivate Course
```
PATCH /api/v1/academy/courses/{course_id}/deactivate
```

#### 5.4 Get Course Inquiries
```
GET /api/v1/academy/courses/{course_id}/inquiries
Response: All inquiries for this course
```

#### 5.5 Get PPC Campaigns
```
GET /api/v1/academy/ppc/campaigns?status=active
Response: All campaigns with performance metrics
```

#### 5.6 Create PPC Campaign
```
POST /api/v1/academy/ppc/campaigns
Body: 5-step campaign data (details, targeting, budget, creative, review)
Response: Campaign created, pending approval
```

#### 5.7 Get Campaign Performance
```
GET /api/v1/academy/ppc/campaigns/{campaign_id}/performance
Response: Impressions, clicks, CPC, conversions
```

#### 5.8 Update Campaign
```
PATCH /api/v1/academy/ppc/campaigns/{campaign_id}
Body: { action: pause|resume|update_budget, daily_budget }
```

#### 5.9 Download Campaign Report
```
GET /api/v1/academy/ppc/campaigns/{campaign_id}/report
Response: PDF/Excel download
```

### Frontend Flows

**Story:** Create PPC Campaign (5-step wizard)  
**Components:** `CreateCampaignWizard.jsx`, `CampaignDetailsStep.jsx`, `TargetingStep.jsx`, `BudgetStep.jsx`, `CreativeStep.jsx`, `ReviewStep.jsx`, `AdPreview.jsx`

---

## 6. ACADEMY ADMISSION INQUIRIES <a name="academy-admission-inquiries"></a>

### Backend APIs (9 endpoints)

#### 6.1 Get Inquiry List
```
GET /api/v1/academy/inquiries?page=1&status=new&source=ppc_ad
Response: Filtered inquiry list
```

#### 6.2 Get Inquiry Detail
```
GET /api/v1/academy/inquiries/{inquiry_id}
Response: Full inquiry with timeline, notes, reminders
```

#### 6.3 Update Inquiry Status
```
PATCH /api/v1/academy/inquiries/{inquiry_id}/status
Body: { status: interested, note }
```

#### 6.4 Assign Inquiry
```
PATCH /api/v1/academy/inquiries/{inquiry_id}/assign
Body: { assigned_to: user_id }
```

#### 6.5 Add Note
```
POST /api/v1/academy/inquiries/{inquiry_id}/notes
Body: { content, is_internal }
```

#### 6.6 Add Follow-up Reminder
```
POST /api/v1/academy/inquiries/{inquiry_id}/reminders
Body: { reminder_date, note }
```

#### 6.7 Send Email Template
```
POST /api/v1/academy/inquiries/{inquiry_id}/send-email
Body: { template_id, custom_variables }
```

#### 6.8 Mark as Enrolled
```
PATCH /api/v1/academy/inquiries/{inquiry_id}/mark-enrolled
Body: { enrollment_date, fees_paid }
```

#### 6.9 Export Inquiries
```
GET /api/v1/academy/inquiries/export
Response: Excel download
```

### Frontend Flows

**Story:** Manage Inquiries  
**Components:** `InquiryList.jsx`, `InquiryDetail.jsx`, `InquiryTimeline.jsx`, `AddNoteForm.jsx`, `AddReminderModal.jsx`, `SendEmailModal.jsx`

---

# PART 2: SUPER ADMIN PANEL

## 1. ADMIN USER MANAGEMENT <a name="admin-user-management"></a>

### Backend APIs (7 endpoints)

#### 1.1 Get Users List
```
GET /api/v1/admin/users?user_type=artist&page=1&search=&status=active
Response: Paginated user list with stats
```

#### 1.2 Get User Detail
```
GET /api/v1/admin/users/{user_id}
Response: Complete user profile (role-specific data)
```

#### 1.3 Verify User
```
POST /api/v1/admin/users/{user_id}/verify
Body: { verification_type, status, notes }
```

#### 1.4 Block/Unblock User
```
POST /api/v1/admin/users/{user_id}/block
Body: { action, reason, duration, block_until }
```

#### 1.5 Delete User Account
```
DELETE /api/v1/admin/users/{user_id}
Body: { reason, hard_delete }
```

#### 1.6 Get User Activity Log
```
GET /api/v1/admin/users/{user_id}/activity-log?page=1
Response: Complete activity history
```

#### 1.7 Export Users
```
GET /api/v1/admin/users/export
Response: Excel download
```

### Frontend Flows

**Story:** Manage All Users  
**Components:** `UserManagement.jsx`, `UserTypeTabs.jsx`, `UserTable.jsx`, `UserDetail.jsx`, `VerifyUserModal.jsx`, `BlockUserModal.jsx`

---

## 2. ADMIN BOOKING MANAGEMENT <a name="admin-booking-management"></a>

### Backend APIs (5 endpoints)

#### 2.1 Get Bookings List
```
GET /api/v1/admin/bookings?page=1&status=&occasion_type=&city=
Response: Paginated bookings with summary
```

#### 2.2 Get Booking Detail
```
GET /api/v1/admin/bookings/{booking_id}
Response: Complete booking details with timeline
```

#### 2.3 Update Booking Status
```
PATCH /api/v1/admin/bookings/{booking_id}/status
Body: { status, reason, refund_amount, notes }
```

#### 2.4 Resolve Booking Dispute
```
POST /api/v1/admin/bookings/{booking_id}/resolve-dispute
Body: { resolution, refund_percentage, notes }
```

#### 2.5 Export Bookings
```
GET /api/v1/admin/bookings/export
Response: Excel download
```

### Frontend Flows

**Story:** Manage Bookings  
**Components:** `BookingManagement.jsx`, `BookingTable.jsx`, `BookingDetail.jsx`, `BookingTimeline.jsx`, `PricingBreakdown.jsx`

---

## 3. ADMIN PAYMENT & WALLET <a name="admin-payment-wallet"></a>

### Backend APIs (8 endpoints)

#### 3.1 Get Transactions
```
GET /api/v1/admin/payments/transactions?page=1&type=&status=
Response: Transaction list with summary
```

#### 3.2 Get Transaction Detail
```
GET /api/v1/admin/payments/transactions/{transaction_id}
Response: Complete transaction details
```

#### 3.3 Get Wallets Overview
```
GET /api/v1/admin/payments/wallets?user_type=artist
Response: All wallets with balances
```

#### 3.4 Get Wallet Transactions
```
GET /api/v1/admin/payments/wallets/{wallet_id}/transactions
Response: Transaction history
```

#### 3.5 Process Withdrawal Request
```
POST /api/v1/admin/payments/withdrawals/{withdrawal_id}/process
Body: { action: approve|reject, utr_number, rejection_reason }
```

#### 3.6 Manual Wallet Adjustment
```
POST /api/v1/admin/payments/wallets/{wallet_id}/adjust
Body: { type: credit|debit, amount, reason, notes }
```

#### 3.7 Get Withdrawal Requests
```
GET /api/v1/admin/payments/withdrawal-requests?status=pending
Response: Pending withdrawals
```

#### 3.8 Export Transactions
```
GET /api/v1/admin/payments/transactions/export
Response: Excel download
```

### Frontend Flows

**Story:** Manage Payments  
**Components:** `PaymentManagement.jsx`, `TransactionTable.jsx`, `WalletManagement.jsx`, `WithdrawalRequests.jsx`, `ApproveWithdrawalModal.jsx`

---

## 4. ADMIN REVIEWS & RATINGS <a name="admin-reviews-ratings"></a>

### Backend APIs (7 endpoints)

#### 4.1 Get Reviews List
```
GET /api/v1/admin/reviews?page=1&rating=&moderation_status=
Response: Reviews with moderation status
```

#### 4.2 Get Review Detail
```
GET /api/v1/admin/reviews/{review_id}
Response: Complete review with moderation history
```

#### 4.3 Moderate Review
```
POST /api/v1/admin/reviews/{review_id}/moderate
Body: { action: approve|flag|remove, reason, notes }
```

#### 4.4 Remove Review Images
```
POST /api/v1/admin/reviews/{review_id}/remove-images
Body: { image_urls, reason }
```

#### 4.5 Respond to Review
```
POST /api/v1/admin/reviews/{review_id}/respond
Body: { response, artist_id }
```

#### 4.6 Get Flagged Reviews
```
GET /api/v1/admin/reviews/flagged
Response: Reviews requiring moderation
```

#### 4.7 Export Reviews
```
GET /api/v1/admin/reviews/export
Response: Excel download
```

### Frontend Flows

**Story:** Moderate Reviews  
**Components:** `ReviewManagement.jsx`, `ReviewTable.jsx`, `ReviewDetail.jsx`, `ModerateReviewModal.jsx`, `FlaggedReviewsQueue.jsx`

---

## 5. ADMIN ARTIST VERIFICATION <a name="admin-artist-verification"></a>

### Backend APIs (7 endpoints)

#### 5.1 Get Verification Queue
```
GET /api/v1/admin/artists/verification-queue?status=pending
Response: Pending verifications
```

#### 5.2 Get Verification Detail
```
GET /api/v1/admin/artists/verification/{request_id}
Response: Documents and artist details
```

#### 5.3 Approve/Reject Verification
```
POST /api/v1/admin/artists/verification/{request_id}/decision
Body: { decision, rejection_reason, notes, verification_badge }
```

#### 5.4 Get Portfolio Moderation Queue
```
GET /api/v1/admin/artists/portfolio/moderation-queue?status=pending
Response: Pending portfolio images
```

#### 5.5 Moderate Portfolio Image
```
POST /api/v1/admin/artists/portfolio/{image_id}/moderate
Body: { action, rejection_reason, notes }
```

#### 5.6 Bulk Moderate Portfolio
```
POST /api/v1/admin/artists/portfolio/bulk-moderate
Body: { image_ids, action, rejection_reason }
```

#### 5.7 Export Verification Requests
```
GET /api/v1/admin/artists/verification/export
Response: Excel download
```

### Frontend Flows

**Story:** Process Verifications  
**Components:** `VerificationQueue.jsx`, `VerificationDetail.jsx`, `DocumentViewer.jsx`, `PortfolioModerationQueue.jsx`, `PortfolioImageGrid.jsx`

---

## 6. ADMIN PROMOTIONS & MARKETING <a name="admin-promotions-marketing"></a>

### Backend APIs (10 endpoints)

#### 6.1-6.5 Promo Code Management
- Get promo codes list
- Create promo code
- Update promo code
- Deactivate promo code
- Get promo code analytics

#### 6.6-6.8 Email Campaigns
- Get email campaigns
- Create email campaign
- Get email templates

#### 6.9-6.10 SMS Campaigns
- Get SMS history
- Send SMS broadcast

### Frontend Flows

**Story:** Manage Marketing  
**Components:** `PromoCodeManagement.jsx`, `EmailCampaigns.jsx`, `CreateEmailCampaignModal.jsx`, `SMSBroadcast.jsx`

---

## 7. ADMIN SUPPORT & TICKETS <a name="admin-support-tickets"></a>

### Backend APIs (11 endpoints)

#### 7.1 Get Support Tickets
```
GET /api/v1/admin/support/tickets?status=&priority=&assigned_to=
Response: Tickets with SLA tracking
```

#### 7.2 Get Ticket Detail
```
GET /api/v1/admin/support/tickets/{ticket_id}
Response: Complete ticket with conversation
```

#### 7.3 Reply to Ticket
```
POST /api/v1/admin/support/tickets/{ticket_id}/reply
Body: { message, send_email, attachments }
```

#### 7.4 Add Internal Note
```
POST /api/v1/admin/support/tickets/{ticket_id}/internal-note
Body: { note }
```

#### 7.5 Update Ticket
```
PATCH /api/v1/admin/support/tickets/{ticket_id}
Body: { status, priority, assigned_to }
```

#### 7.6 Escalate Ticket
```
POST /api/v1/admin/support/tickets/{ticket_id}/escalate
Body: { escalate_to, reason }
```

#### 7.7 Merge Tickets
```
POST /api/v1/admin/support/tickets/merge
Body: { primary_ticket_id, secondary_ticket_ids }
```

#### 7.8 Close Ticket
```
POST /api/v1/admin/support/tickets/{ticket_id}/close
Body: { resolution_summary, send_survey }
```

#### 7.9 Get Canned Responses
```
GET /api/v1/admin/support/canned-responses?category=
Response: Pre-written responses
```

#### 7.10 Get Support Analytics
```
GET /api/v1/admin/support/analytics?period=this_month
Response: Performance metrics
```

#### 7.11 Export Tickets
```
GET /api/v1/admin/support/tickets/export
Response: Excel download
```

### Frontend Flows

**Story:** Manage Support  
**Components:** `SupportTickets.jsx`, `TicketDetail.jsx`, `TicketReplyForm.jsx`, `CannedResponseSelector.jsx`, `SupportAnalytics.jsx`

---

## 8. ADMIN ANALYTICS & REPORTS <a name="admin-analytics-reports"></a>

### Backend APIs (5 endpoints)

#### 8.1 User Analytics
```
GET /api/v1/admin/analytics/users?period=30_days
Response: Growth, acquisition, retention, active users
```

#### 8.2 Booking Analytics
```
GET /api/v1/admin/analytics/bookings?period=30_days
Response: Trends, occasion types, time patterns
```

#### 8.3 Revenue Reports
```
GET /api/v1/admin/analytics/revenue?period=12_months
Response: Revenue trends, sources, city-wise, profit margins
```

#### 8.4 Create Custom Report
```
POST /api/v1/admin/analytics/custom-report
Body: { metrics, date_range, filters, schedule }
Response: Report created/scheduled
```

#### 8.5 Export Report
```
GET /api/v1/admin/analytics/export?report_type=&format=excel
Response: File download
```

### Frontend Flows

**Story:** View Analytics  
**Components:** `UserAnalytics.jsx`, `BookingAnalytics.jsx`, `RevenueAnalytics.jsx`, `CustomReportBuilder.jsx`

---

## 9. ADMIN SYSTEM CONFIGURATION <a name="admin-system-configuration"></a>

### Backend APIs (12 endpoints)

#### 9.1-9.2 Platform Settings
- Get platform settings
- Update platform settings

#### 9.3-9.4 Service Categories
- Get service categories
- Add/update service category

#### 9.5-9.6 Penalty Policies
- Get penalty policies
- Update penalty policies

#### 9.7-9.8 Feature Flags
- Get feature flags
- Update feature flag

#### 9.9-9.10 Payment Gateway Config
- Get payment gateway config
- Update payment gateway config

#### 9.11-9.12 Email/SMS Config
- Get notification config
- Update notification config

### Frontend Flows

**Story:** Configure System  
**Components:** `PlatformSettings.jsx`, `ServiceCategories.jsx`, `PenaltyPolicies.jsx`, `FeatureFlags.jsx`

---

## 10. ADMIN ADMIN MANAGEMENT <a name="admin-admin-management"></a>

### Backend APIs (6 endpoints)

#### 10.1 Get Admin Users
```
GET /api/v1/admin/admin-users?role=&page=1
Response: Admin user list
```

#### 10.2 Add Admin User
```
POST /api/v1/admin/admin-users
Body: { name, email, role, department }
Response: Admin created, password sent
```

#### 10.3 Update Admin Role
```
PATCH /api/v1/admin/admin-users/{admin_id}/role
Body: { role }
```

#### 10.4 Deactivate Admin User
```
PATCH /api/v1/admin/admin-users/{admin_id}/deactivate
```

#### 10.5 Get Admin Activity Log
```
GET /api/v1/admin/admin-users/{admin_id}/activity-log
Response: Admin actions history
```

#### 10.6 Get All Audit Logs
```
GET /api/v1/admin/audit-logs?admin_id=&action_type=
Response: System-wide audit trail
```

### Frontend Flows

**Story:** Manage Admin Users  
**Components:** `AdminUserManagement.jsx`, `AdminUserList.jsx`, `AddAdminUserModal.jsx`, `AdminActivityLogs.jsx`

---

# PART 3: DATABASE CHANGES

## NEW POSTGRESQL TABLES (14)

### 1. academy_students
Link table between academies and artists with enrollment details.

**Key Fields:**
- academy_id, artist_user_id (FK)
- enrollment_date, graduation_date
- course_id, course_name
- maya_registration_status
- invitation_sent

### 2. ppc_campaigns
PPC advertising campaigns for academies.

**Key Fields:**
- academy_id, course_id
- campaign_name, objective
- targeting (cities, age_range, gender)
- budget (daily_budget, total_budget, cost_per_click)
- creative (banner_image, headline, description, cta_text)
- status, approval_status
- metrics (impressions, clicks, total_spend, ctr)

### 3. ppc_campaign_performance
Daily performance metrics for campaigns.

**Key Fields:**
- campaign_id, date
- impressions, clicks, spend, ctr
- admission_inquiries, conversion_rate

### 4. admission_inquiries
Course inquiry lead management.

**Key Fields:**
- academy_id, course_id, campaign_id
- name, phone, email
- source, status
- assigned_to, follow_up_date

### 5. inquiry_notes
Notes on inquiries.

### 6. inquiry_follow_ups
Follow-up reminders for inquiries.

### 7. support_tickets
Customer support ticket system.

**Key Fields:**
- ticket_number, user_id, user_type
- subject, description, issue_type
- priority, status
- assigned_to
- SLA tracking fields

### 8. ticket_messages
Conversation thread for tickets.

### 9. canned_responses
Pre-written support responses.

### 10. email_campaigns
Email marketing campaigns.

**Key Fields:**
- name, subject, email_body
- target_audience, recipient_count
- status, scheduled_at
- analytics (delivered, opened, clicked, bounced)

### 11. email_templates
Reusable email templates.

### 12. sms_campaigns
SMS broadcast campaigns.

### 13. feature_flags
System feature toggles.

**Key Fields:**
- flag_name, flag_slug
- is_enabled, rollout_percentage
- enabled_cities

### 14. user_segments
User segmentation for marketing.

---

## MODIFIED POSTGRESQL TABLES (4)

### 1. artists
**Added Fields:**
- academy_verified, academy_verified_at
- verification_badge_url
- total_bookings, completed_bookings, cancelled_bookings
- completion_rate, total_earnings

### 2. academies
**Added Fields:**
- total_revenue_earned, pending_payout
- total_students, active_students
- ppc_enabled, ppc_budget_limit, ppc_spend_this_month

### 3. bookings
**Added Fields:**
- academy_commission, academy_commission_rate

### 4. reviews
**Added Fields:**
- moderation_status, moderated_by, moderated_at
- moderation_notes, flag_reason
- helpful_count, report_count

---

## NEW MONGODB COLLECTIONS (2)

### 1. activity_feed
Real-time activity feed for academy dashboard.

**Schema:**
```javascript
{
  academy_pg_id: String,
  activity_type: String,
  student_pg_id: String,
  message: String,
  metadata: {},
  created_at: Date
}
```
**TTL:** 90 days

### 2. admin_activity_logs
Enhanced audit trail for admin actions.

**Schema:**
```javascript
{
  admin_user_pg_id: String,
  action: String,
  entity_type: String,
  before_state: {},
  after_state: {},
  ip_address: String,
  created_at: Date,
  expires_at: Date
}
```
**TTL:** 2 years

---

# PART 4: IMPLEMENTATION GUIDE

## API STANDARDS

### Authentication
```
Authorization: Bearer {jwt_token}
JWT Payload: { user_id, role, permissions, exp }
```

### Error Responses
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {}
  }
}
```

### Pagination
```
?page=1&limit=20 (default, max 100)
Response: { data: [], pagination: { total, page, limit, has_next } }
```

### Rate Limiting
- Academy: 100 req/min
- Admin: 500 req/min
- Public: 20 req/min

---

## FRONTEND ARCHITECTURE

### Tech Stack
- React 18+
- Material-UI / Ant Design
- Redux Toolkit / Context API
- Recharts / Chart.js
- React Table / AG Grid
- React Hook Form
- Axios + React Query

### Component Structure
```
src/
├── components/
│   ├── academy/
│   │   ├── Dashboard/
│   │   ├── Students/
│   │   ├── Revenue/
│   │   └── ...
│   ├── admin/
│   │   ├── Users/
│   │   ├── Bookings/
│   │   ├── Support/
│   │   └── ...
│   └── shared/
│       ├── DataTable/
│       ├── Charts/
│       └── Forms/
├── pages/
├── hooks/
├── utils/
└── api/
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1 (Month 3): Core Admin Features
- [ ] Admin authentication with RBAC
- [ ] User management (CRUD, verification, blocking)
- [ ] Booking management (view, update, resolve disputes)
- [ ] Basic analytics dashboards
- [ ] Support ticket system
- [ ] Database migrations

### Phase 2 (Month 4): Academy Dashboard
- [ ] Academy authentication
- [ ] Student management (add, view, bulk upload)
- [ ] Student detail views with tabs
- [ ] Performance analytics
- [ ] Revenue dashboard
- [ ] Activity feed

### Phase 3 (Month 5): Advanced Features
- [ ] PPC campaigns (create, manage, track)
- [ ] Admission inquiry management
- [ ] Email/SMS campaigns
- [ ] Promo code management
- [ ] Custom reports
- [ ] Feature flags
- [ ] System configuration panels

### Testing
- [ ] Unit tests (80% coverage)
- [ ] Integration tests (critical flows)
- [ ] E2E tests (happy paths)
- [ ] Load testing
- [ ] Security testing

### DevOps
- [ ] Staging environment setup
- [ ] Production environment setup
- [ ] CI/CD pipelines
- [ ] Monitoring (Datadog/New Relic)
- [ ] Error tracking (Sentry)
- [ ] Log aggregation

---

## PERFORMANCE TARGETS

### API Response Times
- Dashboard stats: < 500ms
- List endpoints: < 800ms
- Detail endpoints: < 600ms
- Analytics: < 2s
- File uploads: < 3s

### Frontend Performance
- Initial page load: < 2s
- Time to interactive: < 3s
- List render: < 500ms
- Chart render: < 800ms

---

## SECURITY CHECKLIST

- [ ] JWT authentication with refresh tokens
- [ ] 2FA for super admin
- [ ] Role-based access control
- [ ] Permission-based feature access
- [ ] Rate limiting per endpoint
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Encryption at rest and in transit
- [ ] PII data encryption
- [ ] Audit logging for all admin actions
- [ ] Session timeout (30 min inactivity)
- [ ] IP whitelisting for admin panel

---

## MONITORING & ALERTS

### Application Metrics
- API response times
- Error rates
- Request throughput
- Database query performance
- Cache hit rates

### Business Metrics
- Daily active users
- Booking conversion rates
- Payment success rates
- Support ticket volumes
- Average resolution times

### Critical Alerts
- API response time > 2s
- Error rate > 5%
- Database connection issues
- Payment gateway failures
- Support tickets unassigned > 1 hour

---

## DOCUMENTATION DELIVERABLES

1. **API Documentation** (Swagger/OpenAPI)
2. **Database Schema Documentation**
3. **Architecture Diagrams**
4. **User Guides** (Academy Admin, Super Admin)
5. **Deployment Guides**
6. **Troubleshooting Guides**

---

## SUCCESS METRICS

### Academy Dashboard
- Time to add student: < 2 minutes
- Revenue data accuracy: 100%
- Campaign creation completion: > 80%

### Super Admin Panel
- Average ticket resolution: < 24 hours
- Verification processing: < 30 minutes
- Platform uptime: > 99.9%

### Business Impact
- Booking conversion: +20%
- User satisfaction: > 4.5/5
- Support tickets: -30%
- Revenue growth: MoM increase

---

## TIMELINE

**Total Duration:** 3 months (Month 3-5)

- **Month 3:** Core admin features + database setup
- **Month 4:** Academy dashboard + student management
- **Month 5:** Advanced features + PPC + marketing tools

**Team:** 2 Frontend + 2 Backend developers

---

**END OF DOCUMENT**

For detailed API specifications, component implementations, and database schemas, refer to the source documents:
1. MAYA_Admin_Panels_Specification.md
2. maya_platform_optimized_hybrid_db_architecture_postgre_sql_mongo_db_redis_1_.md
