const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_FILE = path.join(__dirname, 'kepabeanan.db');
const exists = fs.existsSync(DB_FILE);

const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  // items table - master data for inventory
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      item_code TEXT PRIMARY KEY,
      item_name TEXT,
      unit TEXT,
      description TEXT
    )
  `);

  // locations table - optional warehouse locations
  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT
    )
  `);

  // movements table
  db.run(`
    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY,
      doc_type TEXT,
      doc_number TEXT,
      doc_date TEXT,
      receipt_number TEXT,
      receipt_date TEXT,
      sender_name TEXT,
      item_code TEXT,
      item_name TEXT,
      qty REAL,
      unit TEXT,
      value_amount REAL,
      value_currency TEXT,
      movement_type TEXT,
      wip_stage TEXT,
      source TEXT,
      note TEXT,
      created_at TEXT
    )
  `);

  // stock_opname table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_opname (
      id TEXT PRIMARY KEY,
      opname_date TEXT,
      item_code TEXT,
      counted_qty REAL,
      unit TEXT,
      note TEXT,
      created_at TEXT
    )
  `);

  // seed some sample items (only if items table empty)
  db.get('SELECT COUNT(1) as c FROM items', (err, row) => {
    if (!err && row && row.c === 0) {
      const stmt = db.prepare('INSERT INTO items (item_code, item_name, unit, description) VALUES (?, ?, ?, ?)');
      stmt.run('ABC-001', 'Bahan X', 'KG', 'Bahan baku X');
      stmt.run('DEF-010', 'Bahan Y', 'PCS', 'Bahan baku Y');
      stmt.finalize();
    }
  });
});

module.exports = db;
