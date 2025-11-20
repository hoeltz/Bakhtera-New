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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  View as ViewIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import enhancedDataSyncService from '../services/enhancedDataSync';

const BLINKDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    customers: [],
    vendors: [],
    salesOrders: [],
    operations: [],
    accounting: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load BLINK module data only (isolated from BRIDGE and BIG)
      let blinkCustomers = enhancedDataSyncService.getBLINKData('customers');
      let blinkVendors = enhancedDataSyncService.getBLINKData('vendors');
      let blinkSalesOrders = enhancedDataSyncService.getBLINKData('salesOrders');
      
      // Initialize with sample data if none exists
      if (blinkSalesOrders.length === 0) {
        enhancedDataSyncService.initializeModuleData('BLINK');
        blinkCustomers = enhancedDataSyncService.getBLINKData('customers');
        blinkVendors = enhancedDataSyncService.getBLINKData('vendors');
        blinkSalesOrders = enhancedDataSyncService.getBLINKData('salesOrders');
      }

      const operations = generateSampleOperations();
      const accounting = generateAccountingData();

      setDashboardData({
        customers: blinkCustomers,
        vendors: blinkVendors,
        salesOrders: blinkSalesOrders,
        operations,
        accounting
      });
      
      console.log(`BLINK Dashboard loaded: ${blinkSalesOrders.length} sales orders (isolated from BRIDGE & BIG)`);
    } catch (error) {
      console.error('Error loading BLINK dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleSalesOrders = (customers) => {
    return customers.slice(0, 5).map((customer, index) => ({
      id: `SO-${Date.now()}-${index}`,
      customerName: customer.companyName,
      orderValue: 2000000 + (index * 750000),
      status: index === 0 ? 'Confirmed' : index === 1 ? 'Processing' : index === 2 ? 'Shipped' : 'Pending',
      date: new Date().toISOString().split('T')[0],
      priority: index === 0 ? 'High' : index === 1 ? 'Normal' : 'Low'
    }));
  };

  const generateSampleOperations = () => {
    return [
      { id: 'OP-001', operation: 'Pickup & Delivery', status: 'In Progress', driver: 'Ahmad Santos', priority: 'High' },
      { id: 'OP-002', operation: 'International Shipping', status: 'Completed', driver: 'Maria Chen', priority: 'Normal' },
      { id: 'OP-003', operation: 'Local Distribution', status: 'Scheduled', driver: 'Budi Santoso', priority: 'Normal' },
      { id: 'OP-004', operation: 'Container Loading', status: 'In Progress', driver: 'Sari Wijaya', priority: 'High' },
      { id: 'OP-005', operation: 'Customs Clearance', status: 'Pending', driver: 'Team Customs', priority: 'Low' }
    ];
  };

  const generateAccountingData = () => {
    return [
      { id: 'ACC-001', description: 'Customer Payment', amount: 3500000, type: 'Credit', date: new Date().toISOString().split('T')[0] },
      { id: 'ACC-002', description: 'Vendor Payment', amount: -1200000, type: 'Debit', date: new Date().toISOString().split('T')[0] },
      { id: 'ACC-003', description: 'Operational Cost', amount: -800000, type: 'Debit', date: new Date().toISOString().split('T')[0] },
      { id: 'ACC-004', description: 'Sales Revenue', amount: 2500000, type: 'Credit', date: new Date().toISOString().split('T')[0] }
    ];
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'shipped':
        return 'success';
      case 'processing':
      case 'in progress':
        return 'warning';
      case 'pending':
      case 'scheduled':
        return 'info';
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
  const totalSalesOrders = dashboardData.salesOrders.length;
  const totalOperations = dashboardData.operations.length;
  const confirmedOrders = dashboardData.salesOrders.filter(order => order.status === 'Confirmed').length;
  const inProgressOps = dashboardData.operations.filter(op => op.status === 'In Progress').length;
  const totalRevenue = dashboardData.salesOrders
    .filter(order => order.status === 'Confirmed')
    .reduce((sum, order) => sum + order.orderValue, 0);

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
          Freight & Forward Management
        </Typography>
        <Button variant="outlined" startIcon={<FilterIcon />} onClick={loadDashboardData}>
          Refresh Data
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Freight & Forward Management:</strong> Complete sales management and operational tracking system
        for customer relations, vendor management, sales orders, operations, and accounting integration.
      </Alert>

      {/* Key Performance Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Active Customers
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
                    {totalCustomers}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <TrendingUpIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      Sales Partners
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
                  <PeopleIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Confirmed Orders
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
                    {confirmedOrders}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <CheckIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      of {totalSalesOrders} total
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
                  <AssignmentIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Active Operations
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
                    {inProgressOps}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <ShippingIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      {totalOperations} total operations
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
                  <ShippingIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Confirmed Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
                    {formatCurrency(totalRevenue)}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <MoneyIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)">
                      Active orders
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
                  <MoneyIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed Content */}
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
                fontSize: '0.85rem',
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
            <Tab icon={<AssignmentIcon sx={{ fontSize: 20 }} />} label="Sales Orders" />
            <Tab icon={<ShippingIcon sx={{ fontSize: 20 }} />} label="Operations" />
            <Tab icon={<AccountBalanceIcon sx={{ fontSize: 20 }} />} label="Accounting" />
            <Tab icon={<AssessmentIcon sx={{ fontSize: 20 }} />} label="Analytics" />
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
                Recent Sales Orders
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
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#6366f1' }}>Priority</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.salesOrders.map((order, index) => (
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
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                            {order.date}
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
                          <Chip
                            label={order.priority}
                            color={getPriorityColor(order.priority)}
                            size="small"
                            sx={{ fontSize: '0.65rem', height: '24px' }}
                          />
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
                Current Operations
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Operation ID</TableCell>
                      <TableCell>Operation</TableCell>
                      <TableCell>Driver</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.operations.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                            {operation.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{operation.operation}</TableCell>
                        <TableCell>{operation.driver}</TableCell>
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
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Accounting Transactions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.accounting.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                            {transaction.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(Math.abs(transaction.amount))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'Credit' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Performance Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sales Performance
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Order Confirmation Rate"
                            secondary={`${Math.round((confirmedOrders / totalSalesOrders) * 100)}%`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MoneyIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Average Order Value"
                            secondary={formatCurrency(totalRevenue / confirmedOrders || 0)}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Operations Efficiency
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <ShippingIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Operations in Progress"
                            secondary={`${inProgressOps} of ${totalOperations}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TimelineIcon color="info" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Driver Utilization"
                            secondary="85% average"
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

export default BLINKDashboard;