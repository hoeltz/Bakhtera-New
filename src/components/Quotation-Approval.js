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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  GetApp as ConvertIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_LOCAL_STORAGE_SERVER_URL || '';

const QuotationApproval = () => {
  const [quotations, setQuotations] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null);
  const [approverNote, setApproverNote] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    quotationNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    items: [{ sku: '', description: '', quantity: 0, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    terms: '',
    deliveryDate: '',
    status: 'draft',
  });

  // Fetch quotations
  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/quotations`);
      if (response.ok) {
        const data = await response.json();
        setQuotations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      quotationNumber: `QT-${Date.now()}`,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: '',
      items: [{ sku: '', description: '', quantity: 0, unitPrice: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
      terms: '',
      deliveryDate: '',
      status: 'draft',
    });
    setShowDialog(true);
  };

  const handleEditClick = (quotation) => {
    setEditingId(quotation.id);
    setFormData(quotation);
    setShowDialog(true);
  };

  const handleApprovalClick = (quotation) => {
    setSelectedQuotation(quotation);
    setApprovalAction(null);
    setApproverNote('');
    setShowApprovalDialog(true);
  };

  const handleDetailView = (quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailView(true);
  };

  const handleConvertToSalesOrder = async () => {
    if (!selectedQuotation || selectedQuotation.status !== 'approved') {
      setErrorMessage('Only approved quotations can be converted to Sales Order');
      return;
    }

    try {
      const salesOrder = {
        id: `SO-${Date.now()}`,
        quotationId: selectedQuotation.id,
        quotationNumber: selectedQuotation.quotationNumber,
        customerName: selectedQuotation.customerName,
        customerEmail: selectedQuotation.customerEmail,
        customerPhone: selectedQuotation.customerPhone,
        items: selectedQuotation.items,
        subtotal: selectedQuotation.subtotal,
        tax: selectedQuotation.tax,
        total: selectedQuotation.total,
        deliveryDate: selectedQuotation.deliveryDate,
        status: 'pending_confirmation',
        createdAt: new Date().toISOString(),
      };

      // POST to server
      const response = await fetch(`${API_BASE}/api/sales-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salesOrder),
      });

      if (response.ok) {
        setSuccessMessage(`Sales Order ${salesOrder.id} created successfully`);
        setShowDetailView(false);
        fetchQuotations();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error converting to sales order:', error);
      setErrorMessage('Failed to convert quotation to sales order');
    }
  };

  const handleApprovalSubmit = async () => {
    if (!approvalAction) {
      setErrorMessage('Please select approve or reject');
      return;
    }

    try {
      const updatedQuotation = {
        ...selectedQuotation,
        status: approvalAction === 'approve' ? 'approved' : 'rejected',
        approvedBy: 'current_user',
        approvedAt: new Date().toISOString(),
        approverNote: approverNote,
      };

      const response = await fetch(`${API_BASE}/api/quotations/${selectedQuotation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuotation),
      });

      if (response.ok) {
        setSuccessMessage(`Quotation ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
        setShowApprovalDialog(false);
        fetchQuotations();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving quotation:', error);
      setErrorMessage('Failed to update quotation approval status');
    }
  };

  const handleSave = async () => {
    try {
      let subtotal = 0;
      formData.items.forEach(item => {
        item.total = item.quantity * item.unitPrice;
        subtotal += item.total;
      });
      formData.subtotal = subtotal;
      formData.tax = subtotal * 0.1;
      formData.total = subtotal + formData.tax;

      const payload = editingId ? formData : { ...formData, id: `QT-${Date.now()}`, createdAt: new Date().toISOString() };
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/api/quotations/${editingId}` : `${API_BASE}/api/quotations`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessMessage(editingId ? 'Quotation updated successfully' : 'Quotation created successfully');
        setShowDialog(false);
        fetchQuotations();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      setErrorMessage('Failed to save quotation');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        const response = await fetch(`${API_BASE}/api/quotations/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccessMessage('Quotation deleted successfully');
          fetchQuotations();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error deleting quotation:', error);
        setErrorMessage('Failed to delete quotation');
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { sku: '', description: '', quantity: 0, unitPrice: 0, total: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const getFilteredQuotations = () => {
    const statusMap = ['', 'draft', 'sent', 'approved', 'rejected'];
    const filter = statusMap[tabValue];
    return filter ? quotations.filter(q => q.status === filter) : quotations;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      sent: 'info',
      approved: 'success',
      rejected: 'error',
      converted: 'warning',
    };
    return colors[status] || 'default';
  };

  const filteredQuotations = getFilteredQuotations();

  return (
    <Box sx={{ p: 3 }}>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Quotation Management (Approval Workflow)
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          New Quotation
        </Button>
      </Box>

      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All" />
          <Tab label="Draft" />
          <Tab label="Sent" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Box>

      {/* Quotations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Quotation #</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell><strong>Valid Until</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuotations.map((qt) => (
              <TableRow key={qt.id} hover>
                <TableCell>{qt.quotationNumber}</TableCell>
                <TableCell>{qt.customerName}</TableCell>
                <TableCell align="right">Rp {qt.total?.toLocaleString('id-ID') || 0}</TableCell>
                <TableCell>{qt.validUntil || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={qt.status}
                    color={getStatusColor(qt.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleDetailView(qt)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {qt.status === 'draft' && (
                    <>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditClick(qt)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(qt.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {['draft', 'sent'].includes(qt.status) && (
                    <Tooltip title="Approve/Reject">
                      <IconButton size="small" onClick={() => handleApprovalClick(qt)}>
                        <ApproveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {qt.status === 'approved' && (
                    <Tooltip title="Convert to Sales Order">
                      <IconButton size="small" color="success" onClick={() => { setSelectedQuotation(qt); setShowDetailView(true); }}>
                        <ConvertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Quotation' : 'New Quotation'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Quotation Number"
            value={formData.quotationNumber}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Customer Name"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Customer Email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Quotation Date"
            type="date"
            value={formData.quotationDate}
            onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Valid Until"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Delivery Date"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Terms & Conditions"
            value={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Line Items
          </Typography>

          {formData.items.map((item, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SKU"
                    size="small"
                    value={item.sku}
                    onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    size="small"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    size="small"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    type="number"
                    size="small"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total"
                    type="number"
                    size="small"
                    disabled
                    value={item.quantity * item.unitPrice}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveItem(idx)}
                  >
                    Remove Item
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}

          <Button
            variant="outlined"
            onClick={handleAddItem}
            sx={{ mb: 2 }}
          >
            Add Line Item
          </Button>

          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}><strong>Subtotal:</strong></Grid>
              <Grid item xs={6} align="right">Rp {formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString('id-ID')}</Grid>
              <Grid item xs={6}><strong>Tax (10%):</strong></Grid>
              <Grid item xs={6} align="right">Rp {(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 0.1).toLocaleString('id-ID')}</Grid>
              <Grid item xs={6}><strong>Total:</strong></Grid>
              <Grid item xs={6} align="right"><strong>Rp {(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 1.1).toLocaleString('id-ID')}</strong></Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onClose={() => setShowApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve / Reject Quotation</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedQuotation && (
            <>
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography><strong>Quotation:</strong> {selectedQuotation.quotationNumber}</Typography>
                <Typography><strong>Customer:</strong> {selectedQuotation.customerName}</Typography>
                <Typography><strong>Total:</strong> Rp {selectedQuotation.total?.toLocaleString('id-ID') || 0}</Typography>
              </Box>

              <FormControl fullWidth margin="normal">
                <InputLabel>Action</InputLabel>
                <Select
                  value={approvalAction || ''}
                  onChange={(e) => setApprovalAction(e.target.value)}
                  label="Action"
                >
                  <MenuItem value="approve">Approve</MenuItem>
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
                placeholder="Enter your approval or rejection reason..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleApprovalSubmit} variant="contained" color={approvalAction === 'approve' ? 'success' : 'error'}>
            {approvalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={showDetailView} onClose={() => setShowDetailView(false)} maxWidth="md" fullWidth>
        <DialogTitle>Quotation Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedQuotation && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Quotation Number
                      </Typography>
                      <Typography variant="h6">{selectedQuotation.quotationNumber}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Status
                      </Typography>
                      <Chip label={selectedQuotation.status} color={getStatusColor(selectedQuotation.status)} />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Customer
                      </Typography>
                      <Typography variant="body1">{selectedQuotation.customerName}</Typography>
                      <Typography variant="caption">{selectedQuotation.customerEmail}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Amount
                      </Typography>
                      <Typography variant="h6">Rp {selectedQuotation.total?.toLocaleString('id-ID') || 0}</Typography>
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
                    {selectedQuotation.items?.map((item, idx) => (
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

              {selectedQuotation.approvedBy && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Approval Information
                    </Typography>
                    <Typography variant="body2"><strong>Approved By:</strong> {selectedQuotation.approvedBy}</Typography>
                    <Typography variant="body2"><strong>Approved At:</strong> {new Date(selectedQuotation.approvedAt).toLocaleString('id-ID')}</Typography>
                    {selectedQuotation.approverNote && (
                      <Typography variant="body2"><strong>Note:</strong> {selectedQuotation.approverNote}</Typography>
                    )}
                  </Box>
                </>
              )}

              {selectedQuotation.status === 'approved' && !selectedQuotation.salesOrderId && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This quotation is approved. Click "Convert to Sales Order" button to create a sales order.
                </Alert>
              )}

              {selectedQuotation.salesOrderId && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <strong>Converted to Sales Order:</strong> {selectedQuotation.salesOrderId}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailView(false)}>Close</Button>
          {selectedQuotation?.status === 'approved' && !selectedQuotation?.salesOrderId && (
            <Button onClick={handleConvertToSalesOrder} variant="contained" color="success" startIcon={<ConvertIcon />}>
              Convert to Sales Order
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuotationApproval;
