// Enhanced Data Sync Service with Complete Module Separation
// Ensures BLINK, BRIDGE, and BIG modules operate independently with isolated data storage

// Module-specific storage keys
const STORAGE_KEYS = {
  // BLINK Module
  BLINK: {
    CUSTOMERS: 'blink_customers',
    VENDORS: 'blink_vendors', 
    SALES_ORDERS: 'blink_sales_orders',
    INVOICES: 'blink_invoices',
    WAREHOUSE_DATA: 'blink_warehouse_data'
  },
  
  // BRIDGE Module
  BRIDGE: {
    CUSTOMERS: 'bridge_customers',
    SALES_ORDERS: 'bridge_sales_orders',
    WAREHOUSE_DATA: 'bridge_warehouse_data',
    ACCOUNTING_LEDGER: 'bridge_accounting_ledger',
    INVENTORY: 'bridge_inventory',
    CUSTOMS_PORTAL: 'bridge_customs_portal'
  },
  
  // BIG Module
  BIG: {
    CUSTOMERS: 'big_customers',
    VENDORS: 'big_vendors',
    SALES_ORDERS: 'big_sales_orders',
    INVOICES: 'big_invoices',
    ACCOUNTING: 'big_accounting'
  }
};

// Base data templates for each module
const BASE_TEMPLATES = {
  BLINK: {
    salesOrder: (customerName, index = 0) => ({
      id: `BLINK-SO-${Date.now()}-${index}`,
      orderNumber: `BLINK-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(index + 1).toString().padStart(4, '0')}`,
      customerName: customerName,
      orderValue: 2500000 + (index * 300000),
      status: index === 0 ? 'Confirmed' : index === 1 ? 'Processing' : 'Pending',
      date: new Date().toISOString().split('T')[0],
      priority: index === 0 ? 'High' : 'Normal',
      module: 'BLINK'
    }),
    
    invoice: (salesOrder, index = 0) => ({
      id: `BLINK-INV-${Date.now()}-${index}`,
      invoiceNumber: `BLINK-INV-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(index + 1).toString().padStart(4, '0')}`,
      customerName: salesOrder.customerName,
      amount: salesOrder.orderValue,
      status: index === 0 ? 'Paid' : 'Pending',
      dueDate: new Date(Date.now() + ((index + 1) * 15 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      salesOrderId: salesOrder.id,
      module: 'BLINK'
    })
  },
  
  BRIDGE: {
    salesOrder: (customerName, index = 0) => ({
      id: `BRIDGE-SO-${Date.now()}-${index}`,
      salesOrderNumber: `BRIDGE-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(index + 1).toString().padStart(4, '0')}`,
      customerName: customerName,
      sellingPrice: 3000000 + (index * 400000),
      status: index === 0 ? 'Confirmed' : index === 1 ? 'In Progress' : 'Draft',
      date: new Date().toISOString().split('T')[0],
      priority: index === 0 ? 'Urgent' : 'Normal',
      module: 'BRIDGE',
      consignmentFees: {
        baseFreight: 0,
        documentation: 0,
        handling: 0,
        insurance: 0,
        customsClearance: 0,
        warehousing: 0,
        delivery: 0,
        fuelSurcharge: 0,
        securityFee: 0,
        equipmentFee: 0,
        temperatureControlled: 0,
        hazardousCargo: 0,
        expressService: 0,
        subtotal: 0,
        taxRate: 11,
        taxAmount: 0,
        total: 0
      }
    })
  },
  
  BIG: {
    salesOrder: (customerName, index = 0) => ({
      id: `BIG-SO-${Date.now()}-${index}`,
      orderNumber: `BIG-SO-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(index + 1).toString().padStart(4, '0')}`,
      customerName: customerName,
      orderValue: 2000000 + (index * 250000),
      status: index === 0 ? 'Confirmed' : index === 1 ? 'Shipped' : 'Processing',
      date: new Date().toISOString().split('T')[0],
      priority: index === 0 ? 'High' : 'Normal',
      module: 'BIG'
    }),
    
    invoice: (salesOrder, index = 0) => ({
      id: `BIG-INV-${Date.now()}-${index}`,
      invoiceNumber: `BIG-INV-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(index + 1).toString().padStart(4, '0')}`,
      customerName: salesOrder.customerName,
      amount: salesOrder.orderValue,
      status: index === 0 ? 'Paid' : index === 1 ? 'Overdue' : 'Draft',
      dueDate: new Date(Date.now() + ((index + 1) * 10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      salesOrderId: salesOrder.id,
      module: 'BIG'
    })
  }
};

// Safe localStorage operations
const safeStorage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }
};

// Enhanced Data Sync Service
const enhancedDataSyncService = {
  // Module-specific data getters
  getBLINKData: (type) => {
    switch (type) {
      case 'customers':
        return safeStorage.get(STORAGE_KEYS.BLINK.CUSTOMERS) || [];
      case 'salesOrders':
        return safeStorage.get(STORAGE_KEYS.BLINK.SALES_ORDERS) || [];
      case 'invoices':
        return safeStorage.get(STORAGE_KEYS.BLINK.INVOICES) || [];
      case 'vendors':
        return safeStorage.get(STORAGE_KEYS.BLINK.VENDORS) || [];
      case 'warehouse':
        return safeStorage.get(STORAGE_KEYS.BLINK.WAREHOUSE_DATA) || {};
      default:
        return [];
    }
  },
  
  getBRIDGEData: (type) => {
    switch (type) {
      case 'customers':
        return safeStorage.get(STORAGE_KEYS.BRIDGE.CUSTOMERS) || [];
      case 'salesOrders':
        return safeStorage.get(STORAGE_KEYS.BRIDGE.SALES_ORDERS) || [];
      case 'warehouse':
        return safeStorage.get(STORAGE_KEYS.BRIDGE.WAREHOUSE_DATA) || {};
      case 'accounting':
        return safeStorage.get(STORAGE_KEYS.BRIDGE.ACCOUNTING_LEDGER) || [];
      case 'inventory':
        return safeStorage.get(STORAGE_KEYS.BRIDGE.INVENTORY) || [];
      case 'customs':
        return safeStorage.get(STORAGE_KEYS.BRIDGE.CUSTOMS_PORTAL) || [];
      default:
        return [];
    }
  },
  
  getBIGData: (type) => {
    switch (type) {
      case 'customers':
        return safeStorage.get(STORAGE_KEYS.BIG.CUSTOMERS) || [];
      case 'salesOrders':
        return safeStorage.get(STORAGE_KEYS.BIG.SALES_ORDERS) || [];
      case 'invoices':
        return safeStorage.get(STORAGE_KEYS.BIG.INVOICES) || [];
      case 'vendors':
        return safeStorage.get(STORAGE_KEYS.BIG.VENDORS) || [];
      case 'accounting':
        return safeStorage.get(STORAGE_KEYS.BIG.ACCOUNTING) || [];
      default:
        return [];
    }
  },
  
  // Module-specific data setters
  setBLINKData: (type, data) => {
    switch (type) {
      case 'customers':
        return safeStorage.set(STORAGE_KEYS.BLINK.CUSTOMERS, data);
      case 'salesOrders':
        return safeStorage.set(STORAGE_KEYS.BLINK.SALES_ORDERS, data);
      case 'invoices':
        return safeStorage.set(STORAGE_KEYS.BLINK.INVOICES, data);
      case 'vendors':
        return safeStorage.set(STORAGE_KEYS.BLINK.VENDORS, data);
      case 'warehouse':
        return safeStorage.set(STORAGE_KEYS.BLINK.WAREHOUSE_DATA, data);
      default:
        return false;
    }
  },
  
  setBRIDGEData: (type, data) => {
    switch (type) {
      case 'customers':
        return safeStorage.set(STORAGE_KEYS.BRIDGE.CUSTOMERS, data);
      case 'salesOrders':
        return safeStorage.set(STORAGE_KEYS.BRIDGE.SALES_ORDERS, data);
      case 'warehouse':
        return safeStorage.set(STORAGE_KEYS.BRIDGE.WAREHOUSE_DATA, data);
      case 'accounting':
        return safeStorage.set(STORAGE_KEYS.BRIDGE.ACCOUNTING_LEDGER, data);
      case 'inventory':
        return safeStorage.set(STORAGE_KEYS.BRIDGE.INVENTORY, data);
      case 'customs':
        return safeStorage.set(STORAGE_KEYS.BRIDGE.CUSTOMS_PORTAL, data);
      default:
        return false;
    }
  },
  
  setBIGData: (type, data) => {
    switch (type) {
      case 'customers':
        return safeStorage.set(STORAGE_KEYS.BIG.CUSTOMERS, data);
      case 'salesOrders':
        return safeStorage.set(STORAGE_KEYS.BIG.SALES_ORDERS, data);
      case 'invoices':
        return safeStorage.set(STORAGE_KEYS.BIG.INVOICES, data);
      case 'vendors':
        return safeStorage.set(STORAGE_KEYS.BIG.VENDORS, data);
      case 'accounting':
        return safeStorage.set(STORAGE_KEYS.BIG.ACCOUNTING, data);
      default:
        return false;
    }
  },
  
  // Generate sample data for specific modules
  generateSampleData: (module, count = 3) => {
    const sampleCustomers = [
      'PT. Maju Jaya Corp',
      'CV. Sukses Mandiri', 
      'PT. Nusantara Logistik',
      'CV. Prima Express',
      'PT. Global Freight'
    ];
    
    let salesOrders = [];
    let invoices = [];
    
    for (let i = 0; i < count; i++) {
      const customerName = sampleCustomers[i % sampleCustomers.length];
      const salesOrder = BASE_TEMPLATES[module].salesOrder(customerName, i);
      const invoice = BASE_TEMPLATES[module].invoice(salesOrder, i);
      
      salesOrders.push(salesOrder);
      invoices.push(invoice);
    }
    
    return { salesOrders, invoices };
  },
  
  // Initialize module-specific data
  initializeModuleData: (module) => {
    const { salesOrders, invoices } = enhancedDataSyncService.generateSampleData(module, 5);
    
    switch (module) {
      case 'BLINK':
        enhancedDataSyncService.setBLINKData('salesOrders', salesOrders);
        enhancedDataSyncService.setBLINKData('invoices', invoices);
        break;
      case 'BRIDGE':
        enhancedDataSyncService.setBRIDGEData('salesOrders', salesOrders);
        // BRIDGE invoices handled by standard InvoiceManagement component
        break;
      case 'BIG':
        enhancedDataSyncService.setBIGData('salesOrders', salesOrders);
        enhancedDataSyncService.setBIGData('invoices', invoices);
        break;
    }
  },
  
  // Add new sales order to specific module
  addSalesOrder: (module, salesOrderData) => {
    const existingOrders = enhancedDataSyncService[`get${module}Data`]('salesOrders');
    const newOrder = {
      ...salesOrderData,
      id: `${module}-SO-${Date.now()}`,
      module: module,
      createdAt: new Date().toISOString()
    };
    
    const updatedOrders = [...existingOrders, newOrder];
    enhancedDataSyncService[`set${module}Data`]('salesOrders', updatedOrders);
    
    return newOrder;
  },
  
  // Add new invoice to specific module  
  addInvoice: (module, invoiceData) => {
    const existingInvoices = enhancedDataSyncService[`get${module}Data`]('invoices');
    const newInvoice = {
      ...invoiceData,
      id: `${module}-INV-${Date.now()}`,
      module: module,
      createdAt: new Date().toISOString()
    };
    
    const updatedInvoices = [...existingInvoices, newInvoice];
    enhancedDataSyncService[`set${module}Data`]('invoices', updatedInvoices);
    
    return newInvoice;
  },
  
  // Get module statistics
  getModuleStats: (module) => {
    const salesOrders = enhancedDataSyncService[`get${module}Data`]('salesOrders');
    const invoices = enhancedDataSyncService[`get${module}Data`]('invoices');
    
    return {
      totalSalesOrders: salesOrders.length,
      totalInvoices: invoices.length,
      confirmedOrders: salesOrders.filter(so => so.status === 'Confirmed').length,
      paidInvoices: invoices.filter(inv => inv.status === 'Paid').length,
      totalRevenue: invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + (inv.amount || inv.sellingPrice || inv.orderValue || 0), 0),
      pendingRevenue: invoices
        .filter(inv => inv.status === 'Pending' || inv.status === 'Sent')
        .reduce((sum, inv) => sum + (inv.amount || inv.sellingPrice || inv.orderValue || 0), 0)
    };
  },
  
  // Clear all data for a specific module
  clearModuleData: (module) => {
    const keys = STORAGE_KEYS[module];
    if (!keys) return false;
    
    Object.values(keys).forEach(key => {
      safeStorage.remove(key);
    });
    
    return true;
  },
  
  // Export data for backup
  exportModuleData: (module) => {
    const data = {};
    const keys = STORAGE_KEYS[module];
    
    if (keys) {
      Object.entries(keys).forEach(([type, key]) => {
        data[type] = safeStorage.get(key);
      });
    }
    
    return data;
  },
  
  // Import data for restore
  importModuleData: (module, data) => {
    const keys = STORAGE_KEYS[module];
    
    if (keys) {
      Object.entries(keys).forEach(([type, key]) => {
        if (data[type]) {
          safeStorage.set(key, data[type]);
        }
      });
    }
    
    return true;
  }
};

export default enhancedDataSyncService;