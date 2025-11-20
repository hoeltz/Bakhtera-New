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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Visibility as ViewIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_LOCAL_STORAGE_SERVER_URL || '';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null);
  const [approverNote, setApproverNote] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    salesOrderId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    paidAmount: 0,
    paidDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    paymentReference: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchSalesOrders();
  }, []);

  const createSampleInvoices = () => [
    {
      id: 'INV-001',
      invoiceNumber: 'INV/2024/001',
      salesOrderId: 'SO-001',
      invoiceDate: '2024-05-15',
      dueDate: '2024-06-15',
      items: [
        { id: 'I-1', description: 'Server Equipment', quantity: 5, unitPrice: 10000000, total: 50000000 },
        { id: 'I-2', description: 'Network Equipment', quantity: 10, unitPrice: 5000000, total: 50000000 }
      ],
      subtotal: 100000000,
      tax: 11000000,
      discount: 0,
      total: 111000000,
      notes: 'Net 30 payment terms',
      status: 'approved',
      createdAt: '2024-05-15',
      createdBy: 'sales_bridge'
    },
    {
      id: 'INV-002',
      invoiceNumber: 'INV/2024/002',
      salesOrderId: 'SO-002',
      invoiceDate: '2024-05-10',
      dueDate: '2024-06-10',
      items: [
        { id: 'I-3', description: 'Office Furniture', quantity: 20, unitPrice: 2000000, total: 40000000 }
      ],
      subtotal: 40000000,
      tax: 4400000,
      discount: 0,
      total: 44400000,
      notes: 'Office renovation project',
      status: 'paid',
      createdAt: '2024-05-10',
      createdBy: 'sales_bridge'
    }
  ];

  const createSampleSalesOrders = () => [
    {
      id: 'SO-001',
      soNumber: 'SO/2024/001',
      customerName: 'PT. Maju Jaya',
      orderDate: '2024-05-01',
      deliveryDate: '2024-05-15',
      items: [
        { id: 'I-1', description: 'Server Equipment', quantity: 5, unitPrice: 10000000, total: 50000000 },
        { id: 'I-2', description: 'Network Equipment', quantity: 10, unitPrice: 5000000, total: 50000000 }
      ],
      subtotal: 100000000,
      tax: 11000000,
      discount: 0,
      total: 111000000,
      status: 'approved',
      createdAt: '2024-05-01',
      createdBy: 'sales_bridge'
    },
    {
      id: 'SO-002',
      soNumber: 'SO/2024/002',
      customerName: 'PT. Sukses Indonesia',
      orderDate: '2024-05-05',
      deliveryDate: '2024-05-10',
      items: [
        { id: 'I-3', description: 'Office Furniture', quantity: 20, unitPrice: 2000000, total: 40000000 }
      ],
      subtotal: 40000000,
      tax: 4400000,
      discount: 0,
      total: 44400000,
      status: 'approved',
      createdAt: '2024-05-05',
      createdBy: 'sales_bridge'
    }
  ];

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/invoices`);
      if (response.ok) {
        const data = await response.json();
        const filtered = Array.isArray(data) ? data : [];
        setInvoices(filtered);
        console.info('[InvoiceManagement] Loaded invoices from API:', filtered.length);
        return;
      }
    } catch (error) {
      console.warn('API fetch for invoices failed, falling back to sample data:', error);
    }

    // Fallback: Load from localStorage or create sample data
    const storedKey = 'bridge_invoices';
    let invoices = [];
    
    try {
      const stored = localStorage.getItem(storedKey);
      if (stored) {
        invoices = JSON.parse(stored);
        console.info('[InvoiceManagement] Loaded invoices from localStorage:', invoices.length);
      }
    } catch (e) {
      console.warn('Error parsing stored invoices:', e);
    }

    // If still empty, create sample data
    if (invoices.length === 0) {
      invoices = createSampleInvoices();
      try {
        localStorage.setItem(storedKey, JSON.stringify(invoices));
        console.info('[InvoiceManagement] Created and stored sample invoices:', invoices.length);
      } catch (e) {
        console.warn('Error storing invoices to localStorage:', e);
      }
    }

    setInvoices(invoices);
  };

  const fetchSalesOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales-orders`);
      if (response.ok) {
        const data = await response.json();
        const filtered = Array.isArray(data) ? data : [];
        setSalesOrders(filtered);
        console.info('[InvoiceManagement] Loaded sales orders from API:', filtered.length);
        return;
      }
    } catch (error) {
      console.warn('API fetch for sales orders failed, falling back to sample data:', error);
    }

    // Fallback: Load from localStorage or create sample data
    const storedKey = 'bridge_sales_orders_for_invoice';
    let salesOrders = [];
    
    try {
      const stored = localStorage.getItem(storedKey);
      if (stored) {
        salesOrders = JSON.parse(stored);
        console.info('[InvoiceManagement] Loaded sales orders from localStorage:', salesOrders.length);
      }
    } catch (e) {
      console.warn('Error parsing stored sales orders:', e);
    }

    // If still empty, create sample data
    if (salesOrders.length === 0) {
      salesOrders = createSampleSalesOrders();
      try {
        localStorage.setItem(storedKey, JSON.stringify(salesOrders));
        console.info('[InvoiceManagement] Created and stored sample sales orders:', salesOrders.length);
      } catch (e) {
        console.warn('Error storing sales orders to localStorage:', e);
      }
    }

    setSalesOrders(salesOrders);
  };

  const handleGenerateFromSO = (soId) => {
    const so = salesOrders.find(s => s.id === soId);
    if (!so) {
      setErrorMessage('Sales Order not found');
      return;
    }

    setEditingId(null);
    setFormData({
      salesOrderId: soId,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: so.items || [],
      subtotal: so.subtotal || 0,
      tax: so.tax || 0,
      discount: 0,
      total: so.total || 0,
      notes: `Generated from Sales Order: ${so.id}`,
    });
    setShowDialog(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      salesOrderId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: '',
    });
    setShowDialog(true);
  };

  const handleEditClick = (invoice) => {
    setEditingId(invoice.id);
    setFormData({
      salesOrderId: invoice.salesOrderId || '',
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      discount: invoice.discount || 0,
      total: invoice.total,
      notes: invoice.notes || '',
    });
    setShowDialog(true);
  };

  const handleApprovalClick = (invoice) => {
    setSelectedInvoice(invoice);
    setApprovalAction(null);
    setApproverNote('');
    setShowApprovalDialog(true);
  };

  const handlePaymentClick = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      paidAmount: invoice.total,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      paymentReference: '',
    });
    setShowPaymentDialog(true);
  };

  const handleDetailView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailView(true);
  };

  const handleApprovalSubmit = async () => {
    if (!approvalAction) {
      setErrorMessage('Please select approve or reject');
      return;
    }

    setLoading(true);
    try {
      const newStatus = approvalAction === 'approve' ? 'approved' : 'rejected';
      const updatedInvoice = {
        ...selectedInvoice,
        status: newStatus,
        approvedBy: 'current_user',
        approvedAt: new Date().toISOString(),
        approverNote: approverNote,
      };

      const response = await fetch(`${API_BASE}/api/invoices/${selectedInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInvoice),
      });

      if (response.ok) {
        setSuccessMessage(`Invoice ${approvalAction === 'approve' ? 'approved' : 'rejected'}`);
        setShowApprovalDialog(false);
        fetchInvoices();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving invoice:', error);
      setErrorMessage('Failed to update invoice approval status');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInvoice) return;

    setLoading(true);
    try {
      const updatedInvoice = {
        ...selectedInvoice,
        status: 'paid',
        paidAmount: paymentData.paidAmount,
        paidDate: paymentData.paidDate,
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference,
      };

      const response = await fetch(`${API_BASE}/api/invoices/${selectedInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInvoice),
      });

      if (response.ok) {
        setSuccessMessage('Payment recorded successfully');
        setShowPaymentDialog(false);
        fetchInvoices();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      setErrorMessage('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const so = salesOrders.find(s => s.id === formData.salesOrderId);
      if (!so && !editingId) {
        setErrorMessage('Please select a Sales Order');
        setLoading(false);
        return;
      }

      const totalAmount = formData.subtotal + (formData.subtotal * formData.tax / 100) - formData.discount;
      const payload = editingId
        ? { ...formData, total: totalAmount }
        : {
            ...formData,
            total: totalAmount,
            id: `INV-${Date.now()}`,
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            customerId: so?.customerId,
            customerName: so?.customerName,
            customerEmail: so?.customerEmail,
            status: 'draft',
            createdAt: new Date().toISOString(),
          };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/api/invoices/${editingId}` : `${API_BASE}/api/invoices`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessMessage(editingId ? 'Invoice updated' : 'Invoice created');
        setShowDialog(false);
        fetchInvoices();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setErrorMessage('Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/invoices/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccessMessage('Invoice deleted');
          fetchInvoices();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setErrorMessage('Failed to delete invoice');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleIssueInvoice = async () => {
    if (!selectedInvoice) return;

    setLoading(true);
    try {
      const updatedInvoice = {
        ...selectedInvoice,
        status: 'issued',
        issuedAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE}/api/invoices/${selectedInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInvoice),
      });

      if (response.ok) {
        setSuccessMessage('Invoice issued successfully');
        setShowDetailView(false);
        fetchInvoices();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error issuing invoice:', error);
      setErrorMessage('Failed to issue invoice');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInvoices = () => {
    const statusMap = ['', 'draft', 'pending_approval', 'approved', 'issued', 'paid'];
    const filter = statusMap[tabValue];
    return filter ? invoices.filter(i => i.status === filter) : invoices;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending_approval: 'warning',
      approved: 'success',
      issued: 'info',
      paid: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatus = (invoice) => {
    if (invoice.status === 'paid') {
      return 'Paid ✓';
    }
    return 'Unpaid';
  };

  const filteredInvoices = getFilteredInvoices();

  const unvoicedSOs = salesOrders.filter(
    so => so.status === 'confirmed' && !invoices.some(inv => inv.salesOrderId === so.id)
  );

  return (
    <Box sx={{ p: 3 }}>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Invoice Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          New Invoice
        </Button>
      </Box>

      {/* Quick Create Cards for Unvoiced Sales Orders */}
      {unvoicedSOs.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
            📊 Ready to Invoice (Confirmed Sales Orders)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {unvoicedSOs.map(so => (
              <Grid item xs={12} sm={6} md={4} key={so.id}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                      {so.id}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {so.customerName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                      Rp {so.total?.toLocaleString('id-ID') || 0}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleGenerateFromSO(so.id)}
                    >
                      Generate Invoice
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All" />
          <Tab label="Draft" />
          <Tab label="Pending Approval" />
          <Tab label="Approved" />
          <Tab label="Issued" />
          <Tab label="Paid" />
        </Tabs>
      </Box>

      {/* Invoices Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Invoice #</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Payment</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          {invoices.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No invoices found. Click "Add Invoice" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : filteredInvoices.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No invoices match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id} hover>
                <TableCell sx={{ fontWeight: 'bold' }}>{inv.invoiceNumber}</TableCell>
                <TableCell>{inv.customerName}</TableCell>
                <TableCell align="right">Rp {inv.total?.toLocaleString('id-ID') || 0}</TableCell>
                <TableCell>{inv.dueDate}</TableCell>
                <TableCell>
                  <Chip
                    label={inv.status}
                    color={getStatusColor(inv.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{getPaymentStatus(inv)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleDetailView(inv)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {inv.status === 'draft' && (
                    <>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditClick(inv)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(inv.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send for Approval">
                        <IconButton size="small" color="primary" onClick={() => handleApprovalClick(inv)}>
                          <ApproveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {['pending_approval', 'approved'].includes(inv.status) && (
                    <Tooltip title="Approve/Reject">
                      <IconButton size="small" color="warning" onClick={() => handleApprovalClick(inv)}>
                        <ApproveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {inv.status === 'issued' && (
                    <Tooltip title="Record Payment">
                      <IconButton size="small" color="success" onClick={() => handlePaymentClick(inv)}>
                        <PaymentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Sales Order</InputLabel>
            <Select
              value={formData.salesOrderId}
              onChange={(e) => handleGenerateFromSO(e.target.value)}
              label="Sales Order"
              disabled={!!editingId}
            >
              {salesOrders.map(so => (
                <MenuItem key={so.id} value={so.id}>
                  {so.id} - {so.customerName} (Rp {so.total?.toLocaleString('id-ID') || 0})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Invoice Date"
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography><strong>Subtotal:</strong></Typography>
                <Typography>Rp {formData.subtotal.toLocaleString('id-ID')}</Typography>
              </Grid>
              <Grid item xs={6} align="right">
                <TextField
                  label="Tax (%)"
                  type="number"
                  size="small"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>Tax Amount:</strong></Typography>
                <Typography>Rp {((formData.subtotal * formData.tax) / 100).toLocaleString('id-ID')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Discount"
                  type="number"
                  size="small"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6"><strong>Total:</strong></Typography>
              </Grid>
              <Grid item xs={6} align="right">
                <Typography variant="h6">
                  <strong>Rp {(formData.subtotal + (formData.subtotal * formData.tax / 100) - formData.discount).toLocaleString('id-ID')}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onClose={() => setShowApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve / Reject Invoice</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedInvoice && (
            <>
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography><strong>Invoice:</strong> {selectedInvoice.invoiceNumber}</Typography>
                <Typography><strong>Customer:</strong> {selectedInvoice.customerName}</Typography>
                <Typography><strong>Total:</strong> Rp {selectedInvoice.total?.toLocaleString('id-ID') || 0}</Typography>
              </Box>

              <FormControl fullWidth margin="normal">
                <InputLabel>Action</InputLabel>
                <Select
                  value={approvalAction || ''}
                  onChange={(e) => setApprovalAction(e.target.value)}
                  label="Action"
                >
                  <MenuItem value="approve">Approve for Issue</MenuItem>
                  <MenuItem value="reject">Reject</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Approval Note"
                value={approverNote}
                onChange={(e) => setApproverNote(e.target.value)}
                margin="normal"
                multiline
                rows={4}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleApprovalSubmit} variant="contained" color={approvalAction === 'approve' ? 'success' : 'error'} disabled={loading}>
            {loading ? 'Processing...' : (approvalAction === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedInvoice && (
            <>
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography><strong>Invoice:</strong> {selectedInvoice.invoiceNumber}</Typography>
                <Typography><strong>Total Amount:</strong> Rp {selectedInvoice.total?.toLocaleString('id-ID') || 0}</Typography>
              </Box>

              <TextField
                fullWidth
                label="Amount Paid"
                type="number"
                value={paymentData.paidAmount}
                onChange={(e) => setPaymentData({ ...paymentData, paidAmount: parseFloat(e.target.value) })}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentData.paidDate}
                onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  label="Payment Method"
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Payment Reference"
                value={paymentData.paymentReference}
                onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
                margin="normal"
                placeholder="Bank Ref #, Check #, etc."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handlePaymentSubmit} variant="contained" color="success" disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={showDetailView} onClose={() => setShowDetailView(false)} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedInvoice && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">Invoice Number</Typography>
                      <Typography variant="h6">{selectedInvoice.invoiceNumber}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">Status</Typography>
                      <Chip label={selectedInvoice.status} color={getStatusColor(selectedInvoice.status)} />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">Customer</Typography>
                      <Typography variant="body2">{selectedInvoice.customerName}</Typography>
                      <Typography variant="caption">{selectedInvoice.customerEmail}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">Total Amount</Typography>
                      <Typography variant="h6">Rp {selectedInvoice.total?.toLocaleString('id-ID') || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Line Items
              </Typography>
              <TableContainer>
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
                    {selectedInvoice.items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">Rp {item.unitPrice?.toLocaleString('id-ID') || 0}</TableCell>
                        <TableCell align="right">Rp {(item.quantity * item.unitPrice)?.toLocaleString('id-ID') || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedInvoice.approvedBy && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Approval Information
                    </Typography>
                    <Typography variant="body2"><strong>Approved By:</strong> {selectedInvoice.approvedBy}</Typography>
                    <Typography variant="body2"><strong>Approved At:</strong> {new Date(selectedInvoice.approvedAt).toLocaleString('id-ID')}</Typography>
                    {selectedInvoice.approverNote && (
                      <Typography variant="body2"><strong>Note:</strong> {selectedInvoice.approverNote}</Typography>
                    )}
                  </Box>
                </>
              )}

              {selectedInvoice.status === 'paid' && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Payment Information
                    </Typography>
                    <Typography variant="body2"><strong>Amount Paid:</strong> Rp {(selectedInvoice.paidAmount || 0).toLocaleString('id-ID')}</Typography>
                    <Typography variant="body2"><strong>Payment Date:</strong> {selectedInvoice.paidDate}</Typography>
                    <Typography variant="body2"><strong>Payment Method:</strong> {selectedInvoice.paymentMethod}</Typography>
                    {selectedInvoice.paymentReference && (
                      <Typography variant="body2"><strong>Reference:</strong> {selectedInvoice.paymentReference}</Typography>
                    )}
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailView(false)}>Close</Button>
          {selectedInvoice?.status === 'approved' && (
            <Button onClick={handleIssueInvoice} variant="contained" color="success" disabled={loading}>
              {loading ? 'Issuing...' : 'Issue Invoice'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceManagement;
