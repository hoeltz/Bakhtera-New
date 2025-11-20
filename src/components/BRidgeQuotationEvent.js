import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  TextField,
  Grid,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import BridgeHeader from './BridgeHeader';

const API_BASE = process.env.REACT_APP_LOCAL_STORAGE_SERVER_URL || '';

const BC_TYPES = [
  { value: 'BC23', label: 'BC 2.3' },
  { value: 'BC25', label: 'BC 2.5' },
  { value: 'BC27', label: 'BC 2.7' },
  { value: 'BC30', label: 'BC 3.0' },
];

const emptyItem = () => ({
  id: `I-${Date.now()}`,
  itemName: '',
  sku: '',
  description: '',
  commodityType: '',
  hsCode: '',
  countryOfOrigin: '',
  quantity: 0,
  unitOfMeasure: 'pcs',
  grossWeight: 0,
  netWeight: 0,
  dimensions: '',
  cbm: 0,
  unitPrice: 0,
  total: 0,
});

export default function BRidgeQuotationEvent() {
  const [quotations, setQuotations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const [form, setForm] = useState({
    quotationNumber: '',
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    customer: { id: '', name: '', company: '', taxId: '', address: '', phone: '', email: '', pic: { name: '', phone: '', email: '' } || {} },
    event: { name: '', type: 'exhibition', startDate: '', endDate: '', venue: '', city: '', country: '', internationalStatus: 'domestic' },
    shipment: { referenceNumber: '', importExportStatus: 'domestic', awb: '', bl: '', customsDocType: 'BC23', hsCode: '', countryOfOrigin: '', estimatedArrival: '', transportMode: 'land', carrier: '', incoterms: 'FOB' },
    warehouse: { storageStartDate: '', storageEndDate: '', totalStorageDays: 0, storageType: 'normal', areaNeeded: 0, specialRequirements: [] },
    items: [ emptyItem() ],
    services: [],
    costs: { goodsSubtotal: 0, servicesSubtotal: 0, subtotalBeforeTax: 0, taxPercent: 11, taxAmount: 0, total: 0 },
    terms: { paymentTerms: 'Net 30', depositPercent: 50, deliveryTerms: '' },
    notes: '',
    status: 'draft',
    createdAt: null,
    createdBy: 'sales_bridge'
  });

  useEffect(() => { fetchList(); }, []);

  function createSampleQuotations() {
    return [
      {
        id: 'QT-001',
        quotationNumber: 'QT-BRIDGE-2024001',
        quotationDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customer: { id: 'C-001', name: 'PT. Indonesia Expo 2024', company: 'PT. Indonesia Expo', taxId: '123456789', address: 'Jakarta Convention Center', phone: '021-1234567', email: 'contact@exindo.com', pic: { name: 'Budi Santoso', phone: '081-98765432', email: 'budi@exindo.com' } },
        event: { name: 'Tech Expo 2024', type: 'exhibition', startDate: '2024-06-15', endDate: '2024-06-17', venue: 'Jakarta Convention Center', city: 'Jakarta', country: 'Indonesia', internationalStatus: 'domestic' },
        shipment: { referenceNumber: 'PO-2024-001', importExportStatus: 'domestic', awb: 'GA-1234567', bl: 'BL-001', customsDocType: 'BC23', hsCode: '8704.10.00', countryOfOrigin: 'Indonesia', estimatedArrival: '2024-06-01', transportMode: 'land', carrier: 'PT. Mitra Logistik', incoterms: 'FOB' },
        warehouse: { storageStartDate: '2024-05-01', storageEndDate: '2024-06-30', totalStorageDays: 60, storageType: 'climate-control', areaNeeded: 500, specialRequirements: ['Climate Control', 'Security'] },
        items: [ { id: 'I-1', itemName: 'Exhibition Equipment', sku: 'EQ-001', description: 'Tech booth equipment', commodityType: 'machinery', hsCode: '8704.10.00', countryOfOrigin: 'Singapore', quantity: 50, unitOfMeasure: 'pcs', grossWeight: 5000, netWeight: 4500, dimensions: '100x100x100cm', cbm: 100, unitPrice: 5000000, total: 250000000 } ],
        services: [ { id: 'S-1', serviceName: 'Storage Service', quantity: 60, unitOfMeasure: 'days', unitPrice: 100000, total: 6000000 } ],
        costs: { goodsSubtotal: 250000000, servicesSubtotal: 6000000, subtotalBeforeTax: 256000000, taxPercent: 11, taxAmount: 28160000, total: 284160000 },
        terms: { paymentTerms: 'Net 30', depositPercent: 50, deliveryTerms: 'FOB Jakarta' },
        notes: 'Tech Expo 2024 - Climate controlled warehouse with 24/7 security',
        status: 'approved',
        quotationType: 'event_warehouse',
        createdAt: new Date().toISOString(),
        createdBy: 'sales_bridge'
      },
      {
        id: 'QT-002',
        quotationNumber: 'QT-BRIDGE-2024002',
        quotationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customer: { id: 'C-002', name: 'PT. Fashion Week Indonesia', company: 'PT. FWI', taxId: '987654321', address: 'ICE Jakarta', phone: '021-5555555', email: 'info@fashionweek.id', pic: { name: 'Siti Nurhaliza', phone: '089-12345678', email: 'siti@fashionweek.id' } },
        event: { name: 'Fashion Week 2024', type: 'exhibition', startDate: '2024-07-10', endDate: '2024-07-15', venue: 'ICE Jakarta', city: 'Jakarta', country: 'Indonesia', internationalStatus: 'international' },
        shipment: { referenceNumber: 'PO-2024-002', importExportStatus: 'import', awb: 'GA-7654321', bl: 'BL-002', customsDocType: 'BC25', hsCode: '6204.62.00', countryOfOrigin: 'Vietnam', estimatedArrival: '2024-06-25', transportMode: 'air', carrier: 'Garuda Indonesia', incoterms: 'CIF' },
        warehouse: { storageStartDate: '2024-06-01', storageEndDate: '2024-07-31', totalStorageDays: 60, storageType: 'normal', areaNeeded: 300, specialRequirements: ['Humidity Control'] },
        items: [ { id: 'I-2', itemName: 'Fashion Collections', sku: 'FC-001', description: 'Imported fashion items', commodityType: 'clothing', hsCode: '6204.62.00', countryOfOrigin: 'Vietnam', quantity: 200, unitOfMeasure: 'box', grossWeight: 2000, netWeight: 1800, dimensions: '50x40x60cm', cbm: 48, unitPrice: 3000000, total: 600000000 } ],
        services: [ { id: 'S-2', serviceName: 'Warehouse & Handling', quantity: 60, unitOfMeasure: 'days', unitPrice: 150000, total: 9000000 } ],
        costs: { goodsSubtotal: 600000000, servicesSubtotal: 9000000, subtotalBeforeTax: 609000000, taxPercent: 11, taxAmount: 66990000, total: 675990000 },
        terms: { paymentTerms: 'Net 45', depositPercent: 30, deliveryTerms: 'CIF Jakarta' },
        notes: 'International fashion exhibition - requires humidity control',
        status: 'draft',
        quotationType: 'event_warehouse',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'sales_bridge'
      },
    ];
  }

  async function fetchList() {
    try {
      // Try to fetch from API
      const res = await fetch(`${API_BASE}/api/quotations`);
      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter(q => !q.quotationType || q.quotationType === 'event_warehouse');
        setQuotations(filtered);
        console.info('[BRidgeQuotationEvent] Loaded quotations from API:', filtered.length);
        return;
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to sample data:', e);
    }

    // Fallback: Load from localStorage or create sample data
    const storedKey = 'bridge_quotations';
    let quotations = [];
    
    try {
      const stored = localStorage.getItem(storedKey);
      if (stored) {
        quotations = JSON.parse(stored);
        console.info('[BRidgeQuotationEvent] Loaded quotations from localStorage:', quotations.length);
      }
    } catch (e) {
      console.warn('Error parsing stored quotations:', e);
    }

    // If still empty, create sample data
    if (quotations.length === 0) {
      quotations = createSampleQuotations();
      try {
        localStorage.setItem(storedKey, JSON.stringify(quotations));
        console.info('[BRidgeQuotationEvent] Created and stored sample quotations:', quotations.length);
      } catch (e) {
        console.warn('Error storing quotations to localStorage:', e);
      }
    }

    setQuotations(quotations);
  }

  function openNew() {
    setEditingId(null);
    setForm(prev => ({ ...prev, quotationNumber: `QT-BRIDGE-${Date.now()}`, createdAt: new Date().toISOString() }));
    setActiveStep(0);
    setOpenDialog(true);
  }

  function handleEdit(q) {
    setEditingId(q.id);
    setForm({ ...q });
    setActiveStep(0);
    setOpenDialog(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete quotation?')) return;
    await fetch(`${API_BASE}/api/quotations/${id}`, { method: 'DELETE' });
    fetchList();
  }

  function updateItem(idx, field, value) {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      items[idx].total = (items[idx].quantity || 0) * (items[idx].unitPrice || 0);
    }
    setForm({ ...form, items });
  }

  function addItem() { setForm({ ...form, items: [ ...form.items, emptyItem() ] }); }
  function removeItem(idx) { setForm({ ...form, items: form.items.filter((_,i)=>i!==idx) }); }

  function recalcCosts(f) {
    const goodsSubtotal = (f.items || []).reduce((s,it)=> s + (Number(it.total)||0), 0);
    const servicesSubtotal = (f.services || []).reduce((s,srv)=> s + (Number(srv.total)||0), 0);
    const subtotalBeforeTax = goodsSubtotal + servicesSubtotal;
    const taxAmount = Math.round((subtotalBeforeTax * (f.costs.taxPercent||11))/100);
    const total = subtotalBeforeTax + taxAmount;
    return { goodsSubtotal, servicesSubtotal, subtotalBeforeTax, taxAmount, total };
  }

  async function handleSave() {
    const costs = recalcCosts(form);
    const payload = { ...form, quotationType: 'event_warehouse', costs: { ...form.costs, ...costs } };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE}/api/quotations/${editingId}` : `${API_BASE}/api/quotations`;

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      setOpenDialog(false);
      fetchList();
    } else {
      console.error('Save failed', await res.text());
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <BridgeHeader
        title="BRiDGE Quotation - Event / Exhibition (Warehouse)"
        subtitle="Create and manage quotations for event & warehouse services"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>New Quotation</Button>}
      />

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>QT #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Event / Venue</TableCell>
              <TableCell>AWB/BL</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          {quotations.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No quotations found. Click "New Quotation" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {quotations.map(q => (
                <TableRow key={q.id} hover>
                <TableCell>{q.quotationNumber}</TableCell>
                <TableCell>{q.customer?.name}</TableCell>
                <TableCell>{q.event?.name} / {q.event?.venue}</TableCell>
                <TableCell>{q.shipment?.awb || q.shipment?.bl || '-'}</TableCell>
                <TableCell align="right">Rp {(q.costs?.total||0).toLocaleString('id-ID')}</TableCell>
                <TableCell>{q.status}</TableCell>
                <TableCell>
                  <Tooltip title="View">
                    <IconButton size="small" onClick={()=>{ setForm(q); setOpenDialog(true); setEditingId(q.id); }}><ViewIcon/></IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={()=>handleEdit(q)}><EditIcon/></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={()=>handleDelete(q.id)}><DeleteIcon/></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={()=>setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editingId ? 'Edit Quotation' : 'New Quotation'}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
            <Step><StepLabel>Customer</StepLabel></Step>
            <Step><StepLabel>Event & Warehouse</StepLabel></Step>
            <Step><StepLabel>Shipment & Customs</StepLabel></Step>
            <Step><StepLabel>Items & Services</StepLabel></Step>
            <Step><StepLabel>Costs & Terms</StepLabel></Step>
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Customer Name" value={form.customer.name} onChange={e=>setForm({...form, customer:{...form.customer, name:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Company" value={form.customer.company} onChange={e=>setForm({...form, customer:{...form.customer, company:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="PIC Name" value={form.customer?.pic?.name || ''} onChange={e=>setForm({...form, customer:{...form.customer, pic:{...(form.customer?.pic || {}), name:e.target.value}}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="PIC Phone" value={form.customer?.pic?.phone || ''} onChange={e=>setForm({...form, customer:{...form.customer, pic:{...(form.customer?.pic || {}), phone:e.target.value}}})} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Address" value={form.customer.address} onChange={e=>setForm({...form, customer:{...form.customer, address:e.target.value}})} /></Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Event Name" value={form.event.name} onChange={e=>setForm({...form,event:{...form.event,name:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Venue" value={form.event.venue} onChange={e=>setForm({...form,event:{...form.event,venue:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="date" label="Start Date" InputLabelProps={{shrink:true}} value={form.event.startDate} onChange={e=>setForm({...form,event:{...form.event,startDate:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="date" label="End Date" InputLabelProps={{shrink:true}} value={form.event.endDate} onChange={e=>setForm({...form,event:{...form.event,endDate:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="Area Needed (m²)" type="number" value={form.warehouse.areaNeeded} onChange={e=>setForm({...form,warehouse:{...form.warehouse,areaNeeded:Number(e.target.value)}})} /></Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Reference / PO" value={form.shipment.referenceNumber} onChange={e=>setForm({...form,shipment:{...form.shipment,referenceNumber:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>BC Type</InputLabel><Select value={form.shipment.customsDocType} label="BC Type" onChange={e=>setForm({...form,shipment:{...form.shipment,customsDocType:e.target.value}})}>{BC_TYPES.map(b=> <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="AWB" value={form.shipment.awb} onChange={e=>setForm({...form,shipment:{...form.shipment,awb:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="BL" value={form.shipment.bl} onChange={e=>setForm({...form,shipment:{...form.shipment,bl:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Country of Origin" value={form.shipment.countryOfOrigin} onChange={e=>setForm({...form,shipment:{...form.shipment,countryOfOrigin:e.target.value}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Estimated Arrival" InputLabelProps={{shrink:true}} value={form.shipment.estimatedArrival} onChange={e=>setForm({...form,shipment:{...form.shipment,estimatedArrival:e.target.value}})} /></Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb:1 }}>Items</Typography>
              {form.items.map((it, idx)=> (
                <Card key={it.id} sx={{ mb:2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Item Name" value={it.itemName} onChange={e=>updateItem(idx,'itemName',e.target.value)} /></Grid>
                      <Grid item xs={12} sm={3}><TextField fullWidth label="Qty" type="number" value={it.quantity} onChange={e=>updateItem(idx,'quantity',Number(e.target.value))} /></Grid>
                      <Grid item xs={12} sm={3}><TextField fullWidth label="Unit Price" type="number" value={it.unitPrice} onChange={e=>updateItem(idx,'unitPrice',Number(e.target.value))} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="HS Code" value={it.hsCode} onChange={e=>updateItem(idx,'hsCode',e.target.value)} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Country of Origin" value={it.countryOfOrigin} onChange={e=>updateItem(idx,'countryOfOrigin',e.target.value)} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Gross Weight (kg)" type="number" value={it.grossWeight} onChange={e=>updateItem(idx,'grossWeight',Number(e.target.value))} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Dimensions (LxWxH cm)" value={it.dimensions} onChange={e=>updateItem(idx,'dimensions',e.target.value)} /></Grid>
                      <Grid item xs={12} sm={12}><Button variant="outlined" color="error" onClick={()=>removeItem(idx)}>Remove</Button></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outlined" startIcon={<AddIcon/>} onClick={addItem}>Add Item</Button>
            </Box>
          )}

          {activeStep === 4 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb:1 }}>Costs & Terms</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Goods Subtotal (Auto)" value={recalcCosts(form).goodsSubtotal} disabled /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Services Subtotal" type="number" value={form.costs.servicesSubtotal} onChange={e=>setForm({...form,costs:{...form.costs,servicesSubtotal:Number(e.target.value)}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Tax %" type="number" value={form.costs.taxPercent} onChange={e=>setForm({...form,costs:{...form.costs,taxPercent:Number(e.target.value)}})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></Grid>
              </Grid>
              <Box sx={{ mt:2 }}>
                <Typography><strong>Total: </strong> Rp {recalcCosts(form).total.toLocaleString('id-ID')}</Typography>
              </Box>
            </Box>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDialog(false)}>Cancel</Button>
          <Button disabled={activeStep===0} onClick={()=>setActiveStep(s=>s-1)}>Back</Button>
          {activeStep < 4 ? (
            <Button onClick={()=>setActiveStep(s=>s+1)} variant="contained">Next</Button>
          ) : (
            <Button onClick={handleSave} variant="contained">Save Quotation</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
