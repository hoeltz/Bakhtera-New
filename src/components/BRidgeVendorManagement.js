import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Rating,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

import BridgeHeader from './BridgeHeader';
import BridgeStatCard from './BridgeStatCard';
import notificationService from '../services/notificationService';
import { formatCurrency } from '../services/currencyUtils';

// Vendor Management Component
const BRidgeVendorManagement = ({ onNotification }) => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Context menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVendorForMenu, setSelectedVendorForMenu] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Supplier',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: 'Net 30',
    rating: 0,
    totalOrders: 0,
    totalSpend: 0,
    status: 'Active',
    contactPerson: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    bankAccount: '',
    bankName: '',
    notes: '',
  });

  // Sample vendor data
  const sampleVendors = [
    {
      id: 'VND-2025-001',
      name: 'PT Mitra Logistik Indonesia',
      type: 'Logistics Provider',
      email: 'contact@mitralogistik.id',
      phone: '(+62-21) 1234-5678',
      address: 'Jl. Gatot Subroto No. 123, Jakarta Selatan, DKI Jakarta 12345',
      taxId: '12.345.678.9-012.345',
      paymentTerms: 'Net 30',
      rating: 4.5,
      totalOrders: 156,
      totalSpend: 2500000000,
      status: 'Active',
      contactPerson: 'Budi Santoso',
      contactPersonPhone: '08123456789',
      contactPersonEmail: 'budi.santoso@mitralogistik.id',
      bankAccount: '1234567890',
      bankName: 'BCA',
      notes: 'Reliable logistics partner with nationwide coverage',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2025-11-20T14:25:00Z'
    },
    {
      id: 'VND-2025-002',
      name: 'PT Packaging Bintang Jaya',
      type: 'Material Supplier',
      email: 'sales@packagingbintang.com',
      phone: '(+62-274) 5678-9012',
      address: 'Jl. Diponegoro No. 456, Yogyakarta 55123',
      taxId: '98.765.432.1-654.321',
      paymentTerms: 'Net 45',
      rating: 4.2,
      totalOrders: 89,
      totalSpend: 1200000000,
      status: 'Active',
      contactPerson: 'Siti Nurhaliza',
      contactPersonPhone: '08298765432',
      contactPersonEmail: 'siti.nurhaliza@packagingbintang.com',
      bankAccount: '0987654321',
      bankName: 'Mandiri',
      notes: 'High-quality packaging materials, consistent delivery',
      createdAt: '2024-02-20T09:15:00Z',
      updatedAt: '2025-11-18T11:40:00Z'
    },
    {
      id: 'VND-2025-003',
      name: 'CV Teknologi Printing Solutions',
      type: 'Service Provider',
      email: 'info@teknologiprinting.co.id',
      phone: '(+62-31) 7654-3210',
      address: 'Jl. Ahmad Yani No. 789, Surabaya 60123',
      taxId: '45.678.901.2-345.678',
      paymentTerms: 'Net 15',
      rating: 4.8,
      totalOrders: 203,
      totalSpend: 3200000000,
      status: 'Active',
      contactPerson: 'Ahmad Wijaya',
      contactPersonPhone: '08154321098',
      contactPersonEmail: 'ahmad.wijaya@teknologiprinting.co.id',
      bankAccount: '1122334455',
      bankName: 'BNI',
      notes: 'Top-tier printing services, quick turnaround time',
      createdAt: '2024-03-10T14:45:00Z',
      updatedAt: '2025-11-21T09:30:00Z'
    },
    {
      id: 'VND-2025-004',
      name: 'PT Elektronik Maju Bersama',
      type: 'Equipment Supplier',
      email: 'procurement@elektronikmaiu.id',
      phone: '(+62-22) 2345-6789',
      address: 'Jl. Raya Bandung-Jakarta Km.25, Bandung 40265',
      taxId: '23.456.789.0-123.456',
      paymentTerms: 'Net 60',
      rating: 4.0,
      totalOrders: 67,
      totalSpend: 4500000000,
      status: 'Inactive',
      contactPerson: 'Rina Budiarti',
      contactPersonPhone: '08227654321',
      contactPersonEmail: 'rina.budiarti@elektronikmaiu.id',
      bankAccount: '5544332211',
      bankName: 'CIMB Niaga',
      notes: 'Temporary suspension - pending contract review',
      createdAt: '2024-04-05T11:20:00Z',
      updatedAt: '2025-09-15T10:15:00Z'
    },
    {
      id: 'VND-2025-005',
      name: 'PT Konsultan Bisnis Terpercaya',
      type: 'Consulting Services',
      email: 'business@konsultanbisnis.id',
      phone: '(+62-21) 8901-2345',
      address: 'Menara BCA, Jl. MH Thamrin No. 1, Jakarta Pusat 10310',
      taxId: '56.789.012.3-789.012',
      paymentTerms: 'Net 30',
      rating: 4.6,
      totalOrders: 45,
      totalSpend: 850000000,
      status: 'Active',
      contactPerson: 'Dr. Muhammad Rizki',
      contactPersonPhone: '08567890123',
      contactPersonEmail: 'rizki.muhammad@konsultanbisnis.id',
      bankAccount: '6677889900',
      bankName: 'BRI',
      notes: 'Expert business consulting, excellent service quality',
      createdAt: '2024-05-12T16:50:00Z',
      updatedAt: '2025-11-19T13:45:00Z'
    }
  ];

  // Initialize vendors from localStorage or use sample data
  useEffect(() => {
    loadVendors();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = vendors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone.includes(searchTerm)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }

    setFilteredVendors(filtered);
  }, [vendors, searchTerm, typeFilter, statusFilter]);

  const loadVendors = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('bridge_vendors');
      if (stored) {
        setVendors(JSON.parse(stored));
      } else {
        // Initialize with sample data
        setVendors(sampleVendors);
        localStorage.setItem('bridge_vendors', JSON.stringify(sampleVendors));
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      notificationService.showError('Failed to load vendors');
      setVendors(sampleVendors);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setFormData({
      name: '',
      type: 'Supplier',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      paymentTerms: 'Net 30',
      rating: 0,
      totalOrders: 0,
      totalSpend: 0,
      status: 'Active',
      contactPerson: '',
      contactPersonPhone: '',
      contactPersonEmail: '',
      bankAccount: '',
      bankName: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setFormData(vendor);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteVendor = (vendor) => {
    if (window.confirm(`Are you sure you want to delete vendor "${vendor.name}"?`)) {
      const updated = vendors.filter(v => v.id !== vendor.id);
      setVendors(updated);
      localStorage.setItem('bridge_vendors', JSON.stringify(updated));
      notificationService.showSuccess('Vendor deleted successfully');
      setAnchorEl(null);
    }
  };

  const handleSaveVendor = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      notificationService.showError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let updated;
      if (selectedVendor) {
        // Update existing vendor
        updated = vendors.map(v =>
          v.id === selectedVendor.id
            ? { ...formData, updatedAt: new Date().toISOString() }
            : v
        );
        notificationService.showSuccess('Vendor updated successfully');
      } else {
        // Add new vendor
        const newVendor = {
          ...formData,
          id: `VND-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updated = [...vendors, newVendor];
        notificationService.showSuccess('Vendor added successfully');
      }
      
      setVendors(updated);
      localStorage.setItem('bridge_vendors', JSON.stringify(updated));
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving vendor:', error);
      notificationService.showError('Failed to save vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, vendor) => {
    setAnchorEl(event.currentTarget);
    setSelectedVendorForMenu(vendor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVendorForMenu(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Supplier': return 'primary';
      case 'Logistics Provider': return 'success';
      case 'Material Supplier': return 'info';
      case 'Service Provider': return 'warning';
      case 'Equipment Supplier': return 'error';
      case 'Consulting Services': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const stats = {
    totalVendors: vendors.length,
    activeVendors: vendors.filter(v => v.status === 'Active').length,
    totalSpend: vendors.reduce((sum, v) => sum + v.totalSpend, 0),
    avgRating: vendors.length > 0 ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1) : 0,
  };

  return (
    <Box>
      <BridgeHeader
        title="Vendor Management"
        subtitle="Manage suppliers and service providers"
        actions={(
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVendor}
            sx={{ py: 1.5, px: 3 }}
          >
            Add Vendor
          </Button>
        )}
      />

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard
            title="Total Vendors"
            value={stats.totalVendors}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard
            title="Active Vendors"
            value={stats.activeVendors}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard
            title="Total Spend"
            value={formatCurrency(stats.totalSpend)}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard
            title="Avg Rating"
            value={`${stats.avgRating} ⭐`}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Vendor Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Vendor Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Supplier">Supplier</MenuItem>
              <MenuItem value="Logistics Provider">Logistics Provider</MenuItem>
              <MenuItem value="Material Supplier">Material Supplier</MenuItem>
              <MenuItem value="Service Provider">Service Provider</MenuItem>
              <MenuItem value="Equipment Supplier">Equipment Supplier</MenuItem>
              <MenuItem value="Consulting Services">Consulting Services</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Vendors Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendor Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rating</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Orders</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Spend</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No vendors found
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.04)' } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {vendor.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {vendor.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {vendor.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={vendor.type}
                      color={getTypeColor(vendor.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{vendor.email}</Typography>
                      <Typography variant="caption" color="textSecondary">{vendor.phone}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Rating value={vendor.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>{vendor.totalOrders}</TableCell>
                  <TableCell>{formatCurrency(vendor.totalSpend)}</TableCell>
                  <TableCell>
                    <Chip
                      label={vendor.status}
                      color={getStatusColor(vendor.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, vendor)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedVendorForMenu && handleEditVendor(selectedVendorForMenu)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedVendorForMenu && handleDeleteVendor(selectedVendorForMenu)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Vendor Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vendor Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vendor Type *</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Vendor Type"
                >
                  <MenuItem value="Supplier">Supplier</MenuItem>
                  <MenuItem value="Logistics Provider">Logistics Provider</MenuItem>
                  <MenuItem value="Material Supplier">Material Supplier</MenuItem>
                  <MenuItem value="Service Provider">Service Provider</MenuItem>
                  <MenuItem value="Equipment Supplier">Equipment Supplier</MenuItem>
                  <MenuItem value="Consulting Services">Consulting Services</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address *"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tax ID"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Person Email"
                value={formData.contactPersonEmail}
                onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Person Phone"
                value={formData.contactPersonPhone}
                onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Terms</InputLabel>
                <Select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  label="Payment Terms"
                >
                  <MenuItem value="Net 15">Net 15</MenuItem>
                  <MenuItem value="Net 30">Net 30</MenuItem>
                  <MenuItem value="Net 45">Net 45</MenuItem>
                  <MenuItem value="Net 60">Net 60</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bank Account"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveVendor}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Vendor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BRidgeVendorManagement;
