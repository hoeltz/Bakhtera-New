const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/quotations - get all quotations
router.get('/quotations', (req, res) => {
  const store = db.getData();
  store.quotations = store.quotations || [];
  res.json(store.quotations);
});

// GET /api/quotations/:id - get single quotation
router.get('/quotations/:id', (req, res) => {
  const { id } = req.params;
  const store = db.getData();
  store.quotations = store.quotations || [];
  const quotation = store.quotations.find(q => q.id === id);
  
  if (!quotation) {
    return res.status(404).json({ error: 'Quotation not found' });
  }
  
  res.json(quotation);
});

// POST /api/quotations - create new quotation
router.post('/quotations', (req, res) => {
  const payload = req.body;
  const store = db.getData();
  store.quotations = store.quotations || [];
  const now = new Date().toISOString();
  
  const quotation = {
    id: payload.id || `QT-${Date.now()}`,
    quotationNumber: payload.quotationNumber,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    quotationDate: payload.quotationDate,
    validUntil: payload.validUntil,
    deliveryDate: payload.deliveryDate,
    items: payload.items || [],
    subtotal: payload.subtotal || 0,
    tax: payload.tax || 0,
    total: payload.total || 0,
    terms: payload.terms || '',
    status: payload.status || 'draft',
    approvedBy: payload.approvedBy || null,
    approvedAt: payload.approvedAt || null,
    approverNote: payload.approverNote || null,
    salesOrderId: payload.salesOrderId || null,
    convertedAt: payload.convertedAt || null,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now
  };
  
  store.quotations.push(quotation);
  db.saveData(store);
  
  res.status(201).json(quotation);
});

// PUT /api/quotations/:id - update quotation
router.put('/quotations/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const store = db.getData();
  store.quotations = store.quotations || [];
  
  const idx = store.quotations.findIndex(q => q.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Quotation not found' });
  }
  
  store.quotations[idx] = {
    ...store.quotations[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  db.saveData(store);
  res.json(store.quotations[idx]);
});

// DELETE /api/quotations/:id - delete quotation
router.delete('/quotations/:id', (req, res) => {
  const { id } = req.params;
  const store = db.getData();
  store.quotations = store.quotations || [];
  
  const idx = store.quotations.findIndex(q => q.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Quotation not found' });
  }
  
  store.quotations.splice(idx, 1);
  db.saveData(store);
  
  res.json({ ok: true, message: 'Quotation deleted' });
});

// GET /api/sales-orders - get all sales orders
router.get('/sales-orders', (req, res) => {
  const store = db.getData();
  store.salesOrders = store.salesOrders || [];
  res.json(store.salesOrders);
});

// GET /api/sales-orders/:id - get single sales order
router.get('/sales-orders/:id', (req, res) => {
  const { id } = req.params;
  const store = db.getData();
  store.salesOrders = store.salesOrders || [];
  const salesOrder = store.salesOrders.find(so => so.id === id);
  
  if (!salesOrder) {
    return res.status(404).json({ error: 'Sales Order not found' });
  }
  
  res.json(salesOrder);
});

// POST /api/sales-orders - create new sales order from quotation
router.post('/sales-orders', (req, res) => {
  const payload = req.body;
  const store = db.getData();
  store.salesOrders = store.salesOrders || [];
  store.quotations = store.quotations || [];
  const now = new Date().toISOString();
  
  const salesOrder = {
    id: payload.id || `SO-${Date.now()}`,
    quotationId: payload.quotationId,
    quotationNumber: payload.quotationNumber,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    items: payload.items || [],
    subtotal: payload.subtotal || 0,
    tax: payload.tax || 0,
    total: payload.total || 0,
    deliveryDate: payload.deliveryDate,
    status: payload.status || 'pending_confirmation',
    confirmedAt: payload.confirmedAt || null,
    confirmedBy: payload.confirmedBy || null,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now
  };
  
  store.salesOrders.push(salesOrder);
  
  // Update quotation status to 'converted'
  if (payload.quotationId) {
    const qtIdx = store.quotations.findIndex(q => q.id === payload.quotationId);
    if (qtIdx !== -1) {
      store.quotations[qtIdx].status = 'converted';
      store.quotations[qtIdx].salesOrderId = salesOrder.id;
      store.quotations[qtIdx].convertedAt = now;
      store.quotations[qtIdx].updatedAt = now;
    }
  }
  
  db.saveData(store);
  
  res.status(201).json(salesOrder);
});

// PUT /api/sales-orders/:id - update sales order
router.put('/sales-orders/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const store = db.getData();
  store.salesOrders = store.salesOrders || [];
  
  const idx = store.salesOrders.findIndex(so => so.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Sales Order not found' });
  }
  
  store.salesOrders[idx] = {
    ...store.salesOrders[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  db.saveData(store);
  res.json(store.salesOrders[idx]);
});

// DELETE /api/sales-orders/:id - delete sales order
router.delete('/sales-orders/:id', (req, res) => {
  const { id } = req.params;
  const store = db.getData();
  store.salesOrders = store.salesOrders || [];
  
  const idx = store.salesOrders.findIndex(so => so.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Sales Order not found' });
  }
  
  store.salesOrders.splice(idx, 1);
  db.saveData(store);
  
  res.json({ ok: true, message: 'Sales Order deleted' });
});

// POST /api/sales-orders/:id/confirm - confirm sales order
router.post('/sales-orders/:id/confirm', (req, res) => {
  const { id } = req.params;
  const { confirmedBy } = req.body || {};
  const store = db.getData();
  store.salesOrders = store.salesOrders || [];
  
  const idx = store.salesOrders.findIndex(so => so.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Sales Order not found' });
  }
  
  const now = new Date().toISOString();
  store.salesOrders[idx].status = 'confirmed';
  store.salesOrders[idx].confirmedAt = now;
  store.salesOrders[idx].confirmedBy = confirmedBy || 'system';
  store.salesOrders[idx].updatedAt = now;
  
  db.saveData(store);
  res.json(store.salesOrders[idx]);
});

module.exports = router;
