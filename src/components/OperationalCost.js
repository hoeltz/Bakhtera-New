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
  Calculate as CalculateIcon,
  LocalShipping as ShippingIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Approval as ApprovalIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  AccessTime as AccessTimeIcon,
  Verified as VerifiedIcon,
  Assignment as AssignmentIcon,
  Flight as FlightIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import {
  operationalCostService,
  quotationService,
  customerService,
} from '../services/localStorage';
import notificationService from '../services/notificationService';
import {
  formatCurrency,
  formatCurrencyInput,
  formatNumber
} from '../services/currencyUtils';
import awbService from '../services/awbService';

/**
 * Custom hook for Operational Cost form management
 */
const useOperationalCostForm = (initialValues = {}, validationRules = {}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Memoized initial form values
  const defaultValues = useMemo(() => ({
    // Link to Quotation
    quotationId: '',
    quotationNumber: '',
    customerName: '',
    customerId: '',
    customerType: 'Corporate',
    
    // AWB Integration
    awbIds: [],
    selectedAWBs: [],
    hasAWB: false,
    
    // Route & Service Information (from quotation)
    routeType: 'Domestic',
    origin: '',
    destination: '',
    serviceType: 'Sea Freight',
    packageType: 'FCL',
    priority: 'Normal',
    
    // Shipment Information
    containerType: '20DC',
    containerNumber: '',
    sealNumber: '',
    shipmentDate: '',
    estimatedDeliveryDate: '',
    
    // Cargo Items (synchronized from quotation)
    cargoItems: [],
    
    // Cost Categories - Actual vs Quotation
    costCategories: {
      origin: {
        quotationCost: 0,
        actualCost: 0,
        variance: 0,
        variancePercentage: 0,
        status: 'Pending',
        items: []
      },
      freight: {
        quotationCost: 0,
        actualCost: 0,
        variance: 0,
        variancePercentage: 0,
        status: 'Pending',
        items: []
      },
      destination: {
        quotationCost: 0,
        actualCost: 0,
        variance: 0,
        variancePercentage: 0,
        status: 'Pending',
        items: []
      },
      additional: {
        quotationCost: 0,
        actualCost: 0,
        variance: 0,
        variancePercentage: 0,
        status: 'Pending',
        items: []
      }
    },
    
    // Financial Summary
    totalQuotationValue: 0,
    totalActualCost: 0,
    totalVariance: 0,
    totalVariancePercentage: 0,
    projectedMargin: 0,
    marginImpact: 0,
    
    // Status & Tracking
    status: 'Active',
    overallProfitability: 'Normal',
    varianceApprovalRequired: false,
    varianceApprovalStatus: 'Pending',
    
    // Milestone Tracking
    milestones: [],
    
    // Documentation
    supportingDocuments: [],
    
    // Performance Metrics
    performanceMetrics: {
      costEfficiency: 0,
      timeEfficiency: 0,
      qualityScore: 0,
      customerSatisfaction: 0
    },
    
    // Approval Workflow
    approvalChain: [],
    currentApprovalStage: 0,
    
    // Notifications & Alerts
    alerts: [],
    varianceThresholds: {
      warning: 5, // 5% variance warning
      critical: 10 // 10% variance critical
    },
    
    // Notes & Comments
    notes: '',
    operationalNotes: '',
    
    // System Fields
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), []);

  const formValues = { ...defaultValues, ...initialValues };

  // Enhanced cost calculation with variance analysis
  const calculateVariances = useCallback(() => {
    const categories = formValues.costCategories;
    const updatedCategories = { ...categories };
    
    let totalQuotationCost = 0;
    let totalActualCost = 0;
    
    // Calculate variance for each category
    Object.keys(updatedCategories).forEach(category => {
      const categoryData = updatedCategories[category];
      const quotationCost = categoryData.quotationCost || 0;
      const actualCost = categoryData.actualCost || 0;
      const variance = actualCost - quotationCost;
      const variancePercentage = quotationCost > 0 ? (variance / quotationCost) * 100 : 0;
      
      updatedCategories[category] = {
        ...categoryData,
        variance,
        variancePercentage,
        status: Math.abs(variancePercentage) >= formValues.varianceThresholds?.critical ? 'Critical' :
               Math.abs(variancePercentage) >= formValues.varianceThresholds?.warning ? 'Warning' : 'Normal'
      };
      
      totalQuotationCost += quotationCost;
      totalActualCost += actualCost;
    });
    
    const totalVariance = totalActualCost - totalQuotationCost;
    const totalVariancePercentage = totalQuotationCost > 0 ? (totalVariance / totalQuotationCost) * 100 : 0;
    const marginImpact = totalVariance;
    const projectedMargin = (formValues.totalQuotationValue || 0) - totalActualCost;
    
    return {
      costCategories: updatedCategories,
      totalQuotationCost,
      totalActualCost,
      totalVariance,
      totalVariancePercentage,
      marginImpact,
      projectedMargin,
      overallVarianceStatus: Math.abs(totalVariancePercentage) >= formValues.varianceThresholds?.critical ? 'Critical' :
                            Math.abs(totalVariancePercentage) >= formValues.varianceThresholds?.warning ? 'Warning' : 'Normal'
    };
  }, [formValues]);

  const varianceData = useMemo(() => calculateVariances(), [calculateVariances]);

  // Cargo items management
  const addCargoItem = useCallback(() => {
    const newItem = {
      id: `cargo_${Date.now()}`,
      description: '',
      weight: 0,
      volume: 0,
      value: 0,
      currency: 'IDR',
      hsCode: '',
      
      // Quotation costs (read-only)
      quotationCosts: {
        basicFreight: 0,
        pickupCharge: 0,
        exportDocumentationFee: 0,
        originTHC: 0,
        insuranceCost: 0
      },
      
      // Actual costs (editable)
      actualCosts: {
        basicFreight: 0,
        pickupCharge: 0,
        exportDocumentationFee: 0,
        originTHC: 0,
        insuranceCost: 0,
        
        // Additional costs
        additionalCosts: []
      },
      
      // Variance tracking
      variance: 0,
      variancePercentage: 0,
      status: 'Pending',
      
      createdAt: new Date().toISOString()
    };
    
    return {
      ...formValues,
      cargoItems: [...(formValues.cargoItems || []), newItem]
    };
  }, [formValues]);

  const updateCargoItem = useCallback((itemId, field, value) => {
    const updatedItems = (formValues.cargoItems || []).map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    
    return {
      ...formValues,
      cargoItems: updatedItems
    };
  }, [formValues]);

  const removeCargoItem = useCallback((itemId) => {
    const filteredItems = (formValues.cargoItems || []).filter(item => item.id !== itemId);
    
    return {
      ...formValues,
      cargoItems: filteredItems
    };
  }, [formValues]);

  // Cost item management per category
  const addCostItem = useCallback((category, costType = 'general') => {
    const newItem = {
      id: `${category}_${Date.now()}`,
      description: '',
      amount: 0,
      currency: 'IDR',
      costType,
      vendorName: '',
      invoiceNumber: '',
      dueDate: '',
      status: 'Pending',
      actualAmount: 0,
      variance: 0,
      variancePercentage: 0,
      approved: false,
      approvedBy: '',
      approvedAt: '',
      notes: '',
      createdAt: new Date().toISOString()
    };
    
    const updatedCategories = {
      ...formValues.costCategories,
      [category]: {
        ...formValues.costCategories[category],
        items: [...(formValues.costCategories[category]?.items || []), newItem]
      }
    };
    
    return {
      ...formValues,
      costCategories: updatedCategories
    };
  }, [formValues]);

  const updateCostItem = useCallback((category, itemId, field, value) => {
    const updatedCategories = {
      ...formValues.costCategories,
      [category]: {
        ...formValues.costCategories[category],
        items: (formValues.costCategories[category]?.items || []).map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }
    };
    
    return {
      ...formValues,
      costCategories: updatedCategories
    };
  }, [formValues]);

  const removeCostItem = useCallback((category, itemId) => {
    const updatedCategories = {
      ...formValues.costCategories,
      [category]: {
        ...formValues.costCategories[category],
        items: (formValues.costCategories[category]?.items || []).filter(item => item.id !== itemId)
      }
    };
    
    return {
      ...formValues,
      costCategories: updatedCategories
    };
  }, [formValues]);

  // Milestone management
  const addMilestone = useCallback(() => {
    const newMilestone = {
      id: `milestone_${Date.now()}`,
      title: '',
      description: '',
      targetDate: '',
      completedDate: '',
      status: 'Pending',
      responsiblePerson: '',
      completionPercentage: 0,
      notes: '',
      createdAt: new Date().toISOString()
    };
    
    return {
      ...formValues,
      milestones: [...(formValues.milestones || []), newMilestone]
    };
  }, [formValues]);

  const updateMilestone = useCallback((milestoneId, field, value) => {
    const updatedMilestones = (formValues.milestones || []).map(milestone =>
      milestone.id === milestoneId ? { ...milestone, [field]: value } : milestone
    );
    
    return {
      ...formValues,
      milestones: updatedMilestones
    };
  }, [formValues]);

  const removeMilestone = useCallback((milestoneId) => {
    const filteredMilestones = (formValues.milestones || []).filter(milestone => milestone.id !== milestoneId);
    
    return {
      ...formValues,
      milestones: filteredMilestones
    };
  }, [formValues]);

  return {
    // Form state
    values: { ...formValues, ...varianceData },
    activeTab,
    snackbar,
    varianceData,

    // Form actions
    setActiveTab,
    setSnackbar,
    
    // Cargo items management
    addCargoItem,
    updateCargoItem,
    removeCargoItem,
    
    // Cost items management
    addCostItem,
    updateCostItem,
    removeCostItem,
    
    // Milestone management
    addMilestone,
    updateMilestone,
    removeMilestone,
  };
};

/**
 * AWB Management Tab Component
 */
const AWBManagementTab = memo(({
  values,
  handleFieldChange
}) => {
  const [availableAWBs, setAvailableAWBs] = useState([]);
  const [showAWBDialog, setShowAWBDialog] = useState(false);

  useEffect(() => {
    // Load available AWBs
    const awbs = awbService.getAll();
    setAvailableAWBs(awbs);
  }, []);

  const selectedAWBs = useMemo(() => {
    return (values.awbIds || []).map(awbId => 
      availableAWBs.find(awb => awb.id === awbId)
    ).filter(Boolean);
  }, [values.awbIds, availableAWBs]);

  const handleAddAWB = useCallback((awb) => {
    const newAWBIds = [...(values.awbIds || []), awb.id];
    const newSelectedAWBs = [...(values.selectedAWBs || []), awb];
    
    handleFieldChange('awbIds', newAWBIds);
    handleFieldChange('selectedAWBs', newSelectedAWBs);
    handleFieldChange('hasAWB', true);
    
    setShowAWBDialog(false);
  }, [values.awbIds, values.selectedAWBs, handleFieldChange]);

  const handleRemoveAWB = useCallback((awbId) => {
    const newAWBIds = (values.awbIds || []).filter(id => id !== awbId);
    const newSelectedAWBs = (values.selectedAWBs || []).filter(awb => awb.id !== awbId);
    
    handleFieldChange('awbIds', newAWBIds);
    handleFieldChange('selectedAWBs', newSelectedAWBs);
    handleFieldChange('hasAWB', newAWBIds.length > 0);
  }, [values.awbIds, values.selectedAWBs, handleFieldChange]);

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                <FlightIcon sx={{ mr: 1 }} />
                AWB Integration
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowAWBDialog(true)}
                size="small"
              >
                Add AWB
              </Button>
            </Box>

            {selectedAWBs.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>AWB Number</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Route</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedAWBs.map((awb) => (
                      <TableRow key={awb.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{awb.awbNumber}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={awb.awbType}
                            size="small"
                            color={awb.awbType === 'Host' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{awb.origin}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            → {awb.destination}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{awb.weight} kg</Typography>
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
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveAWB(awb.id)}
                            color="error"
                            title="Remove AWB"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  No AWBs linked to this operational cost
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAWBDialog(true)}
                >
                  Add First AWB
                </Button>
              </Box>
            )}

            {/* AWB Selection Dialog */}
            <Dialog open={showAWBDialog} onClose={() => setShowAWBDialog(false)} maxWidth="md" fullWidth>
              <DialogTitle>Select AWB</DialogTitle>
              <DialogContent>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>AWB Number</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Route</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableAWBs
                        .filter(awb => !values.awbIds?.includes(awb.id))
                        .map((awb) => (
                          <TableRow key={awb.id} hover>
                            <TableCell>
                              <Typography variant="subtitle2">{awb.awbNumber}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{awb.customerName}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{awb.origin} → {awb.destination}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={awb.status}
                                color={getStatusColor(awb.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleAddAWB(awb)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowAWBDialog(false)}>Cancel</Button>
              </DialogActions>
            </Dialog>
          </CardContent>
        </Card>
      </Grid>

      {/* AWB Cost Integration */}
      {selectedAWBs.length > 0 && (
        <>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LocationOn sx={{ mr: 1 }} />
                  AWB Cost Integration
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="primary">
                        {selectedAWBs.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total AWBs
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="success.main">
                        {selectedAWBs.filter(awb => awb.status === 'Delivered').length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Delivered
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="warning.main">
                        {selectedAWBs.reduce((sum, awb) => sum + (awb.weight || 0), 0)} kg
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Weight
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="error.main">
                        {formatCurrency(selectedAWBs.reduce((sum, awb) => sum + (awb.totalCharge || 0), 0))}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Value
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* AWB Detailed Cost Breakdown */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AnalyticsIcon sx={{ mr: 1 }} />
                  AWB Cost Breakdown
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>AWB Number</TableCell>
                        <TableCell>Freight Charge</TableCell>
                        <TableCell>Fuel Surcharge</TableCell>
                        <TableCell>Security Surcharge</TableCell>
                        <TableCell>Other Charges</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Weight</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAWBs.map((awb) => (
                        <TableRow key={awb.id}>
                          <TableCell>
                            <Typography variant="subtitle2">{awb.awbNumber}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {awb.origin} → {awb.destination}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(awb.freightCharge || 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(awb.fuelSurcharge || 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(awb.securitySurcharge || 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(awb.otherCharges || 0)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" color="primary">
                              {formatCurrency(awb.totalCharge || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {awb.weight} kg
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Total Row */}
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(selectedAWBs.reduce((sum, awb) => sum + (awb.freightCharge || 0), 0))}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(selectedAWBs.reduce((sum, awb) => sum + (awb.fuelSurcharge || 0), 0))}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(selectedAWBs.reduce((sum, awb) => sum + (awb.securitySurcharge || 0), 0))}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(selectedAWBs.reduce((sum, awb) => sum + (awb.otherCharges || 0), 0))}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {formatCurrency(selectedAWBs.reduce((sum, awb) => sum + (awb.totalCharge || 0), 0))}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          {selectedAWBs.reduce((sum, awb) => sum + (awb.weight || 0), 0)} kg
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* AWB Status Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <ScheduleIcon sx={{ mr: 1 }} />
                  Status Distribution
                </Typography>
                
                <Box>
                  {['Created', 'Received', 'Processed', 'In Transit', 'Arrived', 'Delivered', 'Exception'].map((status) => {
                    const count = selectedAWBs.filter(awb => awb.status === status).length;
                    const percentage = selectedAWBs.length > 0 ? (count / selectedAWBs.length) * 100 : 0;
                    
                    if (count === 0) return null;
                    
                    return (
                      <Box key={status} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{status}</Typography>
                          <Typography variant="body2" color="primary">{count} ({percentage.toFixed(0)}%)</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* AWB Analytics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  Performance Metrics
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Delivery Success Rate"
                      secondary={`${(selectedAWBs.filter(awb => awb.status === 'Delivered').length / selectedAWBs.length * 100).toFixed(0)}%`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon><AccessTimeIcon color="warning" /></ListItemIcon>
                    <ListItemText 
                      primary="Average Weight per AWB"
                      secondary={`${(selectedAWBs.reduce((sum, awb) => sum + (awb.weight || 0), 0) / selectedAWBs.length).toFixed(1)} kg`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon><AttachMoneyIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Average Value per AWB"
                      secondary={`${formatCurrency(selectedAWBs.reduce((sum, awb) => sum + (awb.totalCharge || 0), 0) / selectedAWBs.length)}`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon><BusinessIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Host vs Master Ratio"
                      secondary={`${selectedAWBs.filter(awb => awb.awbType === 'Host').length}:${selectedAWBs.filter(awb => awb.awbType === 'Master').length}`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
});

/**
 * Quotation Selection Tab Component
 */
const QuotationSelectionTab = memo(({
  values,
  handleFieldChange,
  getFieldProps
}) => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Load quotations and customers
    const loadedQuotations = quotationService.getAll() || [];
    const loadedCustomers = customerService.getAll() || [];
    setQuotations(loadedQuotations);
    setCustomers(loadedCustomers);
  }, []);

  const selectedQuotation = quotations.find(q => q.id === values.quotationId);

  const handleQuotationSelect = useCallback((quotation) => {
    if (!quotation) return;
    
    // Sync data from quotation
    const syncedData = {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      customerName: quotation.customerName,
      customerId: quotation.customerId,
      customerType: quotation.customerType,
      routeType: quotation.routeType,
      origin: quotation.origin,
      destination: quotation.destination,
      serviceType: quotation.serviceType,
      packageType: quotation.packageType,
      priority: quotation.priority,
      cargoItems: quotation.cargoItems || [],
      totalQuotationValue: quotation.sellingPrice || 0,
      
      // Initialize cost categories with quotation data
      costCategories: {
        origin: {
          quotationCost: (quotation.cargoItems || []).reduce((sum, item) => 
            sum + (item.pickupCharge || 0) + (item.exportDocumentationFee || 0) + (item.originTHC || 0), 0),
          actualCost: 0,
          variance: 0,
          variancePercentage: 0,
          status: 'Pending',
          items: []
        },
        freight: {
          quotationCost: (quotation.cargoItems || []).reduce((sum, item) => 
            sum + (item.basicFreight || 0) + (item.bunkerSurcharge || 0), 0),
          actualCost: 0,
          variance: 0,
          variancePercentage: 0,
          status: 'Pending',
          items: []
        },
        destination: {
          quotationCost: (quotation.cargoItems || []).reduce((sum, item) => 
            sum + (item.importDocumentationFee || 0) + (item.destinationTHC || 0), 0),
          actualCost: 0,
          variance: 0,
          variancePercentage: 0,
          status: 'Pending',
          items: []
        },
        additional: {
          quotationCost: (quotation.cargoItems || []).reduce((sum, item) => 
            sum + (item.insuranceCost || 0) + (item.storageFee || 0) + (item.detentionFee || 0), 0),
          actualCost: 0,
          variance: 0,
          variancePercentage: 0,
          status: 'Pending',
          items: []
        }
      }
    };
    
    // Update form values
    Object.keys(syncedData).forEach(key => {
      handleFieldChange(key, syncedData[key]);
    });
  }, [handleFieldChange]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Select Quotation to Track
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Choose an approved quotation to start tracking operational costs and variances
            </Typography>
            
            <Autocomplete
              options={quotations.filter(q => q.status === 'Approved')}
              getOptionLabel={(option) => `${option.quotationNumber} - ${option.customerName}`}
              value={selectedQuotation || null}
              onChange={(event, newValue) => {
                handleQuotationSelect(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search and Select Quotation"
                  placeholder="Type to search quotations..."
                  {...getFieldProps('quotationId')}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="subtitle1">{option.quotationNumber}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {option.customerName} • {option.origin} → {option.destination}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Value: {formatCurrency(option.sellingPrice || 0)}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          </CardContent>
        </Card>
      </Grid>

      {selectedQuotation && (
        <>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Quotation Summary
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><BusinessIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Customer" 
                      secondary={`${selectedQuotation.customerName} (${selectedQuotation.customerType})`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><ShippingIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Route" 
                      secondary={`${selectedQuotation.origin} → ${selectedQuotation.destination}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalculateIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Service" 
                      secondary={`${selectedQuotation.serviceType} • ${selectedQuotation.packageType}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AttachMoneyIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Quotation Value" 
                      secondary={formatCurrency(selectedQuotation.sellingPrice || 0)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📦 Cargo Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Total Items" 
                      secondary={`${(selectedQuotation.cargoItems || []).length} items`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Total Weight" 
                      secondary={`${(selectedQuotation.cargoItems || []).reduce((sum, item) => sum + (item.weight || 0), 0)} kg`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Total Volume" 
                      secondary={`${(selectedQuotation.cargoItems || []).reduce((sum, item) => sum + (item.volume || 0), 0)} cbm`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Total Value" 
                      secondary={formatCurrency((selectedQuotation.cargoItems || []).reduce((sum, item) => sum + (item.value || 0), 0))}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
});

/**
 * Cost Tracking Tab Component
 */
const CostTrackingTab = memo(({
  values,
  addCostItem,
  updateCostItem,
  removeCostItem
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical': return 'error';
      case 'Warning': return 'warning';
      case 'Normal': return 'success';
      case 'Pending': return 'info';
      default: return 'default';
    }
  };

  const getVarianceIcon = (variance) => {
    if (variance > 0) return <TrendingUpIcon color="error" />;
    if (variance < 0) return <TrendingDownIcon color="success" />;
    return <CheckCircleIcon color="info" />;
  };

  const costCategories = [
    { key: 'origin', label: 'Origin Costs', icon: '🏢', description: 'Pickup, documentation, origin THC' },
    { key: 'freight', label: 'Freight Costs', icon: '🚢', description: 'Basic freight, surcharges' },
    { key: 'destination', label: 'Destination Costs', icon: '🏭', description: 'Import docs, destination THC, delivery' },
    { key: 'additional', label: 'Additional Costs', icon: '📋', description: 'Insurance, storage, detention' }
  ];

  return (
    <Box>
      {costCategories.map((category) => {
        const categoryData = values.costCategories?.[category.key] || {};
        return (
          <Accordion key={category.key} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    {category.icon} {category.label}
                  </Typography>
                  <Chip 
                    label={categoryData.status || 'Pending'} 
                    color={getStatusColor(categoryData.status)}
                    size="small"
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="textSecondary">
                    Quotation: {formatCurrency(categoryData.quotationCost || 0)}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    Actual: {formatCurrency(categoryData.actualCost || 0)}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {getVarianceIcon(categoryData.variance || 0)}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        ml: 1, 
                        color: (categoryData.variance || 0) >= 0 ? 'error.main' : 'success.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {formatCurrency(categoryData.variance || 0)} ({(categoryData.variancePercentage || 0).toFixed(1)}%)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {category.description}
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addCostItem(category.key)}
                    variant="outlined"
                    size="small"
                  >
                    Add Cost Item
                  </Button>
                </Box>

                {/* Cost Items Table */}
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell align="right">Quotation</TableCell>
                        <TableCell align="right">Actual</TableCell>
                        <TableCell align="right">Variance</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(categoryData.items || []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <TextField
                              value={item.description || ''}
                              onChange={(e) => updateCostItem(category.key, item.id, 'description', e.target.value)}
                              variant="standard"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.vendorName || ''}
                              onChange={(e) => updateCostItem(category.key, item.id, 'vendorName', e.target.value)}
                              variant="standard"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.amount || 0}
                              onChange={(e) => updateCostItem(category.key, item.id, 'amount', parseFloat(e.target.value) || 0)}
                              variant="standard"
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.actualAmount || 0}
                              onChange={(e) => {
                                const actualAmount = parseFloat(e.target.value) || 0;
                                const amount = item.amount || 0;
                                const variance = actualAmount - amount;
                                const variancePercentage = amount > 0 ? (variance / amount) * 100 : 0;
                                
                                updateCostItem(category.key, item.id, 'actualAmount', actualAmount);
                                updateCostItem(category.key, item.id, 'variance', variance);
                                updateCostItem(category.key, item.id, 'variancePercentage', variancePercentage);
                              }}
                              variant="standard"
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                color: (item.variance || 0) >= 0 ? 'error.main' : 'success.main',
                                fontWeight: 'bold'
                              }}
                            >
                              {formatCurrency(item.variance || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={item.approved || false}
                                  onChange={(e) => updateCostItem(category.key, item.id, 'approved', e.target.checked)}
                                  size="small"
                                />
                              }
                              label=""
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => removeCostItem(category.key, item.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!categoryData.items || categoryData.items.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="textSecondary">
                              No cost items added yet. Click "Add Cost Item" to get started.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
});

/**
 * Variance Analysis Tab Component
 */
const VarianceAnalysisTab = memo(({ values }) => {
  const totalQuotationCost = useMemo(() => {
    return Object.values(values.costCategories || {}).reduce((sum, category) => 
      sum + (category.quotationCost || 0), 0);
  }, [values.costCategories]);

  const totalActualCost = useMemo(() => {
    return Object.values(values.costCategories || {}).reduce((sum, category) => 
      sum + (category.actualCost || 0), 0);
  }, [values.costCategories]);

  const totalVariance = totalActualCost - totalQuotationCost;
  const variancePercentage = totalQuotationCost > 0 ? (totalVariance / totalQuotationCost) * 100 : 0;

  const getVarianceStatus = (percentage) => {
    const thresholds = values.varianceThresholds || { warning: 5, critical: 10 };
    if (Math.abs(percentage) >= thresholds.critical) return { color: 'error', label: 'Critical' };
    if (Math.abs(percentage) >= thresholds.warning) return { color: 'warning', label: 'Warning' };
    return { color: 'success', label: 'Normal' };
  };

  const varianceStatus = getVarianceStatus(variancePercentage);

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💰 Total Quotation Cost
                </Typography>
                <Typography variant="h4" color="primary">
                  {formatCurrency(totalQuotationCost)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💸 Total Actual Cost
                </Typography>
                <Typography variant="h4" color="error">
                  {formatCurrency(totalActualCost)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Total Variance
                </Typography>
                <Typography 
                  variant="h4" 
                  color={totalVariance >= 0 ? 'error' : 'success'}
                >
                  {formatCurrency(Math.abs(totalVariance))}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {totalVariance >= 0 ? 'Over Budget' : 'Under Budget'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Variance %
                </Typography>
                <Typography 
                  variant="h4" 
                  color={`${varianceStatus.color}.main`}
                >
                  {variancePercentage.toFixed(1)}%
                </Typography>
                <Chip 
                  label={varianceStatus.label} 
                  color={varianceStatus.color}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Detailed Analysis */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Detailed Variance Analysis
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cost Category</TableCell>
                    <TableCell align="right">Quotation</TableCell>
                    <TableCell align="right">Actual</TableCell>
                    <TableCell align="right">Variance</TableCell>
                    <TableCell align="right">Variance %</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Impact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(values.costCategories || {}).map(([key, category]) => {
                    const categoryVariance = (category.actualCost || 0) - (category.quotationCost || 0);
                    const categoryVariancePercentage = (category.quotationCost || 0) > 0 ? 
                      (categoryVariance / category.quotationCost) * 100 : 0;
                    const categoryStatus = getVarianceStatus(categoryVariancePercentage);
                    const impactWeight = Math.abs(categoryVariancePercentage) / Math.abs(variancePercentage) * 100;
                    
                    return (
                      <TableRow key={key}>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                            {key} Costs
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(category.quotationCost || 0)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(category.actualCost || 0)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2"
                            color={categoryVariance >= 0 ? 'error' : 'success'}
                            sx={{ fontWeight: 'bold' }}
                          >
                            {formatCurrency(categoryVariance)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2"
                            color={`${categoryStatus.color}.main`}
                            sx={{ fontWeight: 'bold' }}
                          >
                            {categoryVariancePercentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={categoryStatus.label} 
                            color={categoryStatus.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={`${impactWeight.toFixed(1)}% of total variance impact`}>
                            <Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={impactWeight}
                                sx={{ 
                                  width: 60, 
                                  height: 8,
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: categoryStatus.color === 'error' ? 'error.main' : 
                                                   categoryStatus.color === 'warning' ? 'warning.main' : 'success.main'
                                  }
                                }}
                              />
                              <Typography variant="caption">
                                {impactWeight.toFixed(0)}%
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Total Row */}
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(totalQuotationCost)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(totalActualCost)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      <Typography 
                        color={totalVariance >= 0 ? 'error' : 'success'}
                      >
                        {formatCurrency(totalVariance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      <Typography color={`${varianceStatus.color}.main`}>
                        {variancePercentage.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      <Chip 
                        label={varianceStatus.label} 
                        color={varianceStatus.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">100%</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Margin Impact Analysis */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💼 Margin Impact Analysis
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatCurrency(values.totalQuotationValue || 0)}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Original Quotation Value
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="error" gutterBottom>
                    {formatCurrency(totalActualCost)}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Total Actual Cost
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box textAlign="center" p={3}>
              <Typography variant="h3" color={totalVariance >= 0 ? 'error' : 'success'} gutterBottom>
                {formatCurrency((values.totalQuotationValue || 0) - totalActualCost)}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Projected Margin After Actual Costs
              </Typography>
              <Typography variant="body1" color={totalVariance >= 0 ? 'error' : 'success'}>
                {totalVariance >= 0 ? 'Margin Reduced by' : 'Margin Increased by'} {formatCurrency(Math.abs(totalVariance))}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

/**
 * Approval Workflow Tab Component
 */
const ApprovalWorkflowTab = memo(({ values, updateMilestone }) => {
  const approvalStages = [
    { id: 1, name: 'Initial Review', description: 'Review cost estimates and initial variances', required: true },
    { id: 2, name: 'Variance Analysis', description: 'Analyze significant cost variances', required: true },
    { id: 3, name: 'Management Approval', description: 'Get management approval for cost changes', required: true },
    { id: 4, name: 'Final Reconciliation', description: 'Final review and reconciliation', required: false }
  ];

  const getApprovalStatus = (stageId) => {
    if (values.currentApprovalStage > stageId) return 'completed';
    if (values.currentApprovalStage === stageId) return 'current';
    return 'pending';
  };

  return (
    <Grid container spacing={3}>
      {/* Approval Progress */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔄 Approval Workflow Progress
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              {approvalStages.map((stage, index) => {
                const status = getApprovalStatus(stage.id);
                return (
                  <Box key={stage.id} display="flex" flexDirection="column" alignItems="center" flex={1}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: status === 'completed' ? 'success.main' : 
                                       status === 'current' ? 'primary.main' : 'grey.300',
                        color: 'white',
                        mb: 1
                      }}
                    >
                      {status === 'completed' ? <CheckCircleIcon /> : stage.id}
                    </Avatar>
                    <Typography variant="subtitle2" align="center" gutterBottom>
                      {stage.name}
                    </Typography>
                    <Typography variant="caption" align="center" color="textSecondary">
                      {stage.description}
                    </Typography>
                    {stage.required && (
                      <Chip label="Required" size="small" color="primary" sx={{ mt: 1 }} />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Progress Bar */}
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Overall Progress: {((values.currentApprovalStage / approvalStages.length) * 100).toFixed(0)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(values.currentApprovalStage / approvalStages.length) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Milestone Tracking */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                🎯 Milestone Tracking
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => {/* Add milestone logic */}}
                variant="outlined"
                size="small"
              >
                Add Milestone
              </Button>
            </Box>

            <List>
              {(values.milestones || []).map((milestone) => (
                <ListItem key={milestone.id} divider>
                  <ListItemIcon>
                    <CheckCircleIcon color={milestone.status === 'Completed' ? 'success' : 'action'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={milestone.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {milestone.description}
                        </Typography>
                        <Typography variant="caption">
                          Target: {milestone.targetDate} • Responsible: {milestone.responsiblePerson}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2">
                        {milestone.completionPercentage}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={milestone.completionPercentage || 0}
                        sx={{ width: 80 }}
                      />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

/**
 * Performance Metrics Tab Component
 */
const PerformanceMetricsTab = memo(({ values }) => {
  const performanceData = values.performanceMetrics || {};

  const getMetricColor = (value, thresholds) => {
    if (value >= thresholds.excellent) return 'success';
    if (value >= thresholds.good) return 'warning';
    return 'error';
  };

  const getMetricLabel = (value, thresholds) => {
    if (value >= thresholds.excellent) return 'Excellent';
    if (value >= thresholds.good) return 'Good';
    return 'Needs Improvement';
  };

  const metrics = [
    {
      name: 'Cost Efficiency',
      value: performanceData.costEfficiency || 0,
      icon: <AttachMoneyIcon />,
      thresholds: { excellent: 90, good: 75 },
      description: 'How well actual costs align with budgeted costs'
    },
    {
      name: 'Time Efficiency',
      value: performanceData.timeEfficiency || 0,
      icon: <AccessTimeIcon />,
      thresholds: { excellent: 95, good: 80 },
      description: 'On-time completion of milestones and deliverables'
    },
    {
      name: 'Quality Score',
      value: performanceData.qualityScore || 0,
      icon: <VerifiedIcon />,
      thresholds: { excellent: 95, good: 85 },
      description: 'Overall quality of work and deliverables'
    },
    {
      name: 'Customer Satisfaction',
      value: performanceData.customerSatisfaction || 0,
      icon: <CheckCircleIcon />,
      thresholds: { excellent: 90, good: 80 },
      description: 'Customer feedback and satisfaction rating'
    }
  ];

  return (
    <Grid container spacing={3}>
      {/* Performance Overview */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Performance Overview
            </Typography>
            
            <Grid container spacing={3}>
              {metrics.map((metric) => {
                const color = getMetricColor(metric.value, metric.thresholds);
                const label = getMetricLabel(metric.value, metric.thresholds);
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={metric.name}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Typography variant="h6" color={`${color}.main`}>
                            {metric.name}
                          </Typography>
                          {metric.icon}
                        </Box>
                        
                        <Typography variant="h3" color={`${color}.main`} gutterBottom>
                          {metric.value.toFixed(0)}%
                        </Typography>
                        
                        <Chip 
                          label={label} 
                          color={color}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        
                        <Typography variant="body2" color="textSecondary">
                          {metric.description}
                        </Typography>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={metric.value}
                          color={color}
                          sx={{ mt: 2, height: 8, borderRadius: 4 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Analytics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📈 Cost Trend Analysis
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track cost performance over time
            </Typography>
            {/* Placeholder for cost trend chart */}
            <Box 
              height={200} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              bgcolor="grey.100"
              borderRadius={1}
              mt={2}
            >
              <Typography color="textSecondary">
                Cost trend chart will be displayed here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Key Performance Indicators
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Cost Variance"
                  secondary={`${((values.totalVariance / values.totalQuotationValue) * 100).toFixed(1)}% from budget`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Margin Impact"
                  secondary={`${formatCurrency(values.marginImpact)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Approval Status"
                  secondary={`${values.currentApprovalStage} of 4 stages completed`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Risk Level"
                  secondary={values.overallVarianceStatus || 'Low'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

/**
 * AWB Tracking Timeline Component
 */
const AWBTrackingTimeline = memo(({ awb }) => {
  const trackingEvents = [
    { status: 'Created', timestamp: awb?.createdAt, description: 'AWB record created', completed: true },
    { status: 'Received', timestamp: awb?.receivedAt, description: 'AWB received from shipper/carrier', completed: !!awb?.receivedAt },
    { status: 'Processed', timestamp: awb?.processedAt, description: 'AWB processed and verified', completed: !!awb?.processedAt },
    { status: 'In Transit', timestamp: awb?.departedAt, description: 'Cargo in transit', completed: !!awb?.departedAt },
    { status: 'Arrived', timestamp: awb?.arrivedAt, description: 'Arrived at destination', completed: !!awb?.arrivedAt },
    { status: 'Delivered', timestamp: awb?.deliveredAt, description: 'Successfully delivered', completed: !!awb?.deliveredAt }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <TimelineIcon sx={{ mr: 1 }} />
          AWB Tracking Timeline
        </Typography>
        
        <Box sx={{ position: 'relative' }}>
          {trackingEvents.map((event, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: event.completed ? 'success.main' : 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  zIndex: 1
                }}
              >
                {event.completed && <CheckCircleIcon sx={{ color: 'white', fontSize: 16 }} />}
              </Box>
              
              {index < trackingEvents.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 9,
                    top: 20,
                    width: 2,
                    height: 30,
                    backgroundColor: event.completed ? 'success.main' : 'grey.300',
                    zIndex: 0
                  }}
                />
              )}
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ color: event.completed ? 'success.main' : 'text.secondary' }}>
                  {event.status}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {event.description}
                </Typography>
                {event.timestamp && (
                  <Typography variant="caption" color="primary">
                    {new Date(event.timestamp).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

/**
 * Main OperationalCost Component
 */
const OperationalCost = () => {
  const [operationalCosts, setOperationalCosts] = useState([]);
  const [selectedCost, setSelectedCost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use operational cost form hook
  const formHook = useOperationalCostForm(selectedCost);

  const {
    values,
    activeTab,
    snackbar,
    setActiveTab,
    setSnackbar,
    addCargoItem,
    updateCargoItem,
    removeCargoItem,
    addCostItem,
    updateCostItem,
    removeCostItem,
    addMilestone,
    updateMilestone,
    removeMilestone,
  } = formHook;

  // Load operational costs
  useEffect(() => {
    const loadCosts = () => {
      const costs = operationalCostService.getAll() || [];
      setOperationalCosts(costs);
    };
    loadCosts();
  }, []);

  // Filter costs
  const filteredCosts = useMemo(() => {
    return operationalCosts.filter(cost =>
      cost.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [operationalCosts, searchTerm]);

  const handleAdd = useCallback(() => {
    setSelectedCost(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((cost) => {
    setSelectedCost(cost);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async (costData) => {
    try {
      if (selectedCost) {
        // Update existing cost
        const updatedCost = await operationalCostService.update(selectedCost.id, costData);
        if (updatedCost) {
          setSnackbar({ open: true, message: 'Operational cost updated successfully', severity: 'success' });
        }
      } else {
        // Create new cost
        const newCost = await operationalCostService.create(costData);
        if (newCost) {
          setSnackbar({ open: true, message: 'Operational cost created successfully', severity: 'success' });
        }
      }
      setDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: `Error saving operational cost: ${error.message}`, severity: 'error' });
    }
  }, [selectedCost, setSnackbar]);

  const handleDelete = useCallback(async (costId) => {
    if (window.confirm('Are you sure you want to delete this operational cost?')) {
      try {
        await operationalCostService.delete(costId);
        setSnackbar({ open: true, message: 'Operational cost deleted successfully', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: `Error deleting operational cost: ${error.message}`, severity: 'error' });
      }
    }
  }, [setSnackbar]);

  // Export functions
  const exportToPDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Operational Cost Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.text(`Quotation: ${values.quotationNumber}`, 20, 45);
      doc.text(`Customer: ${values.customerName}`, 20, 55);
      doc.text(`Route: ${values.origin} → ${values.destination}`, 20, 65);
      
      let yPos = 85;
      Object.entries(values.costCategories || {}).forEach(([key, category]) => {
        doc.text(`${key.toUpperCase()} COSTS:`, 20, yPos);
        yPos += 10;
        doc.text(`Quotation: ${formatCurrency(category.quotationCost || 0)}`, 30, yPos);
        yPos += 10;
        doc.text(`Actual: ${formatCurrency(category.actualCost || 0)}`, 30, yPos);
        yPos += 10;
        doc.text(`Variance: ${formatCurrency(category.variance || 0)}`, 30, yPos);
        yPos += 20;
      });
      
      doc.save(`OperationalCost_${values.quotationNumber}.pdf`);
      setSnackbar({ open: true, message: 'PDF exported successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export PDF', severity: 'error' });
    }
  }, [values, setSnackbar]);

  const exportToExcel = useCallback(() => {
    try {
      const workbook = XLSX.utils.book_new();
      const data = [{
        'Quotation Number': values.quotationNumber,
        'Customer': values.customerName,
        'Origin': values.origin,
        'Destination': values.destination,
        'Total Quotation': values.totalQuotationValue,
        'Total Actual Cost': values.totalActualCost,
        'Total Variance': values.totalVariance,
        'Variance %': values.totalVariancePercentage,
        'Status': values.status
      }];
      
      const sheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Operational Cost Summary');
      
      // Add AWB data sheet if available
      if (values.selectedAWBs && values.selectedAWBs.length > 0) {
        const awbData = values.selectedAWBs.map(awb => ({
          'AWB Number': awb.awbNumber,
          'AWB Type': awb.awbType,
          'Customer': awb.customerName,
          'Origin': awb.origin,
          'Destination': awb.destination,
          'Weight (kg)': awb.weight,
          'Freight Charge': awb.freightCharge,
          'Fuel Surcharge': awb.fuelSurcharge,
          'Security Surcharge': awb.securitySurcharge,
          'Other Charges': awb.otherCharges,
          'Total Charge': awb.totalCharge,
          'Status': awb.status,
          'Created Date': new Date(awb.createdAt).toLocaleDateString()
        }));
        
        const awbSheet = XLSX.utils.json_to_sheet(awbData);
        XLSX.utils.book_append_sheet(workbook, awbSheet, 'AWB Details');
      }
      
      XLSX.writeFile(workbook, `OperationalCost_${values.quotationNumber}.xlsx`);
      setSnackbar({ open: true, message: 'Excel exported successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export Excel', severity: 'error' });
    }
  }, [values, setSnackbar]);

  // AWB Analytics Export
  const exportAWBAnalytics = useCallback(() => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // AWB Summary Analytics
      const summaryData = [{
        'Metric': 'Total AWBs',
        'Value': values.selectedAWBs?.length || 0,
        'Description': 'Total number of AWBs linked to this operational cost'
      }, {
        'Metric': 'Delivered AWBs',
        'Value': values.selectedAWBs?.filter(awb => awb.status === 'Delivered').length || 0,
        'Description': 'Number of successfully delivered AWBs'
      }, {
        'Metric': 'Total Weight (kg)',
        'Value': values.selectedAWBs?.reduce((sum, awb) => sum + (awb.weight || 0), 0) || 0,
        'Description': 'Combined weight of all AWBs'
      }, {
        'Metric': 'Total Value',
        'Value': values.selectedAWBs?.reduce((sum, awb) => sum + (awb.totalCharge || 0), 0) || 0,
        'Description': 'Total charge amount across all AWBs'
      }, {
        'Metric': 'Average Weight per AWB',
        'Value': values.selectedAWBs?.length > 0 ? 
          (values.selectedAWBs.reduce((sum, awb) => sum + (awb.weight || 0), 0) / values.selectedAWBs.length).toFixed(2) : 0,
        'Description': 'Average weight per AWB'
      }, {
        'Metric': 'Average Value per AWB',
        'Value': values.selectedAWBs?.length > 0 ?
          (values.selectedAWBs.reduce((sum, awb) => sum + (awb.totalCharge || 0), 0) / values.selectedAWBs.length).toFixed(2) : 0,
        'Description': 'Average charge amount per AWB'
      }];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'AWB Analytics Summary');
      
      // Status Distribution
      const statusData = ['Created', 'Received', 'Processed', 'In Transit', 'Arrived', 'Delivered', 'Exception'].map(status => ({
        'Status': status,
        'Count': values.selectedAWBs?.filter(awb => awb.status === status).length || 0,
        'Percentage': values.selectedAWBs?.length > 0 ? 
          (((values.selectedAWBs?.filter(awb => awb.status === status).length || 0) / values.selectedAWBs.length) * 100).toFixed(1) : 0
      }));
      
      const statusSheet = XLSX.utils.json_to_sheet(statusData);
      XLSX.utils.book_append_sheet(workbook, statusSheet, 'Status Distribution');
      
      // Cost Breakdown
      const costData = [{
        'Cost Category': 'Freight Charge',
        'Total Amount': values.selectedAWBs?.reduce((sum, awb) => sum + (awb.freightCharge || 0), 0) || 0,
        'Average': values.selectedAWBs?.length > 0 ? 
          (values.selectedAWBs.reduce((sum, awb) => sum + (awb.freightCharge || 0), 0) / values.selectedAWBs.length).toFixed(2) : 0
      }, {
        'Cost Category': 'Fuel Surcharge',
        'Total Amount': values.selectedAWBs?.reduce((sum, awb) => sum + (awb.fuelSurcharge || 0), 0) || 0,
        'Average': values.selectedAWBs?.length > 0 ? 
          (values.selectedAWBs.reduce((sum, awb) => sum + (awb.fuelSurcharge || 0), 0) / values.selectedAWBs.length).toFixed(2) : 0
      }, {
        'Cost Category': 'Security Surcharge',
        'Total Amount': values.selectedAWBs?.reduce((sum, awb) => sum + (awb.securitySurcharge || 0), 0) || 0,
        'Average': values.selectedAWBs?.length > 0 ? 
          (values.selectedAWBs.reduce((sum, awb) => sum + (awb.securitySurcharge || 0), 0) / values.selectedAWBs.length).toFixed(2) : 0
      }, {
        'Cost Category': 'Other Charges',
        'Total Amount': values.selectedAWBs?.reduce((sum, awb) => sum + (awb.otherCharges || 0), 0) || 0,
        'Average': values.selectedAWBs?.length > 0 ? 
          (values.selectedAWBs.reduce((sum, awb) => sum + (awb.otherCharges || 0), 0) / values.selectedAWBs.length).toFixed(2) : 0
      }];
      
      const costSheet = XLSX.utils.json_to_sheet(costData);
      XLSX.utils.book_append_sheet(workbook, costSheet, 'Cost Breakdown');
      
      XLSX.writeFile(workbook, `AWB_Analytics_${values.quotationNumber}_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSnackbar({ open: true, message: 'AWB Analytics exported successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export AWB Analytics', severity: 'error' });
    }
  }, [values, setSnackbar]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'primary';
      case 'Cancelled': return 'error';
      default: return 'info';
    }
  };

  const steps = [
    'Quotation Selection',
    'AWB Management',
    'Cost Tracking',
    'Variance Analysis',
    'Approval Workflow',
    'Performance Metrics'
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">📊 Operational Cost Management</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={exportToPDF}
            disabled={!values.quotationNumber}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExcelIcon />}
            onClick={exportToExcel}
            disabled={!values.quotationNumber}
          >
            Export Excel
          </Button>
          {values.selectedAWBs && values.selectedAWBs.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={exportAWBAnalytics}
              color="secondary"
            >
              AWB Analytics
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            New Operational Cost
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search operational costs..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Operational Costs
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(operationalCosts.reduce((sum, cost) => sum + (cost.totalActualCost || 0), 0), 'IDR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Projects
              </Typography>
              <Typography variant="h4" color="success.main">
                {operationalCosts.filter(cost => cost.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Variance
              </Typography>
              <Typography variant="h4" color="warning.main">
                {operationalCosts.length > 0 ? 
                  (operationalCosts.reduce((sum, cost) => sum + (cost.totalVariancePercentage || 0), 0) / operationalCosts.length).toFixed(1) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Projects Needing Attention
              </Typography>
              <Typography variant="h4" color="error.main">
                {operationalCosts.filter(cost => cost.overallVarianceStatus === 'Critical').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Operational Costs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quotation #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Financial Summary</TableCell>
              <TableCell>Variance Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCosts.map((cost) => (
              <TableRow key={cost.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{cost.quotationNumber}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(cost.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{cost.customerName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{cost.origin}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    → {cost.destination}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Quote: {formatCurrency(cost.totalQuotationValue || 0)}
                  </Typography>
                  <Typography variant="body2">
                    Actual: {formatCurrency(cost.totalActualCost || 0)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: (cost.totalVariance || 0) >= 0 ? 'error.main' : 'success.main',
                      fontWeight: 'bold'
                    }}
                  >
                    Variance: {formatCurrency(cost.totalVariance || 0)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={cost.overallVarianceStatus || 'Normal'}
                    color={
                      cost.overallVarianceStatus === 'Critical' ? 'error' :
                      cost.overallVarianceStatus === 'Warning' ? 'warning' : 'success'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={cost.status || 'Active'}
                    color={getStatusColor(cost.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(cost)}
                      color="primary"
                      title="Edit Operational Cost"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(cost.id)}
                      color="error"
                      title="Delete Operational Cost"
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

      {/* Operational Cost Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          {selectedCost ? 'Edit Operational Cost' : 'Create New Operational Cost'}
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
                <QuotationSelectionTab
                  values={values}
                  handleFieldChange={(field, value) => formHook.setValues?.(prev => ({ ...prev, [field]: value }))}
                  getFieldProps={() => ({})}
                />
              )}

              {activeTab === 1 && (
                <AWBManagementTab
                  values={values}
                  handleFieldChange={(field, value) => formHook.setValues?.(prev => ({ ...prev, [field]: value }))}
                />
              )}

              {activeTab === 2 && (
                <CostTrackingTab
                  values={values}
                  addCostItem={addCostItem}
                  updateCostItem={updateCostItem}
                  removeCostItem={removeCostItem}
                />
              )}

              {activeTab === 3 && (
                <VarianceAnalysisTab values={values} />
              )}

              {activeTab === 4 && (
                <ApprovalWorkflowTab values={values} updateMilestone={updateMilestone} />
              )}

              {activeTab === 5 && (
                <PerformanceMetricsTab values={values} />
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
              {selectedCost ? 'Update' : 'Create'} Operational Cost
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

export default OperationalCost;
