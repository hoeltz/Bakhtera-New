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
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon,
  Analytics as AnalyticsIcon,
  View as ViewIcon,
  FilterList as FilterIcon,
  Dashboard as DashboardIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import enhancedDataSyncService from '../services/enhancedDataSync';

const BIGDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    customers: [],
    vendors: [],
    salesOrders: [],
    invoices: [],
    accounting: [],
    timeline: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load BIG module data only (isolated from BLINK and BRIDGE)
      let bigCustomers = enhancedDataSyncService.getBIGData('customers');
      let bigVendors = enhancedDataSyncService.getBIGData('vendors');
      let bigSalesOrders = enhancedDataSyncService.getBIGData('salesOrders');
      let bigInvoices = enhancedDataSyncService.getBIGData('invoices');
      
      // Initialize with sample data if none exists
      if (bigSalesOrders.length === 0 && bigInvoices.length === 0) {
        enhancedDataSyncService.initializeModuleData('BIG');
        bigCustomers = enhancedDataSyncService.getBIGData('customers');
        bigVendors = enhancedDataSyncService.getBIGData('vendors');
        bigSalesOrders = enhancedDataSyncService.getBIGData('salesOrders');
        bigInvoices = enhancedDataSyncService.getBIGData('invoices');
      }

      const accounting = generateAccountingData();
      const timeline = generateTimelineData();

      setDashboardData({
        customers: bigCustomers,
        vendors: bigVendors,
        salesOrders: bigSalesOrders,
        invoices: bigInvoices,
        accounting,
        timeline
      });
      
      console.log(`BIG Dashboard loaded: ${bigSalesOrders.length} sales orders, ${bigInvoices.length} invoices (isolated from BRIDGE & BLINK)`);
    } catch (error) {
      console.error('Error loading BIG dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleSalesOrders = (customers) => {
    return customers.slice(0, 6).map((customer, index) => ({
      id: `SO-${Date.now()}-${index}`,
      customerName: customer.companyName,
      orderValue: 3000000 + (index * 500000),
      status: index === 0 ? 'Confirmed' : index === 1 ? 'Processing' : index === 2 ? 'Shipped' : index === 3 ? 'Delivered' : 'Pending',
      date: new Date().toISOString().split('T')[0],
      priority: index === 0 ? 'High' : index === 1 ? 'High' : 'Normal'
    }));
  };

  const generateSampleInvoices = (customers, salesOrders) => {
    return salesOrders.map((order, index) => ({
      id: `INV-${Date.now()}-${index}`,
      customerName: order.customerName,
      amount: order.orderValue,
      status: index === 0 ? 'Paid' : index === 1 ? 'Pending' : index === 2 ? 'Overdue' : 'Draft',
      dueDate: new Date(Date.now() + ((index + 1) * 15 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      salesOrderId: order.id
    }));
  };

  const generateAccountingData = () => {
    return [
      { id: 'ACC-001', description: 'Sales Revenue', amount: 5000000, type: 'Credit', date: new Date().toISOString().split('T')[0] },
      { id: 'ACC-002', description: 'Operational Expenses', amount: -1500000, type: 'Debit', date: new Date().toISOString().split('T')[0] },
      { id: 'ACC-003', description: 'Vendor Payments', amount: -2000000, type: 'Debit', date: new Date().toISOString().split('T')[0] },
      { id: 'ACC-004', description: 'Customer Payments', amount: 3500000, type: 'Credit', date: new Date().toISOString().split('T')[0] },
      { id: 'ACC-005', description: 'Tax Obligations', amount: -500000, type: 'Debit', date: new Date().toISOString().split('T')[0] }
    ];
  };

  const generateTimelineData = () => {
    return [
      { id: 'TL-001', event: 'Customer Onboarding', status: 'Completed', date: '2024-01-15', description: 'New customer contract signed' },
      { id: 'TL-002', event: 'Sales Order Processing', status: 'In Progress', date: '2024-01-20', description: 'Order processing and fulfillment' },
      { id: 'TL-003', event: 'Invoice Generation', status: 'Pending', date: '2024-01-25', description: 'Invoice creation and sending' },
      { id: 'TL-004', event: 'Payment Collection', status: 'Pending', date: '2024-02-01', description: 'Follow up on outstanding payments' },
      { id: 'TL-005', event: 'Monthly Financial Review', status: 'Scheduled', date: '2024-02-05', description: 'End of month financial analysis' }
    ];
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'shipped':
      case 'delivered':
      case 'paid':
        return 'success';
      case 'processing':
      case 'in progress':
        return 'warning';
      case 'pending':
      case 'scheduled':
      case 'draft':
        return 'info';
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

  // Calculate comprehensive statistics
  const totalCustomers = dashboardData.customers.length;
  const totalVendors = dashboardData.vendors.length;
  const totalSalesOrders = dashboardData.salesOrders.length;
  const totalInvoices = dashboardData.invoices.length;
  const confirmedOrders = dashboardData.salesOrders.filter(order => order.status === 'Confirmed').length;
  const paidInvoices = dashboardData.invoices.filter(inv => inv.status === 'Paid').length;
  const totalRevenue = dashboardData.invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingRevenue = dashboardData.invoices
    .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Event Management
        </Typography>
        <Button variant="outlined" startIcon={<FilterIcon />} onClick={loadDashboardData}>
          Refresh Data
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Event Management:</strong> Comprehensive business management platform
        integrating customer relations, vendor management, sales orders, invoicing, accounting,
        and timeline tracking for complete operational visibility.
      </Alert>

      {/* Comprehensive KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    gutterBottom
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Total Customers
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.3rem' }}>
                    {totalCustomers}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <TrendingUpIcon sx={{ fontSize: 11, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      Active Partners
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    gutterBottom
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Total Vendors
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.3rem' }}>
                    {totalVendors}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <CheckIcon sx={{ fontSize: 11, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      Verified Partners
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    gutterBottom
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Sales Orders
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.3rem' }}>
                    {totalSalesOrders}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <AssignmentIcon sx={{ fontSize: 11, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      {confirmedOrders} confirmed
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    gutterBottom
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Total Invoices
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.3rem' }}>
                    {totalInvoices}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <ReceiptIcon sx={{ fontSize: 11, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      {paidInvoices} paid
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    gutterBottom
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.3rem' }}>
                    {formatCurrency(totalRevenue)}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <MoneyIcon sx={{ fontSize: 11, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      {formatCurrency(pendingRevenue)} pending
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MoneyIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          border: '1px solid rgba(99, 102, 241, 0.1)'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            sx={{
              '& .MuiTab-root': {
                minHeight: 56,
                fontSize: '0.8rem',
                fontWeight: 500,
                textTransform: 'none'
              },
              '& .Mui-selected': {
                color: '#6366f1'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#6366f1',
                height: 3
              }
            }}
          >
            <Tab icon={<AssignmentIcon sx={{ fontSize: 18 }} />} label="Sales Orders" />
            <Tab icon={<ReceiptIcon sx={{ fontSize: 18 }} />} label="Invoices" />
            <Tab icon={<AccountBalanceIcon sx={{ fontSize: 18 }} />} label="Accounting" />
            <Tab icon={<TimelineIcon sx={{ fontSize: 18 }} />} label="Timeline" />
            <Tab icon={<AnalyticsIcon sx={{ fontSize: 18 }} />} label="Analytics" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: '#1f2937',
                  fontSize: '1.1rem',
                  mb: 3
                }}
              >
                Sales Orders Overview
              </Typography>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 1.5,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(99, 102, 241, 0.1)'
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9ff' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#6366f1' }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#6366f1' }}>Customer</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#6366f1' }}>Order Value</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#6366f1' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#6366f1' }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.salesOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        sx={{
                          '&:hover': { backgroundColor: '#f8f9ff' },
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(99, 102, 241, 0.02)' }
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#374151'
                            }}
                          >
                            {order.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {order.customerName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            sx={{ fontSize: '0.85rem', color: '#059669' }}
                          >
                            {formatCurrency(order.orderValue)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ fontSize: '0.65rem', height: '24px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {order.date}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Invoice Management
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                            {invoice.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight="bold">
                            {formatCurrency(invoice.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={invoice.status === 'Overdue' ? 'error.main' : 'text.primary'}>
                            {invoice.dueDate}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Financial Transactions
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Transaction</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.accounting.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <Typography variant="body2">{transaction.description}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                              >
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.type}
                                color={transaction.type === 'Credit' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Financial Summary
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Revenue"
                            secondary={formatCurrency(totalRevenue)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Outstanding Revenue"
                            secondary={formatCurrency(pendingRevenue)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalanceIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Net Profit (Est.)"
                            secondary={formatCurrency(totalRevenue - (pendingRevenue * 0.3))}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Business Timeline
              </Typography>
              <Stepper alternativeLabel activeStep={2}>
                {dashboardData.timeline.map((step, index) => (
                  <Step key={step.id}>
                    <StepLabel
                      StepIconComponent={(props) => {
                        const { active, completed } = props;
                        return (
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          >
                            {completed ? <CheckIcon fontSize="small" /> : index + 1}
                          </Box>
                        );
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {step.event}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {step.date}
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          {step.description}
                        </Typography>
                        <Chip
                          label={step.status}
                          color={getStatusColor(step.status)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Business Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Customer Metrics
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Customer Retention"
                            secondary="92%"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Average Order Value"
                            secondary={formatCurrency(totalRevenue / totalSalesOrders || 0)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Customer Satisfaction"
                            secondary="4.5/5.0"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Financial Performance
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Revenue Growth"
                            secondary="+15% MoM"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Payment Collection Rate"
                            secondary={`${Math.round((paidInvoices / totalInvoices) * 100)}%`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Average Collection Time"
                            secondary="12 days"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Operational Efficiency
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Order Processing Time"
                            secondary="2.3 days avg"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Invoice Generation Rate"
                            secondary="98% automated"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="System Uptime"
                            secondary="99.7%"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

    </Box>
  );
};

export default BIGDashboard;