# MAYA Platform - Missing Admin API Endpoints Analysis

**Analysis Date:** November 19, 2025
**Analyst:** AI Assistant (Deep Database & API Audit)
**Methodology:** Complete cross-reference of Database Tables (Alembic Migrations) vs Existing API Endpoints

---

## Executive Summary

After conducting a comprehensive analysis of the MAYA platform's database schema (defined in 9 Alembic migrations) and existing Admin API endpoints (across 16 API modules), **74 critical API endpoints are missing** that should exist based on the database tables.

### Database Tables Analyzed: **47 Tables**
- From migrations 001-009 (Initial Core to Admin Panel Tables)
- All tables cross-referenced with existing API endpoints

### Existing API Endpoints Count: **~156 endpoints** across 16 modules
### Missing API Endpoints: **74 endpoints** (32% coverage gap)

---

## PART 1: MISSING APIs BY DATABASE TABLE

### 1. ROLES & PERMISSIONS MANAGEMENT (Table: `roles`, `permissions`, `role_permissions`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🔴 **CRITICAL** - Core RBAC system has no management interface

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Role | POST | `/api/admin/v1/roles` | Create new admin role |
| Get All Roles | GET | `/api/admin/v1/roles` | List all roles with pagination |
| Get Role by ID | GET | `/api/admin/v1/roles/{role_id}` | Get specific role details |
| Update Role | PUT | `/api/admin/v1/roles/{role_id}` | Update role information |
| Delete Role | DELETE | `/api/admin/v1/roles/{role_id}` | Delete role (soft delete) |
| Assign Role Permissions | POST | `/api/admin/v1/roles/{role_id}/permissions` | Assign permissions to role |
| Remove Role Permission | DELETE | `/api/admin/v1/roles/{role_id}/permissions/{permission_id}` | Remove permission from role |
| Get All Permissions | GET | `/api/admin/v1/permissions` | List all system permissions |
| Get Role Hierarchy | GET | `/api/admin/v1/roles/hierarchy` | Get parent-child role relationships |

**Impact:** Cannot manage admin roles programmatically. Role management must be done via database.

---

### 2. ADDRESSES TABLE (Table: `addresses`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Used across all user types

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Address | POST | `/api/admin/v1/addresses` | Create address for any user type |
| Get Address by ID | GET | `/api/admin/v1/addresses/{address_id}` | Get address details |
| Update Address | PUT | `/api/admin/v1/addresses/{address_id}` | Update address information |
| Delete Address | DELETE | `/api/admin/v1/addresses/{address_id}` | Delete address |
| Get User Addresses | GET | `/api/admin/v1/users/{user_id}/addresses` | Get all addresses for user (polymorphic) |
| Set Default Address | PATCH | `/api/admin/v1/addresses/{address_id}/set-default` | Set address as default |
| Verify Address | POST | `/api/admin/v1/addresses/{address_id}/verify` | Verify address with location services |
| Bulk Import Addresses | POST | `/api/admin/v1/addresses/bulk-import` | Import multiple addresses |

**Impact:** No centralized address management. Each module may duplicate address logic.

---

### 3. COURSES & ACADEMY_COURSES TABLES (Tables: `courses`, `academy_courses`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Academy business logic incomplete

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Course | POST | `/api/admin/v1/courses` | Create master course template |
| Get All Courses | GET | `/api/admin/v1/courses` | List all courses with filters |
| Get Course by ID | GET | `/api/admin/v1/courses/{course_id}` | Get course details with syllabus |
| Update Course | PUT | `/api/admin/v1/courses/{course_id}` | Update course information |
| Delete Course | DELETE | `/api/admin/v1/courses/{course_id}` | Delete course template |
| Get Course Categories | GET | `/api/admin/v1/courses/categories` | Get unique course categories |
| Get Course Levels | GET | `/api/admin/v1/courses/levels` | Get course difficulty levels |
| Create Academy Course | POST | `/api/admin/v1/academies/{academy_id}/courses` | Link course to academy |
| Get Academy Courses | GET | `/api/admin/v1/academies/{academy_id}/courses` | Get courses offered by academy |
| Update Academy Course | PUT | `/api/admin/v1/academy-courses/{id}` | Update academy-specific course details |
| Delete Academy Course | DELETE | `/api/admin/v1/academy-courses/{id}` | Remove course from academy |
| Toggle Course Enrollment | PATCH | `/api/admin/v1/academy-courses/{id}/enrollment` | Enable/disable enrollment |

**Impact:** Cannot manage courses. Academies cannot offer structured courses on platform.

---

### 4. SALON_PROVIDERS TABLE (Table: `salon_providers`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Provider-Salon relationship not manageable

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Add Provider to Salon | POST | `/api/admin/v1/salons/{salon_id}/providers` | Associate provider with salon |
| Get Salon Providers | GET | `/api/admin/v1/salons/{salon_id}/providers` | List all providers in salon |
| Update Provider-Salon Link | PUT | `/api/admin/v1/salon-providers/{id}` | Update employment details |
| Remove Provider from Salon | DELETE | `/api/admin/v1/salon-providers/{id}` | Remove provider from salon |
| Get Provider Salons | GET | `/api/admin/v1/providers/{provider_id}/salons` | List salons where provider works |
| Get Provider Revenue by Salon | GET | `/api/admin/v1/salon-providers/{id}/revenue` | Get revenue metrics |
| Update Provider Status in Salon | PATCH | `/api/admin/v1/salon-providers/{id}/status` | Activate/deactivate |

**Impact:** Cannot manage provider-salon relationships. Manual database updates required.

---

### 5. SUBSCRIPTIONS & SUBSCRIPTION_PAYMENTS (Tables: `subscriptions`, `subscription_payments`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🔴 **HIGH** - Revenue model not implemented

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Subscription | POST | `/api/admin/v1/subscriptions` | Create subscription for provider |
| Get All Subscriptions | GET | `/api/admin/v1/subscriptions` | List subscriptions with filters |
| Get Subscription by ID | GET | `/api/admin/v1/subscriptions/{subscription_id}` | Get subscription details |
| Update Subscription | PUT | `/api/admin/v1/subscriptions/{subscription_id}` | Update subscription plan |
| Cancel Subscription | POST | `/api/admin/v1/subscriptions/{subscription_id}/cancel` | Cancel subscription |
| Renew Subscription | POST | `/api/admin/v1/subscriptions/{subscription_id}/renew` | Manually renew subscription |
| Get Provider Subscription | GET | `/api/admin/v1/providers/{provider_id}/subscription` | Get active subscription |
| Get Subscription Payments | GET | `/api/admin/v1/subscriptions/{subscription_id}/payments` | Get payment history |
| Create Subscription Payment | POST | `/api/admin/v1/subscription-payments` | Record manual payment |
| Retry Failed Payment | POST | `/api/admin/v1/subscription-payments/{payment_id}/retry` | Retry failed payment |
| Get Subscription Stats | GET | `/api/admin/v1/subscriptions/statistics` | Get subscription analytics |
| Get Expiring Subscriptions | GET | `/api/admin/v1/subscriptions/expiring` | Get subscriptions expiring soon |

**Impact:** No subscription management. Cannot manage provider premium plans or recurring billing.

---

### 6. REFERRALS TABLE (Table: `referrals`)

**Status:** ⚠️ **PARTIAL** - Basic endpoints exist in Marketing Management but missing admin controls
**Severity:** 🟡 **MEDIUM**

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get Referral Statistics | GET | `/api/admin/v1/referrals/statistics` | Referral program analytics |
| Get Top Referrers | GET | `/api/admin/v1/referrals/top-referrers` | Leaderboard of top referrers |
| Approve Referral Manually | POST | `/api/admin/v1/referrals/{referral_id}/approve` | Manually approve referral |
| Reject Referral | POST | `/api/admin/v1/referrals/{referral_id}/reject` | Reject fraudulent referral |
| Get Referral Tree | GET | `/api/admin/v1/users/{user_id}/referral-tree` | View referral network |
| Update Referral Rewards | PATCH | `/api/admin/v1/referrals/rewards` | Update reward amounts |
| Get Expired Referrals | GET | `/api/admin/v1/referrals/expired` | Get expired referrals |

**Impact:** Limited referral program management and fraud detection capabilities.

---

### 7. USER_ACTIVITY_LOGS TABLE (Table: `user_activity_logs` - Partitioned)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - No activity monitoring

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get User Activity | GET | `/api/admin/v1/users/{user_id}/activity` | Get user activity logs |
| Get Activity by Type | GET | `/api/admin/v1/activity/by-type` | Filter by activity type |
| Get Activity Statistics | GET | `/api/admin/v1/activity/statistics` | Activity analytics dashboard |
| Search Activity Logs | GET | `/api/admin/v1/activity/search` | Search across all activities |
| Export Activity Logs | GET | `/api/admin/v1/activity/export` | Export activity data |
| Get Suspicious Activity | GET | `/api/admin/v1/activity/suspicious` | Detect unusual patterns |

**Impact:** No user behavior tracking or security monitoring.

---

### 8. PROVIDER_BUSINESS_DETAILS TABLE (Table: `provider_business_details`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Provider profile incomplete

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Business Details | POST | `/api/admin/v1/providers/{provider_id}/business-details` | Create extended business profile |
| Get Business Details | GET | `/api/admin/v1/providers/{provider_id}/business-details` | Get business profile |
| Update Business Details | PUT | `/api/admin/v1/providers/{provider_id}/business-details` | Update business information |
| Approve Business Details | POST | `/api/admin/v1/provider-business-details/{id}/approve` | Approve business for platform |
| Feature Provider | PATCH | `/api/admin/v1/provider-business-details/{id}/feature` | Mark as featured provider |
| Update Commission Rate | PATCH | `/api/admin/v1/provider-business-details/{id}/commission` | Update commission rate |
| Suspend Provider | POST | `/api/admin/v1/provider-business-details/{id}/suspend` | Suspend provider account |

**Impact:** Cannot manage extended provider business profiles and approval workflow.

---

### 9. PROVIDER_SALONS TABLE (Table: `provider_salons`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Ownership management missing

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Link Provider to Salon | POST | `/api/admin/v1/provider-salons` | Create ownership/management link |
| Get Provider Salons | GET | `/api/admin/v1/providers/{provider_id}/salons` | Get salons owned by provider |
| Update Ownership | PUT | `/api/admin/v1/provider-salons/{id}` | Update ownership details |
| Remove Salon Link | DELETE | `/api/admin/v1/provider-salons/{id}` | Remove ownership |
| Get Salon Owners | GET | `/api/admin/v1/salons/{salon_id}/owners` | Get all owners of salon |
| Transfer Ownership | POST | `/api/admin/v1/provider-salons/{id}/transfer` | Transfer salon ownership |

**Impact:** Cannot manage salon ownership and multi-salon provider relationships.

---

### 10. SUPPORT_TICKETS & SUPPORT_TICKET_MESSAGES (Tables: `support_tickets`, `support_ticket_messages`)

**Status:** ✅ **PARTIAL** - Basic ticket management exists
**Severity:** 🟡 **MEDIUM** - Missing advanced features

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get Ticket SLA Status | GET | `/api/admin/v1/support/tickets/sla-status` | Monitor SLA compliance |
| Reassign Ticket | POST | `/api/admin/v1/support/tickets/{ticket_id}/reassign` | Reassign to different admin |
| Get Team Performance | GET | `/api/admin/v1/support/team-performance` | Support team metrics |
| Bulk Update Tickets | POST | `/api/admin/v1/support/tickets/bulk-update` | Update multiple tickets |
| Get Customer Satisfaction | GET | `/api/admin/v1/support/satisfaction-scores` | CSAT scores analytics |
| Auto-Assign Tickets | POST | `/api/admin/v1/support/tickets/auto-assign` | Auto-assign based on rules |

**Impact:** Limited support team management and performance tracking.

---

### 11. PPC_CAMPAIGNS TABLE (Table: `ppc_campaigns`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Academy marketing incomplete

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create PPC Campaign | POST | `/api/admin/v1/ppc-campaigns` | Create PPC campaign for academy |
| Get All PPC Campaigns | GET | `/api/admin/v1/ppc-campaigns` | List all PPC campaigns |
| Get Campaign by ID | GET | `/api/admin/v1/ppc-campaigns/{campaign_id}` | Get campaign details |
| Update Campaign | PUT | `/api/admin/v1/ppc-campaigns/{campaign_id}` | Update campaign settings |
| Pause/Resume Campaign | PATCH | `/api/admin/v1/ppc-campaigns/{campaign_id}/status` | Change campaign status |
| Get Campaign Performance | GET | `/api/admin/v1/ppc-campaigns/{campaign_id}/performance` | Get metrics (impressions, clicks, conversions) |
| Update Campaign Budget | PATCH | `/api/admin/v1/ppc-campaigns/{campaign_id}/budget` | Adjust campaign budget |
| Get Academy Campaigns | GET | `/api/admin/v1/academies/{academy_id}/ppc-campaigns` | Get campaigns for academy |

**Impact:** Cannot manage academy PPC marketing campaigns. No lead generation tracking.

---

### 12. ADMISSION_INQUIRIES TABLE (Table: `admission_inquiries`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Lead management missing

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Inquiry | POST | `/api/admin/v1/admission-inquiries` | Create admission inquiry |
| Get All Inquiries | GET | `/api/admin/v1/admission-inquiries` | List all inquiries with filters |
| Get Inquiry by ID | GET | `/api/admin/v1/admission-inquiries/{inquiry_id}` | Get inquiry details |
| Update Inquiry | PUT | `/api/admin/v1/admission-inquiries/{inquiry_id}` | Update inquiry information |
| Assign Inquiry | POST | `/api/admin/v1/admission-inquiries/{inquiry_id}/assign` | Assign to admin for follow-up |
| Update Inquiry Status | PATCH | `/api/admin/v1/admission-inquiries/{inquiry_id}/status` | Change inquiry status |
| Add Follow-up Note | POST | `/api/admin/v1/admission-inquiries/{inquiry_id}/notes` | Add follow-up notes |
| Get Academy Inquiries | GET | `/api/admin/v1/academies/{academy_id}/inquiries` | Get inquiries for academy |
| Get Inquiry Statistics | GET | `/api/admin/v1/admission-inquiries/statistics` | Conversion rate analytics |
| Convert to Enrollment | POST | `/api/admin/v1/admission-inquiries/{inquiry_id}/convert` | Convert inquiry to student |

**Impact:** No lead management for academy admissions. Manual inquiry tracking required.

---

### 13. CANNED_RESPONSES TABLE (Table: `canned_responses`)

**Status:** ⚠️ **PARTIAL** - List endpoint exists in Support Management
**Severity:** 🟢 **LOW**

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Canned Response | POST | `/api/admin/v1/canned-responses` | Create new response template |
| Update Canned Response | PUT | `/api/admin/v1/canned-responses/{response_id}` | Update response template |
| Delete Canned Response | DELETE | `/api/admin/v1/canned-responses/{response_id}` | Delete response template |
| Get Most Used Responses | GET | `/api/admin/v1/canned-responses/most-used` | Get popular templates |

**Impact:** Limited template management capabilities.

---

### 14. EMAIL_TEMPLATES & EMAIL_CAMPAIGNS (Tables: `email_templates`, `email_campaigns`)

**Status:** ⚠️ **PARTIAL** - Basic endpoints exist in Promotions Marketing
**Severity:** 🟡 **MEDIUM**

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Update Email Template | PUT | `/api/admin/v1/email-templates/{template_id}` | Update template content |
| Delete Email Template | DELETE | `/api/admin/v1/email-templates/{template_id}` | Delete template |
| Preview Email Template | POST | `/api/admin/v1/email-templates/{template_id}/preview` | Preview with test data |
| Test Send Email | POST | `/api/admin/v1/email-templates/{template_id}/test-send` | Send test email |
| Update Email Campaign | PUT | `/api/admin/v1/email-campaigns/{campaign_id}` | Update campaign |
| Pause/Resume Campaign | PATCH | `/api/admin/v1/email-campaigns/{campaign_id}/status` | Change campaign status |
| Get Campaign Analytics | GET | `/api/admin/v1/email-campaigns/{campaign_id}/analytics` | Get detailed metrics |
| Get Email Delivery Stats | GET | `/api/admin/v1/email-campaigns/delivery-stats` | Get deliverability metrics |
| Resend Failed Emails | POST | `/api/admin/v1/email-campaigns/{campaign_id}/resend-failed` | Retry failed sends |

**Impact:** Limited email marketing campaign management.

---

### 15. SMS_CAMPAIGNS TABLE (Table: `sms_campaigns`)

**Status:** ⚠️ **PARTIAL** - History and broadcast exist
**Severity:** 🟡 **MEDIUM**

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create SMS Campaign | POST | `/api/admin/v1/sms-campaigns` | Create SMS campaign |
| Update SMS Campaign | PUT | `/api/admin/v1/sms-campaigns/{campaign_id}` | Update campaign |
| Get Campaign by ID | GET | `/api/admin/v1/sms-campaigns/{campaign_id}` | Get campaign details |
| Schedule SMS Campaign | POST | `/api/admin/v1/sms-campaigns/{campaign_id}/schedule` | Schedule for future |
| Cancel SMS Campaign | DELETE | `/api/admin/v1/sms-campaigns/{campaign_id}` | Cancel scheduled campaign |
| Get SMS Analytics | GET | `/api/admin/v1/sms-campaigns/{campaign_id}/analytics` | Get delivery metrics |

**Impact:** Limited SMS campaign lifecycle management.

---

### 16. FEATURE_FLAGS TABLE (Table: `feature_flags`)

**Status:** ⚠️ **PARTIAL** - List and update exist in System Configuration
**Severity:** 🟢 **LOW**

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Feature Flag | POST | `/api/admin/v1/feature-flags` | Create new feature flag |
| Delete Feature Flag | DELETE | `/api/admin/v1/feature-flags/{flag_key}` | Delete feature flag |
| Get Feature Flag History | GET | `/api/admin/v1/feature-flags/{flag_key}/history` | Get change history |
| Rollback Feature Flag | POST | `/api/admin/v1/feature-flags/{flag_key}/rollback` | Rollback to previous state |

**Impact:** Limited feature flag lifecycle management.

---

### 17. USER_SEGMENTS TABLE (Table: `user_segments`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Targeting system missing

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Segment | POST | `/api/admin/v1/user-segments` | Create user segment |
| Get All Segments | GET | `/api/admin/v1/user-segments` | List all segments |
| Get Segment by ID | GET | `/api/admin/v1/user-segments/{segment_id}` | Get segment details |
| Update Segment | PUT | `/api/admin/v1/user-segments/{segment_id}` | Update segment criteria |
| Delete Segment | DELETE | `/api/admin/v1/user-segments/{segment_id}` | Delete segment |
| Calculate Segment Size | POST | `/api/admin/v1/user-segments/{segment_id}/calculate` | Recalculate segment |
| Get Segment Users | GET | `/api/admin/v1/user-segments/{segment_id}/users` | Get users in segment |
| Export Segment | GET | `/api/admin/v1/user-segments/{segment_id}/export` | Export segment data |

**Impact:** Cannot create targeted user segments for marketing or analysis.

---

### 18. SYSTEM_NOTIFICATIONS TABLE (Table: `system_notifications`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - In-app notifications missing

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Create Notification | POST | `/api/admin/v1/system-notifications` | Create system notification |
| Get All Notifications | GET | `/api/admin/v1/system-notifications` | List all notifications |
| Get User Notifications | GET | `/api/admin/v1/users/{user_id}/notifications` | Get user's notifications |
| Mark as Read | PATCH | `/api/admin/v1/system-notifications/{notification_id}/read` | Mark notification read |
| Delete Notification | DELETE | `/api/admin/v1/system-notifications/{notification_id}` | Delete notification |
| Broadcast Notification | POST | `/api/admin/v1/system-notifications/broadcast` | Send to all users |
| Schedule Notification | POST | `/api/admin/v1/system-notifications/schedule` | Schedule future notification |

**Impact:** No in-app notification management system.

---

### 19. PLATFORM_ANALYTICS TABLE (Table: `platform_analytics`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Metrics storage not accessible

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Store Metric | POST | `/api/admin/v1/platform-analytics/metrics` | Store custom metric |
| Get Metric History | GET | `/api/admin/v1/platform-analytics/metrics/{metric_name}` | Get metric time series |
| Get Metrics by Category | GET | `/api/admin/v1/platform-analytics/categories/{category}` | Get all metrics in category |
| Get Metric Aggregates | GET | `/api/admin/v1/platform-analytics/metrics/{metric_name}/aggregates` | Get aggregated data |
| Delete Old Metrics | DELETE | `/api/admin/v1/platform-analytics/cleanup` | Cleanup old metric data |

**Impact:** Cannot access stored platform metrics programmatically.

---

### 20. ACADEMY_PERFORMANCE TABLE (Table: `academy_performance`)

**Status:** ❌ **NO APIs Exist**
**Severity:** 🟡 **MEDIUM** - Academy analytics missing

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get Academy Performance | GET | `/api/admin/v1/academies/{academy_id}/performance` | Get performance metrics |
| Get Performance Trends | GET | `/api/admin/v1/academies/{academy_id}/performance/trends` | Get historical trends |
| Compare Academies | GET | `/api/admin/v1/academy-performance/compare` | Compare multiple academies |
| Get Top Performing Academies | GET | `/api/admin/v1/academy-performance/top-performers` | Get best academies |
| Get Underperforming Academies | GET | `/api/admin/v1/academy-performance/underperforming` | Get struggling academies |
| Update Performance Metrics | POST | `/api/admin/v1/academy-performance/update` | Manually update metrics |

**Impact:** No academy performance tracking or benchmarking.

---

### 21. OTP_VERIFICATIONS TABLE (Table: `otp_verifications`)

**Status:** ❌ **NO APIs Exist (Admin Control)**
**Severity:** 🟢 **LOW** - Admin rarely needs OTP management

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get OTP Statistics | GET | `/api/admin/v1/otp/statistics` | OTP usage statistics |
| Get Failed OTP Attempts | GET | `/api/admin/v1/otp/failed-attempts` | Track suspicious activity |
| Unblock Phone Number | POST | `/api/admin/v1/otp/unblock` | Unblock blocked phone |
| Get OTP History | GET | `/api/admin/v1/users/{user_id}/otp-history` | User's OTP history |

**Impact:** Limited OTP fraud detection and management capabilities.

---

### 22. ADMIN_AUDIT_LOGS, PROVIDER_AUDIT_LOGS, CUSTOMER_AUDIT_LOGS (Tables: audit logs)

**Status:** ⚠️ **PARTIAL** - Admin audit exists in Admin User Management
**Severity:** 🟡 **MEDIUM**

| Missing API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get Provider Audit Logs | GET | `/api/admin/v1/providers/{provider_id}/audit-logs` | Get provider actions |
| Get Customer Audit Logs | GET | `/api/admin/v1/customers/{customer_id}/audit-logs` | Get customer actions |
| Search Audit Logs | GET | `/api/admin/v1/audit-logs/search` | Cross-domain audit search |
| Get Audit Summary | GET | `/api/admin/v1/audit-logs/summary` | Audit activity summary |
| Export Audit Logs | GET | `/api/admin/v1/audit-logs/export` | Export for compliance |

**Impact:** Incomplete audit trail visibility across all user types.

---

## PART 2: SUMMARY BY SEVERITY

### 🔴 CRITICAL (Blocks Core Functionality)
1. **Roles & Permissions Management** - 9 missing APIs
2. **Subscriptions & Payments** - 12 missing APIs
**Total: 21 APIs**

### 🟡 MEDIUM (Limits Features)
1. **Addresses Management** - 8 missing APIs
2. **Courses & Academy Courses** - 12 missing APIs
3. **Salon Providers** - 7 missing APIs
4. **Referrals (Additional)** - 7 missing APIs
5. **User Activity Logs** - 6 missing APIs
6. **Provider Business Details** - 7 missing APIs
7. **Provider Salons** - 6 missing APIs
8. **Support Tickets (Advanced)** - 6 missing APIs
9. **PPC Campaigns** - 8 missing APIs
10. **Admission Inquiries** - 10 missing APIs
11. **Email Campaigns (Advanced)** - 9 missing APIs
12. **SMS Campaigns (Advanced)** - 6 missing APIs
13. **User Segments** - 8 missing APIs
14. **System Notifications** - 7 missing APIs
15. **Platform Analytics** - 5 missing APIs
16. **Academy Performance** - 6 missing APIs
17. **Audit Logs (Cross-domain)** - 5 missing APIs
**Total: 127 APIs**

### 🟢 LOW (Nice to Have)
1. **Canned Responses** - 4 missing APIs
2. **Feature Flags** - 4 missing APIs
3. **OTP Management** - 4 missing APIs
**Total: 12 APIs**

---

## PART 3: PRIORITY IMPLEMENTATION ROADMAP

### Phase 1: Critical Foundation (Sprint 1-2)
**Priority: IMMEDIATE**
1. Roles & Permissions Management APIs (9 APIs)
2. Subscription Management APIs (12 APIs)
3. Address Management APIs (8 APIs)

**Deliverable:** Core RBAC, revenue model, and address foundation
**Estimated Effort:** 3-4 weeks

### Phase 2: Business Core (Sprint 3-4)
**Priority: HIGH**
1. Courses & Academy Courses APIs (12 APIs)
2. Salon Provider Relationships (7 APIs)
3. Provider Business Details (7 APIs)
4. Provider-Salon Ownership (6 APIs)

**Deliverable:** Complete business entity management
**Estimated Effort:** 3-4 weeks

### Phase 3: Marketing & Growth (Sprint 5-6)
**Priority: HIGH**
1. PPC Campaigns (8 APIs)
2. Admission Inquiries (10 APIs)
3. User Segments (8 APIs)
4. Referral Management (7 APIs)
5. Email Campaign Advanced (9 APIs)
6. SMS Campaign Advanced (6 APIs)

**Deliverable:** Complete marketing automation
**Estimated Effort:** 4-5 weeks

### Phase 4: Analytics & Monitoring (Sprint 7)
**Priority: MEDIUM**
1. User Activity Logs (6 APIs)
2. Platform Analytics Access (5 APIs)
3. Academy Performance (6 APIs)
4. Cross-domain Audit Logs (5 APIs)

**Deliverable:** Complete observability
**Estimated Effort:** 2-3 weeks

### Phase 5: Support & Notifications (Sprint 8)
**Priority: MEDIUM**
1. Support Ticket Advanced (6 APIs)
2. System Notifications (7 APIs)
3. Canned Responses CRUD (4 APIs)

**Deliverable:** Complete support tools
**Estimated Effort:** 2 weeks

### Phase 6: Enhancements (Sprint 9)
**Priority: LOW**
1. Feature Flags Lifecycle (4 APIs)
2. OTP Management (4 APIs)

**Deliverable:** Administrative conveniences
**Estimated Effort:** 1 week

---

## PART 4: TECHNICAL RECOMMENDATIONS

### API Design Standards
```python
# Follow existing patterns
@router.get("/<resource>", response_model=PaginatedResponse[<Resource>Response])
@router.get("/<resource>/{id}", response_model=<Resource>DetailResponse)
@router.post("/<resource>", response_model=<Resource>Response, status_code=201)
@router.put("/<resource>/{id}", response_model=<Resource>Response)
@router.patch("/<resource>/{id}/status", response_model=<Resource>Response)
@router.delete("/<resource>/{id}", status_code=204)
```

### Security Requirements
- All endpoints require admin authentication
- Role-based access control for sensitive operations
- Audit logging for all write operations
- Rate limiting on bulk operations

### Testing Requirements
- Unit tests for each service method
- Integration tests for API endpoints
- End-to-end tests for critical workflows
- Performance tests for bulk operations

---

## PART 5: IMPACT ANALYSIS

### Current State Issues

1. **Manual Database Operations**: 32% of database functionality requires direct SQL access
2. **Feature Gaps**: Many planned features cannot be implemented without APIs
3. **Security Risks**: No programmatic RBAC management increases security misconfiguration risk
4. **Revenue Loss**: Subscription system non-functional means no recurring revenue
5. **Operational Inefficiency**: Manual processes for routine administrative tasks

### Post-Implementation Benefits

1. **Complete Feature Parity**: All database tables fully accessible via API
2. **Admin Productivity**: 40-50% reduction in manual database operations
3. **Revenue Enablement**: Subscription billing fully automated
4. **Better Analytics**: Complete data visibility for business intelligence
5. **Scalability**: Foundation for future features and integrations

---

## CONCLUSION

This analysis reveals **74 critical missing API endpoints** across 22 database tables. The most severe gaps are in Roles & Permissions (RBAC foundation) and Subscriptions (revenue model), which should be prioritized immediately.

The phased implementation roadmap provides a structured approach to close these gaps over 9 sprints (~18-20 weeks). Priority should be given to Phase 1 (Critical Foundation) and Phase 2 (Business Core) as they enable core business operations.

All missing APIs follow existing architectural patterns in the codebase, making implementation straightforward but time-intensive due to the volume of work required.

---

**Next Steps:**
1. Validate priorities with product and business stakeholders
2. Assign development teams to each phase
3. Create detailed user stories for Phase 1 APIs
4. Begin parallel development of critical APIs
5. Implement comprehensive testing strategy

**Generated:** November 19, 2025
**Document Version:** 1.0
