import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Tooltip,
  Fab,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
  Calculate as CalculateIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

import dataSyncService from '../services/dataSync';
import notificationService from '../services/notificationService';
import warehouseDataService from '../services/warehouseDataService';
import { formatCurrency, formatNumber } from '../services/currencyUtils';
import BridgeHeader from './BridgeHeader';
import BridgeStatCard from './BridgeStatCard';

// Integrated Accounting Ledger for B-ridge
const BRidgeAccountingLedger = ({ onNotification }) => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [accountStats, setAccountStats] = useState({
    totalDebits: 0,
    totalCredits: 0,
    netBalance: 0,
    entryCount: 0
  });

  // Chart of accounts
  const chartOfAccounts = [
    { code: '1000', name: 'Cash and Cash Equivalents', type: 'Asset' },
    { code: '1100', name: 'Accounts Receivable', type: 'Asset' },
    { code: '1200', name: 'Inventory', type: 'Asset' },
    { code: '1300', name: 'Fixed Assets', type: 'Asset' },
    { code: '2000', name: 'Accounts Payable', type: 'Liability' },
    { code: '2100', name: 'Accrued Expenses', type: 'Liability' },
    { code: '3000', name: 'Owner\'s Equity', type: 'Equity' },
    { code: '4000', name: 'Service Revenue', type: 'Revenue' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'Expense' },
    { code: '6000', name: 'Operating Expenses', type: 'Expense' },
    { code: '7000', name: 'Administrative Expenses', type: 'Expense' }
  ];

  // Load ledger entries
  const loadLedgerEntries = useCallback(async () => {
    setLoading(true);
    try {
      // Get existing ledger entries using the new service
      const ledgerEntries = warehouseDataService.getLedgerEntries();
      
      // Initialize with sample data if none exists
      if (!ledgerEntries || ledgerEntries.length === 0) {
        const sampleEntries = [
          {
            id: 'LED-001',
            date: '2024-11-01',
            reference: 'INV-2024-001',
            description: 'Revenue from warehouse services',
            accountCode: '4000',
            accountName: 'Service Revenue',
            debit: 3108000,
            credit: 0,
            entryType: 'Revenue',
            linkedDocument: 'INV-2024-001',
            linkedCustomer: 'PT. ABC Trading',
            status: 'Posted',
            createdBy: 'Finance Team'
          },
          {
            id: 'LED-002',
            date: '2024-11-01',
            reference: 'INV-2024-001',
            description: 'Cash received from customer',
            accountCode: '1000',
            accountName: 'Cash and Cash Equivalents',
            debit: 3108000,
            credit: 0,
            entryType: 'Asset',
            linkedDocument: 'INV-2024-001',
            linkedCustomer: 'PT. ABC Trading',
            status: 'Posted',
            createdBy: 'Finance Team'
          },
          {
            id: 'LED-003',
            date: '2024-11-02',
            reference: 'PO-V-001',
            description: 'Inventory purchases',
            accountCode: '1200',
            accountName: 'Inventory',
            debit: 2500000,
            credit: 0,
            entryType: 'Asset',
            linkedDocument: 'PO-V-001',
            linkedVendor: 'Container Solutions Indonesia',
            status: 'Posted',
            createdBy: 'Procurement Team'
          },
          {
            id: 'LED-004',
            date: '2024-11-02',
            reference: 'PO-V-001',
            description: 'Payment to vendor',
            accountCode: '2000',
            accountName: 'Accounts Payable',
            debit: 0,
            credit: 2500000,
            entryType: 'Liability',
            linkedDocument: 'PO-V-001',
            linkedVendor: 'Container Solutions Indonesia',
            status: 'Posted',
            createdBy: 'Procurement Team'
          },
          {
            id: 'LED-005',
            date: '2024-11-03',
            reference: 'EXP-001',
            description: 'Operating expenses - electricity',
            accountCode: '6000',
            accountName: 'Operating Expenses',
            debit: 850000,
            credit: 0,
            entryType: 'Expense',
            linkedDocument: 'EXP-001',
            status: 'Posted',
            createdBy: 'Operations Team'
          },
          {
            id: 'LED-006',
            date: '2024-11-03',
            reference: 'EXP-001',
            description: 'Cash payment for expenses',
            accountCode: '1000',
            accountName: 'Cash and Cash Equivalents',
            debit: 0,
            credit: 850000,
            entryType: 'Asset',
            linkedDocument: 'EXP-001',
            status: 'Posted',
            createdBy: 'Operations Team'
          },
          {
            id: 'LED-007',
            date: '2024-11-08',
            reference: 'INV-2024-002',
            description: 'Revenue from customs clearance services',
            accountCode: '4000',
            accountName: 'Service Revenue',
            debit: 1998000,
            credit: 0,
            entryType: 'Revenue',
            linkedDocument: 'INV-2024-002',
            linkedCustomer: 'PT. XYZ Logistics',
            status: 'Posted',
            createdBy: 'Finance Team'
          },
          {
            id: 'LED-008',
            date: '2024-11-08',
            reference: 'INV-2024-002',
            description: 'Accounts receivable from customer',
            accountCode: '1100',
            accountName: 'Accounts Receivable',
            debit: 1998000,
            credit: 0,
            entryType: 'Asset',
            linkedDocument: 'INV-2024-002',
            linkedCustomer: 'PT. XYZ Logistics',
            status: 'Posted',
            createdBy: 'Finance Team'
          }
        ];
        
        warehouseDataService.saveLedgerEntries(sampleEntries);
        setLedgerEntries(sampleEntries);
        console.info('✓ BRIDGE Accounting: Seeded %d sample ledger entries', sampleEntries.length);
      } else {
        setLedgerEntries(ledgerEntries);
        console.info('✓ BRIDGE Accounting: Loaded %d ledger entries from storage', ledgerEntries.length);
      }

      // Calculate statistics
      const totalDebits = ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
      const totalCredits = ledgerEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
      
      const stats = {
        totalDebits,
        totalCredits,
        netBalance: totalDebits - totalCredits,
        entryCount: ledgerEntries.length
      };
      setAccountStats(stats);

    } catch (error) {
      console.error('Error loading ledger entries:', error);
      notificationService.showError('Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLedgerEntries();
  }, [loadLedgerEntries]);

  // Filter entries
  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesSearch = 
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.linkedCustomer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.linkedVendor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAccount = selectedAccount === 'all' || entry.accountCode === selectedAccount;
    const matchesType = selectedType === 'all' || entry.entryType === selectedType;
    
    // Date filtering
    let matchesPeriod = true;
    if (selectedPeriod !== 'all') {
      const entryDate = new Date(entry.date);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      switch (selectedPeriod) {
        case 'thisMonth':
          matchesPeriod = entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
          break;
        case 'lastMonth':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          matchesPeriod = entryDate.getMonth() === lastMonth && entryDate.getFullYear() === lastMonthYear;
          break;
        case 'thisYear':
          matchesPeriod = entryDate.getFullYear() === currentYear;
          break;
      }
    }
    
    return matchesSearch && matchesAccount && matchesType && matchesPeriod;
  });

  // Entry form dialog
  const EntryFormDialog = ({ open, onClose, onSave, entry, loading }) => {
    const [formData, setFormData] = useState(entry || {
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      accountCode: '',
      accountName: '',
      debit: 0,
      credit: 0,
      entryType: 'Asset',
      linkedDocument: '',
      linkedCustomer: '',
      linkedVendor: '',
      status: 'Draft'
    });

    const handleSave = async () => {
      await onSave(formData);
      setDialogOpen(false);
    };

    const handleAccountChange = (accountCode) => {
      const account = chartOfAccounts.find(acc => acc.code === accountCode);
      setFormData({
        ...formData,
        accountCode,
        accountName: account ? account.name : '',
        entryType: account ? account.type : ''
      });
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {entry ? 'Edit Ledger Entry' : 'Add New Ledger Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reference"
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
                placeholder="INV-2024-001, PO-V-001, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Account</InputLabel>
                <Select
                  value={formData.accountCode}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  label="Account"
                  required
                >
                  {chartOfAccounts.map(account => (
                    <MenuItem key={account.code} value={account.code}>
                      {account.code} - {account.name} ({account.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Entry Type</InputLabel>
                <Select
                  value={formData.entryType}
                  onChange={(e) => setFormData({...formData, entryType: e.target.value})}
                  label="Entry Type"
                >
                  <MenuItem value="Asset">Asset</MenuItem>
                  <MenuItem value="Liability">Liability</MenuItem>
                  <MenuItem value="Equity">Equity</MenuItem>
                  <MenuItem value="Revenue">Revenue</MenuItem>
                  <MenuItem value="Expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Debit Amount"
                type="number"
                value={formData.debit}
                onChange={(e) => setFormData({...formData, debit: parseFloat(e.target.value) || 0, credit: 0})}
                InputProps={{
                  startAdornment: <Typography>Rp</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credit Amount"
                type="number"
                value={formData.credit}
                onChange={(e) => setFormData({...formData, credit: parseFloat(e.target.value) || 0, debit: 0})}
                InputProps={{
                  startAdornment: <Typography>Rp</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Linked Document"
                value={formData.linkedDocument}
                onChange={(e) => setFormData({...formData, linkedDocument: e.target.value})}
                placeholder="Invoice, PO, etc."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer"
                value={formData.linkedCustomer}
                onChange={(e) => setFormData({...formData, linkedCustomer: e.target.value})}
                placeholder="Optional"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vendor"
                value={formData.linkedVendor}
                onChange={(e) => setFormData({...formData, linkedVendor: e.target.value})}
                placeholder="Optional"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Handle save entry
  const handleSaveEntry = async (entryData) => {
    try {
      const currentEntries = warehouseDataService.getLedgerEntries();
      
      if (selectedEntry) {
        // Update existing entry
        const updatedEntries = currentEntries.map(entry =>
          entry.id === selectedEntry.id ? { ...entry, ...entryData } : entry
        );
        warehouseDataService.saveLedgerEntries(updatedEntries);
        notificationService.showSuccess('Ledger entry updated successfully');
      } else {
        // Add new entry
        const newEntry = {
          ...entryData,
          id: `LED-${Date.now()}`,
          createdBy: 'B-ridge User'
        };
        warehouseDataService.saveLedgerEntries([...currentEntries, newEntry]);
        notificationService.showSuccess('Ledger entry created successfully');
      }
      loadLedgerEntries();
    } catch (error) {
      console.error('Error saving ledger entry:', error);
      notificationService.showError('Failed to save ledger entry');
    }
  };

  // Account balance calculation
  const getAccountBalance = (accountCode) => {
    return ledgerEntries
      .filter(entry => entry.accountCode === accountCode)
      .reduce((balance, entry) => {
        return balance + (entry.debit || 0) - (entry.credit || 0);
      }, 0);
  };

  // Trial balance
  const trialBalance = chartOfAccounts.map(account => ({
    ...account,
    balance: getAccountBalance(account.code)
  }));

  return (
    <Box>
      <BridgeHeader
        title="Accounting Ledger"
        subtitle="Integrated financial transactions for BRiDGE"
        actions={(
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => {
              setSelectedEntry(null);
              setDialogOpen(true);
            }}
          >
            Add Entry
          </Button>
        )}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard title="Total Debits" value={formatCurrency(accountStats.totalDebits)} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard title="Total Credits" value={formatCurrency(accountStats.totalCredits)} gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard title="Net Balance" value={formatCurrency(accountStats.netBalance)} gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard title="Total Entries" value={accountStats.entryCount} gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>B-ridge Integration:</strong> All financial transactions from customers, vendors, 
        inventory movements, and warehouse operations are automatically recorded in the accounting ledger.
      </Alert>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Journal Entries" />
          <Tab label="Trial Balance" />
          <Tab label="Account Summary" />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search entries..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Account</InputLabel>
            <Select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              label="Filter by Account"
            >
              <MenuItem value="all">All Accounts</MenuItem>
              {chartOfAccounts.map(account => (
                <MenuItem key={account.code} value={account.code}>
                  {account.code} - {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Filter by Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Asset">Asset</MenuItem>
              <MenuItem value="Liability">Liability</MenuItem>
              <MenuItem value="Equity">Equity</MenuItem>
              <MenuItem value="Revenue">Revenue</MenuItem>
              <MenuItem value="Expense">Expense</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Period</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Filter by Period"
            >
              <MenuItem value="all">All Periods</MenuItem>
              <MenuItem value="thisMonth">This Month</MenuItem>
              <MenuItem value="lastMonth">Last Month</MenuItem>
              <MenuItem value="thisYear">This Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Content based on active tab */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Date</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Debit</TableCell>
                <TableCell>Credit</TableCell>
                <TableCell>Linked To</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>
                    <Typography variant="body2">{entry.date}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {entry.reference || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {entry.accountCode}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {entry.accountName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{entry.description}</Typography>
                  </TableCell>
                  <TableCell>
                    {entry.debit > 0 && (
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {formatCurrency(entry.debit)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.credit > 0 && (
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        {formatCurrency(entry.credit)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      {entry.linkedCustomer && (
                        <Typography variant="caption" display="block">
                          👤 {entry.linkedCustomer}
                        </Typography>
                      )}
                      {entry.linkedVendor && (
                        <Typography variant="caption" display="block">
                          🏢 {entry.linkedVendor}
                        </Typography>
                      )}
                      {entry.linkedDocument && (
                        <Typography variant="caption" display="block">
                          📄 {entry.linkedDocument}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedEntry(entry);
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" sx={{ py: 4 }}>
                      No ledger entries found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Account Code</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trialBalance.map((account) => (
                <TableRow key={account.code}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={account.type} 
                      size="small" 
                      color={
                        account.type === 'Asset' ? 'primary' :
                        account.type === 'Liability' ? 'secondary' :
                        account.type === 'Equity' ? 'info' :
                        account.type === 'Revenue' ? 'success' : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={account.balance >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(account.balance)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <Grid container spacing={2}>
          {chartOfAccounts.map((account) => {
            const balance = getAccountBalance(account.code);
            const entryCount = ledgerEntries.filter(e => e.accountCode === account.code).length;
            return (
              <Grid item xs={12} sm={6} md={4} key={account.code}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {account.code}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {account.name}
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: balance >= 0 ? 'success.main' : 'error.main',
                        mt: 1
                      }}
                    >
                      {formatCurrency(balance)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {entryCount} entries
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog */}
      <EntryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveEntry}
        entry={selectedEntry}
        loading={loading}
      />
    </Box>
  );
};

export default BRidgeAccountingLedger;