# Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. "Login failed: Invalid authentication data received"

This error occurs when the Directus login response doesn't contain the expected token structure.

#### Possible Causes:
- Directus server is not running
- Wrong Directus URL configuration
- User doesn't exist in Directus
- User account is inactive
- Wrong credentials

#### Solutions:

**Step 1: Check Directus Server**
```bash
# Make sure Directus is running
curl http://localhost:8055/server/info
```

**Step 2: Verify Directus URL**
Check your `.env` file or runtime config:
```bash
DIRECTUS_URL=http://localhost:8055
```

**Step 3: Test Direct API Call**
```bash
curl -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

**Step 4: Check User in Directus Admin**
1. Go to http://localhost:8055
2. Login as admin
3. Go to User Management
4. Verify the test users exist and are active

### 2. Setting up Directus for Authentication

#### Create Admin User (if not exists)
```bash
# Using Directus CLI
npx directus bootstrap

# Or manually create an admin user in Directus
```

#### Create Demo Users via Directus Admin:

1. **Admin User:**
   - Email: admin@example.com
   - Password: password
   - Role: Administrator (or create Admin role)
   - Status: Active

2. **Operator User:**
   - Email: operator@example.com
   - Password: password
   - Role: Operator (create this role)
   - Status: Active

3. **Viewer User:**
   - Email: viewer@example.com
   - Password: password
   - Role: Viewer (create this role)
   - Status: Active

### 3. Debug Steps

#### Enable Debug Mode
Access the debug page: `http://localhost:3001/debug-auth`

This page will help you:
- Test Directus connection
- Test login functionality
- See detailed error messages
- Inspect the authentication response

#### Console Debugging
The authentication now includes detailed console logging. Check browser console for:
- 🔐 Login attempt messages
- 🔑 Token extraction details
- 👤 User data retrieval
- 💾 Storage confirmation
- ❌ Detailed error information

### 4. Common Configuration Issues

#### Wrong Directus URL
```typescript
// In nuxt.config.ts
runtimeConfig: {
  public: {
    directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055'
  }
}
```

#### Missing Environment Variables
Create `.env` file:
```bash
DIRECTUS_URL=http://localhost:8055
```

#### CORS Issues
If you see CORS errors, configure Directus:
```bash
# In your Directus .env file
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 5. Step-by-Step Resolution

1. **Check Directus is Running:**
   ```bash
   # Should return server info
   curl http://localhost:8055/server/info
   ```

2. **Test Authentication Endpoint:**
   ```bash
   curl -X POST http://localhost:8055/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "password"}'
   ```

3. **Verify Response Format:**
   The response should look like:
   ```json
   {
     "data": {
       "access_token": "eyJ...",
       "refresh_token": "eyJ...",
       "expires": 1640000000000
     }
   }
   ```

4. **Check User Exists:**
   - Login to Directus admin panel
   - Verify user exists and is active
   - Check user has proper role assigned

5. **Test with Debug Page:**
   - Go to `/debug-auth`
   - Test connection first
   - Then test login
   - Check console for detailed logs

### 6. Alternative Quick Fix

If you want to bypass authentication temporarily for testing:

```typescript
// In pages/index.vue (or any protected page)
definePageMeta({
  // middleware: 'auth' // Comment this out temporarily
})
```

### 7. Reset Authentication State

If you're getting stuck with cached auth data:

```javascript
// In browser console:
localStorage.clear()
location.reload()
```

### 8. Directus Role Configuration

Make sure your roles in Directus have proper permissions:

#### Admin Role:
- Admin Access: ✅ Yes
- App Access: ✅ Yes

#### Operator Role:
- Admin Access: ❌ No
- App Access: ✅ Yes
- Permissions: Read/Write on all collections

#### Viewer Role:
- Admin Access: ❌ No  
- App Access: ✅ Yes
- Permissions: Read-only on all collections

### 9. Network Issues

#### Check Network Tab
In browser dev tools, check if the login request:
- Is being sent to the correct URL
- Returns a 200 status
- Contains the expected response data

#### Common Network Errors:
- 404: Wrong Directus URL
- 401: Invalid credentials
- 403: User inactive or no permission
- 500: Directus server error
- CORS: Cross-origin request blocked

### 10. Contact for Help

If none of these solutions work, please provide:
1. Output from `/debug-auth` page
2. Browser console errors
3. Network tab showing the login request/response
4. Your Directus version and configuration