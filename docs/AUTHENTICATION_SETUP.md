# Authentication & User Roles Setup Guide

This guide walks you through setting up authentication and user roles in Directus for the Warehouse App.

## 1. Enable Authentication in Directus

Authentication is enabled by default in Directus. You just need to configure it properly.

## 2. Create User Roles

Login to your Directus Admin Panel (usually at `http://localhost:8055`) and create the following roles:

### Admin Role
- **Name**: `Admin`
- **Admin Access**: `true` (Full admin access)
- **App Access**: `true`
- **Description**: Full system access with all permissions

### Operator Role
- **Name**: `Operator`
- **Admin Access**: `false`
- **App Access**: `true`
- **Description**: Can read and edit data but no admin access

**Permissions for Operator:**
- **products**: Create, Read, Update, Delete
- **locations**: Create, Read, Update, Delete
- **transactions**: Create, Read, Update, Delete
- **inventory**: Read, Update

### Viewer Role
- **Name**: `Viewer`
- **Admin Access**: `false`
- **App Access**: `true`
- **Description**: Read-only access to all data

**Permissions for Viewer:**
- **products**: Read only
- **locations**: Read only
- **transactions**: Read only
- **inventory**: Read only

## 3. Create Demo Users

Create test users for each role:

### Admin User
- **Email**: `admin@example.com`
- **Password**: `password`
- **Role**: `Admin`
- **Status**: `active`

### Operator User
- **Email**: `operator@example.com`
- **Password**: `password`
- **Role**: `Operator`
- **Status**: `active`

### Viewer User
- **Email**: `viewer@example.com`
- **Password**: `password`
- **Role**: `Viewer`
- **Status**: `active`

## 4. Configure Collection Permissions

For each collection (products, locations, transactions, inventory), set up permissions:

### For Admin Role
- All permissions (Create, Read, Update, Delete)
- No field restrictions
- No filter restrictions

### For Operator Role
- **Products**: Full CRUD access
- **Locations**: Full CRUD access
- **Transactions**: Full CRUD access
- **Inventory**: Read and Update only (no Create/Delete)

### For Viewer Role
- **All Collections**: Read only access
- Filter: Only show non-deleted items (`deleted` is null or `deleted` equals `false`)

## 5. Environment Variables

Make sure you don't have a `DIRECTUS_TOKEN` environment variable set, as this would bypass user authentication.

## 6. Testing Authentication

1. Start your Nuxt app: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to the login page
4. Try logging in with different user roles to test permissions

## Role-Based Features

### What Each Role Can Do:

**Admin:**
- ✅ View all pages
- ✅ Create/Edit/Delete products
- ✅ Create/Edit/Delete locations
- ✅ Create/Edit/Delete transactions
- ✅ View/Update inventory
- ✅ Access archived items

**Operator:**
- ✅ View all pages
- ✅ Create/Edit products (but cannot delete)
- ✅ Create/Edit locations (but cannot delete)
- ✅ Create/Edit/Delete transactions
- ✅ View/Update inventory

**Viewer:**
- ✅ View all pages
- ❌ Cannot create/edit/delete anything
- ✅ Read-only access to all data

## Troubleshooting

### "Access denied" errors
- Check that the user's role has the correct permissions
- Verify the role name matches exactly what's expected in the code

### Login not working
- Check that the user's status is `active`
- Verify the email and password are correct
- Check browser console for any JavaScript errors

### Token expires too quickly
- Check Directus configuration for token expiration settings
- The app automatically refreshes tokens when needed

### Permissions not working
- Clear browser localStorage to remove old tokens
- Check that the role permissions are set correctly in Directus
- Verify the user is assigned to the correct role

## API Endpoints Used

The authentication system uses these Directus API endpoints:

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /users/me` - Get current user info

## Security Notes

- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- Token refresh happens automatically every 5 minutes
- Users are redirected to login if their token expires
- All API requests use the user's access token for authentication