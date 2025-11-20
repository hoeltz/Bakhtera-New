import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
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
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  StorefrontIcon,
} from '@mui/icons-material';

// Local storage server URL (use relative path by default so CRA proxy works)
const LOCAL_API = process.env.REACT_APP_LOCAL_STORAGE_SERVER_URL || '';

// Service untuk warehouse
const warehouseService = {
  async getAll() {
    try {
      const res = await fetch(`${LOCAL_API}/api/warehouses`);
      if (!res.ok) throw new Error('Failed to fetch warehouses');
      const data = await res.json();
      return data.warehouses || [];
    } catch (err) {
      console.warn('Failed to fetch warehouses from server', err);
      const local = localStorage.getItem('warehouseData');
      return local ? JSON.parse(local).warehouses || [] : [];
    }
  }
};

// Form Dialog untuk Warehouse
const WarehouseFormDialog = ({ open, onClose, onSave, warehouse, loading }) => {
  const [formData, setFormData] = useState(warehouse || {
    name: '',
    country: '',
    city: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    capacity: 0,
    status: 'Aktif'
  });

  useEffect(() => {
    if (warehouse) {
      setFormData(warehouse);
    } else {
      setFormData({
        name: '',
        country: '',
        city: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        capacity: 0,
        status: 'Aktif'
      });
    }
  }, [warehouse, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.country || !formData.city) {
      alert('Name, Country, and City are required');
      return;
    }
    await onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {warehouse ? 'Edit Warehouse' : 'New Warehouse'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Warehouse Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity (units)"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseFloat(e.target.value))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Detail View Dialog
const WarehouseDetailDialog = ({ open, onClose, warehouse }) => {
  if (!warehouse) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Warehouse Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {warehouse.name}
              </Typography>
              <Chip label={warehouse.status} color={warehouse.status === 'Aktif' ? 'success' : 'default'} size="small" />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Country</Typography>
              <Typography variant="body1">{warehouse.country}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">City</Typography>
              <Typography variant="body1">{warehouse.city}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Address</Typography>
              <Typography variant="body1">{warehouse.address || '-'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Contact Person</Typography>
              <Typography variant="body1">{warehouse.contactPerson || '-'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Phone</Typography>
              <Typography variant="body1">{warehouse.phone || '-'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Email</Typography>
              <Typography variant="body1">{warehouse.email || '-'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Capacity</Typography>
              <Typography variant="body1">{warehouse.capacity?.toLocaleString() || '-'} units</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Current Load</Typography>
              <Typography variant="body1">{warehouse.currentLoad?.toLocaleString() || '-'} units</Typography>
            </Grid>

            {warehouse.areas && warehouse.areas.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Warehouse Areas</Typography>
                <List dense>
                  {warehouse.areas.map((area, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={`${area.name} (${area.capacity} capacity)`}
                        secondary={`Zones: ${area.zones?.join(', ') || 'N/A'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Warehouse Master Component
const WarehouseMaster = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Load warehouses
  const loadData = useCallback(async () => {
    try {
      const data = await warehouseService.getAll();
      setWarehouses(data);
    } catch (error) {
      console.error('Error loading warehouses', error);
      setNotification({ open: true, message: 'Error loading warehouses', severity: 'error' });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter warehouses
  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch =
      warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.country?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // CRUD operations
  const handleAdd = () => {
    setSelectedWarehouse(null);
    setDialogOpen(true);
  };

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setDialogOpen(true);
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      // Simpan ke localStorage (future: sync ke server)
      const allData = await warehouseService.getAll();
      if (selectedWarehouse) {
        const idx = allData.findIndex(w => w.id === selectedWarehouse.id);
        if (idx !== -1) allData[idx] = { ...allData[idx], ...data };
      } else {
        allData.push({ id: `wh-${Date.now()}`, ...data });
      }
      localStorage.setItem('warehouseData', JSON.stringify({ warehouses: allData }));
      setNotification({ open: true, message: 'Warehouse saved successfully!', severity: 'success' });
      setDialogOpen(false);
      await loadData();
    } catch (error) {
      setNotification({ open: true, message: 'Error saving warehouse', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setDetailDialogOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Warehouse Master
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Warehouse
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Warehouses
              </Typography>
              <Typography variant="h5">{warehouses.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Warehouses
              </Typography>
              <Typography variant="h5">
                {warehouses.filter(w => w.status === 'Aktif').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Capacity
              </Typography>
              <Typography variant="h5">
                {warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Search by Name, City, or Country..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      {/* Table */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600, minWidth: '800px' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '150px' }}>Name</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Country</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>City</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Contact</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '80px' }}>Capacity</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '80px' }}>Status</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWarehouses.map((warehouse) => (
                <TableRow
                  key={warehouse.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: '#f0f8ff', cursor: 'pointer' }
                  }}
                >
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StorefrontIcon fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {warehouse.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Typography variant="body2">{warehouse.country}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationIcon fontSize="small" />
                      <Typography variant="body2">{warehouse.city}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Typography variant="body2">{warehouse.contactPerson || '-'}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Chip
                      label={`${(warehouse.capacity || 0).toLocaleString()} u`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Chip
                      label={warehouse.status}
                      size="small"
                      color={warehouse.status === 'Aktif' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={() => handleView(warehouse)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(warehouse)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredWarehouses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary" sx={{ py: 2, fontSize: '0.75rem' }}>
                      No warehouses found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Form Dialog */}
      <WarehouseFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        warehouse={selectedWarehouse}
        loading={loading}
      />

      {/* Detail Dialog */}
      <WarehouseDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        warehouse={selectedWarehouse}
      />

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WarehouseMaster;
