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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Local storage server URL (use relative path by default so CRA proxy works)
const LOCAL_API = process.env.REACT_APP_LOCAL_STORAGE_SERVER_URL || '';

// Service to fetch inventory from local server
const inventoryService = {
  async getAll() {
    try {
      const res = await fetch(`${LOCAL_API}/api/inventory`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      return data.inventory || [];
    } catch (err) {
      console.warn('Failed to fetch inventory from server, using localStorage fallback', err);
      // fallback to localStorage
      const local = localStorage.getItem('inventoryData');
      return local ? JSON.parse(local).items || [] : [];
    }
  },

  async create(item) {
    try {
      const res = await fetch(`${LOCAL_API}/api/inventory/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: item.sku,
          name: item.name,
          warehouseId: item.warehouseId,
          qty: item.qty
        })
      });
      if (!res.ok) throw new Error('Failed to create inventory');
      return await res.json();
    } catch (err) {
      console.error('Inventory create error', err);
      throw err;
    }
  },

  async update(id, updates) {
    try {
      const res = await fetch(`${LOCAL_API}/api/inventory/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update inventory');
      return await res.json();
    } catch (err) {
      console.error('Inventory update error', err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const res = await fetch(`${LOCAL_API}/api/inventory/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete inventory');
      return await res.json();
    } catch (err) {
      console.error('Inventory delete error', err);
      throw err;
    }
  }
};

// Form Dialog Component
const InventoryFormDialog = ({ open, onClose, onSave, item, loading }) => {
  const [formData, setFormData] = useState(item || {
    sku: '',
    name: '',
    category: '',
    warehouseId: '',
    warehouseName: '',
    location: '',
    qty: 0,
    unit: 'pcs',
    weight: 0
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        sku: '',
        name: '',
        category: '',
        warehouseId: '',
        warehouseName: '',
        location: '',
        qty: 0,
        unit: 'pcs',
        weight: 0
      });
    }
  }, [item, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.sku || !formData.name) {
      alert('SKU and Name are required');
      return;
    }
    await onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {item ? 'Edit Inventory Item' : 'New Inventory Item'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Warehouse ID"
                value={formData.warehouseId}
                onChange={(e) => handleChange('warehouseId', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Warehouse Name"
                value={formData.warehouseName}
                onChange={(e) => handleChange('warehouseName', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Gudang A, Zona 1, Rack B-05"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.qty}
                onChange={(e) => handleChange('qty', parseFloat(e.target.value))}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="pcs, meter, kg, etc."
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
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
const InventoryDetailDialog = ({ open, onClose, item }) => {
  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Inventory Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">SKU</Typography>
              <Typography variant="body1">{item.sku}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Name</Typography>
              <Typography variant="body1">{item.name}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Category</Typography>
              <Typography variant="body1">{item.category || '-'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Warehouse</Typography>
              <Typography variant="body1">{item.warehouseName} ({item.warehouseId})</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Location</Typography>
              <Typography variant="body1">{item.location}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">Quantity</Typography>
              <Chip label={`${item.qty} ${item.unit}`} color="primary" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">Weight</Typography>
              <Typography variant="body1">{item.weight} kg</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">Updated</Typography>
              <Typography variant="body1" sx={{ fontSize: '0.85rem' }}>
                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID') : '-'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Inventory Management Component
const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Load inventory
  const loadData = useCallback(async () => {
    try {
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory', error);
      setNotification({ open: true, message: 'Error loading inventory', severity: 'error' });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // CRUD operations
  const handleAdd = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (selectedItem) {
        await inventoryService.update(selectedItem.id, data);
        setNotification({ open: true, message: 'Inventory item updated successfully!', severity: 'success' });
      } else {
        await inventoryService.create(data);
        setNotification({ open: true, message: 'Inventory item created successfully!', severity: 'success' });
      }
      setDialogOpen(false);
      await loadData();
    } catch (error) {
      setNotification({ open: true, message: 'Error saving inventory item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete ${item.name}?`)) {
      setLoading(true);
      try {
        await inventoryService.delete(item.id);
        setNotification({ open: true, message: 'Inventory item deleted successfully!', severity: 'success' });
        await loadData();
      } catch (error) {
        setNotification({ open: true, message: 'Error deleting inventory item', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Inventory Management
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add New Item
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h5">{inventory.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Quantity
              </Typography>
              <Typography variant="h5">{inventory.reduce((sum, i) => sum + (i.qty || 0), 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Warehouses
              </Typography>
              <Typography variant="h5">{new Set(inventory.map(i => i.warehouseId)).size}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categories
              </Typography>
              <Typography variant="h5">{new Set(inventory.map(i => i.category)).size}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Search by SKU, Name, Category, or Warehouse..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      {/* Table */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600, minWidth: '900px' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>SKU</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '180px' }}>Name</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Category</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '120px' }}>Warehouse</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '120px' }}>Location</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '80px' }}>Qty</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '80px' }}>Unit</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: '#f0f8ff', cursor: 'pointer' }
                  }}
                >
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Typography variant="body2">{item.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Chip label={item.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Typography variant="body2">{item.warehouseName}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{item.location}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Chip label={`${item.qty} ${item.unit}`} size="small" color="primary" />
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Typography variant="body2">{item.unit}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={() => handleView(item)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" sx={{ py: 2, fontSize: '0.75rem' }}>
                      {inventory.length === 0 ? 'No inventory items found' : 'No items match your search'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Form Dialog */}
      <InventoryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        item={selectedItem}
        loading={loading}
      />

      {/* Detail Dialog */}
      <InventoryDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        item={selectedItem}
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

export default InventoryManagement;
