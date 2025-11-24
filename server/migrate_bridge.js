const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

function run(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function insertItemIfNotExists(item_code, item_name, unit='') {
  const rows = await all('SELECT 1 FROM items WHERE item_code = ?', [item_code]);
  if (rows && rows.length) return;
  await run('INSERT INTO items (item_code, item_name, unit, description) VALUES (?, ?, ?, ?)', [item_code, item_name, unit, 'Migrated from BRIDGE']);
}

async function insertMovement(mov) {
  const sql = `INSERT INTO movements (id, doc_type, doc_number, doc_date, receipt_number, receipt_date, sender_name, item_code, item_name, qty, unit, value_amount, value_currency, movement_type, wip_stage, source, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [mov.id, mov.doc_type, mov.doc_number, mov.doc_date, mov.receipt_number, mov.receipt_date, mov.sender_name, mov.item_code, mov.item_name, mov.qty, mov.unit, mov.value_amount, mov.value_currency, mov.movement_type, mov.wip_stage || null, mov.source || 'BRIDGE', mov.note || '', mov.created_at || new Date().toISOString()];
  await run(sql, params);
}

async function migrate(filePath) {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error('File not found: ' + abs);
  const raw = fs.readFileSync(abs, 'utf8');
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error('JSON must be array');

  let migrated = 0;
  for (const e of arr) {
    let itemField = e.item || '';
    let item_code = itemField;
    let item_name = itemField;
    const m = String(itemField).match(/^([A-Z0-9\-]+)\s*-\s*(.+)$/i);
    if (m) { item_code = m[1]; item_name = m[2]; }
    else { item_code = `MAN-${Date.now()}-${Math.random().toString(36).slice(2,6)}`; item_name = itemField || 'Unknown'; }

    await insertItemIfNotExists(item_code, item_name, e.unit || '');

    const mov = {
      id: uuidv4(),
      doc_type: e.bcInputType || e.doc_type || 'BRIDGE',
      doc_number: e.bl || e.doc_number || '',
      doc_date: e.warehouseEntryDate || e.doc_date || new Date().toISOString().slice(0,10),
      receipt_number: e.awb || e.receipt_number || '',
      receipt_date: e.warehouseEntryDate || e.receipt_date || null,
      sender_name: e.consignee || e.sender_name || '',
      item_code,
      item_name,
      qty: Number(e.quantity || 0),
      unit: e.unit || e.uom || (e.quantity ? 'PCS' : ''),
      value_amount: e.value_amount || 0,
      value_currency: e.value_currency || 'IDR',
      movement_type: 'IN',
      wip_stage: null,
      source: 'BRIDGE',
      note: e.description || e.note || '',
      created_at: new Date().toISOString()
    };

    await insertMovement(mov);
    migrated++;
  }

  console.log(`Migrated ${migrated} entries from ${filePath}`);
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node server/migrate_bridge.js <bridge_inventory.json>');
    process.exit(2);
  }
  migrate(file).then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}
