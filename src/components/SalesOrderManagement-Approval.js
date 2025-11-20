import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  TextField,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ConfirmIcon,
  Visibility as ViewIcon,
  GetApp as ConvertIcon,
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_LOCAL_STORAGE_SERVER_URL || '';

const SalesOrderManagementApproval = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [approvedQuotations, setApprovedQuotations] = useState([]);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch sales orders and approved quotations
  useEffect(() => {
    fetchSalesOrders();
    fetchApprovedQuotations();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales-orders`);
      if (response.ok) {
        const data = await response.json();
        setSalesOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching sales orders:', error);
    }
  };

  const fetchApprovedQuotations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/quotations`);
      if (response.ok) {
        const data = await response.json();
        const approved = Array.isArray(data) ? data.filter(q => q.status === 'approved') : [];
        setApprovedQuotations(approved);
      }
    } catch (error) {
      console.error('Error fetching approved quotations:', error);
    }
  };

  const handleDetailView = (order) => {
    setSelectedOrder(order);
    setShowDetailView(true);
  };

  const handleConfirmClick = (order) => {
    setSelectedOrder(order);
    setShowConfirmDialog(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/sales-orders/${selectedOrder.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmedBy: 'customer' }),
      });

      if (response.ok) {
        setSuccessMessage('Sales Order confirmed successfully');
        setShowConfirmDialog(false);
        fetchSalesOrders();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      setErrorMessage('Failed to confirm sales order');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertQuotationToSalesOrder = async (quotation) => {
    if (!quotation) return;

    setLoading(true);
    try {
      const salesOrder = {
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        customerEmail: quotation.customerEmail,
        customerPhone: quotation.customerPhone,
        items: quotation.items,
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        total: quotation.total,
        deliveryDate: quotation.deliveryDate,
        status: 'pending_confirmation',
      };

      const response = await fetch(`${API_BASE}/api/sales-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salesOrder),
      });

      if (response.ok) {
        const newSO = await response.json();
        setSuccessMessage(`Sales Order ${newSO.id} created from quotation`);
        fetchSalesOrders();
        fetchApprovedQuotations();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error converting quotation:', error);
      setErrorMessage('Failed to convert quotation to sales order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_confirmation: 'warning',
      confirmed: 'success',
      fulfilling: 'info',
      shipped: 'primary',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_confirmation: 'Pending Confirmation',
      confirmed: 'Confirmed',
      fulfilling: 'Fulfilling',
      shipped: 'Shipped',
    };
    return labels[status] || status;
  };

  const filteredOrders = tabValue === 0 ? salesOrders : salesOrders.filter(o => {
    const statusMap = ['', 'pending_confirmation', 'confirmed', 'fulfilling', 'shipped'];
    return o.status === statusMap[tabValue];
  });

  return (
    <Box sx={{ p: 3 }}>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Sales Order Management
        </Typography>
      </Box>

      {/* Approved Quotations Section */}
      {approvedQuotations.length > 0 && (
        <Card sx={{ mb: 3, backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              📋 Approved Quotations Ready to Convert
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {approvedQuotations.map((qt) => (
                <Card key={qt.id} sx={{ flex: 1, minWidth: 250 }}>
                  <CardContent>
                    <Typography variant="h6">{qt.quotationNumber}</Typography>
                    <Typography variant="body2" color="textSecondary">{qt.customerName}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Rp {qt.total?.toLocaleString('id-ID') || 0}
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handleConvertQuotationToSalesOrder(qt)}
                      disabled={loading}
                    >
                      <ConvertIcon sx={{ mr: 1 }} /> Convert to SO
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All" />
          <Tab label="Pending Confirmation" />
          <Tab label="Confirmed" />
          <Tab label="Fulfilling" />
          <Tab label="Shipped" />
        </Tabs>
      </Box>

      {/* Sales Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Sales Order #</strong></TableCell>
              <TableCell><strong>Quotation</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((so) => (
              <TableRow key={so.id} hover>
                <TableCell sx={{ fontWeight: 'bold' }}>{so.id}</TableCell>
                <TableCell>{so.quotationNumber || '-'}</TableCell>
                <TableCell>{so.customerName}</TableCell>
                <TableCell align="right">Rp {so.total?.toLocaleString('id-ID') || 0}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(so.status)}
                    color={getStatusColor(so.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleDetailView(so)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {so.status === 'pending_confirmation' && (
                    <Tooltip title="Confirm Order">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleConfirmClick(so)}
                      >
                        <ConfirmIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary" sx={{ py: 2 }}>
                    {salesOrders.length === 0
                      ? 'No sales orders found. Convert an approved quotation to create one.'
                      : 'No sales orders match the selected status.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail View Dialog */}
      <Dialog open={showDetailView} onClose={() => setShowDetailView(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sales Order Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedOrder && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Sales Order ID
                      </Typography>
                      <Typography variant="h6">{selectedOrder.id}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Status
                      </Typography>
                      <Chip
                        label={getStatusLabel(selectedOrder.status)}
                        color={getStatusColor(selectedOrder.status)}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Customer
                      </Typography>
                      <Typography variant="body1">{selectedOrder.customerName}</Typography>
                      <Typography variant="caption">{selectedOrder.customerEmail}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Amount
                      </Typography>
                      <Typography variant="h6">
                        Rp {selectedOrder.total?.toLocaleString('id-ID') || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {selectedOrder.quotationId && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>From Quotation:</strong> {selectedOrder.quotationNumber}
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Line Items
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>SKU</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell align="right"><strong>Qty</strong></TableCell>
                      <TableCell align="right"><strong>Unit Price</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          Rp {item.unitPrice?.toLocaleString('id-ID') || 0}
                        </TableCell>
                        <TableCell align="right">
                          Rp {(item.quantity * item.unitPrice)?.toLocaleString('id-ID') || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}><strong>Subtotal:</strong></Grid>
                  <Grid item xs={6} align="right">
                    Rp {selectedOrder.subtotal?.toLocaleString('id-ID') || 0}
                  </Grid>
                  <Grid item xs={6}><strong>Tax (10%):</strong></Grid>
                  <Grid item xs={6} align="right">
                    Rp {selectedOrder.tax?.toLocaleString('id-ID') || 0}
                  </Grid>
                  <Grid item xs={6}><strong>Total:</strong></Grid>
                  <Grid item xs={6} align="right">
                    <strong>Rp {selectedOrder.total?.toLocaleString('id-ID') || 0}</strong>
                  </Grid>
                </Grid>
              </Box>

              {selectedOrder.deliveryDate && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">
                    <strong>Delivery Date:</strong> {new Date(selectedOrder.deliveryDate).toLocaleDateString('id-ID')}
                  </Typography>
                </>
              )}

              {selectedOrder.confirmedAt && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Confirmation Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Confirmed By:</strong> {selectedOrder.confirmedBy}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Confirmed At:</strong>{' '}
                      {new Date(selectedOrder.confirmedAt).toLocaleString('id-ID')}
                    </Typography>
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailView(false)}>Close</Button>
          {selectedOrder?.status === 'pending_confirmation' && (
            <Button
              onClick={() => {
                setShowDetailView(false);
                handleConfirmClick(selectedOrder);
              }}
              variant="contained"
              color="success"
              startIcon={<ConfirmIcon />}
            >
              Confirm Order
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Sales Order</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedOrder && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                You are about to confirm this sales order. This action will trigger inventory allocation
                and warehouse packing.
              </Alert>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography><strong>Sales Order:</strong> {selectedOrder.id}</Typography>
                <Typography><strong>Customer:</strong> {selectedOrder.customerName}</Typography>
                <Typography>
                  <strong>Total Amount:</strong> Rp {selectedOrder.total?.toLocaleString('id-ID') || 0}
                </Typography>
                <Typography>
                  <strong>Items:</strong> {selectedOrder.items?.length || 0} line items
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmOrder}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? 'Confirming...' : 'Confirm Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesOrderManagementApproval;
