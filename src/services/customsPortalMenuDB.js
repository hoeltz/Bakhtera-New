/**
 * Customs Portal Menu Database Service
 * 
 * Complete local storage database implementation for custom menu portal system
 * with 5 core entities: Menu Hierarchy, Permissions, User Roles, Menu Configurations, and Change Tracking
 * 
 * Features:
 * - Foreign key relationships and referential integrity
 * - Schema validation and data integrity checks
 * - Performance optimization with indexing and caching
 * - Full CRUD operations for all entities
 * - Scalable architecture for development environment
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================
const STORAGE_KEYS = {
  MENU_HIERARCHY: 'customs_portal_menu_hierarchy',
  PERMISSIONS: 'customs_portal_permissions',
  USER_ROLES: 'customs_portal_user_roles',
  MENU_CONFIGURATIONS: 'customs_portal_menu_configurations',
  CHANGE_TRACKING: 'customs_portal_change_tracking',
  CACHE: 'customs_portal_cache',
  INDEXES: 'customs_portal_indexes'
};

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * Menu Hierarchy Schema
 * Represents the hierarchical structure of menu items
 */
const MENU_HIERARCHY_SCHEMA = {
  id: { type: 'string', required: true, unique: true },
  parentId: { type: 'string', required: false, foreignKey: 'MENU_HIERARCHY.id' },
  name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
  label: { type: 'string', required: true, minLength: 1, maxLength: 100 },
  path: { type: 'string', required: false, maxLength: 255 },
  icon: { type: 'string', required: false, maxLength: 50 },
  order: { type: 'number', required: true, min: 0 },
  level: { type: 'number', required: true, min: 0, max: 5 },
  isActive: { type: 'boolean', required: true, default: true },
  isVisible: { type: 'boolean', required: true, default: true },
  component: { type: 'string', required: false, maxLength: 100 },
  metadata: { type: 'object', required: false },
  createdAt: { type: 'string', required: true },
  updatedAt: { type: 'string', required: true },
  createdBy: { type: 'string', required: true },
  updatedBy: { type: 'string', required: true }
};

/**
 * Permissions Schema
 * Defines granular permissions for menu access and actions
 */
const PERMISSIONS_SCHEMA = {
  id: { type: 'string', required: true, unique: true },
  name: { type: 'string', required: true, unique: true, minLength: 1, maxLength: 100 },
  code: { type: 'string', required: true, unique: true, pattern: /^[A-Z_]+$/ },
  description: { type: 'string', required: false, maxLength: 500 },
  category: { type: 'string', required: true, enum: ['READ', 'WRITE', 'DELETE', 'EXECUTE', 'ADMIN'] },
  resource: { type: 'string', required: true, maxLength: 100 },
  action: { type: 'string', required: true, maxLength: 50 },
  isActive: { type: 'boolean', required: true, default: true },
  metadata: { type: 'object', required: false },
  createdAt: { type: 'string', required: true },
  updatedAt: { type: 'string', required: true },
  createdBy: { type: 'string', required: true },
  updatedBy: { type: 'string', required: true }
};

/**
 * User Roles Schema
 * Defines user roles with associated permissions
 */
const USER_ROLES_SCHEMA = {
  id: { type: 'string', required: true, unique: true },
  name: { type: 'string', required: true, unique: true, minLength: 1, maxLength: 100 },
  code: { type: 'string', required: true, unique: true, pattern: /^[A-Z_]+$/ },
  description: { type: 'string', required: false, maxLength: 500 },
  permissionIds: { type: 'array', required: true, items: { type: 'string', foreignKey: 'PERMISSIONS.id' } },
  menuIds: { type: 'array', required: true, items: { type: 'string', foreignKey: 'MENU_HIERARCHY.id' } },
  priority: { type: 'number', required: true, min: 0, max: 100 },
  isActive: { type: 'boolean', required: true, default: true },
  isSystem: { type: 'boolean', required: true, default: false },
  metadata: { type: 'object', required: false },
  createdAt: { type: 'string', required: true },
  updatedAt: { type: 'string', required: true },
  createdBy: { type: 'string', required: true },
  updatedBy: { type: 'string', required: true }
};

/**
 * Menu Configurations Schema
 * Stores customizable menu settings and preferences
 */
const MENU_CONFIGURATIONS_SCHEMA = {
  id: { type: 'string', required: true, unique: true },
  menuId: { type: 'string', required: true, foreignKey: 'MENU_HIERARCHY.id' },
  roleId: { type: 'string', required: false, foreignKey: 'USER_ROLES.id' },
  userId: { type: 'string', required: false },
  configType: { type: 'string', required: true, enum: ['GLOBAL', 'ROLE', 'USER'] },
  settings: { type: 'object', required: true },
  theme: { type: 'object', required: false },
  layout: { type: 'object', required: false },
  isActive: { type: 'boolean', required: true, default: true },
  priority: { type: 'number', required: true, min: 0, max: 100 },
  metadata: { type: 'object', required: false },
  createdAt: { type: 'string', required: true },
  updatedAt: { type: 'string', required: true },
  createdBy: { type: 'string', required: true },
  updatedBy: { type: 'string', required: true }
};

/**
 * Change Tracking Schema
 * Audit trail for all database changes
 */
const CHANGE_TRACKING_SCHEMA = {
  id: { type: 'string', required: true, unique: true },
  entityType: { type: 'string', required: true, enum: ['MENU_HIERARCHY', 'PERMISSIONS', 'USER_ROLES', 'MENU_CONFIGURATIONS'] },
  entityId: { type: 'string', required: true },
  operation: { type: 'string', required: true, enum: ['CREATE', 'UPDATE', 'DELETE'] },
  userId: { type: 'string', required: true },
  userName: { type: 'string', required: true },
  timestamp: { type: 'string', required: true },
  oldValue: { type: 'object', required: false },
  newValue: { type: 'object', required: false },
  changes: { type: 'array', required: false },
  ipAddress: { type: 'string', required: false },
  userAgent: { type: 'string', required: false },
  metadata: { type: 'object', required: false }
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

class ReferentialIntegrityError extends Error {
  constructor(message, entityType, entityId, referencedType) {
    super(message);
    this.name = 'ReferentialIntegrityError';
    this.entityType = entityType;
    this.entityId = entityId;
    this.referencedType = referencedType;
  }
}

/**
 * Validates data against schema definition
 */
const validateSchema = (data, schema, entityType) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required field validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(new ValidationError(`Field '${field}' is required`, field, value));
      continue;
    }

    // Skip further validation if field is not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (rules.type && value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors.push(new ValidationError(
          `Field '${field}' must be of type '${rules.type}', got '${actualType}'`,
          field,
          value
        ));
      }
    }

    // String validations
    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(new ValidationError(
          `Field '${field}' must be at least ${rules.minLength} characters`,
          field,
          value
        ));
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(new ValidationError(
          `Field '${field}' must not exceed ${rules.maxLength} characters`,
          field,
          value
        ));
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(new ValidationError(
          `Field '${field}' does not match required pattern`,
          field,
          value
        ));
      }
    }

    // Number validations
    if (rules.type === 'number' && typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(new ValidationError(
          `Field '${field}' must be at least ${rules.min}`,
          field,
          value
        ));
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(new ValidationError(
          `Field '${field}' must not exceed ${rules.max}`,
          field,
          value
        ));
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(new ValidationError(
        `Field '${field}' must be one of: ${rules.enum.join(', ')}`,
        field,
        value
      ));
    }

    // Array validation
    if (rules.type === 'array' && Array.isArray(value)) {
      if (rules.items) {
        value.forEach((item, index) => {
          if (rules.items.type) {
            const itemType = typeof item;
            if (itemType !== rules.items.type) {
              errors.push(new ValidationError(
                `Array item at index ${index} in field '${field}' must be of type '${rules.items.type}'`,
                `${field}[${index}]`,
                item
              ));
            }
          }
        });
      }
    }
  }

  if (errors.length > 0) {
    const errorMessage = `Validation failed for ${entityType}:\n${errors.map(e => `  - ${e.message}`).join('\n')}`;
    throw new ValidationError(errorMessage, 'schema', data);
  }

  return true;
};

/**
 * Validates foreign key references
 */
const validateForeignKeys = (data, schema, entityType, storage) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.foreignKey && value) {
      const [refEntity, refField] = rules.foreignKey.split('.');
      const refKey = STORAGE_KEYS[refEntity];
      
      if (refKey) {
        const refData = getFromStorage(refKey);
        const exists = refData.some(item => item[refField] === value);
        
        if (!exists) {
          errors.push(new ReferentialIntegrityError(
            `Foreign key '${field}' references non-existent ${refEntity}.${refField}: ${value}`,
            entityType,
            data.id,
            refEntity
          ));
        }
      }
    }

    // Array of foreign keys
    if (rules.type === 'array' && rules.items?.foreignKey && Array.isArray(value)) {
      const [refEntity, refField] = rules.items.foreignKey.split('.');
      const refKey = STORAGE_KEYS[refEntity];
      
      if (refKey) {
        const refData = getFromStorage(refKey);
        value.forEach((fkValue, index) => {
          const exists = refData.some(item => item[refField] === fkValue);
          if (!exists) {
            errors.push(new ReferentialIntegrityError(
              `Foreign key at '${field}[${index}]' references non-existent ${refEntity}.${refField}: ${fkValue}`,
              entityType,
              data.id,
              refEntity
            ));
          }
        });
      }
    }
  }

  if (errors.length > 0) {
    const errorMessage = `Foreign key validation failed for ${entityType}:\n${errors.map(e => `  - ${e.message}`).join('\n')}`;
    throw new ReferentialIntegrityError(errorMessage, entityType, data.id, 'multiple');
  }

  return true;
};

/**
 * Checks for unique constraint violations
 */
const validateUnique = (data, schema, entityType, storageKey, excludeId = null) => {
  const existingData = getFromStorage(storageKey);
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    if (rules.unique && data[field] !== undefined) {
      const duplicate = existingData.find(item => 
        item[field] === data[field] && item.id !== excludeId
      );
      
      if (duplicate) {
        errors.push(new ValidationError(
          `Field '${field}' must be unique. Value '${data[field]}' already exists`,
          field,
          data[field]
        ));
      }
    }
  }

  if (errors.length > 0) {
    const errorMessage = `Unique constraint violation for ${entityType}:\n${errors.map(e => `  - ${e.message}`).join('\n')}`;
    throw new ValidationError(errorMessage, 'unique', data);
  }

  return true;
};

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Get data from localStorage
 */
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
};

/**
 * Save data to localStorage
 */
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    invalidateCache();
    updateIndexes(key, data);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

// ============================================================================
// CACHING SYSTEM
// ============================================================================

let cacheStore = {};
let cacheTimestamps = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data
 */
const getFromCache = (key) => {
  const timestamp = cacheTimestamps[key];
  if (timestamp && (Date.now() - timestamp < CACHE_TTL)) {
    return cacheStore[key];
  }
  return null;
};

/**
 * Set cache data
 */
const setCache = (key, data) => {
  cacheStore[key] = data;
  cacheTimestamps[key] = Date.now();
};

/**
 * Invalidate all cache
 */
const invalidateCache = () => {
  cacheStore = {};
  cacheTimestamps = {};
};

/**
 * Invalidate specific cache key
 */
const invalidateCacheKey = (key) => {
  delete cacheStore[key];
  delete cacheTimestamps[key];
};

// ============================================================================
// INDEXING SYSTEM
// ============================================================================

let indexStore = {};

/**
 * Update indexes for faster lookups
 */
const updateIndexes = (storageKey, data) => {
  if (!Array.isArray(data)) return;

  const indexes = {};
  
  // Create indexes for common lookup fields
  data.forEach(item => {
    // Index by ID
    if (item.id) {
      if (!indexes.byId) indexes.byId = {};
      indexes.byId[item.id] = item;
    }
    
    // Index by parentId for hierarchical data
    if (item.parentId !== undefined) {
      if (!indexes.byParentId) indexes.byParentId = {};
      if (!indexes.byParentId[item.parentId]) indexes.byParentId[item.parentId] = [];
      indexes.byParentId[item.parentId].push(item);
    }
    
    // Index by roleId
    if (item.roleId) {
      if (!indexes.byRoleId) indexes.byRoleId = {};
      if (!indexes.byRoleId[item.roleId]) indexes.byRoleId[item.roleId] = [];
      indexes.byRoleId[item.roleId].push(item);
    }
    
    // Index by menuId
    if (item.menuId) {
      if (!indexes.byMenuId) indexes.byMenuId = {};
      if (!indexes.byMenuId[item.menuId]) indexes.byMenuId[item.menuId] = [];
      indexes.byMenuId[item.menuId].push(item);
    }
  });

  indexStore[storageKey] = indexes;
};

/**
 * Get indexed data
 */
const getFromIndex = (storageKey, indexType, value) => {
  const indexes = indexStore[storageKey];
  if (!indexes || !indexes[indexType]) return null;
  return indexes[indexType][value];
};

// ============================================================================
// CHANGE TRACKING
// ============================================================================

/**
 * Record a change in the audit trail
 */
const recordChange = (entityType, entityId, operation, oldValue, newValue, userId = 'system', userName = 'System') => {
  try {
    const changes = [];
    
    if (operation === 'UPDATE' && oldValue && newValue) {
      for (const key in newValue) {
        if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
          changes.push({
            field: key,
            oldValue: oldValue[key],
            newValue: newValue[key]
          });
        }
      }
    }

    const changeRecord = {
      id: `CHG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      operation,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      oldValue: operation === 'DELETE' ? oldValue : undefined,
      newValue: operation === 'CREATE' ? newValue : undefined,
      changes: operation === 'UPDATE' ? changes : undefined,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        timestamp: Date.now()
      }
    };

    const trackingData = getFromStorage(STORAGE_KEYS.CHANGE_TRACKING);
    trackingData.push(changeRecord);
    
    // Keep only last 1000 records to prevent storage overflow
    if (trackingData.length > 1000) {
      trackingData.splice(0, trackingData.length - 1000);
    }
    
    saveToStorage(STORAGE_KEYS.CHANGE_TRACKING, trackingData);
    return changeRecord;
  } catch (error) {
    console.error('Error recording change:', error);
    return null;
  }
};

// ============================================================================
// CRUD OPERATIONS - MENU HIERARCHY
// ============================================================================

export const menuHierarchyService = {
  /**
   * Get all menu items
   */
  getAll: () => {
    const cached = getFromCache('menuHierarchy_all');
    if (cached) return cached;

    const data = getFromStorage(STORAGE_KEYS.MENU_HIERARCHY);
    setCache('menuHierarchy_all', data);
    return data;
  },

  /**
   * Get menu item by ID
   */
  getById: (id) => {
    if (!id) return null;
    
    const indexed = getFromIndex(STORAGE_KEYS.MENU_HIERARCHY, 'byId', id);
    if (indexed) return indexed;

    const items = getFromStorage(STORAGE_KEYS.MENU_HIERARCHY);
    return items.find(item => item.id === id) || null;
  },

  /**
   * Get children of a menu item
   */
  getChildren: (parentId) => {
    const indexed = getFromIndex(STORAGE_KEYS.MENU_HIERARCHY, 'byParentId', parentId);
    if (indexed) return indexed;

    const items = getFromStorage(STORAGE_KEYS.MENU_HIERARCHY);
    return items.filter(item => item.parentId === parentId);
  },

  /**
   * Get menu tree structure
   */
  getTree: () => {
    const cached = getFromCache('menuHierarchy_tree');
    if (cached) return cached;

    const items = getFromStorage(STORAGE_KEYS.MENU_HIERARCHY);
    const buildTree = (parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(item => ({
          ...item,
          children: buildTree(item.id)
        }));
    };

    const tree = buildTree(null);
    setCache('menuHierarchy_tree', tree);
    return tree;
  },

  /**
   * Create new menu item
   */
  create: (menuData, userId = 'system', userName = 'System') => {
    try {
      // Validate schema
      validateSchema(menuData, MENU_HIERARCHY_SCHEMA, 'MENU_HIERARCHY');

      // Validate unique constraints
      validateUnique(menuData, MENU_HIERARCHY_SCHEMA, 'MENU_HIERARCHY', STORAGE_KEYS.MENU_HIERARCHY);

      // Validate foreign keys
      validateForeignKeys(menuData, MENU_HIERARCHY_SCHEMA, 'MENU_HIERARCHY');

      const items = getFromStorage(STORAGE_KEYS.MENU_HIERARCHY);

      const newItem = {
        id: menuData.id || `MENU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parentId: menuData.parentId || null,
        name: menuData.name,
        label: menuData.label,
        path: menuData.path || null,
        icon: menuData.icon || null,
        order: menuData.order,
        level: menuData.level,
        isActive: menuData.isActive !== undefined ? menuData.isActive : true,
        isVisible: menuData.isVisible !== undefined ? menuData.isVisible : true,
        component: menuData.component || null,
        metadata: menuData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId
      };

      items.push(newItem);
      saveToStorage(STORAGE_KEYS.MENU_HIERARCHY, items);
      recordChange('MENU_HIERARCHY', newItem.id, 'CREATE', null, newItem, userId, userName);
      invalidateCacheKey('menuHierarchy_all');
      invalidateCacheKey('menuHierarchy_tree');

      return newItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  /**
   * Update menu item
   */
  update: (id, menuData, userId = 'system', userName = 'System') => {
    try {
      if (!id) throw new Error('Menu item ID is required');

      const items = getFromStorage(STORAGE_KEYS.MENU_HIERARCHY);
      const index = items.findIndex(item => item.id === id);

      if (index === -1) {
        throw new Error('Menu item not found');
      }

      const oldItem = { ...items[index] };

      // Validate schema
      const updatedData = { ...items[index], ...menuData, id };
      validateSchema(updatedData, MENU_HIERARCHY_SCHEMA, 'MENU_HIERARCHY');

      // Validate unique constraints
      validateUnique(updatedData, MENU_HIERARCHY_SCHEMA, 'MENU_HIERARCHY', STORAGE_KEYS.MENU_HIERARCHY, id);

      // Validate foreign keys
      validateForeignKeys(updatedData, MENU_HIERARCHY_SCHEMA, 'MENU_HIERARCHY');

      // Prevent circular references
      if (menuData.parentId && menuData.parentId === id) {
        throw new Error('Menu item cannot be its own parent');
      }

      const updatedItem = {
        ...items[index],
        ...menuData,
        id,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };

      items[index] = updatedItem;
      saveToStorage(STORAGE_KEYS.MENU_HIERARCHY, items);
      recordChange('MENU_HIERARCHY', id, 'UPDATE', oldItem, updatedItem, userId, userName);
      invalidateCacheKey('menuHierarchy_all');
      invalidateCacheKey('menuHierarchy_tree');

      return updatedItem;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  /**
   * Delete menu item
   */
  delete: (id, userId = 'system', userName = 'System') => {
    try {
      if (!id) throw new Error('Menu item ID is required');

      const items = getFromStorage(STORAGE_KEYS.MENU_HIERARCHY);
      const item = items.find(i => i.id === id);

      if (!item) {
        throw new Error('Menu item not found');
      }

      // Check for children
      const hasChildren = items.some(i => i.parentId === id);
      if (hasChildren) {
        throw new ReferentialIntegrityError(
          'Cannot delete menu item with children. Delete children first.',
          'MENU_HIERARCHY',
          id,
          'MENU_HIERARCHY'
        );
      }

      // Check for references in configurations
      const configs = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);
      const hasConfigs = configs.some(c => c.menuId === id);
      if (hasConfigs) {
        throw new ReferentialIntegrityError(
          'Cannot delete menu item referenced in configurations',
          'MENU_HIERARCHY',
          id,
          'MENU_CONFIGURATIONS'
        );
      }

      const filteredItems = items.filter(i => i.id !== id);
      saveToStorage(STORAGE_KEYS.MENU_HIERARCHY, filteredItems);
      recordChange('MENU_HIERARCHY', id, 'DELETE', item, null, userId, userName);
      invalidateCacheKey('menuHierarchy_all');
      invalidateCacheKey('menuHierarchy_tree');

      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }
};

// ============================================================================
// CRUD OPERATIONS - PERMISSIONS
// ============================================================================

export const permissionsService = {
  getAll: () => {
    const cached = getFromCache('permissions_all');
    if (cached) return cached;

    const data = getFromStorage(STORAGE_KEYS.PERMISSIONS);
    setCache('permissions_all', data);
    return data;
  },

  getById: (id) => {
    if (!id) return null;
    
    const indexed = getFromIndex(STORAGE_KEYS.PERMISSIONS, 'byId', id);
    if (indexed) return indexed;

    const permissions = getFromStorage(STORAGE_KEYS.PERMISSIONS);
    return permissions.find(p => p.id === id) || null;
  },

  getByCategory: (category) => {
    const permissions = getFromStorage(STORAGE_KEYS.PERMISSIONS);
    return permissions.filter(p => p.category === category && p.isActive);
  },

  create: (permissionData, userId = 'system', userName = 'System') => {
    try {
      validateSchema(permissionData, PERMISSIONS_SCHEMA, 'PERMISSIONS');
      validateUnique(permissionData, PERMISSIONS_SCHEMA, 'PERMISSIONS', STORAGE_KEYS.PERMISSIONS);

      const permissions = getFromStorage(STORAGE_KEYS.PERMISSIONS);

      const newPermission = {
        id: permissionData.id || `PERM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: permissionData.name,
        code: permissionData.code,
        description: permissionData.description || '',
        category: permissionData.category,
        resource: permissionData.resource,
        action: permissionData.action,
        isActive: permissionData.isActive !== undefined ? permissionData.isActive : true,
        metadata: permissionData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId
      };

      permissions.push(newPermission);
      saveToStorage(STORAGE_KEYS.PERMISSIONS, permissions);
      recordChange('PERMISSIONS', newPermission.id, 'CREATE', null, newPermission, userId, userName);
      invalidateCacheKey('permissions_all');

      return newPermission;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  },

  update: (id, permissionData, userId = 'system', userName = 'System') => {
    try {
      if (!id) throw new Error('Permission ID is required');

      const permissions = getFromStorage(STORAGE_KEYS.PERMISSIONS);
      const index = permissions.findIndex(p => p.id === id);

      if (index === -1) {
        throw new Error('Permission not found');
      }

      const oldPermission = { ...permissions[index] };
      const updatedData = { ...permissions[index], ...permissionData, id };
      
      validateSchema(updatedData, PERMISSIONS_SCHEMA, 'PERMISSIONS');
      validateUnique(updatedData, PERMISSIONS_SCHEMA, 'PERMISSIONS', STORAGE_KEYS.PERMISSIONS, id);

      const updatedPermission = {
        ...permissions[index],
        ...permissionData,
        id,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };

      permissions[index] = updatedPermission;
      saveToStorage(STORAGE_KEYS.PERMISSIONS, permissions);
      recordChange('PERMISSIONS', id, 'UPDATE', oldPermission, updatedPermission, userId, userName);
      invalidateCacheKey('permissions_all');

      return updatedPermission;
    } catch (error) {
      console.error('Error updating permission:', error);
      throw error;
    }
  },

  delete: (id, userId = 'system', userName = 'System') => {
    try {
      if (!id) throw new Error('Permission ID is required');

      const permissions = getFromStorage(STORAGE_KEYS.PERMISSIONS);
      const permission = permissions.find(p => p.id === id);

      if (!permission) {
        throw new Error('Permission not found');
      }

      // Check for references in roles
      const roles = getFromStorage(STORAGE_KEYS.USER_ROLES);
      const hasRoles = roles.some(r => r.permissionIds.includes(id));
      if (hasRoles) {
        throw new ReferentialIntegrityError(
          'Cannot delete permission referenced in user roles',
          'PERMISSIONS',
          id,
          'USER_ROLES'
        );
      }

      const filteredPermissions = permissions.filter(p => p.id !== id);
      saveToStorage(STORAGE_KEYS.PERMISSIONS, filteredPermissions);
      recordChange('PERMISSIONS', id, 'DELETE', permission, null, userId, userName);
      invalidateCacheKey('permissions_all');

      return true;
    } catch (error) {
      console.error('Error deleting permission:', error);
      throw error;
    }
  }
};

// ============================================================================
// CRUD OPERATIONS - USER ROLES
// ============================================================================

export const userRolesService = {
  getAll: () => {
    const cached = getFromCache('userRoles_all');
    if (cached) return cached;

    const data = getFromStorage(STORAGE_KEYS.USER_ROLES);
    setCache('userRoles_all', data);
    return data;
  },

  getById: (id) => {
    if (!id) return null;
    
    const indexed = getFromIndex(STORAGE_KEYS.USER_ROLES, 'byId', id);
    if (indexed) return indexed;

    const roles = getFromStorage(STORAGE_KEYS.USER_ROLES);
    return roles.find(r => r.id === id) || null;
  },

  create: (roleData, userId = 'system', userName = 'System') => {
    try {
      validateSchema(roleData, USER_ROLES_SCHEMA, 'USER_ROLES');
      validateUnique(roleData, USER_ROLES_SCHEMA, 'USER_ROLES', STORAGE_KEYS.USER_ROLES);
      validateForeignKeys(roleData, USER_ROLES_SCHEMA, 'USER_ROLES');

      const roles = getFromStorage(STORAGE_KEYS.USER_ROLES);

      const newRole = {
        id: roleData.id || `ROLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: roleData.name,
        code: roleData.code,
        description: roleData.description || '',
        permissionIds: roleData.permissionIds || [],
        menuIds: roleData.menuIds || [],
        priority: roleData.priority,
        isActive: roleData.isActive !== undefined ? roleData.isActive : true,
        isSystem: roleData.isSystem !== undefined ? roleData.isSystem : false,
        metadata: roleData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId
      };

      roles.push(newRole);
      saveToStorage(STORAGE_KEYS.USER_ROLES, roles);
      recordChange('USER_ROLES', newRole.id, 'CREATE', null, newRole, userId, userName);
      invalidateCacheKey('userRoles_all');

      return newRole;
    } catch (error) {
      console.error('Error creating user role:', error);
      throw error;
    }
  },

  update: (id, roleData, userId = 'system', userName = 'System') => {
    try {
      if (!id) throw new Error('Role ID is required');

      const roles = getFromStorage(STORAGE_KEYS.USER_ROLES);
      const index = roles.findIndex(r => r.id === id);

      if (index === -1) {
        throw new Error('User role not found');
      }

      // Prevent modification of system roles
      if (roles[index].isSystem && roleData.isSystem === false) {
        throw new Error('Cannot modify system role status');
      }

      const oldRole = { ...roles[index] };
      const updatedData = { ...roles[index], ...roleData, id };
      
      validateSchema(updatedData, USER_ROLES_SCHEMA, 'USER_ROLES');
      validateUnique(updatedData, USER_ROLES_SCHEMA, 'USER_ROLES', STORAGE_KEYS.USER_ROLES, id);
      validateForeignKeys(updatedData, USER_ROLES_SCHEMA, 'USER_ROLES');

      const updatedRole = {
        ...roles[index],
        ...roleData,
        id,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };

      roles[index] = updatedRole;
      saveToStorage(STORAGE_KEYS.USER_ROLES, roles);
      recordChange('USER_ROLES', id, 'UPDATE', oldRole, updatedRole, userId, userName);
      invalidateCacheKey('userRoles_all');

      return updatedRole;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  delete: (id, userId = 'system', userName = 'System') => {
    try {
      if (!id) throw new Error('Role ID is required');

      const roles = getFromStorage(STORAGE_KEYS.USER_ROLES);
      const role = roles.find(r => r.id === id);

      if (!role) {
        throw new Error('User role not found');
      }

      // Prevent deletion of system roles
      if (role.isSystem) {
        throw new Error('Cannot delete system role');
      }

      // Check for references in configurations
      const configs = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);
      const hasConfigs = configs.some(c => c.roleId === id);
      if (hasConfigs) {
        throw new ReferentialIntegrityError(
          'Cannot delete role referenced in menu configurations',
          'USER_ROLES',
          id,
          'MENU_CONFIGURATIONS'
        );
      }

      const filteredRoles = roles.filter(r => r.id !== id);
      saveToStorage(STORAGE_KEYS.USER_ROLES, filteredRoles);
      recordChange('USER_ROLES', id, 'DELETE', role, null, userId, userName);
      invalidateCacheKey('userRoles_all');

      return true;
    } catch (error) {
      console.error('Error deleting user role:', error);
      throw error;
    }
  }
};

// ============================================================================
// CRUD OPERATIONS - MENU CONFIGURATIONS
// ============================================================================

export const menuConfigurationsService = {
  getAll: () => {
    const cached = getFromCache('menuConfigurations_all');
    if (cached) return cached;

    const data = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);
    setCache('menuConfigurations_all', data);
    return data;
  },

  getById: (id) => {
    if (!id) return null;
    
    const indexed = getFromIndex(STORAGE_KEYS.MENU_CONFIGURATIONS, 'byId', id);
    if (indexed) return indexed;

    const configs = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);
    return configs.find(c => c.id === id) || null;
  },

  getByMenuId: (menuId) => {
    const indexed = getFromIndex(STORAGE_KEYS.MENU_CONFIGURATIONS, 'byMenuId', menuId);
    if (indexed) return indexed;

    const configs = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);
    return configs.filter(c => c.menuId === menuId);
  },

  getByRoleId: (roleId) => {
    const indexed = getFromIndex(STORAGE_KEYS.MENU_CONFIGURATIONS, 'byRoleId', roleId);
    if (indexed) return indexed;

    const configs = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);
    return configs.filter(c => c.roleId === roleId);
  },

  create: (configData, userId = 'system', userName = 'System') => {
    try {
      validateSchema(configData, MENU_CONFIGURATIONS_SCHEMA, 'MENU_CONFIGURATIONS');
      validateForeignKeys(configData, MENU_CONFIGURATIONS_SCHEMA, 'MENU_CONFIGURATIONS');

      const configs = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);

      const newConfig = {
        id: configData.id || `CONFIG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuId: configData.menuId,
        roleId: configData.roleId || null,
        userId: configData.userId || null,
        configType: configData.configType,
        settings: configData.settings,
        theme: configData.theme || {},
        layout: configData.layout || {},
        isActive: configData.isActive !== undefined ? configData.isActive : true,
        priority: configData.priority,
        metadata: configData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId
      };

      configs.push(newConfig);
      saveToStorage(STORAGE_KEYS.MENU_CONFIGURATIONS, configs);
      recordChange('MENU_CONFIGURATIONS', newConfig.id, 'CREATE', null, newConfig, userId, userName);
      invalidateCacheKey('menuConfigurations_all');

      return newConfig;
    } catch (error) {
      console.error('Error creating menu configuration:', error);
      throw error;
    }
  },

  update: (id, configData, userId = 'system', userName = 'System') => {
    try {
      if (!id) throw new Error('Configuration ID is required');

      const configs = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);
      const index = configs.findIndex(c => c.id === id);

      if (index === -1) {
        throw new Error('Menu configuration not found');
      }

      const oldConfig = { ...configs[index] };
      const updatedData = { ...configs[index], ...configData, id };
      
      validateSchema(updatedData, MENU_CONFIGURATIONS_SCHEMA, 'MENU_CONFIGURATIONS');
      validateForeignKeys(updatedData, MENU_CONFIGURATIONS_SCHEMA, 'MENU_CONFIGURATIONS');

      const updatedConfig = {
        ...configs[index],
        ...configData,
        id,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };

      configs[index] = updatedConfig;
      saveToStorage(STORAGE_KEYS.MENU_CONFIGURATIONS, configs);
      recordChange('MENU_CONFIGURATIONS', id, 'UPDATE', oldConfig, updatedConfig, userId, userName);
      invalidateCacheKey('menuConfigurations_all');

      return updatedConfig;
    } catch (error) {
      console.error('Error updating menu configuration:', error);
      throw error;
    }
  },

  delete: (id, userId = 'system', userName = 'System') => {
    try {
      if (!id) throw new Error('Configuration ID is required');

      const configs = getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS);
      const config = configs.find(c => c.id === id);

      if (!config) {
        throw new Error('Menu configuration not found');
      }

      const filteredConfigs = configs.filter(c => c.id !== id);
      saveToStorage(STORAGE_KEYS.MENU_CONFIGURATIONS, filteredConfigs);
      recordChange('MENU_CONFIGURATIONS', id, 'DELETE', config, null, userId, userName);
      invalidateCacheKey('menuConfigurations_all');

      return true;
    } catch (error) {
      console.error('Error deleting menu configuration:', error);
      throw error;
    }
  }
};

// ============================================================================
// CRUD OPERATIONS - CHANGE TRACKING
// ============================================================================

export const changeTrackingService = {
  getAll: () => {
    return getFromStorage(STORAGE_KEYS.CHANGE_TRACKING);
  },

  getById: (id) => {
    if (!id) return null;
    const changes = getFromStorage(STORAGE_KEYS.CHANGE_TRACKING);
    return changes.find(c => c.id === id) || null;
  },

  getByEntity: (entityType, entityId) => {
    const changes = getFromStorage(STORAGE_KEYS.CHANGE_TRACKING);
    return changes.filter(c => c.entityType === entityType && c.entityId === entityId);
  },

  getByUser: (userId) => {
    const changes = getFromStorage(STORAGE_KEYS.CHANGE_TRACKING);
    return changes.filter(c => c.userId === userId);
  },

  getByDateRange: (startDate, endDate) => {
    const changes = getFromStorage(STORAGE_KEYS.CHANGE_TRACKING);
    return changes.filter(c => {
      const timestamp = new Date(c.timestamp);
      return timestamp >= new Date(startDate) && timestamp <= new Date(endDate);
    });
  },

  clear: (olderThan = null) => {
    try {
      let changes = getFromStorage(STORAGE_KEYS.CHANGE_TRACKING);
      
      if (olderThan) {
        const cutoffDate = new Date(olderThan);
        changes = changes.filter(c => new Date(c.timestamp) >= cutoffDate);
      } else {
        changes = [];
      }

      saveToStorage(STORAGE_KEYS.CHANGE_TRACKING, changes);
      return true;
    } catch (error) {
      console.error('Error clearing change tracking:', error);
      return false;
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize database with sample data
 */
export const initializeDatabase = () => {
  try {
    console.log('🔧 Initializing Customs Portal Menu Database...');

    // Initialize storage if empty
    Object.values(STORAGE_KEYS).forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
};

/**
 * Clear all database data
 */
export const clearDatabase = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    invalidateCache();
    indexStore = {};
    console.log('✅ Database cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return false;
  }
};

/**
 * Export database to JSON
 */
export const exportDatabase = () => {
  try {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      data[key] = getFromStorage(storageKey);
    });
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting database:', error);
    return null;
  }
};

/**
 * Import database from JSON
 */
export const importDatabase = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (data[key]) {
        saveToStorage(storageKey, data[key]);
      }
    });
    invalidateCache();
    console.log('✅ Database imported successfully');
    return true;
  } catch (error) {
    console.error('❌ Error importing database:', error);
    return false;
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = () => {
  return {
    menuItems: getFromStorage(STORAGE_KEYS.MENU_HIERARCHY).length,
    permissions: getFromStorage(STORAGE_KEYS.PERMISSIONS).length,
    userRoles: getFromStorage(STORAGE_KEYS.USER_ROLES).length,
    configurations: getFromStorage(STORAGE_KEYS.MENU_CONFIGURATIONS).length,
    changeRecords: getFromStorage(STORAGE_KEYS.CHANGE_TRACKING).length,
    cacheSize: Object.keys(cacheStore).length,
    indexSize: Object.keys(indexStore).length
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  menuHierarchyService,
  permissionsService,
  userRolesService,
  menuConfigurationsService,
  changeTrackingService,
  initializeDatabase,
  clearDatabase,
  exportDatabase,
  importDatabase,
  getDatabaseStats,
  ValidationError,
  ReferentialIntegrityError
};


/**
 * Initialize sample data for Customs Portal Menu Database
 * Creates comprehensive sample data for all 5 entities
 */
export const initializeSampleData = () => {
  try {
    console.log('🔧 Initializing Customs Portal Menu Database with sample data...');

    // Initialize database first
    initializeDatabase();

    // Check if data already exists
    const existingMenus = getFromStorage(STORAGE_KEYS.MENU_HIERARCHY);
    if (existingMenus.length > 0) {
      console.log('📦 Sample data already exists. Skipping initialization.');
      return true;
    }

    const userId = 'system';
    const userName = 'System Administrator';

    // ========================================
    // 1. CREATE PERMISSIONS
    // ========================================
    console.log('📝 Creating permissions...');

    const permissions = [
      // Customs Items Permissions
      {
        name: 'View Customs Items',
        code: 'CUSTOMS_ITEMS_VIEW',
        description: 'Permission to view customs items list and details',
        category: 'READ',
        resource: 'customs_items',
        action: 'view'
      },
      {
        name: 'Create Customs Items',
        code: 'CUSTOMS_ITEMS_CREATE',
        description: 'Permission to create new customs items',
        category: 'WRITE',
        resource: 'customs_items',
        action: 'create'
      },
      {
        name: 'Edit Customs Items',
        code: 'CUSTOMS_ITEMS_EDIT',
        description: 'Permission to edit existing customs items',
        category: 'WRITE',
        resource: 'customs_items',
        action: 'edit'
      },
      {
        name: 'Delete Customs Items',
        code: 'CUSTOMS_ITEMS_DELETE',
        description: 'Permission to delete customs items',
        category: 'DELETE',
        resource: 'customs_items',
        action: 'delete'
      },
      // Document Permissions
      {
        name: 'View Documents',
        code: 'DOCUMENTS_VIEW',
        description: 'Permission to view supporting documents',
        category: 'READ',
        resource: 'documents',
        action: 'view'
      },
      {
        name: 'Upload Documents',
        code: 'DOCUMENTS_UPLOAD',
        description: 'Permission to upload supporting documents',
        category: 'WRITE',
        resource: 'documents',
        action: 'upload'
      },
      {
        name: 'Delete Documents',
        code: 'DOCUMENTS_DELETE',
        description: 'Permission to delete supporting documents',
        category: 'DELETE',
        resource: 'documents',
        action: 'delete'
      },
      // Status Management Permissions
      {
        name: 'Update Item Status',
        code: 'STATUS_UPDATE',
        description: 'Permission to update customs item status',
        category: 'WRITE',
        resource: 'status',
        action: 'update'
      },
      {
        name: 'Approve BC Status',
        code: 'BC_STATUS_APPROVE',
        description: 'Permission to approve BC (Bea Cukai) status',
        category: 'EXECUTE',
        resource: 'bc_status',
        action: 'approve'
      },
      {
        name: 'Reject BC Status',
        code: 'BC_STATUS_REJECT',
        description: 'Permission to reject BC (Bea Cukai) status',
        category: 'EXECUTE',
        resource: 'bc_status',
        action: 'reject'
      },
      // Report Permissions
      {
        name: 'View Reports',
        code: 'REPORTS_VIEW',
        description: 'Permission to view customs reports',
        category: 'READ',
        resource: 'reports',
        action: 'view'
      },
      {
        name: 'Export Reports',
        code: 'REPORTS_EXPORT',
        description: 'Permission to export customs reports',
        category: 'EXECUTE',
        resource: 'reports',
        action: 'export'
      },
      // Admin Permissions
      {
        name: 'Manage Users',
        code: 'USERS_MANAGE',
        description: 'Permission to manage user accounts',
        category: 'ADMIN',
        resource: 'users',
        action: 'manage'
      },
      {
        name: 'Manage Roles',
        code: 'ROLES_MANAGE',
        description: 'Permission to manage user roles',
        category: 'ADMIN',
        resource: 'roles',
        action: 'manage'
      },
      {
        name: 'System Configuration',
        code: 'SYSTEM_CONFIG',
        description: 'Permission to configure system settings',
        category: 'ADMIN',
        resource: 'system',
        action: 'configure'
      }
    ];

    const createdPermissions = {};
    permissions.forEach(perm => {
      const created = permissionsService.create(perm, userId, userName);
      createdPermissions[perm.code] = created;
      console.log(`  ✅ Created permission: ${perm.code}`);
    });

    // ========================================
    // 2. CREATE MENU HIERARCHY
    // ========================================
    console.log('📁 Creating menu hierarchy...');

    // Level 0 - Main Menu
    const customsPortalMenu = menuHierarchyService.create({
      name: 'customs_portal',
      label: 'Bea Cukai Portal',
      path: '/customs',
      icon: 'SecurityIcon',
      order: 1,
      level: 0,
      parentId: null,
      component: null,
      metadata: {
        description: 'Main customs portal menu',
        module: 'BRidge'
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${customsPortalMenu.label}`);

    // Level 1 - Sub Menus
    const itemsMenu = menuHierarchyService.create({
      name: 'customs_items',
      label: 'Customs Items',
      path: '/customs/items',
      icon: 'InventoryIcon',
      order: 1,
      level: 1,
      parentId: customsPortalMenu.id,
      component: 'BRidgeCustomsPortal',
      metadata: {
        description: 'Manage customs items',
        defaultView: 'table'
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${itemsMenu.label}`);

    const documentsMenu = menuHierarchyService.create({
      name: 'documents',
      label: 'Documents',
      path: '/customs/documents',
      icon: 'DescriptionIcon',
      order: 2,
      level: 1,
      parentId: customsPortalMenu.id,
      component: 'DocumentsManager',
      metadata: {
        description: 'Manage supporting documents',
        supportedTypes: ['pdf', 'jpg', 'jpeg']
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${documentsMenu.label}`);

    const reportsMenu = menuHierarchyService.create({
      name: 'reports',
      label: 'Reports',
      path: '/customs/reports',
      icon: 'AssessmentIcon',
      order: 3,
      level: 1,
      parentId: customsPortalMenu.id,
      component: 'CustomsReports',
      metadata: {
        description: 'View and export customs reports'
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${reportsMenu.label}`);

    const settingsMenu = menuHierarchyService.create({
      name: 'settings',
      label: 'Settings',
      path: '/customs/settings',
      icon: 'SettingsIcon',
      order: 4,
      level: 1,
      parentId: customsPortalMenu.id,
      component: 'CustomsSettings',
      metadata: {
        description: 'Configure customs portal settings'
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${settingsMenu.label}`);

    // Level 2 - Sub-sub Menus
    const warehouseItemsMenu = menuHierarchyService.create({
      name: 'warehouse_items',
      label: 'Warehouse Items',
      path: '/customs/items/warehouse',
      icon: 'WarehouseIcon',
      order: 1,
      level: 2,
      parentId: itemsMenu.id,
      component: 'WarehouseItems',
      metadata: {
        filter: { status: 'warehouse' }
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${warehouseItemsMenu.label}`);

    const eventItemsMenu = menuHierarchyService.create({
      name: 'event_items',
      label: 'Event Items',
      path: '/customs/items/event',
      icon: 'EventIcon',
      order: 2,
      level: 2,
      parentId: itemsMenu.id,
      component: 'EventItems',
      metadata: {
        filter: { status: 'event' }
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${eventItemsMenu.label}`);

    const bcPendingMenu = menuHierarchyService.create({
      name: 'bc_pending',
      label: 'BC Pending',
      path: '/customs/items/bc-pending',
      icon: 'PendingIcon',
      order: 3,
      level: 2,
      parentId: itemsMenu.id,
      component: 'BCPendingItems',
      metadata: {
        filter: { status: 'bc_pending' }
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${bcPendingMenu.label}`);

    const bcApprovedMenu = menuHierarchyService.create({
      name: 'bc_approved',
      label: 'BC Approved',
      path: '/customs/items/bc-approved',
      icon: 'CheckCircleIcon',
      order: 4,
      level: 2,
      parentId: itemsMenu.id,
      component: 'BCApprovedItems',
      metadata: {
        filter: { status: 'bc_approved' }
      }
    }, userId, userName);
    console.log(`  ✅ Created menu: ${bcApprovedMenu.label}`);

    // ========================================
    // 3. CREATE USER ROLES
    // ========================================
    console.log('👥 Creating user roles...');

    // Admin Role
    const adminRole = userRolesService.create({
      name: 'System Administrator',
      code: 'ADMIN',
      description: 'Full system access with all permissions',
      permissionIds: Object.values(createdPermissions).map(p => p.id),
      menuIds: [
        customsPortalMenu.id,
        itemsMenu.id,
        documentsMenu.id,
        reportsMenu.id,
        settingsMenu.id,
        warehouseItemsMenu.id,
        eventItemsMenu.id,
        bcPendingMenu.id,
        bcApprovedMenu.id
      ],
      priority: 100,
      isSystem: true,
      metadata: {
        description: 'System administrator with full access'
      }
    }, userId, userName);
    console.log(`  ✅ Created role: ${adminRole.name}`);

    // Customs Officer Role
    const customsOfficerRole = userRolesService.create({
      name: 'Customs Officer',
      code: 'CUSTOMS_OFFICER',
      description: 'Standard customs officer with item management permissions',
      permissionIds: [
        createdPermissions['CUSTOMS_ITEMS_VIEW'].id,
        createdPermissions['CUSTOMS_ITEMS_CREATE'].id,
        createdPermissions['CUSTOMS_ITEMS_EDIT'].id,
        createdPermissions['DOCUMENTS_VIEW'].id,
        createdPermissions['DOCUMENTS_UPLOAD'].id,
        createdPermissions['STATUS_UPDATE'].id,
        createdPermissions['REPORTS_VIEW'].id
      ],
      menuIds: [
        customsPortalMenu.id,
        itemsMenu.id,
        documentsMenu.id,
        reportsMenu.id,
        warehouseItemsMenu.id,
        eventItemsMenu.id,
        bcPendingMenu.id,
        bcApprovedMenu.id
      ],
      priority: 50,
      isSystem: false,
      metadata: {
        description: 'Standard customs officer role'
      }
    }, userId, userName);
    console.log(`  ✅ Created role: ${customsOfficerRole.name}`);

    // BC Approver Role
    const bcApproverRole = userRolesService.create({
      name: 'BC Approver',
      code: 'BC_APPROVER',
      description: 'Bea Cukai approver with status approval permissions',
      permissionIds: [
        createdPermissions['CUSTOMS_ITEMS_VIEW'].id,
        createdPermissions['DOCUMENTS_VIEW'].id,
        createdPermissions['BC_STATUS_APPROVE'].id,
        createdPermissions['BC_STATUS_REJECT'].id,
        createdPermissions['REPORTS_VIEW'].id,
        createdPermissions['REPORTS_EXPORT'].id
      ],
      menuIds: [
        customsPortalMenu.id,
        itemsMenu.id,
        documentsMenu.id,
        reportsMenu.id,
        bcPendingMenu.id,
        bcApprovedMenu.id
      ],
      priority: 75,
      isSystem: false,
      metadata: {
        description: 'BC approver with approval authority'
      }
    }, userId, userName);
    console.log(`  ✅ Created role: ${bcApproverRole.name}`);

    // Viewer Role
    const viewerRole = userRolesService.create({
      name: 'Viewer',
      code: 'VIEWER',
      description: 'Read-only access to customs portal',
      permissionIds: [
        createdPermissions['CUSTOMS_ITEMS_VIEW'].id,
        createdPermissions['DOCUMENTS_VIEW'].id,
        createdPermissions['REPORTS_VIEW'].id
      ],
      menuIds: [
        customsPortalMenu.id,
        itemsMenu.id,
        documentsMenu.id,
        reportsMenu.id,
        warehouseItemsMenu.id,
        eventItemsMenu.id,
        bcPendingMenu.id,
        bcApprovedMenu.id
      ],
      priority: 10,
      isSystem: false,
      metadata: {
        description: 'Read-only viewer role'
      }
    }, userId, userName);
    console.log(`  ✅ Created role: ${viewerRole.name}`);

    // ========================================
    // 4. CREATE MENU CONFIGURATIONS
    // ========================================
    console.log('⚙️ Creating menu configurations...');

    // Global Configuration
    const globalConfig = menuConfigurationsService.create({
      menuId: customsPortalMenu.id,
      roleId: null,
      userId: null,
      configType: 'GLOBAL',
      settings: {
        defaultView: 'table',
        itemsPerPage: 25,
        enableFilters: true,
        enableSearch: true,
        enableExport: true,
        autoRefresh: false,
        refreshInterval: 60000
      },
      theme: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        backgroundColor: '#f5f5f5',
        textColor: '#333333'
      },
      layout: {
        sidebarCollapsed: false,
        showBreadcrumbs: true,
        showStatistics: true,
        compactMode: false
      },
      priority: 0,
      metadata: {
        description: 'Global configuration for all users'
      }
    }, userId, userName);
    console.log(`  ✅ Created config: Global Configuration`);

    // Admin Role Configuration
    const adminConfig = menuConfigurationsService.create({
      menuId: itemsMenu.id,
      roleId: adminRole.id,
      userId: null,
      configType: 'ROLE',
      settings: {
        defaultView: 'table',
        itemsPerPage: 50,
        enableFilters: true,
        enableSearch: true,
        enableExport: true,
        enableBulkActions: true,
        showAdvancedFilters: true,
        autoRefresh: true,
        refreshInterval: 30000
      },
      theme: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#f5576c'
      },
      layout: {
        sidebarCollapsed: false,
        showBreadcrumbs: true,
        showStatistics: true,
        compactMode: false,
        showAuditTrail: true
      },
      priority: 100,
      metadata: {
        description: 'Admin role configuration with full features'
      }
    }, userId, userName);
    console.log(`  ✅ Created config: Admin Role Configuration`);

    // Customs Officer Configuration
    const officerConfig = menuConfigurationsService.create({
      menuId: itemsMenu.id,
      roleId: customsOfficerRole.id,
      userId: null,
      configType: 'ROLE',
      settings: {
        defaultView: 'table',
        itemsPerPage: 25,
        enableFilters: true,
        enableSearch: true,
        enableExport: false,
        enableBulkActions: false,
        showAdvancedFilters: false,
        autoRefresh: false
      },
      theme: {
        primaryColor: '#4facfe',
        secondaryColor: '#00f2fe'
      },
      layout: {
        sidebarCollapsed: false,
        showBreadcrumbs: true,
        showStatistics: true,
        compactMode: false,
        showAuditTrail: false
      },
      priority: 50,
      metadata: {
        description: 'Customs officer role configuration'
      }
    }, userId, userName);
    console.log(`  ✅ Created config: Customs Officer Configuration`);

    // BC Approver Configuration
    const approverConfig = menuConfigurationsService.create({
      menuId: bcPendingMenu.id,
      roleId: bcApproverRole.id,
      userId: null,
      configType: 'ROLE',
      settings: {
        defaultView: 'table',
        itemsPerPage: 10,
        enableFilters: true,
        enableSearch: true,
        enableExport: true,
        showApprovalActions: true,
        highlightPending: true,
        autoRefresh: true,
        refreshInterval: 60000
      },
      theme: {
        primaryColor: '#f093fb',
        secondaryColor: '#f5576c'
      },
      layout: {
        sidebarCollapsed: false,
        showBreadcrumbs: true,
        showStatistics: true,
        compactMode: true,
        showAuditTrail: true
      },
      priority: 75,
      metadata: {
        description: 'BC approver configuration with approval features'
      }
    }, userId, userName);
    console.log(`  ✅ Created config: BC Approver Configuration`);

    // Viewer Configuration
    const viewerConfig = menuConfigurationsService.create({
      menuId: itemsMenu.id,
      roleId: viewerRole.id,
      userId: null,
      configType: 'ROLE',
      settings: {
        defaultView: 'table',
        itemsPerPage: 25,
        enableFilters: true,
        enableSearch: true,
        enableExport: false,
        enableBulkActions: false,
        showAdvancedFilters: false,
        autoRefresh: false,
        readOnly: true
      },
      theme: {
        primaryColor: '#43e97b',
        secondaryColor: '#38f9d7'
      },
      layout: {
        sidebarCollapsed: true,
        showBreadcrumbs: true,
        showStatistics: true,
        compactMode: true,
        showAuditTrail: false
      },
      priority: 10,
      metadata: {
        description: 'Viewer role configuration with read-only access'
      }
    }, userId, userName);
    console.log(`  ✅ Created config: Viewer Configuration`);

    console.log('✅ Sample data initialization completed successfully!');
    console.log('📊 Database Statistics:', getDatabaseStats());

    return true;
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    return false;
  }
};

// ============================================================================
// END OF FILE
// ============================================================================

// Note: The default export is already defined above at line 1335
// This second export has been removed to fix the "Only one default export allowed per module" error

