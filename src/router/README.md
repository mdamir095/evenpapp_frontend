# URL Protection & Permission-Based Routing System

## Overview

This system provides comprehensive URL protection and permission-based access control for the frontend application. It ensures that users can only access modules they have permissions for, while providing Super Admin with universal access.

## Key Features

### ✅ **URL Protection**
- Direct URL access blocked if user lacks permissions
- Route-level permission validation
- Automatic redirect to unauthorized page

### ✅ **Super Admin Privilege**
- Universal access to ALL modules regardless of specific permissions
- Bypass all permission checks (configurable)
- Multiple Super Admin role name formats supported

### ✅ **Permission-Based Access**
- Feature-specific permission validation
- Permission levels: `read`, `write`, `admin`
- Granular access control per module

### ✅ **Error Handling**
- Unauthorized access page with user-friendly messaging
- Dashboard notifications for access denials
- Navigation options for blocked users

## Components

### 1. **PermissionGuard** (`PermissionGuard.tsx`)

Main route protection component that validates user permissions:

```typescript
interface PermissionGuardProps {
  children: React.ReactElement;
  requiredFeature?: string; // Feature name required
  requiredPermission?: 'read' | 'write' | 'admin'; // Permission level
  allowSuperAdminBypass?: boolean; // Super Admin bypass (default: true)
}
```

**Features:**
- Authentication validation
- Super Admin bypass logic
- Route-to-feature mapping
- Permission level checking
- Automatic redirect on unauthorized access

### 2. **ProtectedRoute** (`ProtectedRoute.tsx`)

Simplified wrapper combining authentication and permission checks:

```typescript
<ProtectedRoute 
  requiredFeature="User Management" 
  requiredPermission="write"
>
  <UserForm />
</ProtectedRoute>
```

### 3. **UnauthorizedPage** (`../pages/UnauthorizedPage.tsx`)

User-friendly error page for unauthorized access attempts:

**Features:**
- Clear error messaging
- Navigation options (Back, Dashboard, Contact Admin)
- Attempted URL display
- Contact admin functionality

## Route Configuration

### Protected Routes Structure

```typescript
// User Management - Requires "User Management" feature permission
<Route path="/user-management" element={
  <ProtectedRoute requiredFeature="User Management" requiredPermission="read">
    <UserList />
  </ProtectedRoute>
} />

<Route path="/user-management/new" element={
  <ProtectedRoute requiredFeature="User Management" requiredPermission="write">
    <UserForm />
  </ProtectedRoute>
} />
```

### Universal Routes

These routes are accessible to ALL authenticated users:
- `/dashboard` - Main dashboard
- `/profile-setting` - Profile management
- `/logout` - Logout functionality

## Permission Mapping

### Route-to-Feature Mapping

```typescript
const ROUTE_FEATURE_MAPPING: Record<string, string> = {
  '/user-management': 'User Management',
  '/role-management': 'Role Management', 
  '/feature-management': 'Feature Management',
  '/enterprise-management': 'Enterprise Management',
  '/form-builder': 'Form Builder',
  '/venue-management': 'Venue Management',
  '/service-category': 'Service Management',
  '/vendor-management': 'Vendor Management',
  // ... more mappings
};
```

### Permission Levels

1. **`read`** - View/list access (minimum level)
2. **`write`** - Create/edit access (includes read)
3. **`admin`** - Full access including delete (includes write & read)

## Super Admin System

### Enhanced Detection

```typescript
export const isSuperAdmin = (userData: UserData | null): boolean => {
  // Supports multiple role name formats:
  // - "Super Admin", "super admin"
  // - "SUPER_ADMIN", "super_admin" 
  // - "SuperAdmin", "superadmin"
  // - "super-admin", "super"
  // - Any admin role containing "super"
};
```

### Universal Access

Super Admins have automatic access to:
- ✅ All management modules
- ✅ All CRUD operations  
- ✅ All feature permissions
- ✅ Bypass all route restrictions

## Error Handling Flow

### 1. **Unauthorized Access Attempt**
```
User tries to access /user-management
↓
PermissionGuard checks permissions
↓
User lacks "User Management" feature
↓
Redirect to /dashboard with error state
↓
Dashboard shows error notification
```

### 2. **Dashboard Error Display**
- Red banner with clear error message
- Auto-hide after 5 seconds
- Manual dismiss option
- Includes attempted URL for reference

## Usage Examples

### Basic Protection
```typescript
<ProtectedRoute requiredFeature="User Management">
  <UserList />
</ProtectedRoute>
```

### Write Permission Required
```typescript
<ProtectedRoute 
  requiredFeature="Role Management" 
  requiredPermission="write"
>
  <RoleForm />
</ProtectedRoute>
```

### Admin Permission Required
```typescript
<ProtectedRoute 
  requiredFeature="Feature Management" 
  requiredPermission="admin"
>
  <FeatureDelete />
</ProtectedRoute>
```

### Disable Super Admin Bypass
```typescript
<ProtectedRoute 
  requiredFeature="Critical Operation" 
  allowSuperAdminBypass={false}
>
  <CriticalComponent />
</ProtectedRoute>
```

## Benefits

### 🔒 **Security**
- Prevents unauthorized URL access
- Validates permissions at route level
- Protects against direct navigation attempts

### 👑 **Super Admin Convenience**  
- Full system access without complex permission setup
- Automatic bypass of all restrictions
- Multiple role name format support

### 🎯 **User Experience**
- Clear error messaging for blocked access
- Helpful navigation options
- Context-aware error handling

### 🛠 **Developer Experience**
- Simple route protection syntax
- Reusable components
- Comprehensive logging for debugging

## Debug & Monitoring

### Console Logging

The system provides detailed console logs for debugging:

```
🔑 Super Admin access granted for: /user-management
🔍 Permission Check: {
  route: "/role-management",
  feature: "Role Management", 
  requiredPermission: "write",
  hasAccess: true
}
✅ Access granted to: /feature-management
❌ Access denied to: /vendor-management Required feature: Vendor Management
```

### Permission Verification

```typescript
// Check permissions programmatically
const permissions = usePermissions('User Management');
console.log({
  canView: permissions.canView,
  canAdd: permissions.canAdd, 
  canEdit: permissions.canEdit,
  canDelete: permissions.canDelete
});
```

## Testing Scenarios

### 1. **Regular User Access**
- User with "User Management" read permission
- Can access `/user-management` (list view)
- Blocked from `/user-management/new` (requires write)
- Redirected to dashboard with error message

### 2. **Super Admin Access**
- Super Admin user
- Full access to ALL routes regardless of specific permissions
- No restrictions or redirects

### 3. **Direct URL Navigation**
- User manually types `/role-management` in browser
- System validates permissions before rendering
- Blocks access if insufficient permissions
- Shows appropriate error handling

## Migration Notes

### Before
- Basic `RequireAuth` for authentication only
- No permission-based URL protection
- Users could access unauthorized pages directly

### After
- Comprehensive permission validation
- URL-level access control
- Super Admin universal access
- User-friendly error handling
- Granular permission levels
