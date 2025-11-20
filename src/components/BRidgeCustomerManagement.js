import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  ConfirmDialog
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  LocalShipping as ShippingIcon,
  AccountBalance as TaxIcon,
  Payment as PaymentIcon,
  Timeline as RouteIcon,
  Security as ComplianceIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import dataSyncService from '../services/dataSync';
import notificationService from '../services/notificationService';
import BridgeHeader from './BridgeHeader';
import BridgeStatCard from './BridgeStatCard';

const BRidgeCustomerManagement = ({ onNotification }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Information
    companyName: '',
    legalName: '',
    contactPerson: '',
    secondaryContact: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    mobile: '',
    fax: '',
    website: '',
    preferredCustomer: false,
    
    // Address & Location
    businessAddress: '',
    shippingAddress: '',
    warehouseAddress: '',
    city: '',
    state: '',
    country: 'Indonesia',
    postalCode: '',
    timeZone: 'Asia/Jakarta',
    
    // Business Details
    industry: '',
    businessType: '',
    taxId: '',
    businessRegistration: '',
    yearEstablished: '',
    employeeCount: '',
    annualRevenue: '',
    
    // Credit & Financial
    paymentTerms: '30',
    paymentMethod: '',
    currencyPreference: 'IDR',
    creditRating: 'A',
    outstandingBalance: 0,
    paymentHistory: 'Good',
    
    // Freight Forwarding Specific
    preferredServices: [],
    regularRoutes: [],
    commodityTypes: [],
    volumeInfo: '',
    customsBrokerPreference: '',
    insuranceRequirements: '',
    temperatureRequirements: '',
    
    // Documentation
    requiredDocuments: [],
    customsDocumentation: '',
    complianceRequirements: '',
    importExportLicenses: '',
    
    // Status
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = dataSyncService.getCustomerData();
      if (data && data.length > 0) {
        console.info('✓ BRIDGE Customer: Loaded %d customers from localStorage', data.length);
        setCustomers(data);
      } else {
        // Generate 5 comprehensive sample customers
        const currentYear = new Date().getFullYear();
        const sampleCustomers = [
          {
            id: 'CUST-001',
            customerId: `BRIC${currentYear}000001`,
            companyName: 'ABC Trading Indonesia',
            legalName: 'PT. ABC Trading Indonesia',
            contactPerson: 'John Doe',
            secondaryContact: 'Jane Smith',
            email: 'john@abctrading.com',
            secondaryEmail: 'jane@abctrading.com',
            phone: '+62-21-555-0123',
            mobile: '+62-812-3456-7890',
            fax: '+62-21-555-0124',
            website: 'www.abctrading.com',
            
            businessAddress: 'Jl. Sudirman No. 123, Lt. 15',
            shippingAddress: 'Jl. Sudirman No. 123, Lt. 15',
            warehouseAddress: 'Jl. Industrial Estate No. 45, Bekasi',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '10220',
            timeZone: 'Asia/Jakarta',
            
            industry: 'Import/Export',
            businessType: 'Trading Company',
            taxId: '01.234.567.8-123.000',
            businessRegistration: '0123456789',
            yearEstablished: '2010',
            employeeCount: '50-100',
            annualRevenue: '$1M-$5M',
            
            paymentTerms: '30',
            paymentMethod: 'Bank Transfer',
            currencyPreference: 'IDR',
            creditRating: 'A',
            outstandingBalance: 150000000,
            paymentHistory: 'Excellent',
            
            preferredServices: ['Ocean Freight', 'Air Freight', 'Customs Clearance'],
            regularRoutes: ['Shanghai-Jakarta', 'Singapore-Jakarta', 'Busan-Jakarta'],
            commodityTypes: ['Textiles', 'Electronics', 'Consumer Goods'],
            volumeInfo: '50-100 TEU/month',
            customsBrokerPreference: 'In-house',
            insuranceRequirements: 'All Risk Coverage',
            temperatureRequirements: 'Standard',
            
            requiredDocuments: ['Commercial Invoice', 'Packing List', 'B/L', 'AWB'],
            customsDocumentation: 'Electronic',
            complianceRequirements: 'ISO 9001',
            importExportLicenses: 'Valid until 2025',
            
            status: 'Active',
            preferredCustomer: true,
            notes: 'Preferred customer, handles textile imports. High-volume client with good payment history.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'CUST-002',
            customerId: `BRIC${currentYear}000002`,
            companyName: 'Global Import Co',
            legalName: 'PT. Global Import Sejahtera',
            contactPerson: 'Maria Santos',
            secondaryContact: 'Robert Wilson',
            email: 'maria@globalimport.com',
            secondaryEmail: 'robert@globalimport.com',
            phone: '+62-21-555-0125',
            mobile: '+62-813-9876-5432',
            fax: '+62-21-555-0126',
            website: 'www.globalimport.com',
            
            businessAddress: 'Jl. Thamrin No. 456, Lt. 20',
            shippingAddress: 'Jl. Thamrin No. 456, Lt. 20',
            warehouseAddress: 'Jl. Logistics Park No. 78, Tangerang',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '10310',
            timeZone: 'Asia/Jakarta',
            
            industry: 'Consumer Goods',
            businessType: 'Retail Chain',
            taxId: '01.234.567.8-124.000',
            businessRegistration: '0123456790',
            yearEstablished: '2015',
            employeeCount: '200+',
            annualRevenue: '$10M+',
            
            paymentTerms: '45',
            paymentMethod: 'LC',
            currencyPreference: 'USD',
            creditRating: 'A+',
            outstandingBalance: 300000000,
            paymentHistory: 'Excellent',
            
            preferredServices: ['Ocean Freight', 'Trucking', 'Warehousing'],
            regularRoutes: ['Los Angeles-Jakarta', 'Hamburg-Jakarta', 'Rotterdam-Jakarta'],
            commodityTypes: ['Consumer Electronics', 'Home Appliances', 'Toys'],
            volumeInfo: '100-200 TEU/month',
            customsBrokerPreference: 'Third Party',
            insuranceRequirements: 'Extended Coverage',
            temperatureRequirements: 'Standard',
            
            requiredDocuments: ['Commercial Invoice', 'Packing List', 'B/L', 'COO', 'CIQ'],
            customsDocumentation: 'Electronic + Physical',
            complianceRequirements: 'ISO 14001, OHSAS 18001',
            importExportLicenses: 'Multiple licenses',
            
            status: 'Active',
            preferredCustomer: true,
            notes: 'Large volume importer, specializes in consumer goods. Premium client with strict SLAs.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'CUST-003',
            customerId: `BRIC${currentYear}000003`,
            companyName: 'Mediterranean Foods',
            legalName: 'CV. Mediterranean Foods Indonesia',
            contactPerson: 'Ahmed Hassan',
            secondaryContact: 'Fatima Al-Zahra',
            email: 'ahmed@mediafoods.com',
            secondaryEmail: 'fatima@mediafoods.com',
            phone: '+62-21-555-0127',
            mobile: '+62-814-5555-1234',
            fax: '+62-21-555-0128',
            website: 'www.mediterraneanfoods.co.id',
            
            businessAddress: 'Jl. Kemang No. 789, Lt. 5',
            shippingAddress: 'Jl. Kemang No. 789, Lt. 5',
            warehouseAddress: 'Jl. Cold Storage No. 12, South Jakarta',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '12560',
            timeZone: 'Asia/Jakarta',
            
            industry: 'Food & Beverage',
            businessType: 'Food Distributor',
            taxId: '01.234.567.8-125.000',
            businessRegistration: '0123456791',
            yearEstablished: '2018',
            employeeCount: '20-50',
            annualRevenue: '$500K-$1M',
            
            paymentTerms: '30',
            paymentMethod: 'Bank Transfer',
            currencyPreference: 'IDR',
            creditRating: 'B+',
            outstandingBalance: 75000000,
            paymentHistory: 'Good',
            
            preferredServices: ['Air Freight', 'Cold Storage', 'Customs Clearance'],
            regularRoutes: ['Istanbul-Jakarta', 'Athens-Jakarta', 'Cairo-Jakarta'],
            commodityTypes: ['Dried Fruits', 'Spices', 'Olive Oil', 'Cheese'],
            volumeInfo: '10-20 TEU/month',
            customsBrokerPreference: 'In-house',
            insuranceRequirements: 'Food Grade Coverage',
            temperatureRequirements: '2-8°C',
            
            requiredDocuments: ['Commercial Invoice', 'Packing List', 'AWB', 'Health Certificate', 'Halal Certificate'],
            customsDocumentation: 'Electronic',
            complianceRequirements: 'HACCP, Halal Certification',
            importExportLicenses: 'Food Import License',
            
            status: 'Active',
            preferredCustomer: false,
            notes: 'Specializes in food imports, requires cold chain management. Temperature-sensitive cargo.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'CUST-004',
            customerId: `BRIC${currentYear}000004`,
            companyName: 'Tech Solutions Asia',
            legalName: 'PT. Teknologi Solusi Asia',
            contactPerson: 'David Chen',
            secondaryContact: 'Lisa Wong',
            email: 'david@techsolutions.com',
            secondaryEmail: 'lisa@techsolutions.com',
            phone: '+62-21-555-0130',
            mobile: '+62-815-7777-8888',
            fax: '+62-21-555-0131',
            website: 'www.techsolutions.com',
            
            businessAddress: 'Jl. SCBD Lot 11, Lt. 25',
            shippingAddress: 'Jl. SCBD Lot 11, Lt. 25',
            warehouseAddress: 'Jl. Tech Park No. 33, Cibinong',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '12190',
            timeZone: 'Asia/Jakarta',
            
            industry: 'Technology',
            businessType: 'Technology Solutions',
            taxId: '01.234.567.8-126.000',
            businessRegistration: '0123456792',
            yearEstablished: '2019',
            employeeCount: '100-200',
            annualRevenue: '$2M-$5M',
            
            paymentTerms: '30',
            paymentMethod: 'Wire Transfer',
            currencyPreference: 'USD',
            creditRating: 'A',
            outstandingBalance: 120000000,
            paymentHistory: 'Excellent',
            
            preferredServices: ['Air Freight', 'Express Delivery', 'Warehousing'],
            regularRoutes: ['Shenzhen-Jakarta', 'Hong Kong-Jakarta', 'Taipei-Jakarta'],
            commodityTypes: ['Electronic Components', 'Computer Parts', 'Software Hardware'],
            volumeInfo: '20-30 TEU/month',
            customsBrokerPreference: 'In-house',
            insuranceRequirements: 'Technology Equipment Coverage',
            temperatureRequirements: 'Controlled (15-25°C)',
            
            requiredDocuments: ['Commercial Invoice', 'Packing List', 'AWB', 'Certificate of Origin'],
            customsDocumentation: 'Electronic',
            complianceRequirements: 'CE Marking, FCC Compliance',
            importExportLicenses: 'Electronics Import License',
            
            status: 'Active',
            preferredCustomer: false,
            notes: 'Technology company specializing in hardware imports. Time-sensitive deliveries required.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'CUST-005',
            customerId: `BRIC${currentYear}000005`,
            companyName: 'Fashion Forward Indonesia',
            legalName: 'PT. Mode Maju Nusantara',
            contactPerson: 'Sari Dewi',
            secondaryContact: 'Rudi Pratama',
            email: 'sari@fashionforward.com',
            secondaryEmail: 'rudi@fashionforward.com',
            phone: '+62-21-555-0140',
            mobile: '+62-816-8888-9999',
            fax: '+62-21-555-0141',
            website: 'www.fashionforward.com',
            
            businessAddress: 'Jl. Setiabudhi No. 88, Lt. 8',
            shippingAddress: 'Jl. Setiabudhi No. 88, Lt. 8',
            warehouseAddress: 'Jl. Garment District No. 15, Bandung',
            city: 'Bandung',
            state: 'Jawa Barat',
            country: 'Indonesia',
            postalCode: '40142',
            timeZone: 'Asia/Jakarta',
            
            industry: 'Fashion & Apparel',
            businessType: 'Fashion Retailer',
            taxId: '01.234.567.8-127.000',
            businessRegistration: '0123456793',
            yearEstablished: '2016',
            employeeCount: '30-50',
            annualRevenue: '$500K-$2M',
            
            paymentTerms: '30',
            paymentMethod: 'Bank Transfer',
            currencyPreference: 'IDR',
            creditRating: 'B+',
            outstandingBalance: 50000000,
            paymentHistory: 'Good',
            
            preferredServices: ['Ocean Freight', 'Packaging', 'Warehousing'],
            regularRoutes: ['Mumbai-Jakarta', 'Dhaka-Jakarta', 'Bangkok-Jakarta'],
            commodityTypes: ['Garments', 'Fabrics', 'Accessories', 'Footwear'],
            volumeInfo: '30-50 TEU/month',
            customsBrokerPreference: 'Third Party',
            insuranceRequirements: 'Apparel Coverage',
            temperatureRequirements: 'Standard',
            
            requiredDocuments: ['Commercial Invoice', 'Packing List', 'B/L', 'Fabric Test Reports'],
            customsDocumentation: 'Electronic',
            complianceRequirements: 'OEKO-TEX Standard', 
            importExportLicenses: 'Apparel Import License',
            
            status: 'Active',
            preferredCustomer: false,
            notes: 'Fashion retailer importing garments and fabrics. Seasonal fluctuations in volume.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setCustomers(sampleCustomers);
        dataSyncService.setCustomerData(sampleCustomers);
        console.info('✓ BRIDGE Customer: Seeded %d sample customers', sampleCustomers.length);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      onNotification?.('Error loading customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateCustomerId = () => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const sequenceNumber = (customers.length + 1).toString().padStart(6, '0');
    return `BRIC${currentYear}${sequenceNumber}`;
  };

  const handleSave = async () => {
    try {
      const isEditing = !!selectedCustomer;
      const customerData = {
        ...formData,
        id: isEditing ? selectedCustomer.id : `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        customerId: isEditing ? selectedCustomer.customerId : generateCustomerId(),
        createdAt: isEditing ? selectedCustomer.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        const updatedCustomers = customers.map(c => c.id === selectedCustomer.id ? customerData : c);
        setCustomers(updatedCustomers);
        dataSyncService.setCustomerData(updatedCustomers);
        onNotification?.('Customer updated successfully', 'success');
      } else {
        const newCustomers = [...customers, customerData];
        setCustomers(newCustomers);
        dataSyncService.setCustomerData(newCustomers);
        onNotification?.('Customer created successfully', 'success');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving customer:', error);
      onNotification?.('Error saving customer', 'error');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      companyName: customer.companyName || '',
      legalName: customer.legalName || '',
      contactPerson: customer.contactPerson || '',
      secondaryContact: customer.secondaryContact || '',
      email: customer.email || '',
      secondaryEmail: customer.secondaryEmail || '',
      phone: customer.phone || '',
      mobile: customer.mobile || '',
      fax: customer.fax || '',
      website: customer.website || '',
      
      businessAddress: customer.businessAddress || '',
      shippingAddress: customer.shippingAddress || '',
      warehouseAddress: customer.warehouseAddress || '',
      city: customer.city || '',
      state: customer.state || '',
      country: customer.country || 'Indonesia',
      postalCode: customer.postalCode || '',
      timeZone: customer.timeZone || 'Asia/Jakarta',
      
      industry: customer.industry || '',
      businessType: customer.businessType || '',
      taxId: customer.taxId || '',
      businessRegistration: customer.businessRegistration || '',
      yearEstablished: customer.yearEstablished || '',
      employeeCount: customer.employeeCount || '',
      annualRevenue: customer.annualRevenue || '',
      
      paymentTerms: customer.paymentTerms || '30',
      paymentMethod: customer.paymentMethod || '',
      currencyPreference: customer.currencyPreference || 'IDR',
      preferredCustomer: customer.preferredCustomer || false,
      creditRating: customer.creditRating || 'A',
      outstandingBalance: customer.outstandingBalance || 0,
      paymentHistory: customer.paymentHistory || 'Good',
      
      preferredServices: customer.preferredServices || [],
      regularRoutes: customer.regularRoutes || [],
      commodityTypes: customer.commodityTypes || [],
      volumeInfo: customer.volumeInfo || '',
      customsBrokerPreference: customer.customsBrokerPreference || '',
      insuranceRequirements: customer.insuranceRequirements || '',
      temperatureRequirements: customer.temperatureRequirements || '',
      
      requiredDocuments: customer.requiredDocuments || [],
      customsDocumentation: customer.customsDocumentation || '',
      complianceRequirements: customer.complianceRequirements || '',
      importExportLicenses: customer.importExportLicenses || '',
      
      status: customer.status || 'Active',
      notes: customer.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      const updatedCustomers = customers.filter(c => c.id !== customerToDelete.id);
      setCustomers(updatedCustomers);
      dataSyncService.setCustomerData(updatedCustomers);
      onNotification?.('Customer deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      onNotification?.('Error deleting customer', 'error');
    } finally {
      setConfirmDeleteOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCustomer(null);
    setFormData({
      companyName: '',
      legalName: '',
      contactPerson: '',
      secondaryContact: '',
      email: '',
      secondaryEmail: '',
      phone: '',
      mobile: '',
      fax: '',
      website: '',
      
      businessAddress: '',
      shippingAddress: '',
      warehouseAddress: '',
      city: '',
      state: '',
      country: 'Indonesia',
      postalCode: '',
      timeZone: 'Asia/Jakarta',
      
      industry: '',
      businessType: '',
      taxId: '',
      businessRegistration: '',
      yearEstablished: '',
      employeeCount: '',
      annualRevenue: '',
      
      paymentTerms: '30',
      paymentMethod: '',
      currencyPreference: 'IDR',
      preferredCustomer: false,
      creditRating: 'A',
      outstandingBalance: 0,
      paymentHistory: 'Good',
      
      preferredServices: [],
      regularRoutes: [],
      commodityTypes: [],
      volumeInfo: '',
      customsBrokerPreference: '',
      insuranceRequirements: '',
      temperatureRequirements: '',
      
      requiredDocuments: [],
      customsDocumentation: '',
      complianceRequirements: '',
      importExportLicenses: '',
      
      status: 'Active',
      notes: ''
    });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || customer.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'warning';
      case 'pending': return 'info';
      case 'vip': return 'primary';
      default: return 'default';
    }
  };

  const getCreditRatingColor = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'a+': return 'success';
      case 'a': return 'success';
      case 'b+': return 'warning';
      case 'b': return 'warning';
      case 'c': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getUniqueIndustries = () => {
    const industries = [...new Set(customers.map(c => c.industry).filter(Boolean))];
    return industries;
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PT. BAKHTERA 6 MGN', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Customer Management Report', 105, 35, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 20, 50);
      
      let yPos = 70;
      
      // Summary Statistics
      doc.setFontSize(14);
      doc.text('Summary Statistics', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Customers: ${customers.length}`, 20, yPos);
      yPos += 6;
      doc.text(`Active Customers: ${customers.filter(c => c.status === 'Active').length}`, 20, yPos);
      yPos += 6;
      doc.text(`Outstanding Balance: ${formatCurrency(customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0))}`, 20, yPos);
      yPos += 15;
      
      // Customer Table
      doc.setFontSize(14);
      doc.text('Customer List', 20, yPos);
      yPos += 10;
      
      const tableData = filteredCustomers.map(customer => [
        customer.customerId,
        customer.companyName,
        customer.contactPerson,
        customer.email,
        customer.industry,
        customer.status,
        formatCurrency(customer.outstandingBalance || 0)
      ]);
      
      doc.autoTable({
        head: [['ID', 'Company', 'Contact', 'Email', 'Industry', 'Status', 'Balance']],
        body: tableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [25, 118, 210] }
      });
      
      doc.save(`Customer_Management_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      notificationService.showSuccess('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      notificationService.showError('Failed to export PDF');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary data
      const summaryData = [
        ['PT. BAKHTERA 6 MGN'],
        ['Customer Management Report'],
        [`Generated: ${new Date().toLocaleDateString('id-ID')}`],
        [''],
        ['Summary Statistics'],
        ['Total Customers', customers.length],
        ['Active Customers', customers.filter(c => c.status === 'Active').length],
        ['Outstanding Balance', formatCurrency(customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0))],
        [''],
        ['Customer List']
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Detailed data
      const customerData = filteredCustomers.map(customer => ({
        'Customer ID': customer.customerId,
        'Company Name': customer.companyName,
        'Legal Name': customer.legalName,
        'Contact Person': customer.contactPerson,
        'Email': customer.email,
        'Phone': customer.phone,
        'City': customer.city,
        'Country': customer.country,
        'Industry': customer.industry,
        'Business Type': customer.businessType,
        'Tax ID': customer.taxId,
        'Payment Terms': customer.paymentTerms,
        'Currency': customer.currencyPreference,
        'Credit Rating': customer.creditRating,
        'Outstanding Balance': customer.outstandingBalance,
        'Preferred Services': customer.preferredServices?.join(', '),
        'Status': customer.status,
        'Notes': customer.notes
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(customerData);
      
      // Auto-size columns
      const colWidths = Object.keys(customerData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      worksheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
      
      XLSX.writeFile(workbook, `Customer_Management_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      notificationService.showSuccess('Excel exported successfully!');
    } catch (error) {
      console.error('Excel export error:', error);
      notificationService.showError('Failed to export Excel');
    }
  };

  return (
    <Box>
      <BridgeHeader
        title="Customer Management"
        subtitle="Comprehensive customer database for freight forwarding operations"
        actions={(
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<PdfIcon />} onClick={exportToPDF}>
              Export PDF
            </Button>
            <Button variant="outlined" startIcon={<ExcelIcon />} onClick={exportToExcel}>
              Export Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add Customer
            </Button>
          </Box>
        )}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Customer Management:</strong> Comprehensive customer database for freight forwarding operations including 
        credit management, service preferences, and compliance tracking.
      </Alert>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Industry</InputLabel>
            <Select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              label="Filter by Industry"
            >
              <MenuItem value="all">All Industries</MenuItem>
              {getUniqueIndustries().map(industry => (
                <MenuItem key={industry} value={industry}>{industry}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <BridgeStatCard title="Total Customers" value={customers.length} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
        </Grid>
        <Grid item xs={12} md={4}>
          <BridgeStatCard title="Active Customers" value={customers.filter(c => c.status === 'Active').length} gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" />
        </Grid>
        <Grid item xs={12} md={4}>
          <BridgeStatCard title="Industries" value={getUniqueIndustries().length} gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
        </Grid>
      </Grid>

      {/* Customer Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Customer Info</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Contact & Location</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Business & Services</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            {customers.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No customers found. Click "Add Customer" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : filteredCustomers.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No customers match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">{customer.companyName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {customer.customerId}
                      </Typography>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {customer.contactPerson}
                      </Typography>
                      <Box display="flex" gap={0.5} mt={0.5}>
                        {customer.preferredCustomer && (
                          <Chip
                            label="Preferred"
                            color="primary"
                            size="small"
                            sx={{ height: 18 }}
                          />
                        )}
                        <Chip
                          label={customer.status}
                          color={getStatusColor(customer.status)}
                          size="small"
                          sx={{ height: 18 }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={0.25}>
                      <Typography variant="caption">
                        <EmailIcon sx={{ mr: 0.5 }} />
                        {customer.email}
                      </Typography>
                      <Typography variant="caption">
                        <PhoneIcon sx={{ mr: 0.5 }} />
                        {customer.phone} / {customer.mobile}
                      </Typography>
                      <Typography variant="caption">
                        <LocationIcon sx={{ mr: 0.5 }} />
                        {customer.city}, {customer.country}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{customer.industry}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {customer.businessType}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.25} mt={0.5}>
                        {customer.preferredServices?.slice(0, 3).map((service, index) => (
                          <Chip key={index} label={service} size="small" sx={{ height: 20 }} />
                        ))}
                        {customer.preferredServices?.length > 3 && (
                          <Typography variant="caption" color="textSecondary">
                            +{customer.preferredServices.length - 3}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => handleEdit(customer)} sx={{ p: 0.5 }}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={customer.preferredCustomer ? "Remove Preferred" : "Mark as Preferred"}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const updatedCustomers = customers.map(c =>
                              c.id === customer.id ? { ...c, preferredCustomer: !c.preferredCustomer } : c
                            );
                            setCustomers(updatedCustomers);
                            dataSyncService.setCustomerData(updatedCustomers);
                            onNotification?.(
                              customer.preferredCustomer ? "Removed from preferred customers" : "Marked as preferred customer",
                              'success'
                            );
                          }}
                          color={customer.preferredCustomer ? "warning" : "default"}
                          sx={{ p: 0.5 }}
                        >
                          {customer.preferredCustomer ? <CheckIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(customer)} color="error" sx={{ p: 0.5 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  📋 Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Legal Name"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Contact Person"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Contact"
                  value={formData.secondaryContact}
                  onChange={(e) => setFormData({ ...formData, secondaryContact: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Email"
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Fax"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </Grid>
              
              {/* Address & Location Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  📍 Address & Location
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Address"
                  multiline
                  rows={2}
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </Grid>
              
              {/* Business Details Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  🏢 Business Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Type"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax ID (NPWP)"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Registration"
                  value={formData.businessRegistration}
                  onChange={(e) => setFormData({ ...formData, businessRegistration: e.target.value })}
                />
              </Grid>
              
              {/* Financial Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  💰 Financial
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Outstanding Balance"
                  type="number"
                  value={formData.outstandingBalance}
                  onChange={(e) => setFormData({ ...formData, outstandingBalance: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <Typography>Rp</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payment Terms (Days)"
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Credit Rating</InputLabel>
                  <Select
                    value={formData.creditRating}
                    onChange={(e) => setFormData({ ...formData, creditRating: e.target.value })}
                    label="Credit Rating"
                  >
                    <MenuItem value="A+">A+ (Excellent)</MenuItem>
                    <MenuItem value="A">A (Good)</MenuItem>
                    <MenuItem value="B+">B+ (Fair)</MenuItem>
                    <MenuItem value="B">B (Poor)</MenuItem>
                    <MenuItem value="C">C (Very Poor)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Suspended">Suspended</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="VIP">VIP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.preferredCustomer}
                      onChange={(e) => setFormData({ ...formData, preferredCustomer: e.target.checked })}
                    />
                  }
                  label="Preferred Customer"
                />
              </Grid>
              
              {/* Freight Forwarding Specific Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  🚛 Freight Forwarding Specific
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Volume Information"
                  value={formData.volumeInfo}
                  onChange={(e) => setFormData({ ...formData, volumeInfo: e.target.value })}
                  helperText="e.g., 50-100 TEU/month"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customs Broker Preference"
                  value={formData.customsBrokerPreference}
                  onChange={(e) => setFormData({ ...formData, customsBrokerPreference: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Regular Routes"
                  multiline
                  rows={2}
                  value={formData.regularRoutes?.join(', ')}
                  onChange={(e) => setFormData({ ...formData, regularRoutes: e.target.value.split(', ') })}
                  helperText="Comma-separated routes (e.g., Shanghai-Jakarta, Singapore-Jakarta)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Insurance Requirements"
                  value={formData.insuranceRequirements}
                  onChange={(e) => setFormData({ ...formData, insuranceRequirements: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Temperature Requirements"
                  value={formData.temperatureRequirements}
                  onChange={(e) => setFormData({ ...formData, temperatureRequirements: e.target.value })}
                  helperText="e.g., 2-8°C, Ambient, Frozen"
                />
              </Grid>
              
              {/* Notes Section */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete customer "{customerToDelete?.companyName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BRidgeCustomerManagement;