const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// POST /api/warehouses/sync
// body: { event: 'warehouse.created'|'warehouse.updated'|'warehouse.deleted', data: {...} }
router.post('/warehouses/sync', (req, res) => {
  const payload = req.body || {};
  const event = payload.event;
  const data = payload.data || {};
  const idempotencyKey = req.get('Idempotency-Key') || `${event}:${data.warehouseId || data.id}`;

  const store = db.getData();
  store._idempotency = store._idempotency || {};

  if (store._idempotency[idempotencyKey]) {
    return res.json({ ok: true, message: 'already processed' });
  }

  try {
    switch (event) {
      case 'warehouse.created': {
        // upsert
        const existing = store.warehouses.find(w => w.warehouseId === data.warehouseId || w.id === data.warehouseId);
        const now = new Date().toISOString();
        const warehouse = {
          id: data.warehouseId || `wh-${Date.now()}`,
          name: data.name || data.warehouseName || 'Unnamed Warehouse',
          country: data.country || data.countryName || '',
          city: data.city || data.cityName || '',
          metadata: data.metadata || {},
          createdAt: data.createdAt || now,
          updatedAt: data.updatedAt || now
        };
        if (existing) {
          // update
          Object.assign(existing, warehouse, { updatedAt: new Date().toISOString() });
        } else {
          store.warehouses.push(warehouse);
        }
        break;
      }
      case 'warehouse.updated': {
        const id = data.warehouseId || data.id;
        const existing = store.warehouses.find(w => w.warehouseId === id || w.id === id);
        if (existing) {
          Object.assign(existing, data, { updatedAt: new Date().toISOString() });
        } else {
          // create if not exists
          const now = new Date().toISOString();
          store.warehouses.push({
            id: id || `wh-${Date.now()}`,
            name: data.name || 'Unnamed Warehouse',
            country: data.country || '',
            city: data.city || '',
            metadata: data.metadata || {},
            createdAt: now,
            updatedAt: now
          });
        }
        break;
      }
      case 'warehouse.deleted': {
        const id = data.warehouseId || data.id;
        if (!id) break;
        // check stock
        const stockHere = store.inventory.filter(i => i.warehouseId === id);
        const totalQty = stockHere.reduce((s, it) => s + (it.qty || 0), 0);
        if (totalQty > 0) {
          return res.status(400).json({ ok: false, message: 'warehouse has stock, cannot delete' });
        }
        store.warehouses = store.warehouses.filter(w => w.id !== id && w.warehouseId !== id);
        break;
      }
      default:
        return res.status(400).json({ ok: false, message: 'unknown event type' });
    }

    // mark idempotency
    store._idempotency[idempotencyKey] = { event, time: new Date().toISOString() };
    db.saveData(store);
    return res.json({ ok: true });
  } catch (err) {
    console.error('warehouses/sync error', err);
    return res.status(500).json({ ok: false, message: err.message || 'internal' });
  }
});

// GET /api/warehouses
router.get('/warehouses', (req, res) => {
  const store = db.getData();
  res.json({ ok: true, warehouses: store.warehouses || [] });
});

// GET /api/inventory
router.get('/inventory', (req, res) => {
  const store = db.getData();
  res.json({ ok: true, inventory: store.inventory || [] });
});

// POST /api/inventory/receive
// body: { sku, name, warehouseId, qty }
router.post('/inventory/receive', (req, res) => {
  const { sku, name, warehouseId, qty } = req.body || {};
  if (!sku || !warehouseId || !qty) return res.status(400).json({ ok: false, message: 'sku, warehouseId and qty are required' });

  const store = db.getData();
  const now = new Date().toISOString();

  // find existing item
  let item = store.inventory.find(i => i.sku === sku && i.warehouseId === warehouseId);
  if (item) {
    item.qty = (item.qty || 0) + Number(qty);
    item.updatedAt = now;
  } else {
    item = {
      id: uuidv4(),
      sku,
      name: name || sku,
      warehouseId,
      qty: Number(qty),
      createdAt: now,
      updatedAt: now
    };
    store.inventory.push(item);
  }

  db.saveData(store);
  res.json({ ok: true, item });
});

// POST /api/inventory/dispatch
// body: { sku, warehouseId, qty }
router.post('/inventory/dispatch', (req, res) => {
  const { sku, warehouseId, qty } = req.body || {};
  if (!sku || !warehouseId || !qty) return res.status(400).json({ ok: false, message: 'sku, warehouseId and qty are required' });

  const store = db.getData();
  const now = new Date().toISOString();

  let item = store.inventory.find(i => i.sku === sku && i.warehouseId === warehouseId);
  if (!item) return res.status(400).json({ ok: false, message: 'stock not found' });
  const available = item.qty || 0;
  if (available < qty) return res.status(400).json({ ok: false, message: 'insufficient stock' });

  item.qty = available - Number(qty);
  item.updatedAt = now;
  db.saveData(store);
  res.json({ ok: true, item });
});

// GET /api/locations (list warehouses simplified)
router.get('/locations', (req, res) => {
  const store = db.getData();
  const locations = (store.warehouses || []).map(w => ({ id: w.id, name: w.name, country: w.country, city: w.city }));
  res.json({ ok: true, locations });
});

// Consignments endpoints for sync with WarehouseManagement UI
// GET /api/consignments
router.get('/consignments', (req, res) => {
  const store = db.getData();
  res.json({ ok: true, consignments: store.consignments || [] });
});

// POST /api/consignments - create
router.post('/consignments', (req, res) => {
  const payload = req.body || {};
  const store = db.getData();
  store.consignments = store.consignments || [];
  const now = new Date().toISOString();
  const consignment = {
    id: payload.id || `WH-${Date.now()}`,
    ...payload,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now
  };
  store.consignments.push(consignment);
  db.saveData(store);
  res.json({ ok: true, consignment });
});

// PUT /api/consignments/:id - update
router.put('/consignments/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body || {};
  const store = db.getData();
  store.consignments = store.consignments || [];
  const idx = store.consignments.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'consignment not found' });
  store.consignments[idx] = { ...store.consignments[idx], ...updates, updatedAt: new Date().toISOString() };
  db.saveData(store);
  res.json({ ok: true, consignment: store.consignments[idx] });
});

// DELETE /api/consignments/:id - delete
router.delete('/consignments/:id', (req, res) => {
  const id = req.params.id;
  const store = db.getData();
  store.consignments = store.consignments || [];
  const idx = store.consignments.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'consignment not found' });
  store.consignments.splice(idx, 1);
  db.saveData(store);
  res.json({ ok: true });
});

// POST /api/consignments/dispatch - handle consignment shipment and decrement inventory
// body: { consignmentId, warehouseId, items: [{ sku, qty }, ...] }
router.post('/consignments/dispatch', (req, res) => {
  const { consignmentId, warehouseId, items } = req.body || {};
  if (!consignmentId || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      ok: false, 
      message: 'consignmentId, warehouseId, and items array are required' 
    });
  }

  const store = db.getData();
  const now = new Date().toISOString();
  const dispatchedItems = [];
  const errors = [];

  try {
    // Process each item in the consignment
    for (const { sku, qty } of items) {
      if (!sku || !qty) {
        errors.push(`Invalid item: sku=${sku}, qty=${qty}`);
        continue;
      }

      let item = store.inventory.find(i => i.sku === sku && i.warehouseId === warehouseId);
      if (!item) {
        errors.push(`Stock not found for SKU ${sku} in warehouse ${warehouseId}`);
        continue;
      }

      const available = item.qty || 0;
      if (available < qty) {
        errors.push(`Insufficient stock for ${sku}: available ${available}, requested ${qty}`);
        continue;
      }

      // Decrement inventory
      item.qty = available - Number(qty);
      item.updatedAt = now;
      dispatchedItems.push({ sku, qty, newQty: item.qty });
    }

    // Update consignment status if dispatch was successful
    const consignment = store.consignments?.find(c => c.id === consignmentId);
    if (consignment) {
      consignment.status = 'Sudah Keluar';
      consignment.updatedAt = now;
    }

    db.saveData(store);
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Some items failed to dispatch',
        dispatchedItems,
        errors 
      });
    }

    res.json({ 
      ok: true, 
      message: 'Consignment dispatched successfully',
      dispatchedItems 
    });
  } catch (err) {
    console.error('Consignment dispatch error', err);
    return res.status(500).json({ ok: false, message: err.message || 'internal error' });
  }
});

module.exports = router;
