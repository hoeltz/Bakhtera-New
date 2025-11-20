# Customs Portal Menu Database - Complete Documentation

## Overview

This document provides comprehensive documentation for the Customs Portal Menu Database system, a complete local storage implementation designed for managing custom menu portals with advanced features including hierarchical menu structures, role-based permissions, user configurations, and full audit trails.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Entity Relationships](#entity-relationships)
4. [API Reference](#api-reference)
5. [Data Validation](#data-validation)
6. [Performance Optimization](#performance-optimization)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Components

The Customs Portal Menu Database consists of five core entities:

1. **Menu Hierarchy** - Hierarchical menu structure with parent-child relationships
2. **Permissions** - Granular access control permissions
3. **User Roles** - Role definitions with associated permissions and menu access
4. **Menu Configurations** - Customizable menu settings per role/user
5. **Change Tracking** - Complete audit trail of all database changes

### Key Features

- ✅ **Foreign Key Relationships** - Referential integrity enforcement
- ✅ **Schema Validation** - Comprehensive data validation
- ✅ **Data Integrity Checks** - Prevents orphaned records and circular references
- ✅ **Performance Optimization** - Indexing and caching mechanisms
- ✅ **CRUD Operations** - Full Create, Read, Update, Delete support
- ✅ **Audit Trail** - Complete change tracking with user attribution
- ✅ **Scalable Architecture** - Designed for development and production environments

---

## Database Schema

### 1. Menu Hierarchy

Represents the hierarchical structure of menu items.

```javascript
{
  id: string,                    // Unique identifier (required, unique)
  parentId: string | null,       // Parent menu ID (optional, FK: MENU_HIERARCHY.id)
  name: string,                  // Internal name (required, 1-100 chars)
  label: string,                 // Display label (required, 1-100 chars)
  path: string | null,           // Route path (optional, max 255 chars)
  icon: string | null,           // Icon identifier (optional, max 50 chars)
  order: number,                 // Display order (required, min: 0)
  level: number,                 // Hierarchy level (required, 0-5)
  isActive: boolean,             // Active status (required, default: true)
  isVisible: boolean,            // Visibility status (required, default: true)
  component: string | null,      // Component name (optional, max 100 chars)
  metadata: object,              // Additional metadata (optional)
  createdAt: string,             // ISO 8601 timestamp (required)
  updatedAt: string,             // ISO 8601 timestamp (required)
  createdBy: string,             // User ID who created (required)
  updatedBy: string              // User ID who last updated (required)
}
```

**Constraints:**
- `id` must be unique
- `parentId` must reference existing menu item or be null
- `level` must be between 0 and 5
- Cannot be its own parent (circular reference prevention)

### 2. Permissions

Defines granular permissions for menu access and actions.

```javascript
{
  id: string,                    // Unique identifier (required, unique)
  name: string,                  // Permission name (required, unique, 1-100 chars)
  code: string,                  // Permission code (required, unique, uppercase with underscores)
  description: string,           // Description (optional, max 500 chars)
  category: string,              // Category (required, enum: READ|WRITE|DELETE|EXECUTE|ADMIN)
  resource: string,              // Resource name (required, max 100 chars)
  action: string,                // Action name (required, max 50 chars)
  isActive: boolean,             // Active status (required, default: true)
  metadata: object,              // Additional metadata (optional)
  createdAt: string,             // ISO 8601 timestamp (required)
  updatedAt: string,             // ISO 8601 timestamp (required)
  createdBy: string,             // User ID who created (required)
  updatedBy: string              // User ID who last updated (required)
}
```

**Constraints:**
- `id`, `name`, and `code` must be unique
- `code` must match pattern: `^[A-Z_]+$`
- `category` must be one of: READ, WRITE, DELETE, EXECUTE, ADMIN

### 3. User Roles

Defines user roles with associated permissions and menu access.

```javascript
{
  id: string,                    // Unique identifier (required, unique)
  name: string,                  // Role name (required, unique, 1-100 chars)
  code: string,                  // Role code (required, unique, uppercase with underscores)
  description: string,           // Description (optional, max 500 chars)
  permissionIds: string[],       // Array of permission IDs (required, FK: PERMISSIONS.id)
  menuIds: string[],             // Array of menu IDs (required, FK: MENU_HIERARCHY.id)
  priority: number,              // Priority level (required, 0-100)
  isActive: boolean,             // Active status (required, default: true)
  isSystem: boolean,             // System role flag (required, default: false)
  metadata: object,              // Additional metadata (optional)
  createdAt: string,             // ISO 8601 timestamp (required)
  updatedAt: string,             // ISO 8601 timestamp (required)
  createdBy: string,             // User ID who created (required)
  updatedBy: string              // User ID who last updated (required)
}
```

**Constraints:**
- `id`, `name`, and `code` must be unique
- `code` must match pattern: `^[A-Z_]+$`
- All `permissionIds` must reference existing permissions
- All `menuIds` must reference existing menu items
- System roles (`isSystem: true`) cannot be deleted or have status changed

### 4. Menu Configurations

Stores customizable menu settings and preferences.

```javascript
{
  id: string,                    // Unique identifier (required, unique)
  menuId: string,                // Menu item ID (required, FK: MENU_HIERARCHY.id)
  roleId: string | null,         // Role ID (optional, FK: USER_ROLES.id)
  userId: string | null,         // User ID (optional)
  configType: string,            // Config type (required, enum: GLOBAL|ROLE|USER)
  settings: object,              // Configuration settings (required)
  theme: object,                 // Theme settings (optional)
  layout: object,                // Layout settings (optional)
  isActive: boolean,             // Active status (required, default: true)
  priority: number,              // Priority level (required, 0-100)
  metadata: object,              // Additional metadata (optional)
  createdAt: string,             // ISO 8601 timestamp (required)
  updatedAt: string,             // ISO 8601 timestamp (required)
  createdBy: string,             // User ID who created (required)
  updatedBy: string              // User ID who last updated (required)
}
```

**Constraints:**
- `menuId` must reference existing menu item
- `roleId` must reference existing role if provided
- `configType` must be one of: GLOBAL, ROLE, USER
- Priority determines which configuration takes precedence

### 5. Change Tracking

Audit trail for all database changes.

```javascript
{
  id: string,                    // Unique identifier (required, unique)
  entityType: string,            // Entity type (required, enum: MENU_HIERARCHY|PERMISSIONS|USER_ROLES|MENU_CONFIGURATIONS)
  entityId: string,              // Entity ID (required)
  operation: string,             // Operation type (required, enum: CREATE|UPDATE|DELETE)
  userId: string,                // User ID who made change (required)
  userName: string,              // User name (required)
  timestamp: string,             // ISO 8601 timestamp (required)
  oldValue: object | null,       // Previous value (for DELETE)
  newValue: object | null,       // New value (for CREATE)
  changes: array | null,         // Array of field changes (for UPDATE)
  ipAddress: string,             // IP address (optional)
  userAgent: string,             // User agent (optional)
  metadata: object               // Additional metadata (optional)
}
```

**Constraints:**
- Automatically created for all CREATE, UPDATE, DELETE operations
- Limited to last 1000 records to prevent storage overflow
- Cannot be manually created or modified

---

## Entity Relationships

### Entity Relationship Diagram

```
┌─────────────────────┐
│  MENU_HIERARCHY     │
│  ─────────────────  │
│  id (PK)            │◄──┐
│  parentId (FK)      │───┘ (self-referencing)
│  name               │
│  label              │
│  ...                │
└─────────────────────┘
         △
         │
         │ (FK: menuId)
         │
┌─────────────────────┐         ┌─────────────────────┐
│  USER_ROLES         │         │  PERMISSIONS        │
│  ─────────────────  │         │  ─────────────────  │
│  id (PK)            │         │  id (PK)            │
│  name               │         │  name               │
│  code               │         │  code               │
│  permissionIds[]────┼────────►│  category           │
│  menuIds[]──────────┼───┐     │  ...                │
│  ...                │   │     └─────────────────────┘
└─────────────────────┘   │
         △                │
         │                │
         │ (FK: roleId)   │ (FK: menuId)
         │                │
┌─────────────────────┐   │
│ MENU_CONFIGURATIONS │   │
│  ─────────────────  │   │
│  id (PK)            │   │
│  menuId (FK)────────┼───┘
│  roleId (FK)────────┼───┘
│  userId             │
│  configType         │
│  settings           │
│  ...                │
└─────────────────────┘

┌─────────────────────┐
│  CHANGE_TRACKING    │
│  ─────────────────  │
│  id (PK)            │
│  entityType         │
│  entityId           │
│  operation          │
│  userId             │
│  timestamp          │
│  ...                │
└─────────────────────┘
```

### Relationship Rules

1. **Menu Hierarchy**
   - Can have parent-child relationships (self-referencing)
   - Cannot be its own parent
   - Cannot be deleted if it has children
   - Cannot be deleted if referenced in configurations

2. **Permissions**
   - Can be referenced by multiple roles
   - Cannot be deleted if referenced by any role

3. **User Roles**
   - References multiple permissions
   - References multiple menu items
   - System roles cannot be deleted
   - Cannot be deleted if referenced in configurations

4. **Menu Configurations**
   - Must reference valid menu item
   - Must reference valid role (if roleId provided)
   - Priority determines configuration precedence

---

## API Reference

### Menu Hierarchy Service

#### `menuHierarchyService.getAll()`
Returns all menu items.

```javascript
const menuItems = menuHierarchyService.getAll();
```

#### `menuHierarchyService.getById(id)`
Returns a specific menu item by ID.

```javascript
const menuItem = menuHierarchyService.getById('MENU-123');
```

#### `menuHierarchyService.getChildren(parentId)`
Returns all children of a menu item.

```javascript
const children = menuHierarchyService.getChildren('MENU-123');
```

#### `menuHierarchyService.getTree()`
Returns the complete menu tree structure.

```javascript
const menuTree = menuHierarchyService.getTree();
// Returns hierarchical structure with nested children
```

#### `menuHierarchyService.create(menuData, userId, userName)`
Creates a new menu item.

```javascript
const newMenu = menuHierarchyService.create({
  name: 'customs_portal',
  label: 'Customs Portal',
  path: '/customs',
  icon: 'SecurityIcon',
  order: 1,
  level: 0,
  parentId: null
}, 'user123', 'John Doe');
```

#### `menuHierarchyService.update(id, menuData, userId, userName)`
Updates an existing menu item.

```javascript
const updated = menuHierarchyService.update('MENU-123', {
  label: 'Updated Label',
  order: 2
}, 'user123', 'John Doe');
```

#### `menuHierarchyService.delete(id, userId, userName)`
Deletes a menu item.

```javascript
const success = menuHierarchyService.delete('MENU-123', 'user123', 'John Doe');
```

### Permissions Service

#### `permissionsService.getAll()`
Returns all permissions.

```javascript
const permissions = permissionsService.getAll();
```

#### `permissionsService.getById(id)`
Returns a specific permission by ID.

```javascript
const permission = permissionsService.getById('PERM-123');
```

#### `permissionsService.getByCategory(category)`
Returns all active permissions in a category.

```javascript
const readPermissions = permissionsService.getByCategory('READ');
```

#### `permissionsService.create(permissionData, userId, userName)`
Creates a new permission.

```javascript
const newPermission = permissionsService.create({
  name: 'View Customs Items',
  code: 'CUSTOMS_ITEMS_READ',
  description: 'Permission to view customs items',
  category: 'READ',
  resource: 'customs_items',
  action: 'view'
}, 'user123', 'John Doe');
```

#### `permissionsService.update(id, permissionData, userId, userName)`
Updates an existing permission.

```javascript
const updated = permissionsService.update('PERM-123', {
  description: 'Updated description'
}, 'user123', 'John Doe');
```

#### `permissionsService.delete(id, userId, userName)`
Deletes a permission.

```javascript
const success = permissionsService.delete('PERM-123', 'user123', 'John Doe');
```

### User Roles Service

#### `userRolesService.getAll()`
Returns all user roles.

```javascript
const roles = userRolesService.getAll();
```

#### `userRolesService.getById(id)`
Returns a specific role by ID.

```javascript
const role = userRolesService.getById('ROLE-123');
```

#### `userRolesService.create(roleData, userId, userName)`
Creates a new user role.

```javascript
const newRole = userRolesService.create({
  name: 'Customs Officer',
  code: 'CUSTOMS_OFFICER',
  description: 'Role for customs officers',
  permissionIds: ['PERM-1', 'PERM-2'],
  menuIds: ['MENU-1', 'MENU-2'],
  priority: 50
}, 'user123', 'John Doe');
```

#### `userRolesService.update(id, roleData, userId, userName)`
Updates an existing role.

```javascript
const updated = userRolesService.update('ROLE-123', {
  permissionIds: ['PERM-1', 'PERM-2', 'PERM-3']
}, 'user123', 'John Doe');
```

#### `userRolesService.delete(id, userId, userName)`
Deletes a user role.

```javascript
const success = userRolesService.delete('ROLE-123', 'user123', 'John Doe');
```

### Menu Configurations Service

#### `menuConfigurationsService.getAll()`
Returns all menu configurations.

```javascript
const configs = menuConfigurationsService.getAll();
```

#### `menuConfigurationsService.getById(id)`
Returns a specific configuration by ID.

```javascript
const config = menuConfigurationsService.getById('CONFIG-123');
```

#### `menuConfigurationsService.getByMenuId(menuId)`
Returns all configurations for a menu item.

```javascript
const configs = menuConfigurationsService.getByMenuId('MENU-123');
```

#### `menuConfigurationsService.getByRoleId(roleId)`
Returns all configurations for a role.

```javascript
const configs = menuConfigurationsService.getByRoleId('ROLE-123');
```

#### `menuConfigurationsService.create(configData, userId, userName)`
Creates a new menu configuration.

```javascript
const newConfig = menuConfigurationsService.create({
  menuId: 'MENU-123',
  roleId: 'ROLE-123',
  configType: 'ROLE',
  settings: {
    defaultView: 'table',
    itemsPerPage: 25
  },
  theme: {
    primaryColor: '#667eea'
  },
  priority: 50
}, 'user123', 'John Doe');
```

#### `menuConfigurationsService.update(id, configData, userId, userName)`
Updates an existing configuration.

```javascript
const updated = menuConfigurationsService.update('CONFIG-123', {
  settings: {
    defaultView: 'grid',
    itemsPerPage: 50
  }
}, 'user123', 'John Doe');
```

#### `menuConfigurationsService.delete(id, userId, userName)`
Deletes a menu configuration.

```javascript
const success = menuConfigurationsService.delete('CONFIG-123', 'user123', 'John Doe');
```

### Change Tracking Service

#### `changeTrackingService.getAll()`
Returns all change records.

```javascript
const changes = changeTrackingService.getAll();
```

#### `changeTrackingService.getById(id)`
Returns a specific change record by ID.

```javascript
const change = changeTrackingService.getById('CHG-123');
```

#### `changeTrackingService.getByEntity(entityType, entityId)`
Returns all changes for a specific entity.

```javascript
const changes = changeTrackingService.getByEntity('MENU_HIERARCHY', 'MENU-123');
```

#### `changeTrackingService.getByUser(userId)`
Returns all changes made by a user.

```javascript
const changes = changeTrackingService.getByUser('user123');
```

#### `changeTrackingService.getByDateRange(startDate, endDate)`
Returns changes within a date range.

```javascript
const changes = changeTrackingService.getByDateRange(
  '2024-01-01T00:00:00Z',
  '2024-12-31T23:59:59Z'
);
```

#### `changeTrackingService.clear(olderThan)`
Clears change records.

```javascript
// Clear all records
changeTrackingService.clear();

// Clear records older than a date
changeTrackingService.clear('2024-01-01T00:00:00Z');
```

### Utility Functions

#### `initializeDatabase()`
Initializes the database with empty collections.

```javascript
import { initializeDatabase } from './customsPortalMenuDB';
initializeDatabase();
```

#### `clearDatabase()`
Clears all database data.

```javascript
import { clearDatabase } from './customsPortalMenuDB';
clearDatabase();
```

#### `exportDatabase()`
Exports database to JSON string.

```javascript
import { exportDatabase } from './customsPortalMenuDB';
const jsonData = exportDatabase();
// Save to file or send to server
```

#### `importDatabase(jsonData)`
Imports database from JSON string.

```javascript
import { importDatabase } from './customsPortalMenuDB';
importDatabase(jsonData);
```

#### `getDatabaseStats()`
Returns database statistics.

```javascript
import { getDatabaseStats } from './customsPortalMenuDB';
const stats = getDatabaseStats();
// {
//   menuItems: 10,
//   permissions: 25,
//   userRoles: 5,
//   configurations: 15,
//   changeRecords: 100,
//   cacheSize: 5,
//   indexSize: 4
// }
```

---

## Data Validation

### Validation Types

The system implements comprehensive validation:

1. **Schema Validation**
   - Type checking
   - Required field validation
   - String length constraints
   - Number range constraints
   - Pattern matching (regex)
   - Enum validation

2. **Foreign Key Validation**
   - Ensures referenced entities exist
   - Validates array of foreign keys
   - Prevents orphaned records

3. **Unique Constraint Validation**
   - Prevents duplicate values
   - Checks across all records
   - Excludes current record on update

4. **Business Logic Validation**
   - Prevents circular references
   - Protects system records
   - Enforces referential integrity

### Error Handling

The system throws specific error types:

```javascript
// ValidationError
try {
  menuHierarchyService.create({ name: '' }); // Missing required fields
} catch (error) {
  if (error.name === 'ValidationError') {
    console.log(error.message); // Detailed validation error
    console.log(error.field);   // Field that failed
    console.log(error.value);   // Invalid value
  }
}

// ReferentialIntegrityError
try {
  permissionsService.delete('PERM-123'); // Referenced by roles
} catch (error) {
  if (error.name === 'ReferentialIntegrityError') {
    console.log(error.message);        // Detailed error
    console.log(error.entityType);     // Entity being deleted
    console.log(error.entityId);       // Entity ID
    console.log(error.referencedType); // Type referencing it
  }
}
```

---

## Performance Optimization

### Caching System

The system implements automatic caching:

- **Cache TTL**: 5 minutes
- **Automatic Invalidation**: On data changes
- **Selective Caching**: Frequently accessed data

```javascript
// Cache is automatically used
const menuItems = menuHierarchyService.getAll(); // First call - from storage
const menuItems2 = menuHierarchyService.getAll(); // Second call - from cache

// Cache is automatically invalidated on changes
menuHierarchyService.create({...}); // Cache cleared
```

### Indexing System

The system maintains indexes for fast lookups:

- **By ID**: O(1) lookup by primary key
- **By Parent ID**: Fast hierarchical queries
- **By Role ID**: Quick role-based filtering
- **By Menu ID**: Efficient configuration lookups

```javascript
// Indexes are automatically maintained
const item = menuHierarchyService.getById('MENU-123'); // Uses index
const children = menuHierarchyService.getChildren('MENU-123'); // Uses index
```

### Best Practices for Performance

1. **Use Batch Operations**
   ```javascript
   // Good - single transaction
   const items = menuHierarchyService.getAll();
   
   // Avoid - multiple transactions
   items.forEach(item => {
     menuHierarchyService.getById(item.id);
   });
   ```

2. **Leverage Caching**
   ```javascript
   // Cache is used automatically for repeated calls
   const tree1 = menuHierarchyService.getTree();
   const tree2 = menuHierarchyService.getTree(); // From cache
   ```

3. **Use Specific Queries**
   ```javascript
   // Good - specific query
   const children = menuHierarchyService.getChildren('MENU-123');
   
   // Avoid - filter all items
   const all = menuHierarchyService.getAll();
   const children = all.filter(item => item.parentId === 'MENU-123');
   ```

---

## Usage Examples

### Example 1: Creating a Complete Menu Structure

```javascript
import {
  menuHierarchyService,
  permissionsService,
  userRolesService,
  menuConfigurationsService,
  initializeDatabase
} from './customsPortalMenuDB';

// Initialize database
initializeDatabase();

// Create permissions
const viewPermission = permissionsService.create({
  name: 'View Customs Items',
  code: 'CUSTOMS_ITEMS_VIEW',
  category: 'READ',
  resource: 'customs_items',
  action: 'view'
}, 'admin', 'Admin User');

const editPermission = permissionsService.create({
  name: 'Edit Customs Items',
  code: 'CUSTOMS_ITEMS_EDIT',
  category: 'WRITE',
  resource: 'customs_items',
  action: 'edit'
}, 'admin', 'Admin User');

// Create menu hierarchy
const mainMenu = menuHierarchyService.create({
  name: 'customs_portal',
  label: 'Customs Portal',
  path: '/customs',
  icon: 'SecurityIcon',
  order: 1,
  level: 0,
  parentId: null
}, 'admin', 'Admin User');

const itemsMenu = menuHierarchyService.create({
  name: 'customs_items',
  label: 'Customs Items',
  path: '/customs/items',
  icon: 'InventoryIcon',
  order: 1,
  level: 1,
  parentId: mainMenu.id,
  component: 'BRidgeCustomsPortal'
}, 'admin', 'Admin User');

// Create user role
const customsOfficer = userRolesService.create({
  name: 'Customs Officer',
  code: 'CUSTOMS_OFFICER',
  description: 'Standard customs officer role',
  permissionIds: [viewPermission.id, editPermission.id],
  menuIds: [mainMenu.id, itemsMenu.id],
  priority: 50
}, 'admin', 'Admin User');

// Create menu configuration
const config = menuConfigurationsService.create({
  menuId: itemsMenu.id,
  roleId: customsOfficer.id,
  configType: 'ROLE',
  settings: {
    defaultView: 'table',
    itemsPerPage: 25,
    enableFilters: true
  },
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2'
  },
  priority: 50
}, 'admin', 'Admin User');

console.log('Menu structure created successfully!');
```

### Example 2: Querying Menu Tree for User Role

```javascript
import {
  menuHierarchyService,
  userRolesService
} from './customsPortalMenuDB';

// Get user's role
const userRole = userRolesService.getById('ROLE-123');

// Get full menu tree
const fullTree = menuHierarchyService.getTree();

// Filter menu tree based on role permissions
const filterMenuByRole = (menuTree, allowedMenuIds) => {
  return menuTree
    .filter(item => allowedMenuIds.includes(item.id) && item.isActive && item.isVisible)
    .map(item => ({
      ...item,
      children: filterMenuByRole(item.children, allowedMenuIds)
    }));
};

const userMenuTree = filterMenuByRole(fullTree, userRole.menuIds);

console.log('User menu tree:', userMenuTree);
```

### Example 3: Audit Trail Analysis

```javascript
import { changeTrackingService } from './customsPortalMenuDB';

// Get all changes for a specific menu item
const menuChanges = changeTrackingService.getByEntity('MENU_HIERARCHY', 'MENU-123');

// Analyze changes
menuChanges.forEach(change => {
  console.log(`${change.operation} by ${change.userName} at ${change.timestamp}`);
  
  if (change.operation === 'UPDATE') {
    change.changes.forEach(fieldChange => {
      console.log(`  ${fieldChange.field}: ${fieldChange.oldValue} → ${fieldChange.newValue}`);
    });
  }
});

// Get user activity
const userChanges = changeTrackingService.getByUser('user123');
console.log(`User made ${userChanges.length} changes`);

// Get recent changes
const recentChanges = changeTrackingService.getByDateRange(
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
  new Date().toISOString()
);
console.log(`${recentChanges.length} changes in the last 7 days`);
```

### Example 4: Data Export and Import

```javascript
import {
  exportDatabase,
  importDatabase,
  getDatabaseStats
} from './customsPortalMenuDB';

// Export database
const jsonData = exportDatabase();
console.log('Database exported:', jsonData);

// Save to file (in Node.js environment)
// fs.writeFileSync('database-backup.json', jsonData);

// Get statistics before import
const statsBefore = getDatabaseStats();
console.log('Stats before:', statsBefore);

// Import database
importDatabase(jsonData);

// Get statistics after import
const statsAfter = getDatabaseStats();
console.log('Stats after:', statsAfter);
```

---

## Best Practices

### 1. Always Provide User Context

```javascript
// Good
menuHierarchyService.create(menuData, 'user123', 'John Doe');

// Avoid - uses default 'system' user
menuHierarchyService.create(menuData);
```

### 2. Handle Errors Appropriately

```javascript
try {
  const menu = menuHierarchyService.create(menuData, userId, userName);
  console.log('Menu created:', menu);
} catch (error) {
  if (error.name === 'ValidationError') {
    // Show validation errors to user
    showValidationError(error.message);
  } else if (error.name === 'ReferentialIntegrityError') {
    // Show referential integrity error
    showIntegrityError(error.message);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

### 3. Use Transactions for Related Operations

```javascript
// When creating related entities, handle rollback on failure
let menuId, roleId, configId;

try {
  const menu = menuHierarchyService.create(menuData, userId, userName);
  menuId = menu.id;
  
  const role = userRolesService.create({
    ...roleData,
    menuIds: [menuId]
  }, userId, userName);
  roleId = role.id;
  
  const config = menuConfigurationsService.create({
    menuId,
    roleId,
    ...configData
  }, userId, userName);
  configId = config.id;
  
} catch (error) {
  // Rollback on error
  if (configId) menuConfigurationsService.delete(configId, userId, userName);
  if (roleId) userRolesService.delete(roleId, userId, userName);
  if (menuId) menuHierarchyService.delete(menuId, userId, userName);
  
  throw error;
}
```

### 4. Validate Before Bulk Operations

```javascript
// Validate all items before starting bulk operation
const itemsToCreate = [...];

// Pre-validate
const validationErrors = [];
itemsToCreate.forEach((item, index) => {
  try {
    validateSchema(item, MENU_HIERARCHY_SCHEMA, 'MENU_HIERARCHY');
  } catch (error) {
    validationErrors.push({ index, error: error.message });
  }
});

if (validationErrors.length > 0) {
  console.error('Validation errors:', validationErrors);
  return;
}

// Proceed with bulk creation
itemsToCreate.forEach(item => {
  menuHierarchyService.create(item, userId, userName);
});
```

### 5. Regular Maintenance

```javascript
// Periodically clean old change tracking records
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
changeTrackingService.clear(thirtyDaysAgo);

// Export database regularly for backup
const backup = exportDatabase();
// Save backup to secure location
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: ValidationError - Required field missing

**Error:**
```
ValidationError: Validation failed for MENU_HIERARCHY:
  - Field 'name' is required
```

**Solution:**
Ensure all required fields are provided:
```javascript
const menuData = {
  name: 'menu_name',        // Required
  label: 'Menu Label',      // Required
  order: 1,                 // Required
  level: 0                  // Required
};
```

#### Issue 2: ReferentialIntegrityError - Cannot delete referenced entity

**Error:**
```
ReferentialIntegrityError: Cannot delete permission referenced in user roles
```

**Solution:**
Remove references before deletion:
```javascript
// 1. Find all roles using this permission
const roles = userRolesService.getAll();
const affectedRoles = roles.filter(role => 
  role.permissionIds.includes(permissionId)
);

// 2. Update roles to remove permission
affectedRoles.forEach(role => {
  userRolesService.update(role.id, {
    permissionIds: role.permissionIds.filter(id => id !== permissionId)
  }, userId, userName);
});

// 3. Now delete permission
permissionsService.delete(permissionId, userId, userName);
```

#### Issue 3: Circular reference in menu hierarchy

**Error:**
```
Error: Menu item cannot be its own parent
```

**Solution:**
Ensure parentId is different from id:
```javascript
// Avoid
menuHierarchyService.update('MENU-123', {
  parentId: 'MENU-123'  // Cannot be its own parent
}, userId, userName);

// Correct
menuHierarchyService.update('MENU-123', {
  parentId: 'MENU-456'  // Different parent
}, userId, userName);
```

#### Issue 4: Unique constraint violation

**Error:**
```
ValidationError: Field 'code' must be unique. Value 'ADMIN_ROLE' already exists
```

**Solution:**
Use unique values:
```javascript
// Check if code exists before creating
const existingRoles = userRolesService.getAll();
const codeExists = existingRoles.some(role => role.code === 'ADMIN_ROLE');

if (codeExists) {
  // Use different code or update existing role
  console.log('Role with this code already exists');
} else {
  userRolesService.create({
    code: 'ADMIN_ROLE',
    ...roleData
  }, userId, userName);
}
```

#### Issue 5: Storage quota exceeded

**Error:**
```
QuotaExceededError: Failed to execute 'setItem' on 'Storage'
```

**Solution:**
Clean up old data:
```javascript
// Clear old change tracking records
changeTrackingService.clear(oldDate);

// Or export and clear database
const backup = exportDatabase();
// Save backup
clearDatabase();
// Import only necessary data
```

---

## Integration with BRidgeCustomsPortal

### Step 1: Import the Database Service

```javascript
// In BRidgeCustomsPortal.js
import {
  menuHierarchyService,
  permissionsService,
  userRolesService,
  menuConfigurationsService,
  initializeDatabase
} from '../services/customsPortalMenuDB';
```

### Step 2: Initialize on Component Mount

```javascript
useEffect(() => {
  // Initialize database
  initializeDatabase();
  
  // Load menu structure
  const menuTree = menuHierarchyService.getTree();
  setMenuStructure(menuTree);
  
  // Load user role and permissions
  const userRole = userRolesService.getById(currentUserRoleId);
  setUserPermissions(userRole.permissionIds);
  
  // Load menu configurations
  const configs = menuConfigurationsService.getByRoleId(currentUserRoleId);
  applyConfigurations(configs);
}, []);
```

### Step 3: Use in Menu Rendering

```javascript
const renderMenu = (menuItems, userPermissions) => {
  return menuItems
    .filter(item => hasPermission(item, userPermissions))
    .map(item => (
      <MenuItem key={item.id}>
        <ListItemIcon>{getIcon(item.icon)}</ListItemIcon>
        <ListItemText primary={item.label} />
        {item.children && item.children.length > 0 && (
          <List>
            {renderMenu(item.children, userPermissions)}
          </List>
        )}
      </MenuItem>
    ));
};
```

---

## Conclusion

The Customs Portal Menu Database provides a robust, scalable solution for managing custom menu systems with comprehensive features including:

- ✅ Complete CRUD operations for all entities
- ✅ Foreign key relationships and referential integrity
- ✅ Comprehensive data validation
- ✅ Performance optimization through caching and indexing
- ✅ Full audit trail with change tracking
- ✅ Export/import capabilities for backup and migration

For additional support or questions, refer to the API reference section or examine the source code in [`src/services/customsPortalMenuDB.js`](src/services/customsPortalMenuDB.js).
