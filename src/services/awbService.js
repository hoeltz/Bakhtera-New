// AWB Management Service
// Handles Air Waybill (AWB) operations and data management

import { formatCurrency } from './currencyUtils';

class AWBService {
  constructor() {
    this.storageKey = 'awbData';
    this.initializeData();
  }

  // Initialize default data structure
  initializeData() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Generate unique AWB number
  generateAWBNumber(type = 'Host') {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Get prefix based on type
    const prefix = type === 'Master' ? 'M' : 'H';
    
    // Get current AWBs for this month to determine next number
    const currentMonthAWBs = this.getAll().filter(awb => {
      if (!awb.createdAt) return false;
      const createdDate = new Date(awb.createdAt);
      return createdDate.getFullYear() === now.getFullYear() &&
             (createdDate.getMonth() + 1) === (now.getMonth() + 1);
    });

    const nextNumber = (currentMonthAWBs.length + 1).toString().padStart(6, '0');
    return `${prefix}${year}${month}${day}${nextNumber}`;
  }

  // Get all AWBs
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (error) {
      console.error('Error loading AWB data:', error);
      return [];
    }
  }

  // Get AWB by ID
  getById(id) {
    const awbs = this.getAll();
    return awbs.find(awb => awb.id === id);
  }

  // Get AWBs by quotation ID
  getByQuotationId(quotationId) {
    const awbs = this.getAll();
    return awbs.filter(awb => awb.quotationId === quotationId);
  }

  // Get AWBs by type (Master/Host)
  getByType(type) {
    const awbs = this.getAll();
    return awbs.filter(awb => awb.awbType === type);
  }

  // Create new AWB
  create(awbData) {
    try {
      const awbs = this.getAll();
      
      // Generate AWB number if not provided
      if (!awbData.awbNumber) {
        awbData.awbNumber = this.generateAWBNumber(awbData.awbType);
      }

      const newAWB = {
        id: Date.now().toString(),
        awbNumber: awbData.awbNumber,
        awbType: awbData.awbType || 'Host', // Master (from shipper) or Host (internal)
        
        // Link to quotation and customer
        quotationId: awbData.quotationId || null,
        quotationNumber: awbData.quotationNumber || null,
        customerId: awbData.customerId || null,
        customerName: awbData.customerName || '',
        
        // Shipper information
        shipperName: awbData.shipperName || '',
        shipperAddress: awbData.shipperAddress || '',
        shipperPhone: awbData.shipperPhone || '',
        shipperEmail: awbData.shipperEmail || '',
        
        // Consignee information
        consigneeName: awbData.consigneeName || '',
        consigneeAddress: awbData.consigneeAddress || '',
        consigneePhone: awbData.consigneePhone || '',
        consigneeEmail: awbData.consigneeEmail || '',
        
        // Route information
        origin: awbData.origin || '',
        originAirport: awbData.originAirport || '',
        originCountry: awbData.originCountry || '',
        destination: awbData.destination || '',
        destinationAirport: awbData.destinationAirport || '',
        destinationCountry: awbData.destinationCountry || '',
        routing: awbData.routing || '',
        
        // Weight & Dimensions
        pieces: awbData.pieces || 0,
        weight: awbData.weight || 0, // in kg
        volume: awbData.volume || 0, // in cbm
        chargeableWeight: awbData.chargeableWeight || 0,
        dimensions: awbData.dimensions || '',
        
        // Special handling
        dangerousGoods: awbData.dangerousGoods || false,
        dgClass: awbData.dgClass || '',
        temperature: awbData.temperature || '',
        specialInstructions: awbData.specialInstructions || '',
        
        // Cost integration
        freightCharge: awbData.freightCharge || 0,
        fuelSurcharge: awbData.fuelSurcharge || 0,
        securitySurcharge: awbData.securitySurcharge || 0,
        otherCharges: awbData.otherCharges || 0,
        totalCharge: awbData.totalCharge || 0,
        currency: awbData.currency || 'IDR',
        
        // Operational cost integration
        operationalCostId: awbData.operationalCostId || null,
        costAllocation: awbData.costAllocation || {},
        
        // Status tracking
        status: awbData.status || 'Created',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Tracking history
        trackingHistory: [{
          status: 'Created',
          timestamp: new Date().toISOString(),
          location: '',
          notes: 'AWB created'
        }],
        
        // Additional fields
        carrier: awbData.carrier || '',
        flightNumber: awbData.flightNumber || '',
        flightDate: awbData.flightDate || '',
        flightTime: awbData.flightTime || '',
        documents: awb.documents || [],
        
        // Performance metrics
        metrics: {
          costEfficiency: 0,
          timeEfficiency: 0,
          marginAnalysis: 0,
          performanceScore: 0
        },
        
        // Integration fields
        warehouseId: awbData.warehouseId || null,
        containerId: awbData.containerId || null,
        shipmentId: awbData.shipmentId || null
      };

      awbs.push(newAWB);
      localStorage.setItem(this.storageKey, JSON.stringify(awbs));
      
      return newAWB;
    } catch (error) {
      console.error('Error creating AWB:', error);
      throw new Error('Failed to create AWB');
    }
  }

  // Update existing AWB
  update(id, updateData) {
    try {
      const awbs = this.getAll();
      const index = awbs.findIndex(awb => awb.id === id);
      
      if (index === -1) {
        throw new Error('AWB not found');
      }

      const updatedAWB = {
        ...awbs[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      awbs[index] = updatedAWB;
      localStorage.setItem(this.storageKey, JSON.stringify(awbs));
      
      return updatedAWB;
    } catch (error) {
      console.error('Error updating AWB:', error);
      throw new Error('Failed to update AWB');
    }
  }

  // Update AWB status with tracking history
  updateStatus(id, newStatus, location = '', notes = '') {
    try {
      const awb = this.getById(id);
      if (!awb) {
        throw new Error('AWB not found');
      }

      const trackingEntry = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        location: location,
        notes: notes
      };

      const updatedData = {
        status: newStatus,
        trackingHistory: [...(awb.trackingHistory || []), trackingEntry]
      };

      return this.update(id, updatedData);
    } catch (error) {
      console.error('Error updating AWB status:', error);
      throw new Error('Failed to update AWB status');
    }
  }

  // Delete AWB
  delete(id) {
    try {
      const awbs = this.getAll();
      const filteredAWBs = awbs.filter(awb => awb.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredAWBs));
      return true;
    } catch (error) {
      console.error('Error deleting AWB:', error);
      throw new Error('Failed to delete AWB');
    }
  }

  // Search AWBs
  searchAWBs(searchTerm) {
    const awbs = this.getAll();
    const term = searchTerm.toLowerCase();
    
    return awbs.filter(awb => 
      awb.awbNumber?.toLowerCase().includes(term) ||
      awb.customerName?.toLowerCase().includes(term) ||
      awb.consigneeName?.toLowerCase().includes(term) ||
      awb.origin?.toLowerCase().includes(term) ||
      awb.destination?.toLowerCase().includes(term) ||
      awb.shipperName?.toLowerCase().includes(term)
    );
  }

  // Get AWB statistics
  getStatistics() {
    const awbs = this.getAll();
    
    const stats = {
      total: awbs.length,
      byType: {
        master: awbs.filter(awb => awb.awbType === 'Master').length,
        host: awbs.filter(awb => awb.awbType === 'Host').length
      },
      byStatus: {},
      byMonth: {},
      totalValue: 0,
      avgValue: 0
    };

    // Status breakdown
    const statusCounts = {};
    awbs.forEach(awb => {
      statusCounts[awb.status] = (statusCounts[awb.status] || 0) + 1;
    });
    stats.byStatus = statusCounts;

    // Monthly breakdown
    const monthCounts = {};
    awbs.forEach(awb => {
      if (awb.createdAt) {
        const date = new Date(awb.createdAt);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
    });
    stats.byMonth = monthCounts;

    // Financial stats
    stats.totalValue = awbs.reduce((sum, awb) => sum + (awb.totalCharge || 0), 0);
    stats.avgValue = awbs.length > 0 ? stats.totalValue / awbs.length : 0;

    return stats;
  }

  // Link AWB to operational cost
  linkToOperationalCost(awbId, operationalCostId) {
    try {
      return this.update(awbId, { operationalCostId });
    } catch (error) {
      console.error('Error linking AWB to operational cost:', error);
      throw new Error('Failed to link AWB to operational cost');
    }
  }

  // Get AWBs for dashboard
  getDashboardData() {
    const awbs = this.getAll();
    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      totalAWBs: awbs.length,
      activeAWBs: awbs.filter(awb => 
        !['Delivered', 'Cancelled'].includes(awb.status)
      ).length,
      recentAWBs: awbs.filter(awb => 
        new Date(awb.createdAt) > last30Days
      ).length,
      totalValue: awbs.reduce((sum, awb) => sum + (awb.totalCharge || 0), 0),
      pendingAWBs: awbs.filter(awb => 
        awb.status === 'Created' || awb.status === 'Received'
      ).length
    };
  }

  // Export AWB data
  exportToExcel() {
    const awbs = this.getAll();
    
    const data = awbs.map(awb => ({
      'AWB Number': awb.awbNumber,
      'Type': awb.awbType,
      'Customer': awb.customerName,
      'Shipper': awb.shipperName,
      'Consignee': awb.consigneeName,
      'Route': `${awb.origin} → ${awb.destination}`,
      'Weight (kg)': awb.weight,
      'Pieces': awb.pieces,
      'Total Charge': formatCurrency(awb.totalCharge || 0),
      'Status': awb.status,
      'Carrier': awb.carrier,
      'Created Date': new Date(awb.createdAt).toLocaleDateString()
    }));

    return data;
  }

  // Get status options
  getStatusOptions() {
    return [
      'Created',
      'Received',
      'Processed',
      'Shipped',
      'In Transit',
      'Customs',
      'Delivery',
      'Delivered',
      'Cancelled',
      'Exception'
    ];
  }

  // Get carrier options
  getCarrierOptions() {
    return [
      'Garuda Indonesia',
      'Lion Air',
      'Citilink',
      'Sriwijaya Air',
      'AirAsia Indonesia',
      'Super Air Jet',
      'Batik Air',
      'Pelita Air',
      'Jazeera Airways',
      'Qatar Airways',
      'Emirates',
      'Singapore Airlines',
      'Thai Airways',
      'Other'
    ];
  }

  // Get airport options
  getAirportOptions() {
    return [
      { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia' },
      { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Denpasar', country: 'Indonesia' },
      { code: 'JOG', name: 'Adisucipto International Airport', city: 'Yogyakarta', country: 'Indonesia' },
      { code: 'MES', name: 'Kualanamu International Airport', city: 'Medan', country: 'Indonesia' },
      { code: 'SUB', name: 'Juanda International Airport', city: 'Surabaya', country: 'Indonesia' },
      { code: 'BDO', name: 'Husein Sastranegara Airport', city: 'Bandung', country: 'Indonesia' },
      { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
      { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
      { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
      { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
      { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
      { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' }
    ];
  }
}

export default new AWBService();