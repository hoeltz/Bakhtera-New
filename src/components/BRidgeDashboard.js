import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Chip,
  IconButton,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  AccountBalance as AccountBalanceIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  View as ViewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import BridgeHeader from './BridgeHeader';
import BridgeStatCard from './BridgeStatCard';
import dataSyncService from '../services/dataSync';

const BRidgeDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    customers: [],
    vendors: [],
    inventory: [],
    quotations: [],
    invoices: [],
    warehouseOps: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all B-ridge data
      const customers = dataSyncService.getCustomerData() || [];
      const vendors = dataSyncService.getVendorData() || [];
      const inventory = dataSyncService.getInventoryData() || [];
      
      console.info('✓ BRIDGE Dashboard: Loaded customers=%d, vendors=%d, inventory=%d', customers.length, vendors.length, inventory.length);
      
      // Generate sample data for quotations, invoices, and warehouse operations
      const quotations = generateSampleQuotations(customers);
      const invoices = generateSampleInvoices(customers, quotations);
      const warehouseOps = generateWarehouseOperations();

      setDashboardData({
        customers,
        vendors,
        inventory,
        quotations,
        invoices,
        warehouseOps
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleQuotations = (customers) => {
    return customers.slice(0, 3).map((customer, index) => ({
      id: `Q-${Date.now()}-${index}`,
      customerName: customer.companyName,
      amount: 1500000 + (index * 500000),
      status: index === 0 ? 'Approved' : index === 1 ? 'Pending' : 'Draft',
      date: new Date().toISOString().split('T')[0]
    }));
  };

  const generateSampleInvoices = (customers, quotations) => {
    return quotations.map((quotation, index) => ({
      id: `INV-${Date.now()}-${index}`,
      customerName: quotation.customerName,
      amount: quotation.amount,
      status: index === 0 ? 'Paid' : index === 1 ? 'Pending' : 'Overdue',
      dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    }));
  };

  const generateWarehouseOperations = () => {
    return [
      { id: 'WH-001', operation: 'Inbound Processing', status: 'In Progress', priority: 'High' },
      { id: 'WH-002', operation: 'Outbound Processing', status: 'Completed', priority: 'Normal' },
      { id: 'WH-003', operation: 'Inventory Count', status: 'Pending', priority: 'Low' },
      { id: 'WH-004', operation: 'Quality Check', status: 'In Progress', priority: 'High' },
      { id: 'WH-005', operation: 'Loading/Unloading', status: 'Scheduled', priority: 'Normal' }
    ];
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'paid':
        return 'success';
      case 'pending':
      case 'in progress':
      case 'scheduled':
        return 'warning';
      case 'draft':
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'normal':
        return 'primary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  // Calculate summary statistics
  const totalCustomers = dashboardData.customers.length;
  const totalVendors = dashboardData.vendors.length;
  const totalInventoryItems = dashboardData.inventory.length;
  const totalQuotations = dashboardData.quotations.length;
  const totalInvoices = dashboardData.invoices.length;
  const totalRevenue = dashboardData.invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingInvoices = dashboardData.invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '200px' }} />
      </Box>
    );
  }

  return (
    <Box>
      <BridgeHeader
        title="Warehouse Management"
        subtitle="Complete warehouse operations including customer management, vendor management, inventory tracking, and revenue analysis."
        actions={<Button variant="outlined" startIcon={<FilterIcon />} onClick={loadDashboardData}>Refresh Data</Button>}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Warehouse Management:</strong> Complete warehouse operations including customer management,
        vendor management, inventory tracking, and revenue analysis from quotations and invoices.
      </Alert>

      {/* Key Performance Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard
            title="Active Customers"
            value={totalCustomers}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            icon={<PeopleIcon sx={{ fontSize: 24, color: 'white' }} />}
            changeText="Warehouse Partners"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard
            title="Active Vendors"
            value={totalVendors}
            gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
            icon={<BusinessIcon sx={{ fontSize: 24, color: 'white' }} />}
            changeText="Verified Partners"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard
            title="Inventory Items"
            value={totalInventoryItems}
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            icon={<InventoryIcon sx={{ fontSize: 24, color: 'white' }} />}
            changeText="Tracked Items"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
            icon={<MoneyIcon sx={{ fontSize: 24, color: 'white' }} />}
            changeText="Paid Invoices"
          />
        </Grid>
      </Grid>

      {/* Two Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          {/* Recent Quotations */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Quotations
                </Typography>
                <Box flexGrow={1} />
                <Chip label={totalQuotations} size="small" color="primary" />
              </Box>
              {dashboardData.quotations.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.quotations.slice(0, 5).map((quotation) => (
                        <TableRow key={quotation.id}>
                          <TableCell>{quotation.customerName}</TableCell>
                          <TableCell align="right">{formatCurrency(quotation.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={quotation.status}
                              color={getStatusColor(quotation.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No quotations found
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Invoices
                </Typography>
                <Box flexGrow={1} />
                <Chip label={totalInvoices} size="small" color="primary" />
              </Box>
              {dashboardData.invoices.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.invoices.slice(0, 5).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.customerName}</TableCell>
                          <TableCell align="right">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              color={getStatusColor(invoice.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No invoices found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          {/* Revenue Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Revenue Summary
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total Revenue (Paid)"
                    secondary={formatCurrency(totalRevenue)}
                  />
                  <Chip label="Paid" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Pending Revenue"
                    secondary={formatCurrency(pendingInvoices)}
                  />
                  <Chip label="Pending" color="warning" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ReceiptIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total Quotations"
                    secondary={`${totalQuotations} quotations`}
                  />
                  <Chip label="Quotations" color="primary" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Warehouse Operations */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShippingIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Warehouse Operations
                </Typography>
                <Box flexGrow={1} />
                <Chip label={dashboardData.warehouseOps.length} size="small" color="primary" />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Operation</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.warehouseOps.slice(0, 5).map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell>{operation.operation}</TableCell>
                        <TableCell>
                          <Chip
                            label={operation.status}
                            color={getStatusColor(operation.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={operation.priority}
                            color={getPriorityColor(operation.priority)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Box>
  );
};

export default BRidgeDashboard;