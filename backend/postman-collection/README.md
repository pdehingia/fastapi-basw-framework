# Maya Admin Panel Postman Collection

This folder contains the complete, ready-to-use Postman collection for testing all Maya Platform Admin APIs.

## 📁 Files

- `Maya_Admin_Panel_Postman_Collection_Clean.json` - Complete collection with realistic test data and environment variables built-in

## 🚀 INSTANT SETUP - NO CONFIGURATION NEEDED!

This collection is 100% self-contained with:
- ✅ **All environment variables** pre-configured in the collection
- ✅ **Realistic request bodies** with sample data for all POST/PUT endpoints  
- ✅ **Sample IDs** for testing GET/DELETE operations
- ✅ **Authentication flow** with automatic token management
- ✅ **No external files** or database setup required

## 🎯 Quick Start (30 seconds!)

1. **Import Collection:**
   ```
   File → Import → Select Maya_Admin_Panel_Postman_Collection_Clean.json
   ```

2. **Start Testing:**
   - Run "Admin Login" request first (credentials already configured)
   - Access token will be automatically set for all other requests
   - Start testing any of the 103+ endpoints immediately!

## 🔐 Built-in Test Credentials

- **Admin Email**: admin@maya.com
- **Admin Password**: admin123
- **Sample User Email**: john.doe@example.com
- **Sample Phone**: +1-555-123-4567

## 📊 Pre-configured Sample Data

All POST/PUT requests include realistic examples:
- **User Management**: User creation, notifications, bulk actions
- **Booking Management**: Dispute handling, data export with filters
- **Payment Management**: Refund processing with detailed reasons
- **Review Management**: Bulk moderation with approval workflows  
- **Promotions**: Campaign creation with discount codes
- **Support**: Ticket replies with resolution details
- **Analytics**: Custom report generation with metrics
- **Admin Users**: New admin creation with role-based permissions

## 📚 Collection Structure (103+ Endpoints)

- 🔐 **Authentication** (4 endpoints) - Login, logout, refresh, verify
- 👥 **User Management** (10 endpoints) - CRUD, search, notifications, bulk actions
- 📅 **Booking Management** (7 endpoints) - View, update, disputes, exports
- 💳 **Payment Management** (8 endpoints) - Transactions, refunds, analytics  
- ⭐ **Review Management** (7 endpoints) - Moderation, responses, bulk actions
- 🎨 **Artist Verification** (6 endpoints) - Applications, approval workflows
- 🚀 **Promotions & Marketing** (9 endpoints) - Campaigns, coupons, email marketing
- 🎧 **Support Management** (10 endpoints) - Tickets, FAQ, knowledge base
- 📊 **Analytics & Reports** (8 endpoints) - Dashboards, custom reports, data export
- ⚙️ **System Configuration** (9 endpoints) - Settings, fees, templates, health checks
- 👤 **Admin User Management** (9 endpoints) - Admin CRUD, roles, permissions

## 🎨 Sample Request Examples

### User Notification:
```json
{
  "message": "Your profile has been verified!",
  "type": "success", 
  "send_email": true,
  "send_sms": false
}
```

### Refund Processing:
```json
{
  "amount": 150.00,
  "reason": "Service cancellation due to provider illness",
  "refund_type": "full",
  "admin_notes": "Emergency cancellation - full refund approved",
  "processing_fee_waived": true
}
```

### Campaign Creation:
```json
{
  "name": "Holiday Makeup Special 2024",
  "discount_percentage": 25,
  "promo_code": "HOLIDAY25",
  "applicable_services": ["makeup", "hair-styling"]
}
```

## 🔧 Key Features

- ✅ **Bearer token authentication** with auto-management
- ✅ **Collection variables** for all sample IDs and credentials
- ✅ **Realistic test scenarios** with proper business logic
- ✅ **Error handling examples** with validation patterns
- ✅ **Comprehensive API coverage** across all admin functions
- ✅ **Production-ready examples** with proper data validation

## 💡 Testing Tips

1. **Start with Authentication**: Always run "Admin Login" first
2. **Use Sample IDs**: All endpoints use collection variables like `{{sample_user_id}}`
3. **Realistic Workflows**: Follow logical sequences (create → update → delete)
4. **Error Testing**: Try invalid IDs to test error handling
5. **Bulk Operations**: Test bulk actions with multiple sample IDs

## 📝 Notes

- **Self-Contained**: No external dependencies or setup required
- **Ready for Production**: All examples follow API best practices  
- **Extensible**: Easy to add new test cases or modify existing ones
- **Team Ready**: Share the single JSON file for instant team collaboration
- **Version Controlled**: All test data is embedded and tracked with the collection

## 🎯 Perfect for:

- **API Testing**: Comprehensive endpoint validation
- **Integration Testing**: Full workflow testing across services
- **Demo Purposes**: Realistic data for client demonstrations  
- **Development**: Quick API exploration and debugging
- **Team Collaboration**: Consistent test environment for all developers