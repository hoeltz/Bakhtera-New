const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      warehouses: [],
      inventory: [],
      quotations: [],
      salesOrders: [],
      invoices: [],
      consignments: [],
      _idempotency: {}
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
  }
}

function getData() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // recreate if corrupt
    const initial = {
      warehouses: [],
      inventory: [],
      quotations: [],
      salesOrders: [],
      invoices: [],
      consignments: [],
      _idempotency: {}
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function initializeSampleData() {
  const data = getData();
  // Add sample warehouses/inventory only if they're missing
  // but always ensure sample quotations and salesOrders exist
  
  const sampleWarehouses = [
    {
      id: 'wh-jakarta-01',
      name: 'Warehouse Jakarta',
      country: 'Indonesia',
      city: 'Jakarta',
      address: 'Jl. Tanjungsari No. 45, Jakarta Utara 14140',
      contactPerson: 'Budi Santoso',
      phone: '+62-21-123-4567',
      email: 'wh.jakarta@bakhtera.id',
      capacity: 50000,
      currentLoad: 5000,
      status: 'Aktif',
      areas: [
        { name: 'Gudang A', zones: ['Zona 1', 'Zona 2', 'Zona 3'], capacity: 15000 },
        { name: 'Gudang B', zones: ['Zona 1', 'Zona 2', 'Zona Khusus'], capacity: 20000 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wh-surabaya-01',
      name: 'Warehouse Surabaya',
      country: 'Indonesia',
      city: 'Surabaya',
      address: 'Jl. Perak Timur No. 88, Surabaya 60165',
      contactPerson: 'Siti Wijaya',
      phone: '+62-31-456-7890',
      email: 'wh.surabaya@bakhtera.id',
      capacity: 35000,
      currentLoad: 2500,
      status: 'Aktif',
      areas: [
        { name: 'Gudang B', zones: ['Zona 1', 'Zona 2'], capacity: 18000 },
        { name: 'Gudang C', zones: ['Zona 1', 'Zona 2'], capacity: 17000 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wh-bandung-01',
      name: 'Warehouse Bandung',
      country: 'Indonesia',
      city: 'Bandung',
      address: 'Jl. Cihampelas No. 200, Bandung 40141',
      contactPerson: 'Ahmad Kusuma',
      phone: '+62-22-789-0123',
      email: 'wh.bandung@bakhtera.id',
      capacity: 40000,
      currentLoad: 10000,
      status: 'Aktif',
      areas: [
        { name: 'Gudang C', zones: ['Zona 1', 'Zona 2'], capacity: 20000 },
        { name: 'Gudang D', zones: ['Zona 1'], capacity: 20000 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wh-medan-01',
      name: 'Warehouse Medan',
      country: 'Indonesia',
      city: 'Medan',
      address: 'Jl. Gatot Subroto No. 15, Medan 20122',
      contactPerson: 'Reza Pratama',
      phone: '+62-61-234-5678',
      email: 'wh.medan@bakhtera.id',
      capacity: 30000,
      currentLoad: 3200,
      status: 'Aktif',
      areas: [
        { name: 'Gudang B', zones: ['Zona Khusus'], capacity: 30000 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wh-jakarta-02',
      name: 'Warehouse Jakarta Port',
      country: 'Indonesia',
      city: 'Jakarta',
      address: 'Jl. Pelabuhan No. 100, Tanjung Priok, Jakarta 14340',
      contactPerson: 'Dedi Gunawan',
      phone: '+62-21-987-6543',
      email: 'wh.port@bakhtera.id',
      capacity: 60000,
      currentLoad: 450,
      status: 'Aktif',
      areas: [
        { name: 'Gudang A', zones: ['Zona 3'], capacity: 30000 },
        { name: 'Gudang E', zones: ['Zona 1', 'Zona 2'], capacity: 30000 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const sampleInventory = [
    {
      id: 'inv-001',
      sku: 'SKU-ELEC-001',
      name: 'Electronic Components - Transistor BC547',
      category: 'Electronics',
      warehouseId: 'wh-jakarta-01',
      warehouseName: 'Warehouse Jakarta',
      location: 'Gudang A, Zona 1, Rack B-05',
      qty: 5000,
      unit: 'pcs',
      weight: 0.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inv-002',
      sku: 'SKU-TEXT-001',
      name: 'Textile - Cotton Fabric Roll',
      category: 'Textiles',
      warehouseId: 'wh-surabaya-01',
      warehouseName: 'Warehouse Surabaya',
      location: 'Gudang B, Zona 2, Rack C-12',
      qty: 2500,
      unit: 'meter',
      weight: 15.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inv-003',
      sku: 'SKU-PLAST-001',
      name: 'Plastic Pellets - HDPE Grade',
      category: 'Plastics',
      warehouseId: 'wh-bandung-01',
      warehouseName: 'Warehouse Bandung',
      location: 'Gudang C, Zona 1, Rack A-08',
      qty: 10000,
      unit: 'kg',
      weight: 500.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inv-004',
      sku: 'SKU-CHEM-001',
      name: 'Chemical - Sodium Chloride NaCl',
      category: 'Chemicals',
      warehouseId: 'wh-medan-01',
      warehouseName: 'Warehouse Medan',
      location: 'Gudang B, Zona Khusus, Rack X-01',
      qty: 3200,
      unit: 'kg',
      weight: 160.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inv-005',
      sku: 'SKU-VPART-001',
      name: 'Vehicle Parts - Engine Piston Kit',
      category: 'Vehicle Parts',
      warehouseId: 'wh-jakarta-02',
      warehouseName: 'Warehouse Jakarta Port',
      location: 'Gudang A, Zona 3, Rack D-15',
      qty: 450,
      unit: 'set',
      weight: 2.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  if (!data.warehouses || data.warehouses.length === 0) data.warehouses = sampleWarehouses;
  if (!data.inventory || data.inventory.length === 0) data.inventory = sampleInventory;
  
  // Ensure arrays exist
  data.quotations = data.quotations || [];
  data.salesOrders = data.salesOrders || [];
  // Sample quotations for BRiDGE - Event / Exhibition
  // Add sample quotations if missing by id
  const sampleQuotations = [
    {
      id: 'QT-BRIDGE-1001',
      quotationNumber: 'QT-BRIDGE-2025-1001',
      quotationType: 'event_warehouse',
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
      status: 'draft',
      customer: {
        id: 'CUST-EXPO-001',
        name: 'PT Event Organizer Indonesia',
        company: 'EventOrg',
        taxId: '12.345.678.9-012.345',
        address: 'Jl. Event 123, Jakarta',
        phone: '021-1234567',
        email: 'info@eventorg.co.id',
        pic: { name: 'Budi Santoso', phone: '0812-3456789', email: 'budi@eventorg.co.id' }
      },
      event: { name: 'Indonesia Expo 2025', type: 'international_exhibition', startDate: '2025-12-01', endDate: '2025-12-05', venue: 'Jakarta Convention Center', city: 'Jakarta', country: 'Indonesia', internationalStatus: 'international' },
      shipment: { referenceNumber: 'PO-2025-EX-001', importExportStatus: 'import', awb: 'AWB-EX-1001', bl: '', customsDocType: 'BC23', hsCode: '8528.7290', countryOfOrigin: 'Korea', estimatedArrival: '2025-11-22', transportMode: 'air', carrier: 'KoreanAir', incoterms: 'CIF' },
      warehouse: { storageStartDate: '2025-11-25', storageEndDate: '2025-12-06', totalStorageDays: 11, storageType: 'climate_controlled', areaNeeded: 120, specialRequirements: ['climate_controlled_18-25C','24/7_surveillance'] },
      items: [ { id: 'ITEM-EX-01', itemName: 'LED Display 55"', sku: 'SKU-DISPLAY-55', description: 'Large LED Display', commodityType: 'electronics', hsCode: '8528.7290', countryOfOrigin: 'Korea', quantity: 4, unitOfMeasure: 'pcs', grossWeight: 100, netWeight: 80, dimensions: '120x10x75', cbm: 0.36, unitPrice: 2000000, total: 8000000 } ],
      services: [ { id: 'SVC-EX-01', serviceName: 'Receiving & Inspection', serviceType: 'handling', description: 'Receiving and inspection', quantity: 1, unitPrice: 5000000, total: 5000000 } ],
      costs: { goodsSubtotal: 8000000, servicesSubtotal: 5000000, subtotalBeforeTax: 13000000, taxPercent: 11, taxAmount: 1430000, total: 14430000 },
      terms: { paymentTerms: 'Net 30', depositPercent: 50, deliveryTerms: 'Customer pickup' },
      notes: 'Temporary sample quotation for BRiDGE event flow',
      approvalRequired: true,
      createdAt: new Date().toISOString(),
      createdBy: 'sales_bridge_001'
    },
    {
      id: 'QT-BRIDGE-1002',
      quotationNumber: 'QT-BRIDGE-2025-1002',
      quotationType: 'event_warehouse',
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
      status: 'approved',
      customer: {
        id: 'CUST-EXPO-002',
        name: 'PT Expo Nusantara',
        company: 'ExpoNus',
        taxId: '98.765.432.1-000.000',
        address: 'Jl. Nusantara 45, Jakarta',
        phone: '021-7654321',
        email: 'hello@exponus.co.id',
        pic: { name: 'Siti Nur', phone: '0813-9876543', email: 'siti@exponus.co.id' }
      },
      event: { name: 'GIIAS Mini 2025', type: 'exhibition', startDate: '2025-11-28', endDate: '2025-11-30', venue: 'ICE BSD', city: 'Tangerang', country: 'Indonesia', internationalStatus: 'domestic' },
      shipment: { referenceNumber: 'PO-2025-GIIAS-002', importExportStatus: 'domestic', awb: '', bl: '', customsDocType: 'BC25', hsCode: '9406.0090', countryOfOrigin: 'Indonesia', estimatedArrival: '', transportMode: 'land', carrier: '', incoterms: 'EXW' },
      warehouse: { storageStartDate: '2025-11-20', storageEndDate: '2025-11-31', totalStorageDays: 12, storageType: 'normal', areaNeeded: 80, specialRequirements: ['forklift_access'] },
      items: [ { id: 'ITEM-EX-02', itemName: 'Booth Furniture Set', sku: 'SKU-FURN-01', description: 'Tables and chairs', commodityType: 'furniture', hsCode: '9406.0090', countryOfOrigin: 'Indonesia', quantity: 50, unitOfMeasure: 'pcs', grossWeight: 20, netWeight: 18, dimensions: '100x100x120', cbm: 1.2, unitPrice: 500000, total: 25000000 } ],
      services: [ { id: 'SVC-EX-02', serviceName: 'Storage Service', serviceType: 'storage', description: 'Storage service', quantity: 80, duration: 12, unit: 'm2-days', unitPrice: 50000, total: 480000000 } ],
      costs: { goodsSubtotal: 25000000, servicesSubtotal: 480000000, subtotalBeforeTax: 505000000, taxPercent: 11, taxAmount: 55550000, total: 560550000 },
      terms: { paymentTerms: 'DP 50%', depositPercent: 50, deliveryTerms: 'Warehouse delivery' },
      notes: 'Approved sample quotation converted to sales order in sample data',
      approvalRequired: true,
      approvedBy: 'manager_01',
      approvedAt: new Date().toISOString(),
      salesOrderId: 'SO-BRIDGE-2001',
      createdAt: new Date().toISOString(),
      createdBy: 'sales_bridge_002'
    }
  ];

  sampleQuotations.forEach(sq => {
    if (!data.quotations.find(q => q.id === sq.id)) data.quotations.push(sq);
  });

  // Sample sales order converted from quotation QT-BRIDGE-1002
  const sampleSalesOrders = [
    {
      id: 'SO-BRIDGE-2001',
      quotationId: 'QT-BRIDGE-1002',
      quotationNumber: 'QT-BRIDGE-2025-1002',
      customerName: 'PT Expo Nusantara',
      customerEmail: 'hello@exponus.co.id',
      items: [ { id: 'ITEM-EX-02', description: 'Booth Furniture Set', quantity: 50, unitPrice: 500000, total: 25000000 } ],
      subtotal: 25000000,
      tax: 2750000,
      total: 27750000,
      deliveryDate: '2025-11-20',
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      confirmedBy: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  sampleSalesOrders.forEach(ss => {
    if (!data.salesOrders.find(so => so.id === ss.id)) data.salesOrders.push(ss);
  });

  saveData(data);
}

module.exports = {
  getData,
  saveData,
  initializeSampleData,
  DATA_FILE
};
