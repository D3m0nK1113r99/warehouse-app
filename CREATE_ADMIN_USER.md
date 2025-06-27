# Create Admin User in Directus

## Method 1: Using Directus Admin Panel

1. Go to your Directus admin panel: `http://localhost:8055`
2. Login with your existing admin credentials
3. Go to "User Management" 
4. Click "Create User"
5. Fill in:
   - **Email**: `admin@example.com`
   - **Password**: `password`
   - **Role**: Administrator (or create a new Admin role)
   - **Status**: Active

## Method 2: Using Directus CLI

```bash
# In your Directus project directory
npx directus users create --email admin@example.com --password password --role administrator
```

## Method 3: Using Database Direct Insert (if other methods fail)

If you have access to your database, you can insert a user directly:

```sql
-- For PostgreSQL/MySQL
INSERT INTO directus_users (id, email, password, role, status) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@example.com',
    '$argon2id$v=19$m=65536,t=3,p=4$HASH_HERE', -- You'll need to hash the password
    'administrator',
    'active'
);
```

## Method 4: Bootstrap Directus (Recommended for new installations)

```bash
# In your Directus project directory
npx directus bootstrap
```

This will create an initial admin user and let you set up the credentials.

## Method 5: Reset Admin Password

If you already have an admin user but forgot the password:

```bash
# In your Directus project directory
npx directus users passwd admin@example.com --password password
```

## Verify User Creation

After creating the user, verify it works:

1. Go to `http://localhost:3001/test-directus`
2. Try the direct login test
3. Check the response in browser console

## Create Additional Demo Users

Once you have admin access, create these additional users in the Directus admin panel:

- **Operator**: `operator@example.com` / `password`
- **Viewer**: `viewer@example.com` / `password`

Make sure to assign appropriate roles to each user.