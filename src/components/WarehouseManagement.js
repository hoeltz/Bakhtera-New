import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
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
  Snackbar,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';

// BC Categories for Indonesia Customs
const BC_CATEGORIES = [
  { value: 'BC 2.3', label: '🏭 BC 2.3 - Import dari Luar Negeri' },
  { value: 'BC 2.5', label: '💰 BC 2.5 - Penjualan Lokal' },
  { value: 'BC 2.7', label: '🔄 BC 2.7 - Transfer antar TPPh' },
  { value: 'BC 3.0', label: '↩️ BC 3.0 - Re-export' }
];

// Indonesian Cities
const INDONESIAN_CITIES = [
  { value: 'Jakarta', label: 'Jakarta' },
  { value: 'Surabaya', label: 'Surabaya' },
  { value: 'Bandung', label: 'Bandung' },
  { value: 'Medan', label: 'Medan' },
  { value: 'Semarang', label: 'Semarang' },
  { value: 'Makassar', label: 'Makassar' },
  { value: 'Palembang', label: 'Palembang' },
  { value: 'Denpasar', label: 'Denpasar' },
  { value: 'Manado', label: 'Manado' },
  { value: 'Balikpapan', label: 'Balikpapan' },
  { value: 'Pekanbaru', label: 'Pekanbaru' },
  { value: 'Bandar Lampung', label: 'Bandar Lampung' }
];

// Countries
const COUNTRIES = [
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'Malaysia', label: '🇲🇾 Malaysia' },
  { value: 'Thailand', label: '🇹🇭 Thailand' },
  { value: 'Vietnam', label: '🇻🇳 Vietnam' },
  { value: 'Philippines', label: '🇵🇭 Philippines' },
  { value: 'China', label: '🇨🇳 China' },
  { value: 'Japan', label: '🇯🇵 Japan' },
  { value: 'South Korea', label: '🇰🇷 South Korea' },
  { value: 'India', label: '🇮🇳 India' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'United States', label: '🇺🇸 United States' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'Netherlands', label: '🇳🇱 Netherlands' }
];

// Local storage key for user-added locations
const LOCATIONS_KEY = 'warehouseLocations';

const loadSavedLocations = () => {
  try {
    const raw = localStorage.getItem(LOCATIONS_KEY);
    if (!raw) return { countries: [], cities: [] };
    const parsed = JSON.parse(raw);
    return {
      countries: Array.isArray(parsed.countries) ? parsed.countries : [],
      cities: Array.isArray(parsed.cities) ? parsed.cities : []
    };
  } catch (e) {
    return { countries: [], cities: [] };
  }
};

const saveLocationToStore = (type, option) => {
  // option should be { value, label }
  const data = loadSavedLocations();
  if (type === 'country') {
    // avoid duplicates
    if (!data.countries.find(c => c.value === option.value)) {
      data.countries.push(option);
    }
  } else {
    if (!data.cities.find(c => c.value === option.value)) {
      data.cities.push(option);
    }
  }
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(data));
};

// Get location options based on BC type
const getLocationOptions = (bcType, isOrigin = true) => {
  const saved = loadSavedLocations();
  const needCountries = bcType === 'BC 2.3' || bcType === 'BC 3.0';

  if (needCountries) {
    // merge defaults with saved countries (saved items are objects {value,label})
    const merged = [...COUNTRIES];
    saved.countries.forEach((c) => {
      if (!merged.find(m => m.value === c.value)) merged.push(c);
    });
    return merged;
  }

  // Indonesian cities by default
  const mergedCities = [...INDONESIAN_CITIES];
  saved.cities.forEach((c) => {
    if (!mergedCities.find(m => m.value === c.value)) mergedCities.push(c);
  });
  return mergedCities;
};

// Get location label based on BC type
const getLocationLabel = (bcType, isOrigin = true) => {
  const prefix = isOrigin ? 'Lokasi Asal' : 'Lokasi Tujuan';
  
  switch (bcType) {
    case 'BC 2.3': // Import from abroad
      return `${prefix} (Negara)`;
    case 'BC 2.5': // Local sales
      return `${prefix} (Kota Indonesia)`;
    case 'BC 2.7': // Transfer between TPPA
      return `${prefix} (Kota Indonesia)`;
    case 'BC 3.0': // Re-export
      return `${prefix} (Negara)`;
    default:
      return prefix;
  }
};

// Status options
const STATUS_OPTIONS = [
  { value: 'Baru Masuk', label: 'Baru Masuk' },
  { value: 'Proses BC', label: 'Proses BC' },
  { value: 'Selesai BC', label: 'Selesai BC' },
  { value: 'Siap Keluar', label: 'Siap Keluar' },
  { value: 'Sudah Keluar', label: 'Sudah Keluar' }
];

// Sample data for demonstration
const createSampleData = () => {
  const sampleConsignments = [
    {
      id: 'WH-1731234567001',
      awbNumber: 'AWB-001-2024',
      blNumber: 'BL-SIN-001',
      consignee: 'PT. Maju Jaya Tbk',
      asalBC: 'BC 2.3',
      asalLokasi: 'China',
      tujuanBC: 'BC 2.3',
      tujuanLokasi: 'Jakarta',
      tanggalMasuk: '2024-11-05',
      tanggalKeluar: '2024-11-12',
      status: 'Siap Keluar',
      keterangan: 'HS: 8517.62.00 - Electronics',
      lokasi: 'Gudang A, Zona 1, Rack B-05',
      documents: [
        {
          id: 'DOC-1731234567001',
          name: 'Invoice_Electronics.pdf',
          type: 'application/pdf',
          size: 245760,
          uploadDate: '2024-11-05T10:30:00.000Z',
          url: '#'
        },
        {
          id: 'DOC-1731234567002',
          name: 'Packing_List.jpg',
          type: 'image/jpeg',
          size: 1024000,
          uploadDate: '2024-11-05T10:35:00.000Z',
          url: '#'
        }
      ],
      createdAt: '2024-11-05T09:00:00.000Z',
      updatedAt: '2024-11-10T14:20:00.000Z'
    },
    {
      id: 'WH-1731234567002',
      awbNumber: 'AWB-002-2024',
      blNumber: 'BL-SIN-002',
      consignee: 'CV. Sukses Mandiri',
      asalBC: 'BC 2.5',
      asalLokasi: 'Jakarta',
      tujuanBC: 'BC 2.5',
      tujuanLokasi: 'Surabaya',
      tanggalMasuk: '2024-11-07',
      tanggalKeluar: '',
      status: 'Proses BC',
      keterangan: 'HS: 6109.10.00 - Textiles',
      lokasi: 'Gudang B, Zona 2, Rack C-12',
      documents: [
        {
          id: 'DOC-1731234567003',
          name: 'Commercial_Invoice.pdf',
          type: 'application/pdf',
          size: 156432,
          uploadDate: '2024-11-07T08:15:00.000Z',
          url: '#'
        }
      ],
      createdAt: '2024-11-07T08:00:00.000Z',
      updatedAt: '2024-11-10T16:45:00.000Z'
    },
    {
      id: 'WH-1731234567003',
      awbNumber: 'AWB-003-2024',
      blNumber: 'BL-SIN-003',
      consignee: 'PT. Logistik Nusantara',
      asalBC: 'BC 2.7',
      asalLokasi: 'Bandung',
      tujuanBC: 'BC 2.7',
      tujuanLokasi: 'Jakarta',
      tanggalMasuk: '2024-11-08',
      tanggalKeluar: '',
      status: 'Baru Masuk',
      keterangan: 'HS: 3907.50.00 - Plastics',
      lokasi: 'Gudang C, Zona 1, Rack A-08',
      documents: [],
      createdAt: '2024-11-08T11:30:00.000Z',
      updatedAt: '2024-11-08T11:30:00.000Z'
    },
    {
      id: 'WH-1731234567004',
      awbNumber: 'AWB-004-2024',
      blNumber: 'BL-SIN-004',
      consignee: 'UD. Sumber Rejeki',
      asalBC: 'BC 3.0',
      asalLokasi: 'Jakarta',
      tujuanBC: 'BC 3.0',
      tujuanLokasi: 'Malaysia',
      tanggalMasuk: '2024-11-06',
      tanggalKeluar: '2024-11-09',
      status: 'Sudah Keluar',
      keterangan: 'HS: 8703.21.00 - Vehicle Parts',
      lokasi: 'Gudang A, Zona 3, Rack D-15',
      documents: [
        {
          id: 'DOC-1731234567004',
          name: 'Damage_Report.pdf',
          type: 'application/pdf',
          size: 89432,
          uploadDate: '2024-11-06T13:20:00.000Z',
          url: '#'
        }
      ],
      createdAt: '2024-11-06T12:00:00.000Z',
      updatedAt: '2024-11-09T17:30:00.000Z'
    },
    {
      id: 'WH-1731234567005',
      awbNumber: 'AWB-005-2024',
      blNumber: 'BL-SIN-005',
      consignee: 'PT. Global Trading',
      asalBC: 'BC 2.3',
      asalLokasi: 'Japan',
      tujuanBC: 'BC 2.3',
      tujuanLokasi: 'Medan',
      tanggalMasuk: '2024-11-09',
      tanggalKeluar: '',
      status: 'Selesai BC',
      keterangan: 'HS: 2804.69.00 - Chemicals',
      lokasi: 'Gudang B, Zona Khusus, Rack X-01',
      documents: [
        {
          id: 'DOC-1731234567005',
          name: 'Safety_Data_Sheet.pdf',
          type: 'application/pdf',
          size: 678234,
          uploadDate: '2024-11-09T09:45:00.000Z',
          url: '#'
        },
        {
          id: 'DOC-1731234567006',
          name: 'Hazardous_Material_Permit.png',
          type: 'image/png',
          size: 2345678,
          uploadDate: '2024-11-09T09:50:00.000Z',
          url: '#'
        }
      ],
      createdAt: '2024-11-09T09:00:00.000Z',
      updatedAt: '2024-11-10T12:15:00.000Z'
    }
  ];

  return { consignments: sampleConsignments };
};

// Data service
const warehouseService = {
  getAll: () => {
    const data = localStorage.getItem('warehouseData');
    if (data) {
      return JSON.parse(data);
    } else {
      // Create sample data if none exists
      const sampleData = createSampleData();
      localStorage.setItem('warehouseData', JSON.stringify(sampleData));
      return sampleData;
    }
  },
  
  save: (data) => {
    localStorage.setItem('warehouseData', JSON.stringify(data));
  },
  
  create: (consignment) => {
    const data = warehouseService.getAll();
    consignment.id = `WH-${Date.now()}`;
    consignment.createdAt = new Date().toISOString();
    consignment.updatedAt = new Date().toISOString();
    consignment.documents = []; // Initialize documents array
    data.consignments.push(consignment);
    warehouseService.save(data);
    return consignment;
  },
  
  update: (id, updates) => {
    const data = warehouseService.getAll();
    const index = data.consignments.findIndex(c => c.id === id);
    if (index !== -1) {
      data.consignments[index] = { 
        ...data.consignments[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      warehouseService.save(data);
      return data.consignments[index];
    }
    return null;
  },
  
  delete: (id) => {
    const data = warehouseService.getAll();
    data.consignments = data.consignments.filter(c => c.id !== id);
    warehouseService.save(data);
  }
};

// Confirmation Dialog Component
const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading = false }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Document Management Component
const DocumentManager = ({ consignment, onDocumentsUpdate }) => {
  const [documents, setDocuments] = useState(consignment?.documents || []);

  useEffect(() => {
    setDocuments(consignment?.documents || []);
  }, [consignment]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const document = {
        id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file) // In real app, this would be uploaded to server
      };
      
      setDocuments(prev => [...prev, document]);
    });

    // Update parent component
    if (onDocumentsUpdate) {
      onDocumentsUpdate([...documents, ...files.map(file => ({
        id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file)
      }))]);
    }
  };

  const handleDeleteDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    if (onDocumentsUpdate) {
      onDocumentsUpdate(documents.filter(doc => doc.id !== docId));
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <PdfIcon color="error" />;
    if (type.includes('image')) return <ImageIcon color="primary" />;
    return <DocumentIcon color="default" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Documents</Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          size="small"
        >
          Upload Document
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Button>
      </Box>

      {documents.length === 0 ? (
        <Alert severity="info">No documents uploaded yet</Alert>
      ) : (
        <List>
          {documents.map((doc) => (
            <ListItem key={doc.id} divider>
              <Box display="flex" alignItems="center" mr={2}>
                {getFileIcon(doc.type)}
              </Box>
              <ListItemText
                primary={doc.name}
                secondary={`${formatFileSize(doc.size)} • Uploaded: ${new Date(doc.uploadDate).toLocaleDateString('id-ID')}`}
              />
              <ListItemSecondaryAction>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    View
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

// Form Dialog Component
const ConsignmentFormDialog = ({ open, onClose, onSave, consignment, loading }) => {
  const [formData, setFormData] = useState(consignment || {
    awbNumber: '',
    blNumber: '',
    consignee: '',
    asalBC: 'BC 2.3',
    asalLokasi: '',
    tujuanBC: 'BC 2.3',
    tujuanLokasi: '',
    tanggalMasuk: '',
    tanggalKeluar: '',
    status: 'Baru Masuk',
    lokasi: '',
    keterangan: '',
    documents: []
  });

  useEffect(() => {
    if (consignment) {
      setFormData(consignment);
    } else {
      setFormData({
        awbNumber: '',
        blNumber: '',
        consignee: '',
        asalBC: 'BC 2.3',
        asalLokasi: '',
        tujuanBC: 'BC 2.3',
        tujuanLokasi: '',
        tanggalMasuk: '',
        tanggalKeluar: '',
        status: 'Baru Masuk',
        lokasi: '',
        keterangan: '',
        documents: []
      });
    }
  }, [consignment, open]);

  // State for add-location dialog
  const [addLocDialog, setAddLocDialog] = useState({ open: false, field: null, isCountry: false });

  const handleOpenAddLocation = (fieldName, isCountry) => {
    setAddLocDialog({ open: true, field: fieldName, isCountry });
  };

  const handleAddLocationSave = (inputValue) => {
    const trimmed = (inputValue || '').trim();
    if (!trimmed) return;
    const option = { value: trimmed, label: trimmed };
    saveLocationToStore(addLocDialog.isCountry ? 'country' : 'city', option);
    // set the value into form
    setFormData(prev => ({ ...prev, [addLocDialog.field]: trimmed }));
    setAddLocDialog({ open: false, field: null, isCountry: false });
  };

  const handleCancelAddLocation = () => {
    setAddLocDialog({ open: false, field: null, isCountry: false });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (consignment) {
      await onSave(consignment.id, formData);
    } else {
      await onSave(formData);
    }
  };

  const handleDocumentsUpdate = (documents) => {
    setFormData(prev => ({ ...prev, documents }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {consignment ? 'Edit Consignment' : 'New Consignment'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="No. AWB"
                value={formData.awbNumber}
                onChange={(e) => handleChange('awbNumber', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="No. BL"
                value={formData.blNumber}
                onChange={(e) => handleChange('blNumber', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Consignee"
                value={formData.consignee}
                onChange={(e) => handleChange('consignee', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Asal BC</InputLabel>
                <Select
                  value={formData.asalBC}
                  onChange={(e) => {
                    handleChange('asalBC', e.target.value);
                    // Clear origin location when BC type changes
                    handleChange('asalLokasi', '');
                  }}
                  label="Asal BC"
                >
                  {BC_CATEGORIES.map((bc) => (
                    <MenuItem key={bc.value} value={bc.value}>
                      {bc.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{getLocationLabel(formData.asalBC, true)}</InputLabel>
                <Select
                  value={formData.asalLokasi}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__add__') {
                      const isCountry = formData.asalBC === 'BC 2.3' || formData.asalBC === 'BC 3.0';
                      handleOpenAddLocation('asalLokasi', isCountry);
                    } else {
                      handleChange('asalLokasi', val);
                    }
                  }}
                  label={getLocationLabel(formData.asalBC, true)}
                >
                  {getLocationOptions(formData.asalBC, true).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                  <MenuItem value="__add__"><em>+ Tambah {formData.asalBC === 'BC 2.3' || formData.asalBC === 'BC 3.0' ? 'Negara' : 'Kota'}</em></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tujuan BC</InputLabel>
                <Select
                  value={formData.tujuanBC}
                  onChange={(e) => {
                    handleChange('tujuanBC', e.target.value);
                    // Clear destination location when BC type changes
                    handleChange('tujuanLokasi', '');
                  }}
                  label="Tujuan BC"
                >
                  {BC_CATEGORIES.map((bc) => (
                    <MenuItem key={bc.value} value={bc.value}>
                      {bc.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{getLocationLabel(formData.tujuanBC, false)}</InputLabel>
                <Select
                  value={formData.tujuanLokasi}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__add__') {
                      const isCountry = formData.tujuanBC === 'BC 2.3' || formData.tujuanBC === 'BC 3.0';
                      handleOpenAddLocation('tujuanLokasi', isCountry);
                    } else {
                      handleChange('tujuanLokasi', val);
                    }
                  }}
                  label={getLocationLabel(formData.tujuanBC, false)}
                >
                  {getLocationOptions(formData.tujuanBC, false).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                  <MenuItem value="__add__"><em>+ Tambah {formData.tujuanBC === 'BC 2.3' || formData.tujuanBC === 'BC 3.0' ? 'Negara' : 'Kota'}</em></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tanggal Masuk"
                type="date"
                value={formData.tanggalMasuk}
                onChange={(e) => handleChange('tanggalMasuk', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tanggal Keluar"
                type="date"
                value={formData.tanggalKeluar}
                onChange={(e) => handleChange('tanggalKeluar', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Status"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lokasi"
                value={formData.lokasi}
                onChange={(e) => handleChange('lokasi', e.target.value)}
                placeholder="Warehouse location, zone, rack, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Keterangan (HS Code - Goods Type)"
                value={formData.keterangan}
                onChange={(e) => handleChange('keterangan', e.target.value)}
                placeholder="e.g., HS: 8517.62.00 - Electronics"
              />
            </Grid>
          </Grid>

          {/* Document Management */}
          {consignment && (
            <Box sx={{ mt: 3 }}>
              <DocumentManager 
                consignment={consignment} 
                onDocumentsUpdate={handleDocumentsUpdate}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      {/* Add location dialog (inline) */}
      <Dialog open={addLocDialog.open} onClose={handleCancelAddLocation}>
        <DialogTitle>Tambah {addLocDialog.isCountry ? 'Negara' : 'Kota'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={addLocDialog.isCountry ? 'Nama Negara' : 'Nama Kota'}
            fullWidth
            variant="standard"
            onChange={(e) => {
              // store temporarily on component level using local state inside dialog via DOM event
              // but to keep code simple, we'll keep value in a small ref-like closure
              // we'll store it on addLocDialog.value
              setAddLocDialog(prev => ({ ...prev, value: e.target.value }));
            }}
            defaultValue=""
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAddLocation}>Cancel</Button>
          <Button onClick={() => handleAddLocationSave(addLocDialog.value)} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

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

// Detail View Dialog Component
const DetailViewDialog = ({ open, onClose, consignment, onEdit, onDelete, onDispatch, dispatchLoading }) => {
  if (!consignment) return null;

  const getBCInfo = (bcType) => {
    const bcInfo = {
      'BC 2.3': {
        title: 'Import dari Luar Negeri',
        description: 'Barang masuk dari luar negeri',
        color: 'success'
      },
      'BC 2.5': {
        title: 'Penjualan Lokal',
        description: 'Barang dijual di dalam negeri',
        color: 'warning'
      },
      'BC 2.7': {
        title: 'Transfer antar TPPh',
        description: 'Pindah gudang ke TPPh lain',
        color: 'info'
      },
      'BC 3.0': {
        title: 'Re-export',
        description: 'Barang dikembalikan ke luar negeri',
        color: 'error'
      }
    };
    return bcInfo[bcType] || bcInfo['BC 2.3'];
  };

  const bcInfo = getBCInfo(consignment.asalBC);
  const isDispatched = consignment.dispatchedToInventory === true;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Consignment Details</Typography>
          <Chip 
            label={consignment.status} 
            color={
              consignment.status === 'Sudah Keluar' ? 'success' :
              consignment.status === 'Siap Keluar' ? 'primary' :
              consignment.status === 'Selesai BC' ? 'info' : 'warning'
            }
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">AWB Number</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {consignment.awbNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">BL Number</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {consignment.blNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Consignee</Typography>
                    <Typography variant="body1">
                      {consignment.consignee || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Tujuan Barang</Typography>
                    <Typography variant="body1">
                      {consignment.tujuanBarang || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* BC Information */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏛️ BC Category
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip 
                    label={consignment.asalBC} 
                    color={bcInfo.color}
                    variant="outlined"
                  />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {bcInfo.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {bcInfo.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Timeline */}
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📅 Timeline
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Tanggal Masuk</Typography>
                    <Typography variant="body1">
                      {consignment.tanggalMasuk ? new Date(consignment.tanggalMasuk).toLocaleDateString('id-ID') : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Tanggal Keluar</Typography>
                    <Typography variant="body1">
                      {consignment.tanggalKeluar ? new Date(consignment.tanggalKeluar).toLocaleDateString('id-ID') : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📍 Location
                </Typography>
                <Typography variant="body1">
                  {consignment.lokasi || 'Location not specified'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes */}
          {consignment.keterangan && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📝 Notes
                  </Typography>
                  <Typography variant="body1">
                    {consignment.keterangan}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Documents */}
          <Grid item xs={12}>
            <DocumentManager consignment={consignment} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {consignment.status === 'Sudah Keluar' && !isDispatched && (
          <Button
            variant="contained"
            color="success"
            onClick={() => onDispatch(consignment)}
            disabled={dispatchLoading}
          >
            {dispatchLoading ? 'Dispatching...' : 'Dispatch to Inventory'}
          </Button>
        )}
        {isDispatched && (
          <Chip
            label="✓ Dispatched to Inventory"
            color="success"
            variant="outlined"
            icon={<VisibilityIcon />}
          />
        )}
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {
            onEdit(consignment);
          }}
        >
          Edit
        </Button>
      </DialogActions>
      
      {/* Delete Section at Bottom */}
      <Box sx={{
        mt: 2,
        p: 2,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          size="small"
          onClick={() => {
            onDelete(consignment);
          }}
        >
          Delete Entry
        </Button>
      </Box>
    </Dialog>
  );
};

// Main Warehouse Management Component
const WarehouseManagement = () => {
  const LOCAL_API = process.env.REACT_APP_LOCAL_STORAGE_SERVER_URL || '';
  const [consignments, setConsignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, consignment: null });
  const [loading, setLoading] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Load data
  const loadData = useCallback(() => {
    const data = warehouseService.getAll();
    setConsignments(data.consignments || []);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter consignments
  const filteredConsignments = consignments.filter(consignment => {
    const matchesSearch =
      consignment.awbNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.blNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.consignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.tujuanBarang?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // CRUD operations
  const handleAdd = () => {
    setSelectedConsignment(null);
    setDialogOpen(true);
  };

  const handleEdit = (consignment) => {
    setSelectedConsignment(consignment);
    setDialogOpen(true);
  };

  // Helper function for safe server sync (completely non-blocking)
  const syncToLocalServer = async (method, url, data) => {
    // Fire and forget - no await, no try-catch that blocks
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => {
      // Silently fail - server sync is optional
      console.debug('Server sync skipped:', err.message);
    });
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (selectedConsignment) {
        const updated = warehouseService.update(selectedConsignment.id, data);
        setNotification({ open: true, message: 'Consignment updated successfully!', severity: 'success' });
        // Non-blocking server sync
        syncToLocalServer('PUT', `${LOCAL_API}/api/consignments/${encodeURIComponent(updated.id)}`, updated);
      } else {
        const created = warehouseService.create(data);
        setNotification({ open: true, message: 'Consignment created successfully!', severity: 'success' });
        // Non-blocking server sync
        syncToLocalServer('POST', `${LOCAL_API}/api/consignments`, created);
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Save error:', error);
      setNotification({ 
        open: true, 
        message: `Error saving consignment: ${error.message}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (consignment) => {
    setConfirmDialog({ open: true, consignment });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      // delete locally first
      warehouseService.delete(confirmDialog.consignment.id);
      setNotification({ open: true, message: 'Consignment deleted successfully!', severity: 'success' });
      // attempt to delete on local storage server (non-blocking)
      syncToLocalServer('DELETE', `${LOCAL_API}/api/consignments/${encodeURIComponent(confirmDialog.consignment.id)}`);
      setConfirmDialog({ open: false, consignment: null });
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      setNotification({ 
        open: true, 
        message: `Error deleting consignment: ${error.message}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (consignment) => {
    setSelectedConsignment(consignment);
    setDetailDialogOpen(true);
  };

  const handleEditFromDetail = (consignment) => {
    setDetailDialogOpen(false);
    setSelectedConsignment(consignment);
    setDialogOpen(true);
  };

  const handleDeleteFromDetail = (consignment) => {
    setDetailDialogOpen(false);
    setConfirmDialog({ open: true, consignment });
  };

  // Dispatch consignment to inventory
  const handleDispatch = async (consignment) => {
    // Parse SKU from keterangan (format: "HS: XXXX - Description")
    const keteranganParts = (consignment.keterangan || '').split(' - ');
    const hsCode = keteranganParts[0]?.replace('HS: ', '').trim();
    
    if (!hsCode) {
      setNotification({ 
        open: true, 
        message: 'Cannot dispatch: HS Code not found in description. Please edit and add HS Code.', 
        severity: 'error' 
      });
      return;
    }

    // Get warehouse from tujuan lokasi - simplified: use first matching warehouse name
    // For now, we'll prompt user to select which warehouse this consignment is being dispatched from
    // Actually, use asalLokasi if it's a local warehouse, otherwise tujuanLokasi
    const warehouseId = mapLocationToWarehouseId(consignment.asalLokasi || consignment.tujuanLokasi);
    
    if (!warehouseId) {
      setNotification({ 
        open: true, 
        message: 'Cannot dispatch: Warehouse not found. Please ensure location is set correctly.', 
        severity: 'error' 
      });
      return;
    }

    // TODO: For now, assume qty = 100 as placeholder. In real implementation, would add qty field
    const qty = 100;

    setDispatchLoading(true);
    try {
      const response = await fetch(`${LOCAL_API}/api/consignments/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consignmentId: consignment.id,
          warehouseId,
          items: [{ sku: hsCode, qty }]
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        setNotification({ 
          open: true, 
          message: `Dispatch failed: ${result.message || 'Unknown error'}`, 
          severity: 'error' 
        });
        return;
      }

      // Mark consignment as dispatched
      const updated = warehouseService.update(consignment.id, {
        dispatchedToInventory: true,
        dispatchedAt: new Date().toISOString()
      });
      
      setSelectedConsignment(updated);
      setNotification({ 
        open: true, 
        message: `✓ Consignment dispatched! Inventory decremented by ${qty}.`, 
        severity: 'success' 
      });
      loadData();
    } catch (error) {
      console.error('Dispatch error:', error);
      setNotification({ 
        open: true, 
        message: `Dispatch error: ${error.message}`, 
        severity: 'error' 
      });
    } finally {
      setDispatchLoading(false);
    }
  };

  // Map location to warehouse ID
  const mapLocationToWarehouseId = (location) => {
    // Hardcoded mapping for now - could be dynamic from server later
    const locationMap = {
      'Jakarta': 'wh-jakarta-01',
      'Jakarta Port': 'wh-jakarta-02',
      'Surabaya': 'wh-surabaya-01',
      'Bandung': 'wh-bandung-01',
      'Medan': 'wh-medan-01'
    };
    return locationMap[location] || null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Baru Masuk': return 'default';
      case 'Proses BC': return 'warning';
      case 'Selesai BC': return 'info';
      case 'Siap Keluar': return 'primary';
      case 'Sudah Keluar': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Warehouse Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add New Entry
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Search AWB, BL Number, or Consignee..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      {/* Main Table */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600, minWidth: '800px' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>No. AWB</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>No. BL</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '180px' }}>Consignee</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Asal BC</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Lokasi Asal</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Tujuan BC</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Lokasi Tujuan</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Tgl Masuk</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Tgl Keluar</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '100px' }}>Status</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '150px' }}>Lokasi</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', py: 1, minWidth: '200px' }}>Keterangan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConsignments.map((consignment) => {
                // Parse keterangan for HS Code and goods type
                const keteranganParts = consignment.keterangan ? consignment.keterangan.split(' - ') : [];
                const hsCode = keteranganParts[0] || '';
                const goodsType = keteranganParts[1] || '';
                
                return (
                  <TableRow
                    key={consignment.id}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: '#f0f8ff', cursor: 'pointer' },
                      '&:active': { backgroundColor: '#e6f3ff' }
                    }}
                    onClick={() => handleView(consignment)}
                  >
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Typography variant="body2">
                        {consignment.awbNumber || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Typography variant="body2">
                        {consignment.blNumber || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                        {consignment.consignee || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Chip
                        label={consignment.asalBC || 'BC 2.3'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {consignment.asalLokasi || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Chip
                        label={consignment.tujuanBC || 'BC 2.3'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {consignment.tujuanLokasi || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Typography variant="body2">
                        {consignment.tanggalMasuk ?
                          new Date(consignment.tanggalMasuk).toLocaleDateString('id-ID') :
                          '-'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Typography variant="body2">
                        {consignment.tanggalKeluar ?
                          new Date(consignment.tanggalKeluar).toLocaleDateString('id-ID') :
                          '-'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Chip
                        label={consignment.status || 'Baru Masuk'}
                        color={getStatusColor(consignment.status)}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                        {consignment.lokasi || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.75rem' }}>
                      <Box>
                        {hsCode && (
                          <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                            {hsCode}
                          </Typography>
                        )}
                        {goodsType && (
                          <Typography variant="body2" sx={{ lineHeight: 1.2, color: 'text.secondary' }}>
                            {goodsType}
                          </Typography>
                        )}
                        {!hsCode && !goodsType && (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredConsignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <Typography color="textSecondary" sx={{ py: 2, fontSize: '0.75rem' }}>
                      {consignments.length === 0 ?
                        'No entries found. Add your first entry!' :
                        'No entries match your search criteria.'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Form Dialog */}
      <ConsignmentFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        consignment={selectedConsignment}
        loading={loading}
      />

      {/* Detail View Dialog */}
      <DetailViewDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        consignment={selectedConsignment}
        onEdit={() => handleEditFromDetail(selectedConsignment)}
        onDelete={() => handleDeleteFromDetail(selectedConsignment)}
        onDispatch={handleDispatch}
        dispatchLoading={dispatchLoading}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, consignment: null })}
        onConfirm={confirmDelete}
        title="Delete Consignment"
        message={`Are you sure you want to delete this entry? This action cannot be undone.`}
        loading={loading}
      />

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WarehouseManagement;