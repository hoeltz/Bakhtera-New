/**
 * Warehouse Data Service
 * 
 * Dedicated service for handling warehouse and customs data operations
 * This service provides a cleaner architecture compared to mixing warehouse logic in dataSync.js
 * 
 * Features:
 * - Separate storage for warehouse data
 * - Custom data operations for BRidgeCustomsPortal
 * - Ledger entries management
 * - Customs items management
 * - Error handling and data validation
 */

const WAREHOUSE_STORAGE_KEY = 'bridgeWarehouseData';
const CUSTOMS_PORTAL_DB_KEY = 'customs_portal_db_cache';

/**
 * Get all warehouse data from localStorage
 */
export const getWarehouseData = () => {
  try {
    const data = localStorage.getItem(WAREHOUSE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting warehouse data:', error);
    return {};
  }
};

/**
 * Save warehouse data to localStorage
 */
export const saveWarehouseData = (data) => {
  try {
    localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving warehouse data:', error);
    return false;
  }
};

/**
 * Get customs items from warehouse data
 */
export const getCustomsItems = () => {
  try {
    const warehouseData = getWarehouseData();
    return warehouseData.customsItems || [];
  } catch (error) {
    console.error('Error getting customs items:', error);
    return [];
  }
};

/**
 * Save customs items to warehouse data
 */
export const saveCustomsItems = (customsItems) => {
  try {
    const warehouseData = getWarehouseData();
    const updatedData = {
      ...warehouseData,
      customsItems: customsItems
    };
    return saveWarehouseData(updatedData);
  } catch (error) {
    console.error('Error saving customs items:', error);
    return false;
  }
};

/**
 * Get ledger entries from warehouse data
 */
export const getLedgerEntries = () => {
  try {
    const warehouseData = getWarehouseData();
    return warehouseData.ledgerEntries || [];
  } catch (error) {
    console.error('Error getting ledger entries:', error);
    return [];
  }
};

/**
 * Save ledger entries to warehouse data
 */
export const saveLedgerEntries = (ledgerEntries) => {
  try {
    const warehouseData = getWarehouseData();
    const updatedData = {
      ...warehouseData,
      ledgerEntries: ledgerEntries
    };
    return saveWarehouseData(updatedData);
  } catch (error) {
    console.error('Error saving ledger entries:', error);
    return false;
  }
};

/**
 * Clear all warehouse data
 */
export const clearWarehouseData = () => {
  try {
    localStorage.removeItem(WAREHOUSE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing warehouse data:', error);
    return false;
  }
};

/**
 * Get warehouse data statistics
 */
export const getWarehouseStats = () => {
  try {
    const warehouseData = getWarehouseData();
    return {
      totalCustomsItems: warehouseData.customsItems?.length || 0,
      totalLedgerEntries: warehouseData.ledgerEntries?.length || 0,
      storageSize: JSON.stringify(warehouseData).length
    };
  } catch (error) {
    console.error('Error getting warehouse stats:', error);
    return {
      totalCustomsItems: 0,
      totalLedgerEntries: 0,
      storageSize: 0
    };
  }
};

/**
 * Export warehouse data for backup
 */
export const exportWarehouseData = () => {
  try {
    const warehouseData = getWarehouseData();
    return {
      exportDate: new Date().toISOString(),
      data: warehouseData,
      stats: getWarehouseStats()
    };
  } catch (error) {
    console.error('Error exporting warehouse data:', error);
    return null;
  }
};

/**
 * Import warehouse data from backup
 */
export const importWarehouseData = (importData) => {
  try {
    if (!importData || !importData.data) {
      throw new Error('Invalid import data format');
    }
    
    const success = saveWarehouseData(importData.data);
    if (success) {
      console.log('Warehouse data imported successfully');
      return true;
    } else {
      throw new Error('Failed to save imported data');
    }
  } catch (error) {
    console.error('Error importing warehouse data:', error);
    return false;
  }
};

/**
 * Validate warehouse data structure
 */
export const validateWarehouseData = (data) => {
  try {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check for expected data structures
    const hasValidStructure = 
      (data.customsItems === undefined || Array.isArray(data.customsItems)) &&
      (data.ledgerEntries === undefined || Array.isArray(data.ledgerEntries));
    
    return hasValidStructure;
  } catch (error) {
    console.error('Error validating warehouse data:', error);
    return false;
  }
};

/**
 * Service object for backward compatibility
 */
const warehouseDataService = {
  getWarehouseData,
  saveWarehouseData,
  getCustomsItems,
  saveCustomsItems,
  getLedgerEntries,
  saveLedgerEntries,
  clearWarehouseData,
  getWarehouseStats,
  exportWarehouseData,
  importWarehouseData,
  validateWarehouseData
};

export default warehouseDataService;