"""
Constants Migration Guide

This guide demonstrates how to refactor existing hardcoded strings to use the new constants system.

## Before and After Examples

### 1. Status Values Refactoring

BEFORE:
```python
# In models/booking.py
class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# In services
if booking.status == "pending":
    # process pending booking
```

AFTER:
```python
# Import the constants
from app.shared.constants import BOOKING_STATUS

# Use constants instead
if booking.status == BOOKING_STATUS.PENDING:
    # process pending booking
```

### 2. API Routes Refactoring

BEFORE:
```python
# In router files
admin_router = APIRouter(prefix="/admin/v1", tags=["admin-v1"])
@router.post("/promo-codes")
```

AFTER:
```python
# Import constants
from app.shared.constants import API_PREFIXES, API_ROUTES, API_TAGS

# Use constants
admin_router = APIRouter(prefix=API_PREFIXES.ADMIN_V1, tags=[API_TAGS.ADMIN])
@router.post(API_ROUTES.PROMO_CODES_LIST)
```

### 3. User Roles Refactoring

BEFORE:
```python
# Hardcoded role checks
if user.role == "admin":
    allow_access = True
elif user.role == "provider":
    allow_limited_access = True
```

AFTER:
```python
from app.shared.constants import USER_ROLES

if user.role == USER_ROLES.ADMIN:
    allow_access = True
elif user.role == USER_ROLES.PROVIDER:
    allow_limited_access = True
```

### 4. Response Messages Refactoring

BEFORE:
```python
# Hardcoded messages
return {"success": True, "message": "User created successfully"}
raise HTTPException(status_code=400, detail="Invalid email format")
```

AFTER:
```python
from app.shared.constants import SUCCESS_MESSAGES, ERROR_MESSAGES

return {"success": True, "message": SUCCESS_MESSAGES.CREATED_SUCCESS.format(entity="User")}
raise HTTPException(status_code=400, detail=ERROR_MESSAGES.INVALID_EMAIL)
```

### 5. File Paths Refactoring

BEFORE:
```python
# Hardcoded paths
upload_path = "uploads/profiles/avatar.jpg"
static_path = "/static/images/default_avatar.png"
```

AFTER:
```python
from app.shared.constants import UPLOAD_PATHS, STATIC_PATHS

upload_path = UPLOAD_PATHS.get_profile_image_path(user_id, "avatar.jpg")
static_path = STATIC_PATHS.DEFAULT_AVATAR
```

## Benefits of Using Constants

1. **Consistency**: All parts of the application use the same values
2. **Maintainability**: Change once, update everywhere
3. **Type Safety**: IDE autocompletion and error detection
4. **Documentation**: Clear naming and organization
5. **Refactoring**: Easy to find and update all usages

## Import Patterns

### Specific Constants
```python
from app.shared.constants.status import BOOKING_STATUS, PAYMENT_STATUS
from app.shared.constants.api import API_ROUTES, HTTP_STATUS_CODES
from app.shared.constants.user_roles import USER_ROLES, PERMISSION_LEVELS
```

### All Constants (convenience)
```python
from app.shared.constants import (
    BOOKING_STATUS, PAYMENT_STATUS, USER_ROLES, 
    API_ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES
)
```

## Refactoring Checklist

### Phase 1: Models
- [ ] Replace enum string values with constants
- [ ] Update status field definitions
- [ ] Replace role references

### Phase 2: API Routes
- [ ] Replace hardcoded route paths
- [ ] Update API tags and prefixes  
- [ ] Replace HTTP status codes

### Phase 3: Services
- [ ] Replace status checks and updates
- [ ] Update business logic constants
- [ ] Replace commission rates and policies

### Phase 4: Response Messages
- [ ] Replace success messages
- [ ] Replace error messages
- [ ] Update validation messages

### Phase 5: File Operations
- [ ] Replace file paths
- [ ] Update upload directories
- [ ] Replace static asset paths

### Phase 6: UI Components (Admin Panel)
- [ ] Replace color values
- [ ] Update size constants
- [ ] Replace icon names

## Testing After Refactoring

1. **Unit Tests**: Ensure all constant imports work
2. **Integration Tests**: Verify API responses use correct constants
3. **E2E Tests**: Test complete workflows with new constants
4. **Performance**: Verify no performance degradation

## Migration Script Example

```python
#!/usr/bin/env python3
"""
Migration script to help refactor hardcoded strings to constants.
"""

import os
import re
from pathlib import Path

def find_and_replace_patterns():
    patterns = [
        (r'"pending"', 'BOOKING_STATUS.PENDING'),
        (r'"completed"', 'BOOKING_STATUS.COMPLETED'),
        (r'"/admin/v1"', 'API_PREFIXES.ADMIN_V1'),
        (r'"admin"', 'USER_ROLES.ADMIN'),
    ]
    
    for py_file in Path('.').glob('**/*.py'):
        # Apply replacements
        pass

if __name__ == "__main__":
    find_and_replace_patterns()
```

## Next Steps

1. Create refactoring plan by priority
2. Update imports in core modules first
3. Refactor models and enums
4. Update API routes and responses
5. Test thoroughly after each phase
6. Update documentation and type hints
"""