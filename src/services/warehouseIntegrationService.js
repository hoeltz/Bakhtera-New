import dataSyncService from './dataSync';
import notificationService from './notificationService';

class WarehouseIntegrationService {
  constructor() {
    this.syncInterval = 30000; // 30 seconds
    this.isSyncing = false;
    this.subscribers = [];
  }

  // Initialize real-time data synchronization
  initializeSync() {
    this.startPeriodicSync();
    this.setupEventListeners();
  }

  // Start periodic synchronization
  startPeriodicSync() {
    setInterval(() => {
      this.performSync();
    }, this.syncInterval);
  }

  // Setup event listeners for data changes
  setupEventListeners() {
    // Listen for quotation changes
    dataSyncService.subscribe('quotation_updated', (data) => {
      this.handleQuotationUpdate(data);
    });

    // Listen for invoice changes
    dataSyncService.subscribe('invoice_updated', (data) => {
      this.handleInvoiceUpdate(data);
    });

    // Listen for operational cost changes
    dataSyncService.subscribe('operational_cost_updated', (data) => {
      this.handleOperationalCostUpdate(data);
    });
  }

  // Subscribe to warehouse updates
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  // Unsubscribe from warehouse updates
  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  // Notify all subscribers
  notify(type, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('Error notifying warehouse subscriber:', error);
      }
    });
  }

  // Perform data synchronization
  async performSync() {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    try {
      await Promise.all([
        this.syncConsignments(),
        this.syncCosts(),
        this.syncInvoices(),
        this.syncQuotations()
      ]);
    } catch (error) {
      console.error('Error during warehouse sync:', error);
      notificationService.showError('Warehouse data sync failed');
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync consignments with master quotations
  async syncConsignments() {
    try {
      const quotations = dataSyncService.getData('quotations') || [];
      const consignments = dataSyncService.getData('consignments') || [];

      // Update consignment references to master quotations
      for (let consignment of consignments) {
        const relatedQuotation = quotations.find(q => 
          q.id === consignment.masterQuotationId
        );
        
        if (relatedQuotation) {
          consignment.quotationReference = relatedQuotation;
          consignment.quotationAmount = relatedQuotation.totalAmount;
          consignment.syncStatus = 'synced';
        } else {
          consignment.syncStatus = 'missing_quotation';
        }
      }

      dataSyncService.setData('consignments', consignments);
      this.notify('consignments_synced', consignments);
    } catch (error) {
      console.error('Error syncing consignments:', error);
    }
  }

  // Sync cost tracking with operational costs
  async syncCosts() {
    try {
      const operationalCosts = dataSyncService.getData('operationalCosts') || [];
      const costTracking = dataSyncService.getData('warehouseCostTracking') || [];

      // Update cost tracking with operational cost data
      for (let cost of costTracking) {
        const relatedCosts = operationalCosts.filter(cost => 
          cost.relatedConsignmentId === cost.consignmentId
        );

        if (relatedCosts.length > 0) {
          // Update cost categories with operational data
          cost.operationalCosts = relatedCosts;
          cost.lastSyncTime = new Date().toISOString();
          cost.syncStatus = 'synced';
        }
      }

      dataSyncService.setData('warehouseCostTracking', costTracking);
      this.notify('costs_synced', costTracking);
    } catch (error) {
      console.error('Error syncing costs:', error);
    }
  }

  // Sync warehouse invoices with system invoices
  async syncInvoices() {
    try {
      const systemInvoices = dataSyncService.getData('invoices') || [];
      const warehouseInvoices = dataSyncService.getData('warehouseInvoices') || [];

      // Auto-sync warehouse invoices with system invoices
      for (let whInvoice of warehouseInvoices) {
        const systemInvoice = systemInvoices.find(inv => 
          inv.referenceId === whInvoice.id || inv.relatedConsignmentId === whInvoice.consignmentId
        );

        if (systemInvoice) {
          // Sync amounts and status
          whInvoice.systemInvoiceId = systemInvoice.id;
          whInvoice.systemInvoiceStatus = systemInvoice.status;
          whInvoice.lastSyncTime = new Date().toISOString();
          whInvoice.syncStatus = 'synced';

          // Update if amounts differ
          if (Math.abs(whInvoice.totalAmount - systemInvoice.totalAmount) > 0.01) {
            whInvoice.totalAmount = systemInvoice.totalAmount;
            whInvoice.varianceAmount = systemInvoice.totalAmount - whInvoice.originalAmount;
            whInvoice.variancePercent = (whInvoice.varianceAmount / whInvoice.originalAmount) * 100;
            whInvoice.needsReview = true;
          }
        } else {
          whInvoice.syncStatus = 'missing_system_invoice';
        }
      }

      dataSyncService.setData('warehouseInvoices', warehouseInvoices);
      this.notify('invoices_synced', warehouseInvoices);
    } catch (error) {
      console.error('Error syncing invoices:', error);
    }
  }

  // Sync warehouse quotations with system quotations
  async syncQuotations() {
    try {
      const systemQuotations = dataSyncService.getData('quotations') || [];
      const warehouseQuotations = dataSyncService.getData('warehouseQuotations') || [];

      // Update warehouse quotations with system quotation data
      for (let whQuote of warehouseQuotations) {
        const systemQuote = systemQuotations.find(quote => 
          quote.id === whQuote.systemQuotationId
        );

        if (systemQuote) {
          whQuote.status = systemQuote.status;
          whQuote.validUntil = systemQuote.validUntil;
          whQuote.lastSyncTime = new Date().toISOString();
          whQuote.syncStatus = 'synced';
        } else {
          whQuote.syncStatus = 'missing_system_quotation';
        }
      }

      dataSyncService.setData('warehouseQuotations', warehouseQuotations);
      this.notify('quotations_synced', warehouseQuotations);
    } catch (error) {
      console.error('Error syncing quotations:', error);
    }
  }

  // Handle quotation updates
  handleQuotationUpdate(data) {
    this.notify('quotation_updated', data);
    this.performSync();
  }

  // Handle invoice updates
  handleInvoiceUpdate(data) {
    this.notify('invoice_updated', data);
    this.performSync();
  }

  // Handle operational cost updates
  handleOperationalCostUpdate(data) {
    this.notify('operational_cost_updated', data);
    this.performSync();
  }

  // Create new warehouse consignment
  async createConsignment(consignmentData) {
    try {
      const newConsignment = {
        id: `C-${Date.now()}`,
        ...consignmentData,
        createdAt: new Date().toISOString(),
        status: 'Created',
        syncStatus: 'pending'
      };

      // Add to local storage
      const consignments = dataSyncService.getData('consignments') || [];
      consignments.push(newConsignment);
      dataSyncService.setData('consignments', consignments);

      // Sync with quotation if master quotation is provided
      if (consignmentData.masterQuotationId) {
        await this.syncConsignments();
      }

      this.notify('consignment_created', newConsignment);
      notificationService.showSuccess('Consignment created successfully');
      
      return newConsignment;
    } catch (error) {
      console.error('Error creating consignment:', error);
      notificationService.showError('Failed to create consignment');
      throw error;
    }
  }

  // Update consignment status
  async updateConsignmentStatus(consignmentId, newStatus) {
    try {
      const consignments = dataSyncService.getData('consignments') || [];
      const consignment = consignments.find(c => c.id === consignmentId);
      
      if (consignment) {
        consignment.status = newStatus;
        consignment.lastUpdated = new Date().toISOString();
        
        dataSyncService.setData('consignments', consignments);
        this.notify('consignment_status_updated', { consignmentId, status: newStatus });
        
        notificationService.showSuccess('Consignment status updated');
      }
    } catch (error) {
      console.error('Error updating consignment status:', error);
      notificationService.showError('Failed to update consignment status');
    }
  }

  // Calculate storage costs
  calculateStorageCost(consignmentId, storageRate, storageDays) {
    const consignments = dataSyncService.getData('consignments') || [];
    const consignment = consignments.find(c => c.id === consignmentId);
    
    if (!consignment) {
      throw new Error('Consignment not found');
    }

    // Calculate based on volume and weight
    const baseRate = storageRate || 50000; // Default rate
    const volumeWeightFactor = Math.max(
      parseFloat(consignment.totalVolume || 0),
      parseFloat(consignment.totalWeight || 0) / 1000
    );

    const storageCost = baseRate * volumeWeightFactor * storageDays;
    
    return {
      consignmentId,
      storageDays,
      storageRate: baseRate,
      volumeWeightFactor,
      totalCost: storageCost,
      calculatedAt: new Date().toISOString()
    };
  }

  // Generate warehouse invoice
  async generateWarehouseInvoice(consignmentId, costData) {
    try {
      const consignment = dataSyncService.getData('consignments')?.find(c => c.id === consignmentId);
      
      if (!consignment) {
        throw new Error('Consignment not found');
      }

      const invoice = {
        id: `WI-${Date.now()}`,
        consignmentId: consignmentId,
        customerName: consignment.customerName || 'N/A',
        billingCycle: 'Service-based',
        costs: costData,
        totalAmount: Object.values(costData).reduce((sum, cost) => sum + (cost || 0), 0),
        status: 'Pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        autoSync: true,
        syncStatus: 'pending'
      };

      // Save to local storage
      const warehouseInvoices = dataSyncService.getData('warehouseInvoices') || [];
      warehouseInvoices.push(invoice);
      dataSyncService.setData('warehouseInvoices', warehouseInvoices);

      // Create corresponding system invoice
      const systemInvoice = {
        id: `INV-${Date.now()}`,
        type: 'warehouse',
        referenceId: invoice.id,
        relatedConsignmentId: consignmentId,
        amount: invoice.totalAmount,
        customerName: invoice.customerName,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const systemInvoices = dataSyncService.getData('invoices') || [];
      systemInvoices.push(systemInvoice);
      dataSyncService.setData('invoices', systemInvoices);

      this.notify('invoice_generated', invoice);
      notificationService.showSuccess('Warehouse invoice generated successfully');
      
      return invoice;
    } catch (error) {
      console.error('Error generating warehouse invoice:', error);
      notificationService.showError('Failed to generate warehouse invoice');
      throw error;
    }
  }

  // Get dashboard KPIs
  getDashboardKPIs() {
    try {
      const consignments = dataSyncService.getData('consignments') || [];
      const warehouseInvoices = dataSyncService.getData('warehouseInvoices') || [];
      const inventory = dataSyncService.getData('warehouseInventory') || [];

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      // Calculate KPIs
      const totalWarehouses = 8; // This would be dynamic based on actual warehouse data
      const totalInventory = inventory.length;
      const pendingConsignments = consignments.filter(c => 
        ['In Transit', 'Processing', 'Pending'].includes(c.status)
      ).length;
      
      const monthlyInvoices = warehouseInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.createdDate);
        return invoiceDate.getMonth() === thisMonth && invoiceDate.getFullYear() === thisYear;
      });
      
      const monthlyRevenue = monthlyInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
      
      // Calculate storage utilization (mock data)
      const storageUtilization = 78.5;
      
      // Calculate customs clearance rate (mock data)
      const customsClearance = 92.3;

      return {
        totalWarehouses,
        totalInventory,
        pendingConsignments,
        monthlyRevenue,
        storageUtilization,
        customsClearance
      };
    } catch (error) {
      console.error('Error calculating dashboard KPIs:', error);
      return {
        totalWarehouses: 0,
        totalInventory: 0,
        pendingConsignments: 0,
        monthlyRevenue: 0,
        storageUtilization: 0,
        customsClearance: 0
      };
    }
  }

  // Export warehouse data
  async exportData(type = 'all') {
    try {
      const data = {};
      
      switch (type) {
        case 'consignments':
          data.consignments = dataSyncService.getData('consignments') || [];
          break;
        case 'invoices':
          data.invoices = dataSyncService.getData('warehouseInvoices') || [];
          break;
        case 'costs':
          data.costs = dataSyncService.getData('warehouseCostTracking') || [];
          break;
        case 'quotations':
          data.quotations = dataSyncService.getData('warehouseQuotations') || [];
          break;
        default:
          data.consignments = dataSyncService.getData('consignments') || [];
          data.invoices = dataSyncService.getData('warehouseInvoices') || [];
          data.costs = dataSyncService.getData('warehouseCostTracking') || [];
          data.quotations = dataSyncService.getData('warehouseQuotations') || [];
          data.inventory = dataSyncService.getData('warehouseInventory') || [];
      }

      // Create exportable JSON
      const exportData = {
        exportType: type,
        exportDate: new Date().toISOString(),
        data: data
      };

      // Convert to downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `warehouse-${type}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notificationService.showSuccess('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      notificationService.showError('Failed to export data');
    }
  }

  // Cleanup
  destroy() {
    this.subscribers = [];
  }
}

// Create singleton instance
const warehouseIntegrationService = new WarehouseIntegrationService();
export default warehouseIntegrationService;