import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Warehouse as WarehouseIcon,
  Event as EventIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import customsPortalMenuDB from '../services/customsPortalMenuDB';

const {
  menuHierarchyService,
  permissionsService,
  userRolesService,
  menuConfigurationsService,
  changeTrackingService,
  initializeDatabase,
  initializeSampleData,
  clearDatabase,
  exportDatabase,
  importDatabase,
  getDatabaseStats
} = customsPortalMenuDB;

const CustomsPortalMenuDemo = () => {
  const [stats, setStats] = useState(null);
  const [menuTree, setMenuTree] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [changes, setChanges] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [message, setMessage] = useState(null);

  const iconMap = {
    SecurityIcon: <SecurityIcon />,
    InventoryIcon: <InventoryIcon />,
    DescriptionIcon: <DescriptionIcon />,
    AssessmentIcon: <AssessmentIcon />,
    SettingsIcon: <SettingsIcon />,
    WarehouseIcon: <WarehouseIcon />,
    EventIcon: <EventIcon />,
    PendingIcon: <PendingIcon />,
    CheckCircleIcon: <CheckCircleIcon />
  };

  const loadData = () => {
    try {
      const dbStats = getDatabaseStats();
      setStats(dbStats);

      const tree = menuHierarchyService.getTree();
      setMenuTree(tree);

      const allRoles = userRolesService.getAll();
      setRoles(allRoles);

      const allPermissions = permissionsService.getAll();
      setPermissions(allPermissions);

      const allConfigs = menuConfigurationsService.getAll();
      setConfigurations(allConfigs);

      const recentChanges = changeTrackingService.getAll().slice(-10);
      setChanges(recentChanges);

      setMessage({ type: 'success', text: 'Data loaded successfully!' });
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: `Error loading data: ${error.message}` });
    }
  };

  const handleInitializeSampleData = () => {
    try {
      const success = initializeSampleData();
      if (success) {
        setMessage({ type: 'success', text: 'Sample data initialized successfully!' });
        loadData();
      } else {
        setMessage({ type: 'error', text: 'Failed to initialize sample data' });
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  const handleClearDatabase = () => {
    if (window.confirm('Are you sure you want to clear all database data?')) {
      try {
        clearDatabase();
        setMessage({ type: 'success', text: 'Database cleared successfully!' });
        loadData();
      } catch (error) {
        setMessage({ type: 'error', text: `Error clearing database: ${error.message}` });
      }
    }
  };

  const handleExportDatabase = () => {
    try {
      const jsonData = exportDatabase();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customs-portal-db-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Database exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: `Error exporting database: ${error.message}` });
    }
  };

  useEffect(() => {
    initializeDatabase();
    loadData();
  }, []);

  const renderMenuTree = (items, level = 0) => {
    return items.map(item => (
      <Box key={item.id} sx={{ ml: level * 3 }}>
        <ListItem>
          <ListItemIcon>
            {iconMap[item.icon] || <InventoryIcon />}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            secondary={`Path: ${item.path || 'N/A'} | Order: ${item.order} | Level: ${item.level}`}
          />
          <Chip
            label={item.isActive ? 'Active' : 'Inactive'}
            color={item.isActive ? 'success' : 'default'}
            size="small"
          />
        </ListItem>
        {item.children && item.children.length > 0 && (
          <List>
            {renderMenuTree(item.children, level + 1)}
          </List>
        )}
      </Box>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
          Customs Portal Menu Database Demo
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Complete local storage database system with 5 entities
        </Typography>
      </Box>

      {/* Message Alert */}
      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleInitializeSampleData}
            color="primary"
          >
            Initialize Sample Data
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Reload Data
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportDatabase}
            color="success"
          >
            Export Database
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleClearDatabase}
            color="error"
          >
            Clear Database
          </Button>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Menu Items</Typography>
                <Typography variant="h4">{stats.menuItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Permissions</Typography>
                <Typography variant="h4">{stats.permissions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">User Roles</Typography>
                <Typography variant="h4">{stats.userRoles}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Configurations</Typography>
                <Typography variant="h4">{stats.configurations}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Change Records</Typography>
                <Typography variant="h4">{stats.changeRecords}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Cache Size</Typography>
                <Typography variant="h4">{stats.cacheSize}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Menu Hierarchy */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Menu Hierarchy ({menuTree.length} root items)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {renderMenuTree(menuTree)}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* User Roles */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">User Roles ({roles.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Menus</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>
                      <Chip label={role.code} size="small" />
                    </TableCell>
                    <TableCell>{role.permissionIds.length}</TableCell>
                    <TableCell>{role.menuIds.length}</TableCell>
                    <TableCell>{role.priority}</TableCell>
                    <TableCell>
                      <Chip
                        label={role.isActive ? 'Active' : 'Inactive'}
                        color={role.isActive ? 'success' : 'default'}
                        size="small"
                      />
                      {role.isSystem && (
                        <Chip label="System" color="warning" size="small" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Permissions */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Permissions ({permissions.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map(perm => (
                  <TableRow key={perm.id}>
                    <TableCell>{perm.name}</TableCell>
                    <TableCell>
                      <Chip label={perm.code} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={perm.category}
                        color={
                          perm.category === 'ADMIN' ? 'error' :
                          perm.category === 'WRITE' ? 'warning' :
                          perm.category === 'DELETE' ? 'error' :
                          perm.category === 'EXECUTE' ? 'info' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{perm.resource}</TableCell>
                    <TableCell>{perm.action}</TableCell>
                    <TableCell>
                      <Chip
                        label={perm.isActive ? 'Active' : 'Inactive'}
                        color={perm.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Menu Configurations */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Menu Configurations ({configurations.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Config Type</TableCell>
                  <TableCell>Menu ID</TableCell>
                  <TableCell>Role ID</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Settings</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configurations.map(config => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Chip label={config.configType} size="small" color="primary" />
                    </TableCell>
                    <TableCell>{config.menuId.substring(0, 15)}...</TableCell>
                    <TableCell>{config.roleId ? config.roleId.substring(0, 15) + '...' : 'N/A'}</TableCell>
                    <TableCell>{config.priority}</TableCell>
                    <TableCell>{Object.keys(config.settings).length} settings</TableCell>
                    <TableCell>
                      <Chip
                        label={config.isActive ? 'Active' : 'Inactive'}
                        color={config.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Recent Changes */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Recent Changes (Last 10)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Entity Type</TableCell>
                  <TableCell>Operation</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Changes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changes.map(change => (
                  <TableRow key={change.id}>
                    <TableCell>{new Date(change.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={change.entityType} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={change.operation}
                        color={
                          change.operation === 'CREATE' ? 'success' :
                          change.operation === 'UPDATE' ? 'info' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{change.userName}</TableCell>
                    <TableCell>
                      {change.changes ? `${change.changes.length} fields` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CustomsPortalMenuDemo;
