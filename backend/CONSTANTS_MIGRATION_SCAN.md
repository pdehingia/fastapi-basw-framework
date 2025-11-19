# Constants Migration Report

## Summary
- **Files requiring migration**: 21
- **HTTP Status Codes**: 124 occurrences
- **Hardcoded Messages**: 90 occurrences
- **API Tags**: 17 occurrences
- **API Prefixes**: 3 occurrences

## Files Requiring Migration
- [ ] `app\core\dependencies.py`
- [ ] `app\domains\admin\features\v1\admin_user_management\api.py`
- [ ] `app\domains\admin\features\v1\artist_verification\api.py`
- [ ] `app\domains\admin\features\v1\auth\service.py`
- [ ] `app\domains\admin\features\v1\business_management\service.py`
- [ ] `app\domains\admin\features\v1\financial_management\service.py`
- [ ] `app\domains\admin\features\v1\marketing_management\api.py`
- [ ] `app\domains\admin\features\v1\marketing_management\service.py`
- [ ] `app\domains\admin\features\v1\promotions_marketing\api.py`
- [ ] `app\domains\admin\features\v1\provider_management\service.py`
- [ ] `app\domains\admin\features\v1\refactored_api_example.py`
- [ ] `app\domains\admin\features\v1\review_management\api.py`
- [ ] `app\domains\admin\features\v1\support_management\api.py`
- [ ] `app\domains\admin\features\v1\support_management\service.py`
- [ ] `app\domains\admin\features\v1\system_configuration\api.py`
- [ ] `app\domains\admin\features\v1\user_management\api.py`
- [ ] `app\domains\admin\router.py`
- [ ] `app\domains\admin\router_refactored_example.py`
- [ ] `app\main.py`
- [ ] `app\middleware\error_handler.py`
- [ ] `app\shared\decorators.py`

## HTTP Status Codes to Replace
- **201** (1 occurrences) → `HTTP_STATUS_CODES.CREATED`
- **204** (1 occurrences) → `HTTP_STATUS_CODES.NO_CONTENT`
- **400** (44 occurrences) → `HTTP_STATUS_CODES.BAD_REQUEST`
- **403** (2 occurrences) → `HTTP_STATUS_CODES.FORBIDDEN`
- **404** (36 occurrences) → `HTTP_STATUS_CODES.NOT_FOUND`
- **500** (40 occurrences) → `HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR`

### Details:
- `app\core\dependencies.py:120` - `#     raise HTTPException(status_code=403, detail="Admin access required")...`
- `app\core\dependencies.py:120` - `#     raise HTTPException(status_code=403, detail="Admin access required")...`
- `app\shared\decorators.py:128` - `status_code=500,...`
- `app\shared\decorators.py:133` - `status_code=500,...`
- `app\shared\decorators.py:132` - `raise HTTPException(...`
- `app\shared\decorators.py:125` - `error_response_content = create_error_json_response(...`
- `app\domains\admin\features\v1\refactored_api_example.py:342` - `@router.post("/bookings", status_code=201)...`
- `app\domains\admin\features\v1\refactored_api_example.py:345` - `raise HTTPException(status_code=404, detail="Booking not found")...`
- `app\domains\admin\features\v1\refactored_api_example.py:345` - `raise HTTPException(status_code=404, detail="Booking not found")...`
- `app\domains\admin\features\v1\admin_user_management\api.py:60` - `raise HTTPException(status_code=404, detail="Admin user not found")...`
- `app\domains\admin\features\v1\admin_user_management\api.py:122` - `raise HTTPException(status_code=400, detail="Failed to delete admin user")...`
- `app\domains\admin\features\v1\admin_user_management\api.py:211` - `raise HTTPException(status_code=400, detail="Failed to change password")...`
- `app\domains\admin\features\v1\admin_user_management\api.py:233` - `raise HTTPException(status_code=400, detail="Failed to assign permissions")...`
- `app\domains\admin\features\v1\admin_user_management\api.py:60` - `raise HTTPException(status_code=404, detail="Admin user not found")...`
- `app\domains\admin\features\v1\admin_user_management\api.py:122` - `raise HTTPException(status_code=400, detail="Failed to delete admin user")...`
- `app\domains\admin\features\v1\admin_user_management\api.py:211` - `raise HTTPException(status_code=400, detail="Failed to change password")...`
- `app\domains\admin\features\v1\admin_user_management\api.py:233` - `raise HTTPException(status_code=400, detail="Failed to assign permissions")...`
- `app\domains\admin\features\v1\artist_verification\api.py:82` - `raise HTTPException(status_code=500, detail=f"Failed to retrieve verification qu...`
- `app\domains\admin\features\v1\artist_verification\api.py:115` - `raise HTTPException(status_code=404, detail="Verification request not found")...`
- `app\domains\admin\features\v1\artist_verification\api.py:163` - `status_code=400,...`
- ... and 104 more

## Error Messages to Replace
Common patterns found:
- **already_exists** (19 occurrences) → `ERROR_MESSAGES.ALREADY_EXISTS`
- **database_error** (6 occurrences) → `ERROR_MESSAGES.DATABASE_ERROR`
- **generic_error** (1 occurrences) → `ERROR_MESSAGES.INTERNAL_ERROR`
- **not_found** (63 occurrences) → `ERROR_MESSAGES.RESOURCE_NOT_FOUND`
- **validation_failed** (1 occurrences) → `ERROR_MESSAGES.VALIDATION_FAILED`

### Details:
- `app\middleware\error_handler.py:74` - "Validation failed"
- `app\middleware\error_handler.py:177` - "A record with this value already exists"
- `app\middleware\error_handler.py:250` - "Internal server error"
- `app\domains\admin\features\v1\refactored_api_example.py:345` - "Booking not found"
- `app\domains\admin\features\v1\admin_user_management\api.py:60` - "Admin user not found"
- `app\domains\admin\features\v1\artist_verification\api.py:115` - "Verification request not found"
- `app\domains\admin\features\v1\auth\service.py:240` - "User not found"
- `app\domains\admin\features\v1\auth\service.py:286` - "User not found"
- `app\domains\admin\features\v1\auth\service.py:387` - "User with this email already exists"
- `app\domains\admin\features\v1\business_management\service.py:123` - "Salon not found"
- `app\domains\admin\features\v1\business_management\service.py:131` - "Salon with this name already exists"
- `app\domains\admin\features\v1\business_management\service.py:134` - "Salon with this slug already exists"
- `app\domains\admin\features\v1\business_management\service.py:148` - "Salon not found"
- `app\domains\admin\features\v1\business_management\service.py:154` - "Salon with this name already exists"
- `app\domains\admin\features\v1\business_management\service.py:159` - "Salon with this slug already exists"
- ... and 75 more

## API Tags to Replace
- `"Admin Artist Verification"` → `API_TAGS.ADMIN`
- `"Admin Review Management"` → `API_TAGS.ADMIN`
- `"Admin User Management"` → `API_TAGS.USER_MANAGEMENT`
- `"Health"` → `API_TAGS.HEALTH`
- `"Promotions & Marketing"` → `API_TAGS.MARKETING`
- `"Support Management"` → `API_TAGS.SUPPORT_MANAGEMENT`
- `"System Configuration"` → `API_TAGS.SYSTEM_CONFIGURATION`
- `"Test"` → `API_TAGS.TEST`
- `"admin-v1"` → `API_TAGS.ADMIN`
- `"booking"` → `API_TAGS.BOOKING`
- `"payment"` → `API_TAGS.PAYMENT`
- `"urgent"` → `API_TAGS.URGENT`
- `"verification"` → `API_TAGS.VERIFICATION`
- `"welcome"` → `API_TAGS.WELCOME`

## API Prefixes to Replace
- `"/api"` → `"/api"  # TODO: Add to API_PREFIXES`

## Migration Priority
1. **High Priority** (API endpoints):

2. **Medium Priority** (Services and models):

3. **Lower Priority** (Other files):
   - `app\core\dependencies.py`
   - `app\domains\admin\features\v1\admin_user_management\api.py`
   - `app\domains\admin\features\v1\artist_verification\api.py`
   - `app\domains\admin\features\v1\auth\service.py`
   - `app\domains\admin\features\v1\business_management\service.py`
   - `app\domains\admin\features\v1\financial_management\service.py`
   - `app\domains\admin\features\v1\marketing_management\api.py`
   - `app\domains\admin\features\v1\marketing_management\service.py`
   - `app\domains\admin\features\v1\promotions_marketing\api.py`
   - `app\domains\admin\features\v1\provider_management\service.py`
   - ... and 11 more files

## Next Steps
1. Start with high-priority API files
2. Import constants: `from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS`
3. Replace hardcoded values systematically
4. Test each file after migration
5. Update related tests if needed