import React, { useState, useEffect } from 'react';
import { fetchInbound } from '../../services/kepabeananService';

export default function InboundReport() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', docType: '', item: '' });
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    const prior = new Date(now);
    prior.setDate(prior.getDate() - 30);
    setFilters((f) => ({ ...f, startDate: prior.toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) }));
    // eslint-disable-next-line
  }, []);

  async function handleSearch() {
    setLoading(true);
    setError('');
    try {
      const resp = await fetchInbound(filters);
      setRows(resp.rows || []);
      setSummary(resp.summary || null);
    } catch (e) {
      setError(e.message || 'Error fetching data');
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  function csvColumns() {
    return [
      { key: 'doc_type', label: 'Dokumen Pabean (Jenis)' },
      { key: 'doc_number', label: 'Nomor Dokumen' },
      { key: 'doc_date', label: 'Tanggal Dokumen' },
      { key: 'receipt_number', label: 'Bukti Terima (No)' },
      { key: 'receipt_date', label: 'Tanggal Terima' },
      { key: 'sender_name', label: 'Nama Pengirim' },
      { key: 'item_code', label: 'Kode Barang' },
      { key: 'item_name', label: 'Nama Barang' },
      { key: 'qty', label: 'Jumlah' },
      { key: 'unit', label: 'Satuan' },
      { key: 'value_amount', label: 'Nilai' },
      { key: 'value_currency', label: 'Mata Uang' },
      { key: 'note', label: 'Keterangan' },
    ];
  }

  function exportCSV() {
    if (!rows || rows.length === 0) return;
    const cols = csvColumns();
    const header = cols.map((c) => c.label).join(',');
    const lines = rows.map((r) => cols.map((c) => csvSafe(String(r[c.key] ?? ''))).join(','));
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kepabeanan-inbound-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvSafe(v) {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/\"/g, '""')}"`;
    }
    return v;
  }

  function printTable() {
    const cols = csvColumns();
    const htmlRows = rows
      .map((r) => `<tr>${cols.map((c) => `<td style="padding:6px;border:1px solid #ddd">${escapeHtml(r[c.key] ?? '')}</td>`).join('')}</tr>`)
      .join('');
    const headerRow = `<tr>${cols.map((c) => `<th style="padding:6px;border:1px solid #ddd;background:#f5f5f5">${escapeHtml(c.label)}</th>`).join('')}</tr>`;
    const title = `Laporan Pemasukan Barang - ${filters.startDate || ''} s/d ${filters.endDate || ''}`;
    const win = window.open('', '_blank', 'width=1000,height=800');
    win.document.write(`<html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,Helvetica,sans-serif;font-size:12px;} table{border-collapse:collapse;width:100%;}</style></head><body>`);
    win.document.write(`<h3>${escapeHtml(title)}</h3>`);
    win.document.write(`<table>${headerRow}${htmlRows}</table>`);
    win.document.write(`<p>Generated: ${new Date().toLocaleString()}</p>`);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Laporan Pemasukan Barang</h3>

      <div style={{ border: '1px solid #f0f0f0', padding: 12, borderRadius: 6 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label>Periode Start</label>
            <br />
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          </div>

          <div>
            <label>Periode End</label>
            <br />
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>

          <div>
            <label>Jenis Dokumen</label>
            <br />
            <input value={filters.docType} onChange={(e) => setFilters({ ...filters, docType: e.target.value })} placeholder="PIB / Lainnya" />
          </div>

          <div>
            <label>Kode / Nama Barang</label>
            <br />
            <input value={filters.item} onChange={(e) => setFilters({ ...filters, item: e.target.value })} placeholder="Kode atau nama" />
          </div>

          <div>
            <button onClick={handleSearch} disabled={loading} style={{ padding: '6px 10px' }}>
              {loading ? 'Loading...' : 'Preview'}
            </button>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <button onClick={exportCSV} disabled={!rows.length} style={{ marginRight: 8 }}>
              Export CSV
            </button>
            <button onClick={printTable} disabled={!rows.length}>
              Print
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {csvColumns().map((c) => (
                  <th key={c.key} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={csvColumns().length} style={{ padding: 12 }}>Tidak ada data</td></tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    {csvColumns().map((c) => (
                      <td key={c.key} style={{ padding: 8 }}>{String(r[c.key] ?? '')}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {summary && (
          <div style={{ marginTop: 8, color: '#333' }}>
            <strong>Summary:</strong> Rows {summary.totalRows} — Total In: {summary.totalQtyIn} — Total Value (IDR): {summary.totalValueIDR ?? 0}
          </div>
        )}
      </div>
    </div>
  );
}
