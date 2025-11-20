const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const inventoryRoutes = require('./routes/inventory');
const quotationRoutes = require('./routes/quotations');
const invoiceRoutes = require('./routes/invoices');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Local storage server running' });
});

app.use('/api', inventoryRoutes);
app.use('/api', quotationRoutes);
app.use('/api', invoiceRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ ok: false, message: err.message || 'internal' });
});

// ensure DB file exists on startup and initialize sample data
db.getData();
db.initializeSampleData();

app.listen(PORT, () => {
  console.log(`Local storage server listening on http://localhost:${PORT}`);
});
