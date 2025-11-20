// AWB Management Component
// Comprehensive Air Waybill management with tracking and cost integration

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  LinearProgress,
  Badge,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flight as FlightIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  LocalShipping as ShippingIcon,
  Tracking as TrackingIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
} from '@mui/icons-material';
import awbService from '../services/awbService';
import { operationalCostService, quotationService, customerService } from '../services/localStorage';
import { formatCurrency, formatNumber } from '../services/currencyUtils';

/**
 * AWB Form Hook
 */
const useAWBForm = (initialValues = {}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Default AWB values
  const defaultValues = useMemo(() => ({
    // Basic AWB information
    awbNumber: '',
    awbType: 'Host', // Master or Host
    quotationId: '',
    quotationNumber: '',
    customerId: '',
    customerName: '',
    
    // Shipper information
    shipperName: '',
    shipperAddress: '',
    shipperPhone: '',
    shipperEmail: '',
    
    // Consignee information
    consigneeName: '',
    consigneeAddress: '',
    consigneePhone: '',
    consigneeEmail: '',
    
    // Route information
    origin: '',
    originAirport: '',
    originCountry: 'Indonesia',
    destination: '',
    destinationAirport: '',
    destinationCountry: '',
    routing: '',
    
    // Weight & dimensions
    pieces: 0,
    weight: 0,
    volume: 0,
    chargeableWeight: 0,
    dimensions: '',
    
    // Special handling
    dangerousGoods: false,
    dgClass: '',
    temperature: '',
    specialInstructions: '',
    
    // Costs
    freightCharge: 0,
    fuelSurcharge: 0,
    securitySurcharge: 0,
    otherCharges: 0,
    totalCharge: 0,
    currency: 'IDR',
    
    // Flight details
    carrier: '',
    flightNumber: '',
    flightDate: '',
    flightTime: '',
    
    // Status
    status: 'Created',
    operationalCostId: '',
    
    // Notes
    notes: '',
    
    // System fields
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), []);

  const formValues = { ...defaultValues, ...initialValues };

  // Calculate total charge
  const calculateTotalCharge = useCallback(() => {
    const freight = parseFloat(formValues.freightCharge) || 0;
    const fuel = parseFloat(formValues.fuelSurcharge) || 0;
    const security = parseFloat(formValues.securitySurcharge) || 0;
    const other = parseFloat(formValues.otherCharges) || 0;
    return freight + fuel + security + other;
  }, [formValues.freightCharge, formValues.fuelSurcharge, formValues.securitySurcharge, formValues.otherCharges]);

  const totalCharge = useMemo(() => calculateTotalCharge(), [calculateTotalCharge]);

  // Handle field changes
  const handleFieldChange = useCallback((field, value) => {
    formValues[field] = value;
  }, [formValues]);

  return {
    values: { ...formValues, totalCharge },
    activeTab,
    snackbar,
    totalCharge,
    setActiveTab,
    setSnackbar,
    handleFieldChange,
  };
};

/**
 * AWB Details Tab Component
 */
const AWBDetailsTab = memo(({
  values,
  handleFieldChange,
  customers,
  quotations
}) => {
  const carriers = awbService.getCarrierOptions();
  const airports = awbService.getAirportOptions();

  return (
    <Grid container spacing={3}>
      {/* Basic Information */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Basic AWB Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>AWB Type</InputLabel>
                  <Select
                    value={values.awbType || 'Host'}
                    onChange={(e) => handleFieldChange('awbType', e.target.value)}
                    label="AWB Type"
                  >
                    <MenuItem value="Host">Host (Internal)</MenuItem>
                    <MenuItem value="Master">Master (From Shipper)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="AWB Number"
                  value={values.awbNumber || ''}
                  onChange={(e) => handleFieldChange('awbNumber', e.target.value)}
                  disabled={!!values.id} // Disable editing existing AWB numbers
                  helperText="Leave empty to auto-generate"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Link to Quotation</InputLabel>
                  <Select
                    value={values.quotationId || ''}
                    onChange={(e) => {
                      handleFieldChange('quotationId', e.target.value);
                      const selectedQuotation = quotations.find(q => q.id === e.target.value);
                      if (selectedQuotation) {
                        handleFieldChange('quotationNumber', selectedQuotation.quotationNumber);
                        handleFieldChange('customerName', selectedQuotation.customerName);
                        handleFieldChange('customerId', selectedQuotation.customerId);
                      }
                    }}
                    label="Link to Quotation"
                  >
                    <MenuItem value="">No Quotation</MenuItem>
                    {quotations.map(quotation => (
                      <MenuItem key={quotation.id} value={quotation.id}>
                        {quotation.quotationNumber} - {quotation.customerName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={values.status || 'Created'}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    label="Status"
                  >
                    {awbService.getStatusOptions().map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Shipper Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📦 Shipper Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Shipper Name"
                  value={values.shipperName || ''}
                  onChange={(e) => handleFieldChange('shipperName', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={values.shipperAddress || ''}
                  onChange={(e) => handleFieldChange('shipperAddress', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={values.shipperPhone || ''}
                  onChange={(e) => handleFieldChange('shipperPhone', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={values.shipperEmail || ''}
                  onChange={(e) => handleFieldChange('shipperEmail', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Consignee Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Consignee Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Consignee Name"
                  value={values.consigneeName || ''}
                  onChange={(e) => handleFieldChange('consigneeName', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={values.consigneeAddress || ''}
                  onChange={(e) => handleFieldChange('consigneeAddress', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={values.consigneePhone || ''}
                  onChange={(e) => handleFieldChange('consigneePhone', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={values.consigneeEmail || ''}
                  onChange={(e) => handleFieldChange('consigneeEmail', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

/**
 * Route Details Tab Component
 */
const RouteDetailsTab = memo(({
  values,
  handleFieldChange
}) => {
  const airports = awbService.getAirportOptions();

  return (
    <Grid container spacing={3}>
      {/* Origin Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FlightTakeoffIcon sx={{ mr: 1 }} />
              Origin Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Origin City/Country"
                  value={values.origin || ''}
                  onChange={(e) => handleFieldChange('origin', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={airports}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={airports.find(airport => airport.code === values.originAirport) || null}
                  onChange={(event, newValue) => {
                    handleFieldChange('originAirport', newValue?.code || '');
                    handleFieldChange('originCountry', newValue?.country || '');
                    if (newValue && !values.origin) {
                      handleFieldChange('origin', newValue.city);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Origin Airport" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Origin Country"
                  value={values.originCountry || 'Indonesia'}
                  onChange={(e) => handleFieldChange('originCountry', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Destination Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FlightLandIcon sx={{ mr: 1 }} />
              Destination Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Destination City/Country"
                  value={values.destination || ''}
                  onChange={(e) => handleFieldChange('destination', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={airports}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={airports.find(airport => airport.code === values.destinationAirport) || null}
                  onChange={(event, newValue) => {
                    handleFieldChange('destinationAirport', newValue?.code || '');
                    handleFieldChange('destinationCountry', newValue?.country || '');
                    if (newValue && !values.destination) {
                      handleFieldChange('destination', newValue.city);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Destination Airport" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Destination Country"
                  value={values.destinationCountry || ''}
                  onChange={(e) => handleFieldChange('destinationCountry', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Flight Details */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FlightIcon sx={{ mr: 1 }} />
              Flight Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Carrier</InputLabel>
                  <Select
                    value={values.carrier || ''}
                    onChange={(e) => handleFieldChange('carrier', e.target.value)}
                    label="Carrier"
                  >
                    {awbService.getCarrierOptions().map(carrier => (
                      <MenuItem key={carrier} value={carrier}>{carrier}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Flight Number"
                  value={values.flightNumber || ''}
                  onChange={(e) => handleFieldChange('flightNumber', e.target.value)}
                  placeholder="e.g. GA123"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Flight Date"
                  type="date"
                  value={values.flightDate || ''}
                  onChange={(e) => handleFieldChange('flightDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Flight Time"
                  type="time"
                  value={values.flightTime || ''}
                  onChange={(e) => handleFieldChange('flightTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Routing Instructions"
                  multiline
                  rows={2}
                  value={values.routing || ''}
                  onChange={(e) => handleFieldChange('routing', e.target.value)}
                  placeholder="Special routing instructions or connections"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

/**
 * Cargo Details Tab Component
 */
const CargoDetailsTab = memo(({
  values,
  handleFieldChange
}) => {
  return (
    <Grid container spacing={3}>
      {/* Weight and Dimensions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚖️ Weight & Dimensions
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Number of Pieces"
                  type="number"
                  value={values.pieces || 0}
                  onChange={(e) => handleFieldChange('pieces', parseInt(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={values.weight || 0}
                  onChange={(e) => handleFieldChange('weight', parseFloat(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Volume (cbm)"
                  type="number"
                  value={values.volume || 0}
                  onChange={(e) => handleFieldChange('volume', parseFloat(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Chargeable Weight (kg)"
                  type="number"
                  value={values.chargeableWeight || 0}
                  onChange={(e) => handleFieldChange('chargeableWeight', parseFloat(e.target.value) || 0)}
                  helperText="Auto-calculated from actual weight and volume"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dimensions"
                  value={values.dimensions || ''}
                  onChange={(e) => handleFieldChange('dimensions', e.target.value)}
                  placeholder="e.g. 100x80x60 cm, 3 pieces"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Special Handling */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚠️ Special Handling Requirements
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.dangerousGoods || false}
                      onChange={(e) => handleFieldChange('dangerousGoods', e.target.checked)}
                    />
                  }
                  label="Dangerous Goods"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="DG Class"
                  value={values.dgClass || ''}
                  onChange={(e) => handleFieldChange('dgClass', e.target.value)}
                  placeholder="e.g. 3, 8, 9"
                  disabled={!values.dangerousGoods}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Temperature Requirement"
                  value={values.temperature || ''}
                  onChange={(e) => handleFieldChange('temperature', e.target.value)}
                  placeholder="e.g. 2-8°C, Frozen, Room Temperature"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Instructions"
                  multiline
                  rows={3}
                  value={values.specialInstructions || ''}
                  onChange={(e) => handleFieldChange('specialInstructions', e.target.value)}
                  placeholder="Any special handling instructions for this shipment"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

/**
 * Cost Details Tab Component
 */
const CostDetailsTab = memo(({
  values,
  handleFieldChange
}) => {
  return (
    <Grid container spacing={3}>
      {/* Cost Breakdown */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💰 Cost Breakdown
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Freight Charge"
                  type="number"
                  value={values.freightCharge || 0}
                  onChange={(e) => handleFieldChange('freightCharge', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>Rp</Typography>
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fuel Surcharge"
                  type="number"
                  value={values.fuelSurcharge || 0}
                  onChange={(e) => handleFieldChange('fuelSurcharge', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>Rp</Typography>
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Security Surcharge"
                  type="number"
                  value={values.securitySurcharge || 0}
                  onChange={(e) => handleFieldChange('securitySurcharge', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>Rp</Typography>
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Other Charges"
                  type="number"
                  value={values.otherCharges || 0}
                  onChange={(e) => handleFieldChange('otherCharges', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>Rp</Typography>
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    Total Charge:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(values.totalCharge || 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={values.currency || 'IDR'}
                    onChange={(e) => handleFieldChange('currency', e.target.value)}
                    label="Currency"
                  >
                    <MenuItem value="IDR">🇮🇩 IDR - Indonesian Rupiah</MenuItem>
                    <MenuItem value="USD">🇺🇸 USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">🇪🇺 EUR - Euro</MenuItem>
                    <MenuItem value="SGD">🇸🇬 SGD - Singapore Dollar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

/**
 * Tracking History Tab Component
 */
const TrackingHistoryTab = memo(({ awb }) => {
  const trackingHistory = awb?.trackingHistory || [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TimelineIcon sx={{ mr: 1 }} />
              Tracking History
            </Typography>
            
            {trackingHistory.length > 0 ? (
              <List>
                {trackingHistory.map((entry, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: entry.status === 'Delivered' ? 'success.main' : 
                                 entry.status === 'Exception' ? 'error.main' : 'primary.main'
                        }}
                      >
                        {entry.status === 'Delivered' ? <CheckCircleIcon /> :
                         entry.status === 'Exception' ? <WarningIcon /> :
                         <ScheduleIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {entry.status}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(entry.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          {entry.location && (
                            <Typography variant="body2" color="textSecondary">
                              📍 {entry.location}
                            </Typography>
                          )}
                          {entry.notes && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {entry.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                No tracking history available yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

/**
 * Main AWB Management Component
 */
const AWBManagement = () => {
  const [awbs, setAWBs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedAWB, setSelectedAWB] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use AWB form hook
  const formHook = useAWBForm(selectedAWB);
  const { values, activeTab, snackbar, setActiveTab, setSnackbar, handleFieldChange } = formHook;

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const awbData = awbService.getAll();
        setAWBs(awbData);

        if (quotationService?.getAll) {
          const quotationData = quotationService.getAll() || [];
          setQuotations(quotationData);
        }

        if (customerService?.getAll) {
          const customerData = customerService.getAll() || [];
          setCustomers(customerData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Filter AWBs
  const filteredAWBs = useMemo(() => {
    if (!searchTerm) return awbs;
    
    return awbs.filter(awb =>
      awb.awbNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awb.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awb.consigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awb.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awb.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [awbs, searchTerm]);

  // Handlers
  const handleAdd = useCallback(() => {
    setSelectedAWB(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((awb) => {
    setSelectedAWB(awb);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async (awbData) => {
    try {
      if (selectedAWB) {
        // Update existing AWB
        const updatedAWB = awbService.update(selectedAWB.id, awbData);
        setSnackbar({ open: true, message: 'AWB updated successfully', severity: 'success' });
        setDialogOpen(false);
        
        // Refresh data
        const updatedData = awbService.getAll();
        setAWBs(updatedData);
        return updatedAWB;
      } else {
        // Create new AWB
        const newAWB = awbService.create(awbData);
        setSnackbar({ open: true, message: `AWB ${newAWB.awbNumber} created successfully`, severity: 'success' });
        setDialogOpen(false);
        
        // Refresh data
        const updatedData = awbService.getAll();
        setAWBs(updatedData);
        return newAWB;
      }
    } catch (error) {
      setSnackbar({ open: true, message: `Error saving AWB: ${error.message}`, severity: 'error' });
    }
  }, [selectedAWB, setSnackbar]);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this AWB?')) {
      try {
        awbService.delete(id);
        setSnackbar({ open: true, message: 'AWB deleted successfully', severity: 'success' });
        setAWBs(awbService.getAll());
      } catch (error) {
        setSnackbar({ open: true, message: `Error deleting AWB: ${error.message}`, severity: 'error' });
      }
    }
  }, [setSnackbar]);

  // Export functions
  const exportToPDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Air Waybill (AWB) Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
      
      let yPos = 55;
      filteredAWBs.forEach((awb) => {
        doc.text(`AWB Number: ${awb.awbNumber}`, 20, yPos);
        doc.text(`Customer: ${awb.customerName}`, 20, yPos + 10);
        doc.text(`Route: ${awb.origin} → ${awb.destination}`, 20, yPos + 20);
        doc.text(`Weight: ${awb.weight} kg, Pieces: ${awb.pieces}`, 20, yPos + 30);
        doc.text(`Total Charge: ${formatCurrency(awb.totalCharge || 0)}`, 20, yPos + 40);
        doc.text(`Status: ${awb.status}`, 20, yPos + 50);
        yPos += 70;
      });
      
      doc.save('AWB_Report.pdf');
      setSnackbar({ open: true, message: 'PDF exported successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export PDF', severity: 'error' });
    }
  }, [filteredAWBs, setSnackbar]);

  const exportToExcel = useCallback(() => {
    try {
      const workbook = XLSX.utils.book_new();
      const data = awbService.exportToExcel();
      const sheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, sheet, 'AWB Summary');
      XLSX.writeFile(workbook, 'AWB_Report.xlsx');
      setSnackbar({ open: true, message: 'Excel exported successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export Excel', severity: 'error' });
    }
  }, [setSnackbar]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Shipped': return 'info';
      case 'In Transit': return 'warning';
      case 'Exception': return 'error';
      case 'Cancelled': return 'error';
      default: return 'primary';
    }
  };

  const steps = [
    'AWB Details',
    'Route & Flight',
    'Cargo Details',
    'Cost Details',
    'Tracking History'
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">📦 AWB Management</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={exportToPDF}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExcelIcon />}
            onClick={exportToExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            New AWB
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search AWBs..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total AWBs
              </Typography>
              <Typography variant="h4" color="primary">
                {awbs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active AWBs
              </Typography>
              <Typography variant="h4" color="success.main">
                {awbs.filter(awb => !['Delivered', 'Cancelled'].includes(awb.status)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(awbs.reduce((sum, awb) => sum + (awb.totalCharge || 0), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Host/Master Ratio
              </Typography>
              <Typography variant="h4" color="info.main">
                {awbs.filter(awb => awb.awbType === 'Host').length}/{awbs.filter(awb => awb.awbType === 'Master').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AWBs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>AWB Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAWBs.map((awb) => (
              <TableRow key={awb.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{awb.awbNumber}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(awb.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={awb.awbType}
                    size="small"
                    color={awb.awbType === 'Host' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{awb.customerName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {awb.consigneeName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{awb.origin}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    → {awb.destination}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{awb.weight} kg</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {awb.pieces} pieces
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatCurrency(awb.totalCharge || 0)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={awb.status}
                    color={getStatusColor(awb.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(awb)}
                      color="primary"
                      title="Edit AWB"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(awb.id)}
                      color="error"
                      title="Delete AWB"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* AWB Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedAWB ? 'Edit AWB' : 'Create New AWB'}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ width: '100%', mt: 2 }}>
            <Stepper activeStep={activeTab} alternativeLabel sx={{ mb: 3 }}>
              {steps.map((label, index) => (
                <Step key={`step-${index}`}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 3 }}>
              {activeTab === 0 && (
                <AWBDetailsTab
                  values={values}
                  handleFieldChange={handleFieldChange}
                  customers={customers}
                  quotations={quotations}
                />
              )}

              {activeTab === 1 && (
                <RouteDetailsTab
                  values={values}
                  handleFieldChange={handleFieldChange}
                />
              )}

              {activeTab === 2 && (
                <CargoDetailsTab
                  values={values}
                  handleFieldChange={handleFieldChange}
                />
              )}

              {activeTab === 3 && (
                <CostDetailsTab
                  values={values}
                  handleFieldChange={handleFieldChange}
                />
              )}

              {activeTab === 4 && (
                <TrackingHistoryTab awb={selectedAWB} />
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeTab > 0 && (
            <Button onClick={() => setActiveTab(prev => prev - 1)}>
              Previous
            </Button>
          )}
          {activeTab < steps.length - 1 ? (
            <Button onClick={() => setActiveTab(prev => prev + 1)} variant="contained">
              Next
            </Button>
          ) : (
            <Button
              onClick={() => handleSave(values)}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              {selectedAWB ? 'Update' : 'Create'} AWB
            </Button>
          )}
        </DialogActions>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Dialog>
    </Box>
  );
};

export default AWBManagement;