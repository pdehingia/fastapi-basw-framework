# 🔐 Maya Admin Panel - Postman Collection Authentication Flow

## ✅ Authentication Setup Complete

The Postman collection has been configured with **automatic JWT token management** for seamless API testing.

### 🚀 How It Works

#### 1. **Login Once, Use Everywhere**
- Run the **"Admin Login"** request first
- The collection automatically extracts and saves the JWT token
- All subsequent requests automatically use the saved token

#### 2. **Automatic Token Handling**
- **Pre-request Script**: Automatically adds `Authorization: Bearer {token}` to all requests (except login)
- **Post-response Script**: Extracts token from login response and saves to collection variables
- **Collection-level Auth**: Bearer token configuration using `{{access_token}}` variable

### 🔧 Technical Implementation

#### Collection-Level Authorization
```json
"auth": {
    "type": "bearer",
    "bearer": [
        {
            "key": "token",
            "value": "{{access_token}}",
            "type": "string"
        }
    ]
}
```

#### Pre-Request Script (Runs before every request)
```javascript
// Automatically set authorization header for all requests except login
const requestUrl = pm.request.url.toString();

// Skip auth for login endpoint
if (requestUrl.includes('/auth/login')) {
    console.log('🔓 Skipping auth for login endpoint');
    return;
}

// Get the stored access token
const token = pm.collectionVariables.get('access_token');

if (token && token.length > 0) {
    console.log('🔐 Setting Bearer token for request');
    pm.request.headers.add({
        key: 'Authorization',
        value: `Bearer ${token}`
    });
} else {
    console.log('⚠️ No access token found. Please run Admin Login first.');
}
```

#### Post-Response Script (Runs after login request)
```javascript
// Auto-save token for login endpoint
const requestUrl = pm.request.url.toString();

if (requestUrl.includes('/auth/login') && pm.response.code === 200) {
    try {
        const responseJson = pm.response.json();
        
        // Handle standardized response format
        let token = null;
        if (responseJson.success && responseJson.data && responseJson.data.access_token) {
            token = responseJson.data.access_token;
            console.log('✅ Token extracted from standardized response');
        } else if (responseJson.access_token) {
            token = responseJson.access_token;
            console.log('✅ Token extracted from direct response');
        }
        
        if (token) {
            pm.collectionVariables.set('access_token', token);
            console.log('🔐 Access token saved to collection variables');
        } else {
            console.error('❌ Could not find access_token in response');
            console.log('Response structure:', JSON.stringify(responseJson, null, 2));
        }
    } catch (error) {
        console.error('❌ Error processing login response:', error);
    }
}
```

### 📋 Usage Instructions

#### Step 1: Import Collection
- Import `Maya_Admin_Panel_Postman_Collection_Clean.json` into Postman

#### Step 2: Login
- Run the **"Admin Login"** request in the 🔐 Authentication folder
- Check the console to confirm token was saved: `🔐 Access token saved to collection variables`

#### Step 3: Use Any Endpoint
- Run any other endpoint in the collection
- The token is automatically applied - no manual setup needed!

#### Step 4: Token Expiry
- When token expires, just run **"Admin Login"** again
- All subsequent requests will use the new token automatically

### 🎯 Benefits

- **No Manual Token Management**: Login once, use everywhere
- **Error Prevention**: No more "401 Unauthorized" due to missing tokens
- **Developer Experience**: Focus on testing APIs, not authentication setup
- **Console Logging**: Clear feedback about authentication status
- **Standardized Response Support**: Handles both direct and standardized response formats

### 🔍 Troubleshooting

#### If you get "401 Unauthorized":
1. Check console for: `⚠️ No access token found. Please run Admin Login first.`
2. Run the **Admin Login** request
3. Verify console shows: `🔐 Access token saved to collection variables`
4. Try your request again

#### If token extraction fails:
1. Check console for error messages
2. Verify login response format matches expected structure
3. Check that login endpoint returns `success: true` and `data.access_token`

### 📊 Collection Statistics
- **11 Feature Folders**
- **87 API Endpoints**
- **15 Collection Variables**
- **1 Login Endpoint** (Admin Login)
- **Full Authentication Automation** ✅

## ✅ Ready to Use!

Your Postman collection is now fully configured for seamless API testing. Just login once and test all 87 endpoints without worrying about authentication! 🚀