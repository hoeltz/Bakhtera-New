import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { salesOrderService, customerService, invoiceService } from '../services/localStorage';
import { dashboardStats } from '../data/sampleData';
import notificationService, { useNotifications } from '../services/notificationService';
import { handleError } from '../services/errorHandler';
import { useDashboardStats, useDataSync } from '../hooks/useDataSync';
import { formatCurrency } from '../services/currencyUtils';

// L/R (Loss/Revenue) Tracking Component
const LRTrackingTable = ({ lrData }) => {
  const getProfitabilityColor = (margin) => {
    if (margin > 0) return 'success.main';
    if (margin < 0) return 'error.main';
    return 'warning.main';
  };

  const getProfitabilityLabel = (margin) => {
    if (margin > 0) return 'Profit';
    if (margin < 0) return 'Loss';
    return 'Break-even';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          📊 L/R (Loss/Revenue) per Quotation
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
          Real-time comparison between quotation prices and operational costs
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Quotation #</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Customer</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Selling Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Total Cost</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Margin</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Margin %</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lrData.slice(0, 10).map((item) => (
                <TableRow key={item.quotationId} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{item.quotationNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.customerName}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(item.sellingPrice, 'IDR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(item.totalCost, 'IDR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ color: getProfitabilityColor(item.margin) }}
                    >
                      {formatCurrency(item.margin, 'IDR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ color: getProfitabilityColor(item.margin) }}
                    >
                      {formatCurrency(item.marginPercentage, 'IDR') || '0%'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getProfitabilityLabel(item.margin)}
                      color={item.margin > 0 ? 'success' : item.margin < 0 ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {lrData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              No operational cost data available. Approve quotations to see L/R tracking.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StatCard = ({ title, value, icon, color, subtitle, children, trend }) => (
  <Card
    sx={{
      height: '100%',
      minHeight: 110,
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
      border: '1px solid rgba(99, 102, 241, 0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)',
      }
    }}
  >
    <CardContent sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      p: 2
    }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Typography
            color="textSecondary"
            gutterBottom
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 0.5
            }}
          >
            {title}
          </Typography>
          <Box sx={{ mb: 0.5 }}>
            {children || (
              <Typography
                variant="h5"
                component="div"
                sx={{
                  color,
                  fontSize: '1.4rem',
                  lineHeight: 1.2,
                  fontWeight: 700
                }}
              >
                {value}
              </Typography>
            )}
          </Box>
          {subtitle && (
            <Typography
              color="textSecondary"
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 400
              }}
            >
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box display="flex" alignItems="center" mt={0.5}>
              <Typography
                variant="caption"
                sx={{
                  color: trend.direction === 'up' ? '#10b981' : '#ef4444',
                  fontSize: '0.65rem',
                  fontWeight: 600
                }}
              >
                {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            ml: 2,
            p: 1,
            borderRadius: 1.5,
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {React.cloneElement(icon, {
            sx: { fontSize: 24, color }
          })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const RecentOrders = ({ orders }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
      border: '1px solid rgba(99, 102, 241, 0.1)'
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1f2937'
          }}
        >
          Recent Sales Orders
        </Typography>
        <Chip
          label={`${orders.length} orders`}
          size="small"
          sx={{
            backgroundColor: '#6366f1',
            color: 'white',
            fontSize: '0.65rem'
          }}
        />
      </Box>
      <List sx={{ p: 0 }}>
        {orders.slice(0, 5).map((order) => (
          <ListItem
            key={order.id}
            divider
            sx={{
              px: 0,
              py: 1.5,
              '&:last-child': { borderBottom: 'none' }
            }}
          >
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#111827'
                      }}
                    >
                      {order.orderNumber}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {order.customerName} • {order.packageType}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <Chip
                      label={order.status || 'Draft'}
                      color={order.status === 'Confirmed' ? 'success' : order.status === 'In Transit' ? 'primary' : 'warning'}
                      size="small"
                      sx={{
                        fontSize: '0.6rem',
                        height: '20px',
                        minHeight: '20px'
                      }}
                    />
                    <Chip
                      label={order.priority}
                      color={order.priority === 'High' ? 'error' : order.priority === 'Urgent' ? 'warning' : 'default'}
                      size="small"
                      sx={{
                        fontSize: '0.6rem',
                        height: '20px',
                        minHeight: '20px'
                      }}
                    />
                  </Box>
                </Box>
              }
              secondary={
                <Box mt={0.5}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {order.origin} → {order.destination} • {order.serviceType}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: '0.7rem', display: 'block' }}
                  >
                    {order.cargoItems?.length || 0} items • {order.cargoItems?.reduce((sum, item) => sum + (item.weight || 0), 0)}kg • {formatCurrency(order.sellingPrice || 0, 'IDR')}
                  </Typography>
                  {order.shipmentDetails?.trackingNumber && (
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ fontSize: '0.65rem', display: 'block', mt: 0.25 }}
                    >
                      Tracking: {order.shipmentDetails.trackingNumber}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);


const Dashboard = () => {
  // Use real-time dashboard statistics with fallback
  const dashboardStatsData = useDashboardStats();
  const stats = dashboardStatsData?.stats || {
    totalRevenue: 0,
    totalOperationalCosts: 0,
    totalMargin: 0,
    totalCustomers: 0,
    totalOrders: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalOverdueAmount: 0,
    activeShipments: 0
  };
  const statsLoading = dashboardStatsData?.loading || false;

  // Use real-time data sync for recent orders
  const { data: ordersData, loading: ordersLoading } = useDataSync('salesOrders');

  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lrData, setLRData] = useState([]);

  // Use the notification hook
  const notificationData = useNotifications();

  useEffect(() => {
    if (notificationData) {
      setAlerts(notificationService.alerts || []);
      setNotifications(notificationData.notifications || []);
    }
  }, [notificationData?.notifications?.length]); // Only depend on notifications length

  // Load L/R data
  useEffect(() => {
    const loadLRData = () => {
      try {
        const lrDataFromStorage = JSON.parse(localStorage.getItem('dashboardLR') || '[]');
        setLRData(lrDataFromStorage);
      } catch (error) {
        console.error('Error loading L/R data:', error);
      }
    };

    loadLRData();

    // Listen for storage changes to update L/R data in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'dashboardLR') {
        loadLRData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get recent orders from real-time data
  const recentOrders = ordersData?.slice(0, 5) || [];

  // Calculate additional stats that aren't in the real-time stats
  const additionalStats = {
    activeShipments: ordersData?.filter(order =>
      order.shipmentDetails?.status === 'Booked' || order.shipmentDetails?.status === 'In Transit'
    ).length || 0,
    totalOverdueAmount: 0 // This would need to be calculated from invoice data
  };

  // Using standardized currency formatting
  const formatCurrencyDisplay = (amount, currency = 'IDR') => {
    return formatCurrency(amount, currency);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome to Bakhtera1 - Your Advanced Freight Forwarding Management System
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          {notificationData.unreadCount > 0 && (
            <Chip
              label={`${notificationData.unreadCount} new notifications`}
              color="primary"
              onClick={() => notificationService.markAllAsRead()}
            />
          )}
          {alerts.filter(alert => !alert.acknowledged).length > 0 && (
            <Chip
              label={`${alerts.filter(alert => !alert.acknowledged).length} active alerts`}
              color="warning"
            />
          )}
        </Box>
      </Box>

      {/* Real-time Alerts */}
      {alerts.filter(alert => !alert.acknowledged).length > 0 && (
        <Box mb={3}>
          {alerts.filter(alert => !alert.acknowledged).map(alert => (
            <Alert
              key={alert.id}
              severity={alert.severity === 'critical' ? 'error' : 'warning'}
              sx={{ mb: 1 }}
              onClose={() => notificationService.acknowledgeAlert(alert.id)}
            >
              <Typography variant="subtitle2">{alert.message}</Typography>
              <Typography variant="caption">
                {new Date(alert.timestamp).toLocaleString()}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Financial Stats Cards - Top Priority */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            icon={<MoneyIcon />}
            color="#f59e0b"
            trend={{ direction: 'up', value: '+12.5%' }}
          >
            <Box>
              <Typography variant="h6" sx={{ color: '#f59e0b', fontSize: '1.25rem' }}>
                IDR {formatCurrencyDisplay(stats.totalRevenue, 'IDR')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6366f1', fontSize: '0.8rem' }}>
                USD {formatCurrencyDisplay(stats.totalRevenue / 15000, 'USD')}
              </Typography>
            </Box>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Operational Cost"
            icon={<MoneyIcon />}
            color="#ef4444"
            trend={{ direction: 'down', value: '-3.2%' }}
          >
            <Box>
              <Typography variant="h6" sx={{ color: '#ef4444', fontSize: '1.25rem' }}>
                IDR {formatCurrencyDisplay(stats.totalOperationalCosts || 0, 'IDR')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6366f1', fontSize: '0.8rem' }}>
                USD {formatCurrencyDisplay((stats.totalOperationalCosts || 0) / 15000, 'USD')}
              </Typography>
            </Box>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Profit Margin"
            value={statsLoading ? '...' : formatCurrency(stats.totalMargin)}
            icon={<TrendingUpIcon />}
            color="#10b981"
            trend={{ direction: 'up', value: '+8.7%' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Margin Rate"
            value={statsLoading ? '...' : `${((stats.totalMargin / stats.totalRevenue) * 100).toFixed(1)}%`}
            icon={<AssessmentIcon />}
            color="#8b5cf6"
            trend={{ direction: 'up', value: '+2.1%' }}
          />
        </Grid>
      </Grid>

      {/* Activity Stats Cards - Secondary */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={statsLoading ? '...' : stats.totalCustomers}
            icon={<PeopleIcon />}
            color="#6366f1"
            trend={{ direction: 'up', value: '+5 new' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Orders"
            value={statsLoading ? '...' : stats.totalOrders}
            icon={<AssignmentIcon />}
            color="#10b981"
            trend={{ direction: 'up', value: '+2 today' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Shipments"
            value={ordersLoading ? '...' : additionalStats.activeShipments}
            icon={<ShippingIcon />}
            color="#f59e0b"
            trend={{ direction: 'up', value: '+1 shipped' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Invoices"
            value={statsLoading ? '...' : stats.pendingInvoices}
            icon={<ReceiptIcon />}
            color="#ef4444"
            trend={{ direction: 'down', value: '-3 paid' }}
          />
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Invoices"
            value={statsLoading ? '...' : stats.overdueInvoices}
            icon={<ScheduleIcon />}
            color="#ef4444"
            subtitle={stats.totalOverdueAmount > 0 ? formatCurrencyDisplay(stats.totalOverdueAmount) : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="On-Time Delivery"
            value="98.5%"
            icon={<AssessmentIcon />}
            color="#10b981"
            trend={{ direction: 'up', value: '+0.3%' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Processing"
            value="2.3 days"
            icon={<ScheduleIcon />}
            color="#8b5cf6"
            trend={{ direction: 'down', value: '-0.2 days' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Alerts"
            value={alerts.filter(alert => !alert.acknowledged).length}
            icon={<AssessmentIcon />}
            color={alerts.filter(alert => !alert.acknowledged).length > 0 ? "#f59e0b" : "#6b7280"}
          />
        </Grid>
      </Grid>


      {/* Recent Orders */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {ordersLoading ? (
            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ mt: 2, fontSize: '0.9rem' }}>
                  Loading recent orders...
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <RecentOrders orders={recentOrders} />
          )}
        </Grid>
      </Grid>

      {/* L/R Tracking Table */}
      {lrData.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <LRTrackingTable lrData={lrData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;