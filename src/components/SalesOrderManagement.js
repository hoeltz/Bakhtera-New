import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  Autocomplete,
  Divider,
  Tooltip,
  Fab,
  Badge,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  CloudUpload as UploadIcon,
  GetApp as ExportIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Description as DocumentIcon,
  Gavel as CustomsIcon,
  AccountTree as ProcessIcon,
  AttachFile as AttachFileIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

import enhancedDataSyncService from '../services/enhancedDataSync';
import notificationService from '../services/notificationService';

// Safe formatCurrency function with fallback
const safeFormatCurrency = (amount) => {
  if (typeof formatCurrency === 'function') {
    return formatCurrency(amount || 0);
  }
  // Fallback formatting
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

// Auto-generation of Sales Order Number: BRIDGE-YYMMNNNN
const generateSalesOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // YY
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
  
  // Get existing sales orders to determine next sequence
  const existingOrders = enhancedDataSyncService.getBRIDGEData('salesOrders') || [];
  const thisMonthOrders = existingOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate.getFullYear() === now.getFullYear() &&
           (orderDate.getMonth() + 1) === (now.getMonth() + 1);
  });
  
  const nextSequence = (thisMonthOrders.length + 1).toString().padStart(4, '0'); // NNNN
  return `BRIDGE-${year}${month}${nextSequence}`;
};

// Freight Forwarding specific data
const freightServiceTypes = [
  'Sea Freight',
  'Air Freight',
  'Trucking',
  'Rail Freight',
  'Express Courier',
  'Door to Door',
  'Warehousing',
  'Customs Clearance',
  'Consolidation'
];

const containerTypes = [
  '20ft Standard',
  '40ft Standard',
  '40ft High Cube',
  '45ft High Cube',
  'LCL (Less than Container Load)',
  'FCL (Full Container Load)',
  'Open Top',
  'Flat Rack'
];

const bcCodes = [
  { code: 'BC 2.3', description: 'Peng impor barang untuk dirakit/dipasang di dalam negeri' },
  { code: 'BC 2.5', description: 'Peng impor barang contoh untuk perkembangan industry' },
  { code: 'BC 2.7', description: 'Peng impor sementara' },
  { code: 'BC 3.0', description: 'Peng ekspor barang' },
  { code: 'BC 2.3.1', description: 'BC 2.3 dengan financial assistance' },
  { code: 'BC 2.5.1', description: 'BC 2.5 untuk grace period' }
];

// Initialize consignment fees structure
const initializeConsignmentFees = () => ({
  // Base Fees
  baseFreight: 0,
  documentation: 0,
  handling: 0,
  // Additional Services
  insurance: 0,
  customsClearance: 0,
  warehousing: 0,
  delivery: 0,
  // Operational Fees
  fuelSurcharge: 0,
  securityFee: 0,
  equipmentFee: 0,
  // Special Services
  temperatureControlled: 0,
  hazardousCargo: 0,
  expressService: 0,
  // Total Calculation
  subtotal: 0,
  taxRate: 11,
  taxAmount: 0,
  total: 0
});

// Main Sales Order Management Component
const SalesOrderManagement = ({ onNotification }) => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  // Enhanced Sales Order Form Data
  const [formData, setFormData] = useState({
    salesOrderNumber: '',
    customerId: '',
    customerName: '',
    customerEmail: '',
    serviceType: '',
    origin: '',
    destination: '',
    incoterm: '',
    
    // Consignment Details
    consignments: [],
    
    // Freight Details
    awbNumber: '',
    blNumber: '',
    vesselName: '',
    voyageNumber: '',
    portLoading: '',
    portDischarge: '',
    
    // Cargo Details
    cargoItems: [
      {
        id: `cargo_${Date.now()}`,
        description: '',
        hsCode: '',
        quantity: 1,
        unit: 'PCS',
        weight: 0,
        weightUnit: 'KG',
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          unit: 'CM'
        },
        volume: 0,
        volumeUnit: 'M3',
        packingType: '',
        containerType: '',
        containerNumber: '',
        sealNumber: '',
        value: 0,
        currency: 'IDR'
      }
    ],
    
    // Customs & Documentation
    bcCode: '',
    bcDescription: '',
    importLicense: '',
    exportLicense: '',
    certificateOrigin: '',
    
    // Documentation Management
    documents: [
      {
        id: `doc_${Date.now()}`,
        name: '',
        type: '',
        status: 'pending',
        uploadDate: null,
        expiryDate: null,
        required: true,
        uploadedBy: '',
        notes: ''
      }
    ],
    
    // Customs Workflow
    customsWorkflow: {
      currentStep: 'preparation',
      steps: [
        { id: 'preparation', name: 'Document Preparation', completed: false, date: null },
        { id: 'submission', name: 'BC Submission', completed: false, date: null },
        { id: 'verification', name: 'Customs Verification', completed: false, date: null },
        { id: 'clearance', name: 'Customs Clearance', completed: false, date: null },
        { id: 'release', name: 'Cargo Release', completed: false, date: null }
      ],
      customsOfficer: '',
      remarks: '',
      estimatedProcessingTime: ''
    },
    
    // Financial
    sellingPrice: 0,
    currency: 'IDR',
    exchangeRate: 1,
    paymentTerms: 'Net 30',
    dueDate: '',
    
    // Consignment Fee Structure
    consignmentFees: initializeConsignmentFees(),
    
    // Owner Information
    consignor: '',
    consignee: '',
    notifyParty: '',
    
    // Additional Information
    specialInstructions: '',
    marksAndNumbers: '',
    hazardous: false,
    temperature: '',
    
    // Status
    status: 'Draft',
    priority: 'Normal',
    createdAt: new Date().toISOString(),
    estimatedDeparture: '',
    estimatedArrival: ''
  });

  // Consignment Fee Structure Constants
  const consignmentFeeTypes = {
    baseFreight: { label: 'Base Freight', description: 'Main transportation cost', type: 'freight' },
    documentation: { label: 'Documentation', description: 'Document processing fees', type: 'service' },
    handling: { label: 'Cargo Handling', description: 'Loading/unloading operations', type: 'service' },
    insurance: { label: 'Cargo Insurance', description: 'Insurance coverage', type: 'insurance' },
    customsClearance: { label: 'Customs Clearance', description: 'Customs processing', type: 'service' },
    warehousing: { label: 'Warehousing', description: 'Storage and handling', type: 'service' },
    delivery: { label: 'Delivery Service', description: 'Final delivery to consignee', type: 'service' },
    fuelSurcharge: { label: 'Fuel Surcharge', description: 'Fuel cost adjustment', type: 'surcharge' },
    securityFee: { label: 'Security Fee', description: 'Cargo security services', type: 'service' },
    equipmentFee: { label: 'Equipment Fee', description: 'Special equipment usage', type: 'service' },
    temperatureControlled: { label: 'Temperature Control', description: 'Refrigerated transport', type: 'special' },
    hazardousCargo: { label: 'Hazardous Cargo', description: 'Dangerous goods handling', type: 'special' },
    expressService: { label: 'Express Service', description: 'Priority/urgent handling', type: 'service' }
  };

  const incoterms = [
    'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
    'FAS', 'FOB', 'CFR', 'CIF', 'COT', 'CIF'
  ];

  const steps = [
    'Basic Information',
    'Freight Details',
    'Cargo Items',
    'Documentation Management',
    'Consignment Fees',
    'Customs Workflow',
    'Financial & Terms'
  ];

  // Document types and templates
  const documentTypes = [
    'Invoice',
    'Packing List',
    'Bill of Lading (B/L)',
    'Airway Bill (AWB)',
    'Certificate of Origin',
    'Commercial Invoice',
    'Proforma Invoice',
    'Import Declaration (BC)',
    'Export Declaration (BC)',
    'Insurance Certificate',
    'Inspection Certificate',
    'Phytosanitary Certificate',
    'Health Certificate',
    'Customs Declaration',
    'Import Permit',
    'Export Permit',
    'Other'
  ];

  // Load data - BRIDGE Module only with proper isolation
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load BRIDGE-specific data only - no cross-module contamination
      const bridgeSalesOrdersRaw = localStorage.getItem('bridge_sales_orders');
      let bridgeSalesOrders = [];
      
      if (bridgeSalesOrdersRaw) {
        try {
          bridgeSalesOrders = JSON.parse(bridgeSalesOrdersRaw) || [];
        } catch (e) {
          console.warn('Error parsing BRIDGE sales orders:', e);
          bridgeSalesOrders = [];
        }
      }
      
      // Initialize with sample data if empty
      if (bridgeSalesOrders.length === 0) {
        bridgeSalesOrders = createSampleSalesOrders(getSampleCustomers());
        localStorage.setItem('bridge_sales_orders', JSON.stringify(bridgeSalesOrders));
        console.info('[SalesOrderManagement] Created and stored sample sales orders:', bridgeSalesOrders.length);
      } else {
        console.info('[SalesOrderManagement] Loaded sales orders from localStorage:', bridgeSalesOrders.length);
      }

      // Load BRIDGE-specific customers
      const bridgeCustomersRaw = localStorage.getItem('bridge_customers');
      let bridgeCustomers = [];
      
      if (bridgeCustomersRaw) {
        try {
          bridgeCustomers = JSON.parse(bridgeCustomersRaw) || [];
        } catch (e) {
          console.warn('Error parsing BRIDGE customers:', e);
          bridgeCustomers = getSampleCustomers();
        }
      } else {
        bridgeCustomers = getSampleCustomers();
        localStorage.setItem('bridge_customers', JSON.stringify(bridgeCustomers));
      }

      setSalesOrders(bridgeSalesOrders);
      setCustomers(bridgeCustomers);
      
      console.info('[SalesOrderManagement] Data loaded successfully - Sales Orders:', bridgeSalesOrders.length, 'Customers:', bridgeCustomers.length);
      
    } catch (error) {
      console.error('Error loading BRIDGE module data:', error);
      // Silent error handling - no user notifications
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sample data creation functions
  const getSampleCustomers = () => [
    {
      id: 'CUST-001',
      name: 'PT. ABC Trading Indonesia',
      email: 'contact@abctrading.co.id',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat'
    },
    {
      id: 'CUST-002',
      name: 'PT. XYZ Logistics',
      email: 'info@xyzlogistics.com',
      address: 'Jl. Thamrin No. 456, Jakarta'
    },
    {
      id: 'CUST-003',
      name: 'CV. Maju Jaya',
      email: 'sales@majujaya.com',
      address: 'Jl. Gatot Subroto No. 789, Surabaya'
    }
  ];

  const createSampleSalesOrders = (customers) => [
    {
      id: 'so_001',
      salesOrderNumber: 'BRIDGE-24110001',
      customerId: customers[0]?.id || 'CUST-001',
      customerName: customers[0]?.name || 'PT. ABC Trading Indonesia',
      customerEmail: customers[0]?.email || 'contact@abctrading.co.id',
      serviceType: 'Sea Freight',
      origin: 'Jakarta, Indonesia',
      destination: 'Singapore',
      incoterm: 'FOB',
      awbNumber: '',
      blNumber: 'BL-SIN-2024-001',
      vesselName: 'MV Pacific Star',
      voyageNumber: 'PS2411-01',
      portLoading: 'Tanjung Priok, Jakarta',
      portDischarge: 'Port of Singapore',
      cargoItems: [
        {
          id: 'cargo_001_1',
          description: 'Electronic Components - Circuit Boards',
          hsCode: '8534.00.00',
          quantity: 50,
          unit: 'PCS',
          weight: 250,
          weightUnit: 'KG',
          dimensions: { length: 60, width: 40, height: 20, unit: 'CM' },
          volume: 1.2,
          volumeUnit: 'M3',
          packingType: 'Wooden Case',
          containerType: '20ft Standard',
          containerNumber: 'MSKU1234567',
          sealNumber: 'SEAL001234',
          value: 50000000,
          currency: 'IDR'
        }
      ],
      bcCode: 'BC 3.0',
      bcDescription: 'Ekspor barang elektronik',
      importLicense: '',
      exportLicense: 'EXP-2024-001',
      certificateOrigin: 'Certificate of Origin Indonesia',
      sellingPrice: 75000000,
      currency: 'IDR',
      exchangeRate: 1,
      paymentTerms: 'Net 30',
      dueDate: '2024-12-10',
      consignor: 'PT. ABC Trading Indonesia',
      consignee: 'ABC Electronics Pte Ltd',
      notifyParty: 'ABC Electronics Pte Ltd',
      specialInstructions: 'Handle with care - Fragile electronic components',
      marksAndNumbers: 'ABC-SIN-001',
      hazardous: false,
      temperature: '',
      status: 'Confirmed',
      priority: 'Normal',
      createdAt: '2024-11-01T10:00:00Z',
      estimatedDeparture: '2024-11-15',
      estimatedArrival: '2024-11-18',
      totals: { totalWeight: 250, totalVolume: 1.2, totalValue: 50000000 },
      consignmentFees: {
        baseFreight: 15000000,
        documentation: 200000,
        handling: 500000,
        insurance: 250000,
        customsClearance: 500000,
        warehousing: 180000,
        delivery: 300000,
        fuelSurcharge: 2250000,
        securityFee: 250000,
        equipmentFee: 1000000,
        temperatureControlled: 0,
        hazardousCargo: 0,
        expressService: 0,
        subtotal: 20750000,
        taxRate: 11,
        taxAmount: 2282500,
        total: 23032500
      }
    },
    {
      id: 'so_002',
      salesOrderNumber: 'BRIDGE-24110002',
      customerId: customers[1]?.id || 'CUST-002',
      customerName: customers[1]?.name || 'PT. XYZ Logistics',
      customerEmail: customers[1]?.email || 'info@xyzlogistics.com',
      serviceType: 'Air Freight',
      origin: 'Jakarta, Indonesia',
      destination: 'Kuala Lumpur, Malaysia',
      incoterm: 'DDP',
      awbNumber: 'AWB-MH-2024-002',
      blNumber: '',
      vesselName: '',
      voyageNumber: '',
      portLoading: 'Soekarno-Hatta Airport',
      portDischarge: 'Kuala Lumpur International Airport',
      cargoItems: [
        {
          id: 'cargo_002_1',
          description: 'Fashion Apparel - Cotton T-Shirts',
          hsCode: '6109.10.00',
          quantity: 200,
          unit: 'PCS',
          weight: 80,
          weightUnit: 'KG',
          dimensions: { length: 50, width: 40, height: 30, unit: 'CM' },
          volume: 1.5,
          volumeUnit: 'M3',
          packingType: 'Carton Box',
          containerType: 'LCL (Less than Container Load)',
          containerNumber: '',
          sealNumber: '',
          value: 30000000,
          currency: 'IDR'
        }
      ],
      bcCode: 'BC 3.0',
      bcDescription: 'Ekspor tekstil dan pakaian jadi',
      importLicense: '',
      exportLicense: 'EXP-2024-002',
      certificateOrigin: 'Certificate of Origin Indonesia',
      sellingPrice: 45000000,
      currency: 'IDR',
      exchangeRate: 1,
      paymentTerms: 'Net 15',
      dueDate: '2024-11-25',
      consignor: 'PT. XYZ Logistics',
      consignee: 'Fashion House Sdn Bhd',
      notifyParty: 'Fashion House Sdn Bhd',
      specialInstructions: 'Keep dry - Textile products',
      marksAndNumbers: 'XYZ-KL-002',
      hazardous: false,
      temperature: '',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2024-11-02T14:30:00Z',
      estimatedDeparture: '2024-11-08',
      estimatedArrival: '2024-11-09',
      totals: { totalWeight: 80, totalVolume: 1.5, totalValue: 30000000 },
      consignmentFees: {
        baseFreight: 8000000,
        documentation: 200000,
        handling: 200000,
        insurance: 150000,
        customsClearance: 500000,
        warehousing: 225000,
        delivery: 300000,
        fuelSurcharge: 1200000,
        securityFee: 80000,
        equipmentFee: 0,
        temperatureControlled: 0,
        hazardousCargo: 0,
        expressService: 3200000,
        subtotal: 14450000,
        taxRate: 11,
        taxAmount: 1589500,
        total: 16039500
      }
    },
    {
      id: 'so_003',
      salesOrderNumber: 'BRIDGE-24110003',
      customerId: customers[2]?.id || 'CUST-003',
      customerName: customers[2]?.name || 'CV. Maju Jaya',
      customerEmail: customers[2]?.email || 'sales@majujaya.com',
      serviceType: 'Sea Freight',
      origin: 'Surabaya, Indonesia',
      destination: 'Bangkok, Thailand',
      incoterm: 'CIF',
      awbNumber: '',
      blNumber: 'BL-BKK-2024-003',
      vesselName: 'MV ASEAN Express',
      voyageNumber: 'AE2411-03',
      portLoading: 'Tanjung Perak, Surabaya',
      portDischarge: 'Port of Bangkok',
      cargoItems: [
        {
          id: 'cargo_003_1',
          description: 'Coffee Beans - Arabica Premium',
          hsCode: '0901.11.10',
          quantity: 1000,
          unit: 'KG',
          weight: 1000,
          weightUnit: 'KG',
          dimensions: { length: 80, width: 60, height: 50, unit: 'CM' },
          volume: 12,
          volumeUnit: 'M3',
          packingType: 'Gunny Bag',
          containerType: '40ft High Cube',
          containerNumber: 'MSKU7654321',
          sealNumber: 'SEAL003456',
          value: 120000000,
          currency: 'IDR'
        }
      ],
      bcCode: 'BC 3.0',
      bcDescription: 'Ekspor kopi arabica',
      importLicense: '',
      exportLicense: 'EXP-2024-003',
      certificateOrigin: 'Certificate of Origin Indonesia',
      sellingPrice: 150000000,
      currency: 'IDR',
      exchangeRate: 1,
      paymentTerms: 'Net 45',
      dueDate: '2024-12-15',
      consignor: 'CV. Maju Jaya',
      consignee: 'Coffee Trading Co Ltd',
      notifyParty: 'Coffee Trading Co Ltd',
      specialInstructions: 'Keep in cool, dry place - Coffee products',
      marksAndNumbers: 'MJ-BKK-003',
      hazardous: false,
      temperature: '',
      status: 'Draft',
      priority: 'Normal',
      createdAt: '2024-11-03T09:15:00Z',
      estimatedDeparture: '2024-11-20',
      estimatedArrival: '2024-11-25',
      totals: { totalWeight: 1000, totalVolume: 12, totalValue: 120000000 },
      consignmentFees: {
        baseFreight: 24000000,
        documentation: 200000,
        handling: 1000000,
        insurance: 600000,
        customsClearance: 500000,
        warehousing: 1800000,
        delivery: 300000,
        fuelSurcharge: 3600000,
        securityFee: 1000000,
        equipmentFee: 1000000,
        temperatureControlled: 0,
        hazardousCargo: 0,
        expressService: 0,
        subtotal: 35800000,
        taxRate: 11,
        taxAmount: 3938000,
        total: 39738000
      }
    },
    {
      id: 'so_004',
      salesOrderNumber: 'BRIDGE-24110004',
      customerId: customers[0]?.id || 'CUST-001',
      customerName: customers[0]?.name || 'PT. ABC Trading Indonesia',
      customerEmail: customers[0]?.email || 'contact@abctrading.co.id',
      serviceType: 'Trucking',
      origin: 'Jakarta, Indonesia',
      destination: 'Bandung, Indonesia',
      incoterm: 'EXW',
      awbNumber: '',
      blNumber: '',
      vesselName: '',
      voyageNumber: '',
      portLoading: 'Jakarta',
      portDischarge: 'Bandung',
      cargoItems: [
        {
          id: 'cargo_004_1',
          description: 'Furniture - Office Chairs',
          hsCode: '9401.30.00',
          quantity: 25,
          unit: 'PCS',
          weight: 500,
          weightUnit: 'KG',
          dimensions: { length: 70, width: 65, height: 110, unit: 'CM' },
          volume: 3.2,
          volumeUnit: 'M3',
          packingType: 'Pallet',
          containerType: 'LCL (Less than Container Load)',
          containerNumber: '',
          sealNumber: '',
          value: 25000000,
          currency: 'IDR'
        }
      ],
      bcCode: '',
      bcDescription: '',
      importLicense: '',
      exportLicense: '',
      certificateOrigin: '',
      sellingPrice: 35000000,
      currency: 'IDR',
      exchangeRate: 1,
      paymentTerms: 'COD',
      dueDate: '2024-11-12',
      consignor: 'PT. ABC Trading Indonesia',
      consignee: 'Office Solutions Bandung',
      notifyParty: 'Office Solutions Bandung',
      specialInstructions: 'Fragile - Handle with care',
      marksAndNumbers: 'ABC-BDG-004',
      hazardous: false,
      temperature: '',
      status: 'Completed',
      priority: 'Normal',
      createdAt: '2024-11-04T11:20:00Z',
      estimatedDeparture: '2024-11-08',
      estimatedArrival: '2024-11-09',
      totals: { totalWeight: 500, totalVolume: 3.2, totalValue: 25000000 },
      consignmentFees: {
        baseFreight: 5000000,
        documentation: 200000,
        handling: 500000,
        insurance: 125000,
        customsClearance: 0,
        warehousing: 0,
        delivery: 300000,
        fuelSurcharge: 750000,
        securityFee: 500000,
        equipmentFee: 0,
        temperatureControlled: 0,
        hazardousCargo: 0,
        expressService: 0,
        subtotal: 7375000,
        taxRate: 11,
        taxAmount: 811250,
        total: 8186250
      }
    },
    {
      id: 'so_005',
      salesOrderNumber: 'BRIDGE-24110005',
      customerId: customers[1]?.id || 'CUST-002',
      customerName: customers[1]?.name || 'PT. XYZ Logistics',
      customerEmail: customers[1]?.email || 'info@xyzlogistics.com',
      serviceType: 'Air Freight',
      origin: 'Jakarta, Indonesia',
      destination: 'Tokyo, Japan',
      incoterm: 'CIF',
      awbNumber: 'AWB-JL-2024-005',
      blNumber: '',
      vesselName: '',
      voyageNumber: '',
      portLoading: 'Soekarno-Hatta Airport',
      portDischarge: 'Narita International Airport',
      cargoItems: [
        {
          id: 'cargo_005_1',
          description: 'Beauty Products - Cosmetics',
          hsCode: '3304.99.00',
          quantity: 500,
          unit: 'PCS',
          weight: 120,
          weightUnit: 'KG',
          dimensions: { length: 40, width: 30, height: 25, unit: 'CM' },
          volume: 0.9,
          volumeUnit: 'M3',
          packingType: 'Carton Box',
          containerType: 'LCL (Less than Container Load)',
          containerNumber: '',
          sealNumber: '',
          value: 75000000,
          currency: 'IDR'
        }
      ],
      bcCode: 'BC 3.0',
      bcDescription: 'Ekspor produk kosmetik',
      importLicense: '',
      exportLicense: 'EXP-2024-005',
      certificateOrigin: 'Certificate of Origin Indonesia',
      sellingPrice: 90000000,
      currency: 'IDR',
      exchangeRate: 1,
      paymentTerms: 'Net 30',
      dueDate: '2024-12-10',
      consignor: 'PT. XYZ Logistics',
      consignee: 'Beauty Corp Japan',
      notifyParty: 'Beauty Corp Japan',
      specialInstructions: 'Temperature controlled - Beauty products',
      marksAndNumbers: 'XYZ-TYO-005',
      hazardous: false,
      temperature: '15-25°C',
      status: 'Confirmed',
      priority: 'Urgent',
      createdAt: '2024-11-05T16:45:00Z',
      estimatedDeparture: '2024-11-12',
      estimatedArrival: '2024-11-13',
      totals: { totalWeight: 120, totalVolume: 0.9, totalValue: 75000000 },
      consignmentFees: {
        baseFreight: 18000000,
        documentation: 200000,
        handling: 300000,
        insurance: 375000,
        customsClearance: 500000,
        warehousing: 135000,
        delivery: 300000,
        fuelSurcharge: 2700000,
        securityFee: 120000,
        equipmentFee: 0,
        temperatureControlled: 5400000,
        hazardousCargo: 0,
        expressService: 7200000,
        subtotal: 34275000,
        taxRate: 11,
        taxAmount: 3770250,
        total: 38045250
      }
    }
  ];

  // Filter sales orders
  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = 
      order.salesOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.awbNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.blNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Generate new sales order number
  const generateNewOrderNumber = () => {
    const newNumber = generateSalesOrderNumber();
    setFormData(prev => ({ ...prev, salesOrderNumber: newNumber }));
    return newNumber;
  };

  // Form handlers
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
      consignmentFees: prev.consignmentFees || initializeConsignmentFees()
    }));
  };

  const handleCustomerChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      customerId: newValue?.id || '',
      customerName: newValue?.name || '',
      customerEmail: newValue?.email || ''
    }));
  };

  // Cargo item management
  const addCargoItem = () => {
    const newItem = {
      id: `cargo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: '',
      hsCode: '',
      quantity: 1,
      unit: 'PCS',
      weight: 0,
      weightUnit: 'KG',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'CM'
      },
      volume: 0,
      volumeUnit: 'M3',
      packingType: '',
      containerType: '',
      containerNumber: '',
      sealNumber: '',
      value: 0,
      currency: 'IDR'
    };
    
    setFormData(prev => ({
      ...prev,
      cargoItems: [...prev.cargoItems, newItem]
    }));
  };

  const updateCargoItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cargoItems: prev.cargoItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeCargoItem = (index) => {
    setFormData(prev => ({
      ...prev,
      cargoItems: prev.cargoItems.filter((_, i) => i !== index)
    }));
  };

  // Document management functions
  const addDocument = () => {
    const newDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      type: '',
      status: 'pending',
      uploadDate: null,
      expiryDate: null,
      required: true,
      uploadedBy: '',
      notes: ''
    };
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument]
    }));
  };

  const updateDocument = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) =>
        i === index ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Customs workflow functions
  const updateCustomsStep = (stepId, completed) => {
    setFormData(prev => ({
      ...prev,
      customsWorkflow: {
        ...prev.customsWorkflow,
        steps: prev.customsWorkflow.steps.map(step =>
          step.id === stepId ? { ...step, completed, date: completed ? new Date().toISOString() : null } : step
        )
      }
    }));
  };

  const getCustomsWorkflowProgress = () => {
    const completedSteps = formData.customsWorkflow.steps.filter(step => step.completed).length;
    return (completedSteps / formData.customsWorkflow.steps.length) * 100;
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalWeight = formData.cargoItems.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalVolume = formData.cargoItems.reduce((sum, item) => sum + (item.volume || 0), 0);
    const totalValue = formData.cargoItems.reduce((sum, item) => sum + (item.value || 0), 0);
    
    return { totalWeight, totalVolume, totalValue };
  };

  // Calculate consignment fees
  const calculateConsignmentFees = () => {
    const fees = formData.consignmentFees || {};
    const subtotal = Object.keys(fees)
      .filter(key => key !== 'subtotal' && key !== 'taxRate' && key !== 'taxAmount' && key !== 'total')
      .reduce((sum, key) => sum + (fees[key] || 0), 0);
    
    const taxAmount = subtotal * ((fees.taxRate || 11) / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      total,
      calculated: {
        subtotal,
        taxAmount,
        total
      }
    };
  };

  // Update consignment fee
  const updateConsignmentFee = (feeType, value) => {
    setFormData(prev => ({
      ...prev,
      consignmentFees: {
        ...initializeConsignmentFees(),
        ...prev.consignmentFees,
        [feeType]: value || 0
      }
    }));
  };

  // Auto-calculate recommended fees based on cargo
  const calculateRecommendedFees = () => {
    const totals = calculateTotals();
    const totalWeight = totals.totalWeight;
    const totalVolume = totals.totalVolume;
    const totalValue = totals.totalValue;
    const isHazardous = formData.hazardous;
    const serviceType = formData.serviceType;
    
    let recommendedFees = { ...formData.consignmentFees };

    // Base freight calculation
    let baseFreight = 0;
    if (serviceType === 'Sea Freight') {
      baseFreight = Math.max(totalWeight * 50000, totalVolume * 2000000);
    } else if (serviceType === 'Air Freight') {
      baseFreight = Math.max(totalWeight * 150000, totalVolume * 5000000);
    } else if (serviceType === 'Trucking') {
      baseFreight = Math.max(totalWeight * 80000, totalVolume * 3000000);
    }
    recommendedFees.baseFreight = Math.round(baseFreight);

    // Documentation
    recommendedFees.documentation = 200000;

    // Handling
    recommendedFees.handling = Math.round(totalWeight * 25000);

    // Insurance (0.5% of cargo value)
    recommendedFees.insurance = Math.round(totalValue * 0.005);

    // Customs clearance
    recommendedFees.customsClearance = 500000;

    // Warehousing
    recommendedFees.warehousing = totalVolume * 150000;

    // Delivery
    recommendedFees.delivery = 300000;

    // Fuel surcharge (15% of base freight)
    recommendedFees.fuelSurcharge = recommendedFees.baseFreight * 0.15;

    // Security fee
    recommendedFees.securityFee = totalWeight * 10000;

    // Equipment fee
    if (formData.cargoItems.some(item => item.containerType?.includes('Container'))) {
      recommendedFees.equipmentFee = 1000000;
    }

    // Temperature control
    if (formData.temperature) {
      recommendedFees.temperatureControlled = Math.round(baseFreight * 0.3);
    }

    // Hazardous cargo
    if (isHazardous || formData.cargoItems.some(item =>
      item.description?.toLowerCase().includes('hazardous') ||
      item.description?.toLowerCase().includes('dangerous')
    )) {
      recommendedFees.hazardousCargo = Math.round(baseFreight * 0.5);
    }

    // Express service
    if (formData.priority === 'Urgent') {
      recommendedFees.expressService = Math.round(baseFreight * 0.4);
    }

    setFormData(prev => ({
      ...prev,
      consignmentFees: {
        ...prev.consignmentFees,
        ...recommendedFees
      }
    }));

    return recommendedFees;
  };

  // Reset fees to zero
  const resetConsignmentFees = () => {
    setFormData(prev => ({
      ...prev,
      consignmentFees: initializeConsignmentFees()
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = [];
    
    if (!formData.customerName) errors.push('Customer is required');
    if (!formData.serviceType) errors.push('Service type is required');
    if (!formData.origin) errors.push('Origin is required');
    if (!formData.destination) errors.push('Destination is required');
    if (formData.cargoItems.length === 0) errors.push('At least one cargo item is required');
    
    formData.cargoItems.forEach((item, index) => {
      if (!item.description) errors.push(`Cargo item ${index + 1}: Description is required`);
      if (!item.hsCode) errors.push(`Cargo item ${index + 1}: HS Code is required`);
      if (item.quantity <= 0) errors.push(`Cargo item ${index + 1}: Quantity must be greater than 0`);
    });
    
    return errors;
  };

  // Save sales order
  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      console.warn('Form validation errors:', errors.join(', '));
      return;
    }

    try {
      setLoading(true);
      
      const salesOrderData = {
        ...formData,
        id: selectedOrder?.id || `so_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        salesOrderNumber: formData.salesOrderNumber || generateNewOrderNumber(),
        createdAt: selectedOrder?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totals: calculateTotals(),
        // Ensure module isolation
        module: 'BRIDGE',
        moduleType: 'warehouse_management'
      };

      // Try to save via enhancedDataSyncService
      let savedOrder;
      try {
        // EnhancedDataSyncService doesn't have createSalesOrder, using local storage
        savedOrder = salesOrderData;
      } catch (serviceError) {
        console.warn('EnhancedDataSyncService failed, using local storage:', serviceError);
        savedOrder = salesOrderData;
      }

      // Update local state
      if (selectedOrder) {
        setSalesOrders(prev => prev.map(order =>
          order.id === savedOrder.id ? savedOrder : order
        ));
      } else {
        setSalesOrders(prev => [...prev, savedOrder]);
      }

      // Persist to module-specific localStorage
      const updatedOrders = selectedOrder
        ? salesOrders.map(order => order.id === savedOrder.id ? savedOrder : order)
        : [...salesOrders, savedOrder];
      localStorage.setItem('bridge_sales_orders', JSON.stringify(updatedOrders));

      // Silent operation - no notifications
      
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error saving sales order:', error);
      // Silent error handling - no notifications
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (order = null) => {
    if (order) {
      setSelectedOrder(order);
      setFormData({
        ...order,
        documents: order.documents || [
          {
            id: `doc_${Date.now()}`,
            name: '',
            type: '',
            status: 'pending',
            uploadDate: null,
            expiryDate: null,
            required: true,
            uploadedBy: '',
            notes: ''
          }
        ],
        customsWorkflow: order.customsWorkflow || {
          currentStep: 'preparation',
          steps: [
            { id: 'preparation', name: 'Document Preparation', completed: false, date: null },
            { id: 'submission', name: 'BC Submission', completed: false, date: null },
            { id: 'verification', name: 'Customs Verification', completed: false, date: null },
            { id: 'clearance', name: 'Customs Clearance', completed: false, date: null },
            { id: 'release', name: 'Cargo Release', completed: false, date: null }
          ],
          customsOfficer: '',
          remarks: '',
          estimatedProcessingTime: ''
        },
        consignmentFees: order.consignmentFees || initializeConsignmentFees()
      });
    } else {
      setSelectedOrder(null);
      setFormData({
        salesOrderNumber: generateNewOrderNumber(),
        customerId: '',
        customerName: '',
        customerEmail: '',
        serviceType: '',
        origin: '',
        destination: '',
        incoterm: '',
        consignments: [],
        awbNumber: '',
        blNumber: '',
        vesselName: '',
        voyageNumber: '',
        portLoading: '',
        portDischarge: '',
        cargoItems: [
          {
            id: `cargo_${Date.now()}`,
            description: '',
            hsCode: '',
            quantity: 1,
            unit: 'PCS',
            weight: 0,
            weightUnit: 'KG',
            dimensions: { length: 0, width: 0, height: 0, unit: 'CM' },
            volume: 0,
            volumeUnit: 'M3',
            packingType: '',
            containerType: '',
            containerNumber: '',
            sealNumber: '',
            value: 0,
            currency: 'IDR'
          }
        ],
        bcCode: '',
        bcDescription: '',
        importLicense: '',
        exportLicense: '',
        certificateOrigin: '',
        documents: [
          {
            id: `doc_${Date.now()}`,
            name: '',
            type: '',
            status: 'pending',
            uploadDate: null,
            expiryDate: null,
            required: true,
            uploadedBy: '',
            notes: ''
          }
        ],
        customsWorkflow: {
          currentStep: 'preparation',
          steps: [
            { id: 'preparation', name: 'Document Preparation', completed: false, date: null },
            { id: 'submission', name: 'BC Submission', completed: false, date: null },
            { id: 'verification', name: 'Customs Verification', completed: false, date: null },
            { id: 'clearance', name: 'Customs Clearance', completed: false, date: null },
            { id: 'release', name: 'Cargo Release', completed: false, date: null }
          ],
          customsOfficer: '',
          remarks: '',
          estimatedProcessingTime: ''
        },
        sellingPrice: 0,
        currency: 'IDR',
        exchangeRate: 1,
        paymentTerms: 'Net 30',
        dueDate: '',
        consignmentFees: initializeConsignmentFees(),
        consignor: '',
        consignee: '',
        notifyParty: '',
        specialInstructions: '',
        marksAndNumbers: '',
        hazardous: false,
        temperature: '',
        status: 'Draft',
        priority: 'Normal',
        createdAt: new Date().toISOString(),
        estimatedDeparture: '',
        estimatedArrival: ''
      });
    }
    setDialogOpen(true);
    setActiveStep(0);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
    setActiveStep(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'Confirmed': return 'primary';
      case 'In Progress': return 'warning';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '2rem', color: 'primary.main', mb: 1 }}>
            Sales Order Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
            BridGe Warehouse Management - Enhanced Consignment & Documentation
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            py: 1.5,
            px: 3
          }}
        >
          Create Sales Order
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            minHeight: 120,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: 0.9,
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                fontSize: '2rem',
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}>
                {salesOrders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            minHeight: 120,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: 0.9,
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Active Orders
              </Typography>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                fontSize: '2rem',
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}>
                {salesOrders.filter(o => o.status === 'In Progress').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            minHeight: 120,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: 0.9,
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Confirmed Orders
              </Typography>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                fontSize: '2rem',
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}>
                {salesOrders.filter(o => o.status === 'Confirmed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            minHeight: 120,
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: 0.9,
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total Revenue
              </Typography>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                lineHeight: 1.2,
                wordBreak: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {safeFormatCurrency(salesOrders.reduce((sum, order) => sum + (order.sellingPrice || 0), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Enhanced Sales Order System:</strong> All freight forwarding data including consignment details,
        comprehensive consignment fees, HS codes, AWB/BL numbers, cargo specifications, and customs information
        are now captured for accurate invoice generation and revenue calculation.
      </Alert>

      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search orders..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Sales Orders Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', py: 2 }}>SO Number</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', py: 2 }}>Customer</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', py: 2 }}>Service Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', py: 2 }}>Route</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', py: 2 }}>AWB/BL</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', py: 2 }}>Total Value</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', py: 2 }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                hover
                sx={{
                  '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.04)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                    {order.salesOrderNumber}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.customerName}</Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{order.serviceType}</Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {order.origin} → {order.destination}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {order.awbNumber || order.blNumber || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {safeFormatCurrency(order.sellingPrice || 0)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={order.status}
                    size="small"
                    color={getStatusColor(order.status)}
                    sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ py: 2 }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.1)' }
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(order)}
                    sx={{
                      color: 'secondary.main',
                      '&:hover': { backgroundColor: 'rgba(118, 75, 162, 0.1)' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'success.main',
                      '&:hover': { backgroundColor: 'rgba(67, 233, 123, 0.1)' }
                    }}
                  >
                    <PrintIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="textSecondary" sx={{ fontSize: '1rem', fontStyle: 'italic' }}>
                    No sales orders found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Sales Order Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { minHeight: '80vh' } }}
      >
        <DialogTitle>
          {selectedOrder ? `Edit Sales Order ${selectedOrder.salesOrderNumber}` : 'Create New Sales Order'}
          {formData.salesOrderNumber && (
            <Typography variant="caption" display="block" color="textSecondary">
              SO Number: {formData.salesOrderNumber}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => option.name}
                  value={customers.find(c => c.id === formData.customerId) || null}
                  onChange={handleCustomerChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Customer" fullWidth required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={formData.serviceType}
                    onChange={handleInputChange('serviceType')}
                    label="Service Type"
                    required
                  >
                    {freightServiceTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Origin"
                  value={formData.origin}
                  onChange={handleInputChange('origin')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Destination"
                  value={formData.destination}
                  onChange={handleInputChange('destination')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Incoterm"
                  value={formData.incoterm}
                  onChange={handleInputChange('incoterm')}
                  placeholder="EXW, FOB, CIF, DDP, etc."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    label="Status"
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Consignor"
                  value={formData.consignor}
                  onChange={handleInputChange('consignor')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Consignee"
                  value={formData.consignee}
                  onChange={handleInputChange('consignee')}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 2: Freight Details */}
          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="AWB Number (Air)"
                  value={formData.awbNumber}
                  onChange={handleInputChange('awbNumber')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="BL Number (Sea)"
                  value={formData.blNumber}
                  onChange={handleInputChange('blNumber')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vessel Name"
                  value={formData.vesselName}
                  onChange={handleInputChange('vesselName')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Voyage Number"
                  value={formData.voyageNumber}
                  onChange={handleInputChange('voyageNumber')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Port of Loading"
                  value={formData.portLoading}
                  onChange={handleInputChange('portLoading')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Port of Discharge"
                  value={formData.portDischarge}
                  onChange={handleInputChange('portDischarge')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Departure"
                  type="date"
                  value={formData.estimatedDeparture}
                  onChange={handleInputChange('estimatedDeparture')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Arrival"
                  type="date"
                  value={formData.estimatedArrival}
                  onChange={handleInputChange('estimatedArrival')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 3: Cargo Items */}
          {activeStep === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Cargo Items</Typography>
                <Button startIcon={<AddIcon />} onClick={addCargoItem}>
                  Add Cargo Item
                </Button>
              </Box>

              {formData.cargoItems.map((item, index) => (
                <Card key={item.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={item.description}
                          onChange={(e) => updateCargoItem(index, 'description', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="HS Code"
                          value={item.hsCode}
                          onChange={(e) => updateCargoItem(index, 'hsCode', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCargoItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Unit</InputLabel>
                          <Select
                            value={item.unit}
                            onChange={(e) => updateCargoItem(index, 'unit', e.target.value)}
                            label="Unit"
                          >
                            <MenuItem value="PCS">Pieces</MenuItem>
                            <MenuItem value="KG">Kilograms</MenuItem>
                            <MenuItem value="M3">Cubic Meters</MenuItem>
                            <MenuItem value="SET">Set</MenuItem>
                            <MenuItem value="BOX">Box</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Weight"
                          type="number"
                          value={item.weight}
                          onChange={(e) => updateCargoItem(index, 'weight', parseFloat(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Weight Unit</InputLabel>
                          <Select
                            value={item.weightUnit}
                            onChange={(e) => updateCargoItem(index, 'weightUnit', e.target.value)}
                            label="Weight Unit"
                          >
                            <MenuItem value="KG">KG</MenuItem>
                            <MenuItem value="LB">Pounds</MenuItem>
                            <MenuItem value="TON">Metric Tons</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="L x W x H (cm)"
                          value={`${item.dimensions.length} x ${item.dimensions.width} x ${item.dimensions.height}`}
                          onChange={(e) => {
                            const [length, width, height] = e.target.value.split(' x ').map(v => parseFloat(v) || 0);
                            updateCargoItem(index, 'dimensions', { ...item.dimensions, length, width, height });
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Container Type</InputLabel>
                          <Select
                            value={item.containerType}
                            onChange={(e) => updateCargoItem(index, 'containerType', e.target.value)}
                            label="Container Type"
                          >
                            {containerTypes.map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Container Number"
                          value={item.containerNumber}
                          onChange={(e) => updateCargoItem(index, 'containerNumber', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Packing Type"
                          value={item.packingType}
                          onChange={(e) => updateCargoItem(index, 'packingType', e.target.value)}
                          placeholder="Wooden case, Carton, Pallet, etc."
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Goods Value"
                          type="number"
                          value={item.value}
                          onChange={(e) => updateCargoItem(index, 'value', parseFloat(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <IconButton 
                          color="error" 
                          onClick={() => removeCargoItem(index)}
                          disabled={formData.cargoItems.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              {/* Cargo Summary */}
              <Card sx={{ mt: 2, bgcolor: 'grey.50', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" gutterBottom sx={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 2
                  }}>
                    Cargo Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary" sx={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Total Weight
                      </Typography>
                      <Typography variant="h6" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'primary.main',
                        wordBreak: 'break-word'
                      }}>
                        {calculateTotals().totalWeight} {formData.cargoItems[0]?.weightUnit || 'KG'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary" sx={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Total Value
                      </Typography>
                      <Typography variant="h6" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'success.main',
                        wordBreak: 'break-word'
                      }}>
                        {safeFormatCurrency(calculateTotals().totalValue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary" sx={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Total Items
                      </Typography>
                      <Typography variant="h6" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'warning.main'
                      }}>
                        {formData.cargoItems.length}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Step 4: Consignment Fees */}
          {activeStep === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Consignment Fee Structure</Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={calculateRecommendedFees}
                    disabled={formData.cargoItems.length === 0}
                  >
                    Auto Calculate
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={resetConsignmentFees}
                    color="warning"
                  >
                    Reset All
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Base Fees */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Base Fees
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Base Freight"
                        type="number"
                        value={formData.consignmentFees.baseFreight}
                        onChange={(e) => updateConsignmentFee('baseFreight', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Documentation"
                        type="number"
                        value={formData.consignmentFees.documentation}
                        onChange={(e) => updateConsignmentFee('documentation', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Cargo Handling"
                        type="number"
                        value={formData.consignmentFees.handling}
                        onChange={(e) => updateConsignmentFee('handling', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Additional Services */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Additional Services
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Cargo Insurance"
                        type="number"
                        value={formData.consignmentFees.insurance}
                        onChange={(e) => updateConsignmentFee('insurance', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Customs Clearance"
                        type="number"
                        value={formData.consignmentFees.customsClearance}
                        onChange={(e) => updateConsignmentFee('customsClearance', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Warehousing"
                        type="number"
                        value={formData.consignmentFees.warehousing}
                        onChange={(e) => updateConsignmentFee('warehousing', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Delivery Service"
                        type="number"
                        value={formData.consignmentFees.delivery}
                        onChange={(e) => updateConsignmentFee('delivery', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Operational Fees */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Operational Fees
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Fuel Surcharge"
                        type="number"
                        value={formData.consignmentFees.fuelSurcharge}
                        onChange={(e) => updateConsignmentFee('fuelSurcharge', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Security Fee"
                        type="number"
                        value={formData.consignmentFees.securityFee}
                        onChange={(e) => updateConsignmentFee('securityFee', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Equipment Fee"
                        type="number"
                        value={formData.consignmentFees.equipmentFee}
                        onChange={(e) => updateConsignmentFee('equipmentFee', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Special Services */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Special Services
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Temperature Control"
                        type="number"
                        value={formData.consignmentFees.temperatureControlled}
                        onChange={(e) => updateConsignmentFee('temperatureControlled', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Hazardous Cargo"
                        type="number"
                        value={formData.consignmentFees.hazardousCargo}
                        onChange={(e) => updateConsignmentFee('hazardousCargo', parseFloat(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Express Service"
                        type="number"
                        value={formData.consignmentFees.expressService}
                        onChange={(e) => updateConsignmentFee('expressService', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <Typography>Rp</Typography>
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Fee Summary */}
              <Card sx={{
                mt: 3,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" gutterBottom sx={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    mb: 2
                  }}>
                    Fee Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{
                        opacity: 0.8,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Subtotal
                      </Typography>
                      <Typography variant="h5" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        wordBreak: 'break-word'
                      }}>
                        {safeFormatCurrency(calculateConsignmentFees().calculated.subtotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{
                        opacity: 0.8,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Tax (11%)
                      </Typography>
                      <Typography variant="h5" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        wordBreak: 'break-word'
                      }}>
                        {safeFormatCurrency(calculateConsignmentFees().calculated.taxAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box textAlign="right">
                        <Typography variant="body2" sx={{
                          opacity: 0.8,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          mb: 0.5
                        }}>
                          Total Consignment Fee
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{
                          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                          wordBreak: 'break-word'
                        }}>
                          {safeFormatCurrency(calculateConsignmentFees().calculated.total)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Step 4: Documentation Management */}
          {activeStep === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Document Management</Typography>
                <Button startIcon={<AddIcon />} onClick={addDocument}>
                  Add Document
                </Button>
              </Box>

              {formData.documents.map((doc, index) => (
                <Card key={doc.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Document Name"
                          value={doc.name}
                          onChange={(e) => updateDocument(index, 'name', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Document Type</InputLabel>
                          <Select
                            value={doc.type}
                            onChange={(e) => updateDocument(index, 'type', e.target.value)}
                            label="Document Type"
                          >
                            {documentTypes.map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={doc.status}
                            onChange={(e) => updateDocument(index, 'status', e.target.value)}
                            label="Status"
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="uploaded">Uploaded</MenuItem>
                            <MenuItem value="verified">Verified</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                            <MenuItem value="expired">Expired</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Upload Date"
                          type="date"
                          value={doc.uploadDate ? doc.uploadDate.split('T')[0] : ''}
                          onChange={(e) => updateDocument(index, 'uploadDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          type="date"
                          value={doc.expiryDate ? doc.expiryDate.split('T')[0] : ''}
                          onChange={(e) => updateDocument(index, 'expiryDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Uploaded By"
                          value={doc.uploadedBy}
                          onChange={(e) => updateDocument(index, 'uploadedBy', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Notes"
                          multiline
                          rows={2}
                          value={doc.notes}
                          onChange={(e) => updateDocument(index, 'notes', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Checkbox
                            checked={doc.required}
                            onChange={(e) => updateDocument(index, 'required', e.target.checked)}
                          />
                          <Typography variant="body2">Required Document</Typography>
                          <IconButton
                            color="error"
                            onClick={() => removeDocument(index)}
                            disabled={formData.documents.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              {/* Document Summary */}
              <Card sx={{
                mt: 2,
                bgcolor: 'info.main',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" gutterBottom sx={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    mb: 2
                  }}>
                    Document Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{
                        opacity: 0.8,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Total Documents
                      </Typography>
                      <Typography variant="h5" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                      }}>
                        {formData.documents.length}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{
                        opacity: 0.8,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Required
                      </Typography>
                      <Typography variant="h5" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                      }}>
                        {formData.documents.filter(doc => doc.required).length}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{
                        opacity: 0.8,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Uploaded
                      </Typography>
                      <Typography variant="h5" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                      }}>
                        {formData.documents.filter(doc => doc.status === 'uploaded' || doc.status === 'verified').length}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{
                        opacity: 0.8,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        Pending
                      </Typography>
                      <Typography variant="h5" sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                      }}>
                        {formData.documents.filter(doc => doc.status === 'pending').length}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Step 6: Customs Workflow */}
          {activeStep === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customs Workflow Management
              </Typography>

              {/* Customs Progress */}
              <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Workflow Progress: {Math.round(getCustomsWorkflowProgress())}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getCustomsWorkflowProgress()}
                    sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Current Step: {formData.customsWorkflow.steps.find(step => !step.completed)?.name || 'Completed'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Customs Steps */}
              <List>
                {formData.customsWorkflow.steps.map((step, index) => (
                  <ListItem key={step.id}>
                    <ListItemIcon>
                      <Checkbox
                        checked={step.completed}
                        onChange={(e) => updateCustomsStep(step.id, e.target.checked)}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {step.name}
                          </Typography>
                          <Chip
                            label={step.completed ? 'Completed' : 'Pending'}
                            color={step.completed ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        step.date && (
                          <Typography variant="caption" color="textSecondary">
                            Completed on: {new Date(step.date).toLocaleDateString()}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {/* Customs Details */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Current Step</InputLabel>
                    <Select
                      value={formData.customsWorkflow.currentStep}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customsWorkflow: { ...prev.customsWorkflow, currentStep: e.target.value }
                      }))}
                      label="Current Step"
                    >
                      {formData.customsWorkflow.steps.map(step => (
                        <MenuItem key={step.id} value={step.id}>{step.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customs Officer"
                    value={formData.customsWorkflow.customsOfficer}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customsWorkflow: { ...prev.customsWorkflow, customsOfficer: e.target.value }
                    }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Estimated Processing Time"
                    value={formData.customsWorkflow.estimatedProcessingTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customsWorkflow: { ...prev.customsWorkflow, estimatedProcessingTime: e.target.value }
                    }))}
                    placeholder="e.g., 2-3 business days"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Customs Remarks"
                    multiline
                    rows={3}
                    value={formData.customsWorkflow.remarks}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customsWorkflow: { ...prev.customsWorkflow, remarks: e.target.value }
                    }))}
                  />
                </Grid>
              </Grid>

              {/* BC Code and Customs Information */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Customs Declaration Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>BC Code</InputLabel>
                        <Select
                          value={formData.bcCode}
                          onChange={handleInputChange('bcCode')}
                          label="BC Code"
                        >
                          <MenuItem value=""><em>No BC Code</em></MenuItem>
                          {bcCodes.map(code => (
                            <MenuItem key={code.code} value={code.code}>
                              {code.code} - {code.description}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="BC Description"
                        value={formData.bcDescription}
                        onChange={handleInputChange('bcDescription')}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Import License"
                        value={formData.importLicense}
                        onChange={handleInputChange('importLicense')}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Export License"
                        value={formData.exportLicense}
                        onChange={handleInputChange('exportLicense')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Certificate of Origin"
                        value={formData.certificateOrigin}
                        onChange={handleInputChange('certificateOrigin')}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Step 7: Financial & Terms */}
          {activeStep === 6 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Selling Price"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={handleInputChange('sellingPrice')}
                  InputProps={{
                    startAdornment: <Typography>Rp</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={formData.currency}
                    onChange={handleInputChange('currency')}
                    label="Currency"
                  >
                    <MenuItem value="IDR">IDR (Indonesian Rupiah)</MenuItem>
                    <MenuItem value="USD">USD (US Dollar)</MenuItem>
                    <MenuItem value="SGD">SGD (Singapore Dollar)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Exchange Rate"
                  type="number"
                  step="0.01"
                  value={formData.exchangeRate}
                  onChange={handleInputChange('exchangeRate')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Terms</InputLabel>
                  <Select
                    value={formData.paymentTerms}
                    onChange={handleInputChange('paymentTerms')}
                    label="Payment Terms"
                  >
                    {incoterms.map(term => (
                      <MenuItem key={term} value={term}>{term}</MenuItem>
                    ))}
                    <MenuItem value="COD">Cash on Delivery</MenuItem>
                    <MenuItem value="Net 7">Net 7 Days</MenuItem>
                    <MenuItem value="Net 15">Net 15 Days</MenuItem>
                    <MenuItem value="Net 30">Net 30 Days</MenuItem>
                    <MenuItem value="Net 45">Net 45 Days</MenuItem>
                    <MenuItem value="Net 60">Net 60 Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange('dueDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={handleInputChange('priority')}
                    label="Priority"
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Marks and Numbers"
                  multiline
                  rows={2}
                  value={formData.marksAndNumbers}
                  onChange={handleInputChange('marksAndNumbers')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Instructions"
                  multiline
                  rows={3}
                  value={formData.specialInstructions}
                  onChange={handleInputChange('specialInstructions')}
                />
              </Grid>
              
              {/* Final Financial Summary */}
              <Grid item xs={12}>
                <Card sx={{
                  mt: 2,
                  bgcolor: 'success.main',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" gutterBottom sx={{
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      mb: 2
                    }}>
                      Final Financial Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" sx={{
                          opacity: 0.8,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          mb: 0.5
                        }}>
                          Selling Price
                        </Typography>
                        <Typography variant="h5" sx={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          wordBreak: 'break-word'
                        }}>
                          {safeFormatCurrency(formData.sellingPrice || 0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" sx={{
                          opacity: 0.8,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          mb: 0.5
                        }}>
                          Consignment Fees
                        </Typography>
                        <Typography variant="h5" sx={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          wordBreak: 'break-word'
                        }}>
                          {safeFormatCurrency(calculateConsignmentFees().calculated.total)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="right">
                          <Typography variant="body2" sx={{
                            opacity: 0.8,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            mb: 0.5
                          }}>
                            Total Revenue
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" sx={{
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                            wordBreak: 'break-word'
                          }}>
                            {safeFormatCurrency((formData.sellingPrice || 0) + calculateConsignmentFees().calculated.total)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep(prev => prev - 1)}>
              Previous
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              onClick={() => setActiveStep(prev => prev + 1)}
              variant="contained"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Sales Order'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesOrderManagement;