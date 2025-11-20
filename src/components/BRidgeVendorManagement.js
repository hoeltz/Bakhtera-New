import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  LocalAirport as AirIcon,
  DirectionsBoat as OceanIcon,
  LocalShipping as TruckingIcon,
  Storage as WarehouseIcon,
  Gavel as CustomsIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  TrendingUp as PerformanceIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import dataSyncService from '../services/dataSync';
import BridgeHeader from './BridgeHeader';
import BridgeStatCard from './BridgeStatCard';

const BRidgeVendorManagement = ({ onNotification }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    legalName: '',
    contactPerson: '',
    accountManager: '',
    operationsContact: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    mobile: '',
    fax: '',
    website: '',
    businessAddress: '',
    serviceAreas: [],
    facilityLocations: [],
    headOfficeAddress: '',
    city: '',
    state: '',
    country: 'Indonesia',
    postalCode: '',
    businessLicense: '',
    taxId: '',
    insuranceInfo: '',
    certifications: [],
    yearsInBusiness: '',
    companySize: '',
    serviceType: '',
    routeCoverage: [],
    equipmentTypes: [],
    specialServices: [],
    maxCapacity: '',
    transitTimes: '',
    onTimePerformance: 0,
    damageRate: 0,
    customerSatisfaction: 0,
    rateCompetitiveness: 0,
    responseTime: 0,
    claimsRate: 0,
    paymentTerms: '',
    bankingInfo: '',
    performanceBonuses: '',
    contractStartDate: '',
    contractEndDate: '',
    rateAgreements: '',
    slaRequirements: '',
    terminationNotice: '',
    performanceGuarantees: '',
    insuranceCertificates: '',
    safetyCertifications: '',
    qualityCertifications: '',
    references: '',
    status: 'Active',
    preferredVendor: false,
    notes: ''
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      console.log('[BRidgeVendorManagement] Starting loadVendors...');
      let data = [];
      
      try {
        const storedData = localStorage.getItem('bridgeVendorData');
        console.log('[BRidgeVendorManagement] localStorage.getItem result:', storedData ? `${storedData.length} chars` : 'null');
        if (storedData) {
          data = JSON.parse(storedData);
          console.log('[BRidgeVendorManagement] Setting vendors from localStorage:', data.length);
        }
      } catch (e) {
        console.warn('Error parsing stored vendors:', e);
      }

      if (data && data.length > 0) {
        setVendors(data);
      } else {
        console.log('[BRidgeVendorManagement] No localStorage data, creating sample vendors...');
        const currentYear = new Date().getFullYear();
        const sampleVendors = [
          {
            id: 'VEND-001',
            vendorId: `BRIV${currentYear}000001`,
            companyName: 'Maju Shipping Line',
            legalName: 'PT. Maju Shipping Indonesia',
            contactPerson: 'Budi Santoso',
            accountManager: 'Sariwijaya',
            operationsContact: 'Andi Pratama',
            email: 'budi@majushipping.com',
            secondaryEmail: 'operations@majushipping.com',
            phone: '+62-21-555-2001',
            mobile: '+62-812-1234-5678',
            fax: '+62-21-555-2002',
            website: 'www.majushipping.com',
            businessAddress: 'Jl. Maritim No. 45, Lt. 10',
            serviceAreas: ['Jakarta', 'Surabaya', 'Medan', 'Makassar'],
            facilityLocations: ['Tanjung Priok Port', 'Tanjung Perak Port'],
            headOfficeAddress: 'Jl. Maritim No. 45, Jakarta',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '14410',
            businessLicense: 'LIC-2015-001',
            taxId: '02.345.678.9-201.000',
            insuranceInfo: 'Comprehensive Marine Insurance - $10M',
            certifications: ['ISO 9001:2015', 'ISM Code', 'ISPS Code'],
            yearsInBusiness: '15',
            companySize: '200+',
            serviceType: 'Shipping Line',
            routeCoverage: ['Shanghai-Jakarta', 'Singapore-Jakarta', 'Busan-Jakarta', 'Hong Kong-Jakarta'],
            equipmentTypes: ['20ft Container', '40ft Container', '40ft HC Container'],
            specialServices: ['Dangerous Goods', 'Temperature Controlled', 'Oversized Cargo'],
            maxCapacity: '1000 TEU/month',
            transitTimes: '7-14 days',
            onTimePerformance: 95.2,
            damageRate: 0.5,
            customerSatisfaction: 4.6,
            rateCompetitiveness: 88,
            responseTime: 2,
            claimsRate: 0.3,
            paymentTerms: 'Net 30',
            bankingInfo: 'BCA - 1234567890',
            performanceBonuses: 'Volume discount after 500 TEU/month',
            contractStartDate: '2023-01-01',
            contractEndDate: '2025-12-31',
            rateAgreements: 'Competitive rates, negotiable for high volume',
            slaRequirements: '95% on-time delivery, Max 1% damage rate',
            terminationNotice: '60 days written notice',
            performanceGuarantees: 'GPS tracking, real-time updates',
            insuranceCertificates: 'Marine Liability Insurance',
            safetyCertifications: 'Port Safety Compliance',
            qualityCertifications: 'ISO 9001:2015 Quality Management',
            references: 'Major importers and exporters',
            status: 'Active',
            preferredVendor: true,
            notes: 'Primary shipping partner. Excellent reliability and on-time performance.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'VEND-002',
            vendorId: `BRIV${currentYear}000002`,
            companyName: 'Garuda Air Cargo',
            legalName: 'PT. Garuda Inti Jasa Ekspor',
            contactPerson: 'Dewi Lestari',
            accountManager: 'Ahmad Wijaya',
            operationsContact: 'Ratna Kusuma',
            email: 'dewi@garudaaircargo.com',
            secondaryEmail: 'ops@garudaaircargo.com',
            phone: '+62-21-555-3001',
            mobile: '+62-813-9876-5432',
            fax: '+62-21-555-3002',
            website: 'www.garudaaircargo.com',
            businessAddress: 'Soekarno-Hatta Airport, Cargo Terminal',
            serviceAreas: ['Jakarta', 'Surabaya', 'Denpasar', 'Medan'],
            facilityLocations: ['Soekarno-Hatta Air Cargo', 'Surabaya Air Cargo', 'Denpasar Air Cargo'],
            headOfficeAddress: 'Terminal 3 Soekarno-Hatta, Jakarta',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '19100',
            businessLicense: 'LIC-2018-002',
            taxId: '02.345.678.9-202.000',
            insuranceInfo: 'Air Cargo Insurance - $5M',
            certifications: ['IATA Certified', 'ISO 9001:2015', 'IATA DGR'],
            yearsInBusiness: '12',
            companySize: '100-150',
            serviceType: 'Air Cargo',
            routeCoverage: ['Jakarta-Singapore', 'Jakarta-Bangkok', 'Jakarta-Hong Kong', 'Jakarta-Shanghai'],
            equipmentTypes: ['Boeing 747F', 'Airbus A330F', 'Regional Aircraft'],
            specialServices: ['Pharmaceutical', 'Electronics', 'Perishables', 'Express'],
            maxCapacity: '300 tons/month',
            transitTimes: '2-5 days',
            onTimePerformance: 96.8,
            damageRate: 0.2,
            customerSatisfaction: 4.8,
            rateCompetitiveness: 85,
            responseTime: 1,
            claimsRate: 0.1,
            paymentTerms: 'Net 15',
            bankingInfo: 'Mandiri - 9876543210',
            performanceBonuses: 'Early payment discount 2%',
            contractStartDate: '2022-06-15',
            contractEndDate: '2025-06-14',
            rateAgreements: 'Premium rates, volume rebate available',
            slaRequirements: '98% on-time, 24-hour tracking',
            terminationNotice: '30 days written notice',
            performanceGuarantees: 'Real-time tracking, SMS updates',
            insuranceCertificates: 'Full Air Cargo Coverage',
            safetyCertifications: 'IATA Safety Standards',
            qualityCertifications: 'ISO 9001:2015, IATA DGR',
            references: 'Tech companies, pharmaceutical firms',
            status: 'Active',
            preferredVendor: true,
            notes: 'Preferred for time-sensitive air freight. Fast and reliable.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'VEND-003',
            vendorId: `BRIV${currentYear}000003`,
            companyName: 'Transporter Logistics',
            legalName: 'PT. Transporter Logistik Nusantara',
            contactPerson: 'Hendra Gunawan',
            accountManager: 'Tina Rahayu',
            operationsContact: 'Bambang Sutanto',
            email: 'hendra@transporterlogistics.com',
            secondaryEmail: 'dispatch@transporterlogistics.com',
            phone: '+62-21-555-4001',
            mobile: '+62-814-5555-6666',
            fax: '+62-21-555-4002',
            website: 'www.transporterlogistics.com',
            businessAddress: 'Jl. Gatot Subroto No. 123, Lt. 6',
            serviceAreas: ['Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya'],
            facilityLocations: ['Jakarta Hub', 'Bandung Terminal', 'Surabaya Terminal'],
            headOfficeAddress: 'Jl. Gatot Subroto No. 123, Jakarta',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '12930',
            businessLicense: 'LIC-2016-003',
            taxId: '02.345.678.9-203.000',
            insuranceInfo: 'Ground Transport Insurance - $3M',
            certifications: ['ISO 9001:2015', 'Road Safety Certificate'],
            yearsInBusiness: '10',
            companySize: '50-100',
            serviceType: 'Trucking',
            routeCoverage: ['Jakarta-Bandung', 'Jakarta-Yogyakarta', 'Jakarta-Surabaya', 'Inter-island'],
            equipmentTypes: ['Trailer 20ft', 'Trailer 40ft', 'Pickup Truck', 'Tanker'],
            specialServices: ['Cold Storage', 'Hazmat Transport', 'Heavy Equipment'],
            maxCapacity: '500 tons/month',
            transitTimes: '2-7 days',
            onTimePerformance: 92.5,
            damageRate: 0.8,
            customerSatisfaction: 4.2,
            rateCompetitiveness: 90,
            responseTime: 3,
            claimsRate: 0.4,
            paymentTerms: 'Net 30',
            bankingInfo: 'BRI - 1111111111',
            performanceBonuses: 'Quarterly performance bonus',
            contractStartDate: '2023-03-01',
            contractEndDate: '2026-02-28',
            rateAgreements: 'Fixed rate per route',
            slaRequirements: 'Delivery within agreed window',
            terminationNotice: '45 days notice',
            performanceGuarantees: 'GPS tracking, daily updates',
            insuranceCertificates: 'Comprehensive Ground Transport',
            safetyCertifications: 'Road Safety Compliance',
            qualityCertifications: 'ISO 9001:2015',
            references: 'Manufacturing and trading companies',
            status: 'Active',
            preferredVendor: false,
            notes: 'Reliable local trucking services. Good for domestic distribution.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'VEND-004',
            vendorId: `BRIV${currentYear}000004`,
            companyName: 'Berlian Customs Broker',
            legalName: 'PT. Berlian Inti Muda',
            contactPerson: 'Susi Hartati',
            accountManager: 'Dimas Prasetyo',
            operationsContact: 'Nina Wulandari',
            email: 'susi@berliancustoms.com',
            secondaryEmail: 'customs@berliancustoms.com',
            phone: '+62-21-555-5001',
            mobile: '+62-817-7777-7777',
            fax: '+62-21-555-5002',
            website: 'www.berliancustoms.com',
            businessAddress: 'Jl. Cipta Karya No. 15, Lt. 8',
            serviceAreas: ['Jakarta', 'Surabaya', 'Banjarmasin', 'Balikpapan'],
            facilityLocations: ['Bea Cukai Tanjung Priok', 'Bea Cukai Soekarno-Hatta', 'Bea Cukai Tanjung Perak'],
            headOfficeAddress: 'Jl. Cipta Karya No. 15, Jakarta',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '14240',
            businessLicense: 'LIC-2012-004',
            taxId: '02.345.678.9-204.000',
            insuranceInfo: 'Professional Liability - $1M',
            certifications: ['Licensed Customs Broker', 'ISO 27001', 'Trade Compliance'],
            yearsInBusiness: '20',
            companySize: '30-50',
            serviceType: 'Customs Broker',
            routeCoverage: ['All Indonesian Ports', 'All Indonesian Airports'],
            equipmentTypes: ['Documentation Services', 'Electronic Processing'],
            specialServices: ['HS Code Classification', 'Duty Optimization', 'Regulatory Compliance'],
            maxCapacity: '1000 declarations/month',
            transitTimes: '1-5 days',
            onTimePerformance: 96.5,
            damageRate: 0.0,
            customerSatisfaction: 4.7,
            rateCompetitiveness: 90,
            responseTime: 3,
            claimsRate: 0.0,
            paymentTerms: 'Net 30',
            bankingInfo: 'CIMB Niaga - 7788990011',
            performanceBonuses: 'Early submission discount',
            contractStartDate: '2023-03-01',
            contractEndDate: '2026-02-28',
            rateAgreements: 'Fixed rate per declaration',
            slaRequirements: '100% accuracy, 24-hour response',
            terminationNotice: '60 days notice',
            performanceGuarantees: 'Zero penalty for compliance',
            insuranceCertificates: 'Professional Indemnity',
            safetyCertifications: 'Data Security Compliance',
            qualityCertifications: 'ISO 27001',
            references: 'Major trading companies',
            status: 'Active',
            preferredVendor: true,
            notes: 'Experienced customs broker with excellent regulatory knowledge.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'VEND-005',
            vendorId: `BRIV${currentYear}000005`,
            companyName: 'Indoware Solutions',
            legalName: 'PT. Indoware International',
            contactPerson: 'Robert Hermawan',
            accountManager: 'Maya Indrawati',
            operationsContact: 'Dedi Kurniawan',
            email: 'robert@indoware.com',
            secondaryEmail: 'operations@indoware.com',
            phone: '+62-21-555-6001',
            mobile: '+62-818-8888-8888',
            fax: '+62-21-555-6002',
            website: 'www.indoware.com',
            businessAddress: 'Jl. Selesa Jaya No. 12, Lt. 5',
            serviceAreas: ['Jakarta', 'Bekasi', 'Tangerang', 'Karawang'],
            facilityLocations: ['Bekasi Cold Storage', 'Tangerang Warehouse', 'Karawang Hub'],
            headOfficeAddress: 'Jl. Selesa Jaya No. 12, Jakarta',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '13920',
            businessLicense: 'LIC-2019-005',
            taxId: '02.345.678.9-205.000',
            insuranceInfo: 'Warehouse and Goods Insurance - $8M',
            certifications: ['ISO 9001:2015', 'Cold Storage Certification', 'Food Safety'],
            yearsInBusiness: '8',
            companySize: '75-100',
            serviceType: 'Warehouse',
            routeCoverage: ['Jakarta Metro', 'West Java', 'Central Java'],
            equipmentTypes: ['Cold Storage -25°C', 'General Storage', 'Climate Controlled'],
            specialServices: ['Food Storage', 'Electronics Handling', 'Consolidation'],
            maxCapacity: '2000 tons storage',
            transitTimes: 'On-demand',
            onTimePerformance: 94.3,
            damageRate: 0.3,
            customerSatisfaction: 4.4,
            rateCompetitiveness: 88,
            responseTime: 4,
            claimsRate: 0.2,
            paymentTerms: 'Net 45',
            bankingInfo: 'Bank Rakyat - 2222222222',
            performanceBonuses: 'Long-term contract discount',
            contractStartDate: '2023-09-01',
            contractEndDate: '2026-08-31',
            rateAgreements: 'Variable based on volume',
            slaRequirements: '99% accuracy, 48-hour response',
            terminationNotice: '90 days notice',
            performanceGuarantees: 'Inventory reconciliation weekly',
            insuranceCertificates: 'Full Goods Coverage',
            safetyCertifications: 'Warehouse Safety Standards',
            qualityCertifications: 'ISO 9001:2015, HACCP',
            references: 'Food importers, electronics traders',
            status: 'Active',
            preferredVendor: false,
            notes: 'Reliable warehouse partner. Good for cold chain and consolidation.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        try {
          localStorage.setItem('bridgeVendorData', JSON.stringify(sampleVendors));
          console.log('[BRidgeVendorManagement] Saved', sampleVendors.length, 'vendors to localStorage');
        } catch (e) {
          console.warn('Error saving vendors to localStorage:', e);
        }
        
        console.log('[BRidgeVendorManagement] Setting vendors state with', sampleVendors.length, 'samples');
        setVendors(sampleVendors);
        dataSyncService.setVendorData(sampleVendors);
        console.info('✓ BRIDGE Vendor: Seeded %d sample vendors', sampleVendors.length);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      onNotification?.('Error loading vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.vendorId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || vendor.serviceType === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (vendors.length > 0) {
    console.log('[BRidgeVendorManagement] Render - vendors:', vendors.length, 'filtered:', filteredVendors.length);
  }

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData(vendor);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVendor(null);
    setFormData({
      companyName: '', legalName: '', contactPerson: '', accountManager: '', operationsContact: '',
      email: '', secondaryEmail: '', phone: '', mobile: '', fax: '', website: '',
      businessAddress: '', serviceAreas: [], facilityLocations: [], headOfficeAddress: '',
      city: '', state: '', country: 'Indonesia', postalCode: '',
      businessLicense: '', taxId: '', insuranceInfo: '', certifications: [], yearsInBusiness: '', companySize: '',
      serviceType: '', routeCoverage: [], equipmentTypes: [], specialServices: [], maxCapacity: '', transitTimes: '',
      onTimePerformance: 0, damageRate: 0, customerSatisfaction: 0, rateCompetitiveness: 0, responseTime: 0, claimsRate: 0,
      paymentTerms: '', bankingInfo: '', performanceBonuses: '',
      contractStartDate: '', contractEndDate: '', rateAgreements: '', slaRequirements: '', terminationNotice: '', performanceGuarantees: '',
      insuranceCertificates: '', safetyCertifications: '', qualityCertifications: '', references: '',
      status: 'Active', preferredVendor: false, notes: ''
    });
  };

  const handleSave = async () => {
    try {
      const isEditing = !!selectedVendor;
      const vendorData = {
        ...formData,
        id: isEditing ? selectedVendor.id : `VEND-${String(vendors.length + 1).padStart(3, '0')}`,
        vendorId: isEditing ? selectedVendor.vendorId : `BRIV${new Date().getFullYear()}${String(vendors.length + 1).padStart(6, '0')}`,
        createdAt: isEditing ? selectedVendor.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        const updatedVendors = vendors.map(v => v.id === selectedVendor.id ? vendorData : v);
        setVendors(updatedVendors);
        dataSyncService.setVendorData(updatedVendors);
        onNotification?.('Vendor updated successfully', 'success');
      } else {
        const newVendors = [...vendors, vendorData];
        setVendors(newVendors);
        dataSyncService.setVendorData(newVendors);
        onNotification?.('Vendor created successfully', 'success');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving vendor:', error);
      onNotification?.('Error saving vendor', 'error');
    }
  };

  const handleDelete = (vendor) => {
    setVendorToDelete(vendor);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    const updatedVendors = vendors.filter(v => v.id !== vendorToDelete.id);
    setVendors(updatedVendors);
    dataSyncService.setVendorData(updatedVendors);
    setConfirmDeleteOpen(false);
    setVendorToDelete(null);
    onNotification?.('Vendor deleted successfully', 'success');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'warning';
      case 'under review': return 'info';
      case 'contract pending': return 'primary';
      default: return 'default';
    }
  };

  const getServiceTypeIcon = (serviceType) => {
    switch (serviceType?.toLowerCase()) {
      case 'shipping line': return <OceanIcon color="primary" />;
      case 'air cargo': return <AirIcon color="primary" />;
      case 'trucking': return <TruckingIcon color="primary" />;
      case 'warehouse': return <WarehouseIcon color="primary" />;
      case 'customs broker': return <CustomsIcon color="primary" />;
      default: return <CheckIcon color="primary" />;
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PT. BAKHTERA 6 MGN', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Vendor Management Report', 105, 35, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 20, 50);
      
      let yPos = 70;
      doc.setFontSize(14);
      doc.text('Summary Statistics', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Vendors: ${vendors.length}`, 20, yPos);
      yPos += 6;
      doc.text(`Active Vendors: ${vendors.filter(v => v.status === 'Active').length}`, 20, yPos);
      yPos += 6;
      doc.text(`Preferred Vendors: ${vendors.filter(v => v.preferredVendor).length}`, 20, yPos);
      
      const tableData = filteredVendors.map(vendor => [
        vendor.vendorId,
        vendor.companyName,
        vendor.contactPerson,
        vendor.serviceType,
        vendor.status
      ]);
      
      doc.autoTable({
        head: [['ID', 'Company', 'Contact', 'Service', 'Status']],
        body: tableData,
        startY: yPos + 20
      });
      
      doc.save('vendor-report.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(filteredVendors.map(v => ({
        ID: v.vendorId,
        Company: v.companyName,
        Contact: v.contactPerson,
        Email: v.email,
        Phone: v.phone,
        Service: v.serviceType,
        Status: v.status,
        Performance: `${v.onTimePerformance || 0}%`,
        Rating: `${v.customerSatisfaction || 0}/5.0`
      })));
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
      XLSX.writeFile(wb, 'vendors.xlsx');
    } catch (error) {
      console.error('Excel export error:', error);
    }
  };

  return (
    <Box>
      <BridgeHeader
        title="Vendor Management"
        subtitle="Comprehensive vendor database for freight forwarding operations"
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
              Add Vendor
            </Button>
          </Box>
        )}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Vendor Management:</strong> Comprehensive vendor database for freight forwarding operations.
      </Alert>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search vendors..."
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
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
              <MenuItem value="Contract Pending">Contract Pending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Service Type</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Filter by Service Type"
            >
              <MenuItem value="all">All Services</MenuItem>
              <MenuItem value="Shipping Line">Shipping Line</MenuItem>
              <MenuItem value="Air Cargo">Air Cargo</MenuItem>
              <MenuItem value="Trucking">Trucking</MenuItem>
              <MenuItem value="Warehouse">Warehouse</MenuItem>
              <MenuItem value="Customs Broker">Customs Broker</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <BridgeStatCard title="Total Vendors" value={vendors.length} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
        </Grid>
        <Grid item xs={12} md={4}>
          <BridgeStatCard title="Active Vendors" value={vendors.filter(v => v.status === 'Active').length} gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
        </Grid>
        <Grid item xs={12} md={4}>
          <BridgeStatCard title="Preferred Vendors" value={vendors.filter(v => v.preferredVendor).length} gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" />
        </Grid>
      </Grid>

      {/* Vendor Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Vendor Info</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Contact & Location</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Service & Performance</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            {vendors.length === 0 && !loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No vendors found. Click "Add Vendor" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : filteredVendors.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No vendors match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{vendor.companyName}</Typography>
                        <Typography variant="caption" color="textSecondary">{vendor.vendorId}</Typography>
                        <Typography variant="caption" display="block" color="textSecondary">{vendor.contactPerson}</Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                          {vendor.preferredVendor && <Chip label="Preferred" color="primary" size="small" sx={{ height: 18 }} />}
                          <Chip label={vendor.status} color={getStatusColor(vendor.status)} size="small" sx={{ height: 18 }} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.25}>
                        <Typography variant="caption"><EmailIcon sx={{ mr: 0.5 }} />{vendor.email}</Typography>
                        <Typography variant="caption"><PhoneIcon sx={{ mr: 0.5 }} />{vendor.phone}</Typography>
                        <Typography variant="caption"><LocationIcon sx={{ mr: 0.5 }} />{vendor.city}, {vendor.country}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                          {getServiceTypeIcon(vendor.serviceType)}
                          <Typography variant="body2">{vendor.serviceType}</Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">{vendor.companySize} | {vendor.yearsInBusiness} years</Typography>
                        <Box display="flex" flexDirection="column" gap={0.25} mt={0.5}>
                          <Typography variant="caption">{vendor.onTimePerformance || 0}% On-time</Typography>
                          <Typography variant="caption" color="textSecondary">{vendor.customerSatisfaction || 0}/5.0 Rating</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={0.5} justifyContent="flex-end">
                        <Tooltip title="View"><IconButton size="small" onClick={() => handleEdit(vendor)} sx={{ p: 0.5 }}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title={vendor.preferredVendor ? "Remove Preferred" : "Mark as Preferred"}>
                          <IconButton size="small" onClick={() => {
                            const updatedVendors = vendors.map(v => v.id === vendor.id ? { ...v, preferredVendor: !v.preferredVendor } : v);
                            setVendors(updatedVendors);
                            dataSyncService.setVendorData(updatedVendors);
                          }} color={vendor.preferredVendor ? "warning" : "default"} sx={{ p: 0.5 }}>
                            {vendor.preferredVendor ? <CheckIcon fontSize="small" /> : <PerformanceIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(vendor)} color="error" sx={{ p: 0.5 }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Company Name" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Contact Person" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Service Type</InputLabel>
                  <Select value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} label="Service Type">
                    <MenuItem value="Shipping Line">Shipping Line</MenuItem>
                    <MenuItem value="Air Cargo">Air Cargo</MenuItem>
                    <MenuItem value="Trucking">Trucking</MenuItem>
                    <MenuItem value="Warehouse">Warehouse</MenuItem>
                    <MenuItem value="Customs Broker">Customs Broker</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} label="Status">
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" multiline rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{selectedVendor ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete vendor "{vendorToDelete?.companyName}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BRidgeVendorManagement;
