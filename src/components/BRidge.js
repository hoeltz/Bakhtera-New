import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Badge,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  LocalShipping as ShippingIcon,
  AccountBalanceWallet as FinanceIcon,
  Assignment as AssignmentIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

// Import BRidge modules
import BRidgeCustomerManagement from './BRidgeCustomerManagement';
import BRidgeInventoryManagement from './BRidgeInventoryManagement';
import WarehouseManagement from './WarehouseManagement';
import BRidgeAccountingLedger from './BRidgeAccountingLedger';
import BRidgeKepabeanan from './BRidgeKepabeanan';
import BridgeHeader from './BridgeHeader';
import BridgeStatCard from './BridgeStatCard';

// Data services
import dataSyncService from '../services/dataSync';
import notificationService from '../services/notificationService';

// Main B-ridge Dashboard Component
const BRidgeDashboard = ({ onNavigateToTab }) => {
  const [kpis, setKpis] = useState({
    totalCustomers: 0,
    activeInventory: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    customsClearance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBRidgeKPIs = async () => {
      setLoading(true);
      try {
        // Load data from all B-ridge modules
        const customerData = dataSyncService.getCustomerData();
        
        // For demo purposes, calculate KPIs
        setKpis({
          totalCustomers: customerData?.length || 0,
          activeInventory: 150, // This would come from inventory module
          pendingInvoices: 12, // This would come from invoicing module
          totalRevenue: 125000000, // This would come from accounting module
          customsClearance: 85.5 // This would come from customs portal
        });
      } catch (error) {
        console.error('Error loading B-ridge KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBRidgeKPIs();
  }, []);

  const kpiCards = [
    {
      title: 'Total Customers',
      value: kpis.totalCustomers,
      icon: <PeopleIcon />,
      color: 'primary',
      change: '+5.2%',
      changeType: 'positive'
    },
    {
      title: 'Active Inventory',
      value: kpis.activeInventory,
      icon: <InventoryIcon />,
      color: 'warning',
      change: '-1.5%',
      changeType: 'negative'
    },
    {
      title: 'Pending Invoices',
      value: kpis.pendingInvoices,
      icon: <ReceiptIcon />,
      color: 'error',
      change: '+8.3%',
      changeType: 'negative'
    },
    {
      title: 'Monthly Revenue',
      value: `Rp ${(kpis.totalRevenue / 1000000).toFixed(1)}M`,
      icon: <TrendingUpIcon />,
      color: 'success',
      change: '+12.4%',
      changeType: 'positive'
    },
    {
      title: 'Customs Clearance',
      value: `${kpis.customsClearance}%`,
      icon: <SecurityIcon />,
      color: 'info',
      change: '+2.8%',
      changeType: 'positive'
    }
  ];


  return (
    <Box>
      <BridgeHeader title="B-ridge Dashboard" subtitle="Integrated platform for BRiDGE modules" />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>B-ridge Integrated Platform:</strong> Comprehensive management system for customers, 
        inventory, invoicing, accounting, and customs operations. All modules are interconnected for seamless data flow.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <BridgeStatCard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              changeText={` ${kpi.change} from last month`}
              gradient={undefined}
            />
          </Grid>
        ))}
      </Grid>

    </Box>
  );
};

// Main B-ridge Component
const BRidge = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNavigateToTab = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const tabLabels = [
    { label: 'Customer Management', icon: <PeopleIcon /> },
    { label: 'Warehouse Management', icon: <ShippingIcon /> },
    { label: 'Inventory Management', icon: <InventoryIcon /> },
    { label: 'Accounting', icon: <AccountIcon /> },
    { label: 'Kepabeanan', icon: <SecurityIcon /> }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          B-ridge Integrated Platform
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Notifications">
            <IconButton color="secondary">
              <Badge badgeContent={3} color="error">
                <NotificationIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton color="primary">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 140,
              textTransform: 'none'
            }
          }}
        >
          {tabLabels.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ minHeight: '600px' }}>
        {activeTab === 0 && <BRidgeCustomerManagement onNotification={handleNotification} />}
        {activeTab === 1 && <WarehouseManagement />}
        {activeTab === 2 && <BRidgeInventoryManagement onNotification={handleNotification} />}
        {activeTab === 3 && <BRidgeAccountingLedger onNotification={handleNotification} />}
        {activeTab === 4 && <BRidgeKepabeanan onNotification={handleNotification} />}
      </Box>
    </Box>
  );
};

export default BRidge;