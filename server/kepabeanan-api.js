const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function runQueryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function runQueryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Seed sample data if table empty
db.get('SELECT COUNT(1) as c FROM movements', (err, row) => {
  if (!err && row && row.c === 0) {
    const stmt = db.prepare(`INSERT INTO movements (id, doc_type, doc_number, doc_date, receipt_number, receipt_date, sender_name, item_code, item_name, qty, unit, value_amount, value_currency, movement_type, source, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const now = new Date().toISOString().split('T')[0];
    stmt.run(uuidv4(), 'PIB', 'PIB-2025-0001', '2025-11-10', 'RCV-2025-055', '2025-11-11', 'PT. Pengirim', 'ABC-001', 'Bahan X', 50, 'KG', 1250000, 'IDR', 'IN', 'PIB', 'Opname 11 Nov', new Date().toISOString());
    stmt.run(uuidv4(), 'PIB', 'PIB-2025-0002', '2025-11-12', 'RCV-2025-056', '2025-11-12', 'PT. Supplier', 'DEF-010', 'Bahan Y', 100, 'PCS', 500, 'USD', 'IN', 'PIB', '', new Date().toISOString());
    stmt.finalize();
  }
});

// GET inbound movements
app.get('/api/kepabeanan/reports/inbound', async (req, res) => {
  try {
    const { start, end, docType, item } = req.query;
    let sql = `SELECT * FROM movements WHERE movement_type = 'IN'`;
    const params = [];
    if (docType) {
      sql += ` AND LOWER(doc_type) LIKE ?`;
      params.push(`%${String(docType).toLowerCase()}%`);
    }
    if (item) {
      sql += ` AND (LOWER(item_code) LIKE ? OR LOWER(item_name) LIKE ?)`;
      params.push(`%${String(item).toLowerCase()}%`, `%${String(item).toLowerCase()}%`);
    }
    if (start) {
      sql += ` AND doc_date >= ?`;
      params.push(start);
    }
    if (end) {
      sql += ` AND doc_date <= ?`;
      params.push(end);
    }
    const rows = await runQueryAll(sql, params);
    const summary = {
      totalRows: rows.length,
      totalQtyIn: rows.reduce((s, x) => s + (Number(x.qty) || 0), 0),
      totalValueIDR: rows.reduce((s, x) => s + (x.value_currency === 'IDR' ? Number(x.value_amount || 0) : 0), 0),
    };
    res.json({ rows, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET outbound movements
app.get('/api/kepabeanan/reports/outbound', async (req, res) => {
  try {
    const { start, end, item } = req.query;
    let sql = `SELECT * FROM movements WHERE movement_type = 'OUT'`;
    const params = [];
    if (item) {
      sql += ` AND (LOWER(item_code) LIKE ? OR LOWER(item_name) LIKE ?)`;
      params.push(`%${String(item).toLowerCase()}%`, `%${String(item).toLowerCase()}%`);
    }
    if (start) {
      sql += ` AND doc_date >= ?`;
      params.push(start);
    }
    if (end) {
      sql += ` AND doc_date <= ?`;
      params.push(end);
    }
    const rows = await runQueryAll(sql, params);
    const summary = {
      totalRows: rows.length,
      totalQtyOut: rows.reduce((s, x) => s + (Number(x.qty) || 0), 0),
    };
    res.json({ rows, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Inventory master endpoints ---
// GET items
app.get('/api/inventory/items', async (req, res) => {
  try {
    const rows = await runQueryAll('SELECT * FROM items ORDER BY item_code');
    res.json({ rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create item
app.post('/api/inventory/items', async (req, res) => {
  try {
    const { item_code, item_name, unit, description } = req.body;
    await runQueryRun('INSERT INTO items (item_code, item_name, unit, description) VALUES (?, ?, ?, ?)', [item_code, item_name, unit, description]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET locations
app.get('/api/inventory/locations', async (req, res) => {
  try {
    const rows = await runQueryAll('SELECT * FROM locations ORDER BY name');
    res.json({ rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create location
app.post('/api/inventory/locations', async (req, res) => {
  try {
    const { id, name, description } = req.body;
    await runQueryRun('INSERT INTO locations (id, name, description) VALUES (?, ?, ?)', [id || uuidv4(), name, description]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generic inventory movements read endpoint (filtered)
app.get('/api/inventory/movements', async (req, res) => {
  try {
    const { start, end, item, type } = req.query;
    let sql = 'SELECT * FROM movements WHERE 1=1';
    const params = [];
    if (type) { sql += ' AND movement_type = ?'; params.push(type); }
    if (item) { sql += ' AND (LOWER(item_code) LIKE ? OR LOWER(item_name) LIKE ?)'; params.push(`%${String(item).toLowerCase()}%`, `%${String(item).toLowerCase()}%`); }
    if (start) { sql += ' AND doc_date >= ?'; params.push(start); }
    if (end) { sql += ' AND doc_date <= ?'; params.push(end); }
    sql += ' ORDER BY item_code, doc_date';
    const rows = await runQueryAll(sql, params);
    res.json({ rows, summary: { totalRows: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Aggregation endpoint for mutasi per item
app.get('/api/inventory/aggregations/mutasi', async (req, res) => {
  try {
    const { start, end, item } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end required' });

    // build item list
    let itemsSql = 'SELECT DISTINCT item_code, item_name, unit FROM movements WHERE 1=1';
    const p = [];
    if (item) { itemsSql += ' AND (LOWER(item_code) LIKE ? OR LOWER(item_name) LIKE ?)'; p.push(`%${String(item).toLowerCase()}%`, `%${String(item).toLowerCase()}%`); }
    const items = await runQueryAll(itemsSql, p);

    const results = [];
    for (const it of items) {
      const itemCode = it.item_code;
      const beforeSql = `SELECT SUM(CASE WHEN movement_type='IN' THEN qty WHEN movement_type='OUT' THEN -qty WHEN movement_type='ADJ' THEN qty ELSE 0 END) AS saldo_awal FROM movements WHERE item_code = ? AND doc_date < ?`;
      const beforeRow = (await runQueryAll(beforeSql, [itemCode, start]))[0] || { saldo_awal: 0 };
      const saldoAwal = Number(beforeRow.saldo_awal || 0);

      const totalsSql = `SELECT SUM(CASE WHEN movement_type='IN' THEN qty ELSE 0 END) AS pemasukan, SUM(CASE WHEN movement_type='OUT' THEN qty ELSE 0 END) AS pengeluaran, SUM(CASE WHEN movement_type='ADJ' THEN qty ELSE 0 END) AS penyesuaian FROM movements WHERE item_code = ? AND doc_date BETWEEN ? AND ?`;
      const totalsRow = (await runQueryAll(totalsSql, [itemCode, start, end]))[0] || {};
      const pemasukan = Number(totalsRow.pemasukan || 0);
      const pengeluaran = Number(totalsRow.pengeluaran || 0);
      const penyesuaian = Number(totalsRow.penyesuaian || 0);

      const saldoBuku = saldoAwal + pemasukan - pengeluaran + penyesuaian;

      const opnameSql = 'SELECT counted_qty, opname_date FROM stock_opname WHERE item_code=? AND opname_date<=? ORDER BY opname_date DESC LIMIT 1';
      const opnameRow = (await runQueryAll(opnameSql, [itemCode, end]))[0] || { counted_qty: 0 };
      const stockOpname = Number(opnameRow.counted_qty || 0);
      const selisih = stockOpname - saldoBuku;

      results.push({ item_code: itemCode, item_name: it.item_name, unit: it.unit, opening_balance: saldoAwal, total_in: pemasukan, total_out: pengeluaran, total_adj: penyesuaian, book_balance: saldoBuku, stock_opname: stockOpname, variance: selisih });
    }

    res.json({ rows: results, summary: { totalItems: results.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WIP report (kept under kepabeanan namespace earlier, but duplicate under inventory)
app.get('/api/kepabeanan/reports/wip', async (req, res) => {
  try {
    const { date } = req.query;
    let sql = `SELECT item_code, item_name, wip_stage, SUM(qty) AS qty FROM movements WHERE wip_stage IS NOT NULL`;
    const params = [];
    if (date) { sql += ' AND doc_date <= ?'; params.push(date); }
    sql += ' GROUP BY item_code, item_name, wip_stage ORDER BY item_code';
    const rows = await runQueryAll(sql, params);
    res.json({ rows, summary: { totalRows: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mutasi bahan detailed
app.get('/api/kepabeanan/reports/mutasi_bahan', async (req, res) => {
  try {
    const { start, end, item } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end required' });
    let sql = 'SELECT * FROM movements WHERE doc_date BETWEEN ? AND ?';
    const params = [start, end];
    if (item) { sql += ' AND (LOWER(item_code) LIKE ? OR LOWER(item_name) LIKE ?)'; params.push(`%${String(item).toLowerCase()}%`, `%${String(item).toLowerCase()}%`); }
    sql += ' ORDER BY item_code, doc_date';
    const rows = await runQueryAll(sql, params);
    res.json({ rows, summary: { totalRows: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create movement
app.post('/api/kepabeanan/movements', async (req, res) => {
  try {
    const data = req.body;
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const sql = `INSERT INTO movements (id, doc_type, doc_number, doc_date, receipt_number, receipt_date, sender_name, item_code, item_name, qty, unit, value_amount, value_currency, movement_type, source, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await runQueryRun(sql, [id, data.doc_type, data.doc_number, data.doc_date, data.receipt_number, data.receipt_date, data.sender_name, data.item_code, data.item_name, data.qty, data.unit, data.value_amount, data.value_currency, data.movement_type, data.source, data.note, createdAt]);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST stock opname
app.post('/api/kepabeanan/stock-opname', async (req, res) => {
  try {
    const data = req.body;
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const sql = `INSERT INTO stock_opname (id, opname_date, item_code, counted_qty, unit, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await runQueryRun(sql, [id, data.opname_date, data.item_code, data.counted_qty, data.unit, data.note, createdAt]);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST migrate bridge inventory -> inventory items + movements
app.post('/api/inventory/migrate_bridge', async (req, res) => {
  try {
    const entries = req.body || [];
    if (!Array.isArray(entries)) return res.status(400).json({ error: 'array required' });

    const insertItem = async (code, name, unit = null) => {
      // check exists
      const exists = await runQueryAll('SELECT 1 FROM items WHERE item_code = ?', [code]);
      if (exists && exists.length) return;
      await runQueryRun('INSERT INTO items (item_code, item_name, unit, description) VALUES (?, ?, ?, ?)', [code, name, unit || '', 'Migrated from BRIDGE']);
    };

    for (const e of entries) {
      // map fields
      const itemField = e.item || '';
      let item_code = itemField;
      let item_name = itemField;
      // if formatted like 'CODE - NAME'
      const m = String(itemField).match(/^([A-Z0-9\-]+)\s*-\s*(.+)$/i);
      if (m) {
        item_code = m[1];
        item_name = m[2];
      } else {
        // create a synthetic code
        item_code = `MAN-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
        item_name = itemField || 'Unknown Item';
      }

      await insertItem(item_code, item_name, e.unit || e.uom || null);

      // create movement (IN)
      const mov = {
        id: uuidv4(),
        doc_type: e.bcInputType || e.doc_type || 'BRIDGE',
        doc_number: e.bl || e.doc_number || '',
        doc_date: e.warehouseEntryDate || e.doc_date || new Date().toISOString().slice(0,10),
        receipt_number: e.awb || e.receipt_number || '',
        receipt_date: e.warehouseEntryDate || e.receipt_date || null,
        sender_name: e.consignee || e.sender_name || '',
        item_code: item_code,
        item_name: item_name,
        qty: Number(e.quantity || 0),
        unit: e.unit || e.uom || (e.quantity ? 'PCS' : ''),
        value_amount: e.value_amount || 0,
        value_currency: e.value_currency || 'IDR',
        movement_type: 'IN',
        source: 'BRIDGE',
        note: e.description || e.note || '',
        created_at: new Date().toISOString()
      };

      await runQueryRun(`INSERT INTO movements (id, doc_type, doc_number, doc_date, receipt_number, receipt_date, sender_name, item_code, item_name, qty, unit, value_amount, value_currency, movement_type, source, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [mov.id, mov.doc_type, mov.doc_number, mov.doc_date, mov.receipt_number, mov.receipt_date, mov.sender_name, mov.item_code, mov.item_name, mov.qty, mov.unit, mov.value_amount, mov.value_currency, mov.movement_type, mov.source, mov.note, mov.created_at]);
    }

    res.json({ ok: true, migrated: entries.length });
  } catch (err) {
    console.error('migrate_bridge error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Kepabeanan API listening on http://localhost:${PORT}`);
});
