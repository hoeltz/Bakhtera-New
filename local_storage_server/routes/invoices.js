const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all invoices
router.get('/invoices', (req, res) => {
  const data = db.getData();
  const invoices = data.invoices || [];
  res.json(invoices);
});

// GET single invoice
router.get('/invoices/:id', (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const invoices = data.invoices || [];
  const invoice = invoices.find(i => i.id === id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

// POST create invoice
router.post('/invoices', (req, res) => {
  const payload = req.body;
  const data = db.getData();
  data.invoices = data.invoices || [];
  const now = new Date().toISOString();
  
  const invoice = {
    ...payload,
    id: payload.id || `INV-${Date.now()}`,
    invoiceNumber: payload.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    status: payload.status || 'draft',
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
  };
  
  data.invoices.push(invoice);
  db.saveData(data);
  res.status(201).json(invoice);
});

// PUT update invoice
router.put('/invoices/:id', (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  data.invoices = data.invoices || [];
  
  const index = data.invoices.findIndex(i => i.id === id);
  if (index === -1) return res.status(404).json({ error: 'Invoice not found' });
  
  data.invoices[index] = {
    ...data.invoices[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  db.saveData(data);
  res.json(data.invoices[index]);
});

// DELETE invoice
router.delete('/invoices/:id', (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  data.invoices = data.invoices || [];
  
  const index = data.invoices.findIndex(i => i.id === id);
  if (index === -1) return res.status(404).json({ error: 'Invoice not found' });
  
  data.invoices.splice(index, 1);
  db.saveData(data);
  res.json({ ok: true, message: 'Invoice deleted' });
});

module.exports = router;
