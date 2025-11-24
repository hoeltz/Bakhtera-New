import React, { useState } from 'react';
import { fetchOutbound } from '../../services/kepabeananService';
import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function OutboundReport() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', item: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  async function handleSearch() {
    setLoading(true);
    try {
      const resp = await fetchOutbound(filters);
      setRows(resp.rows || []);
      setSummary(resp.summary || null);
    } catch (err) {
      console.error(err);
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  function exportPDF() {
    if (!rows || rows.length === 0) return;
    const doc = new jsPDF();
    const head = [['Jenis Dok', 'Nomor', 'Tanggal', 'Kode Barang', 'Nama Barang', 'Jumlah', 'Satuan']];
    const body = rows.map(r => [r.doc_type, r.doc_number, r.doc_date, r.item_code, r.item_name, r.qty, r.unit]);
    doc.text('Laporan Pengeluaran Barang', 14, 16);
    // @ts-ignore
    doc.autoTable({ head, body, startY: 22 });
    doc.save(`kepabeanan-outbound-${new Date().toISOString().slice(0,19)}.pdf`);
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Laporan Pengeluaran Barang</h3>

      <Box sx={{ border: '1px solid #f0f0f0', p: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'end' }}>
          <TextField label="Periode Start" type="date" InputLabelProps={{ shrink: true }} value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <TextField label="Periode End" type="date" InputLabelProps={{ shrink: true }} value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          <TextField label="Kode/Nama Barang" value={filters.item} onChange={(e) => setFilters({ ...filters, item: e.target.value })} />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>{loading ? 'Loading...' : 'Preview'}</Button>
          <Box sx={{ ml: 'auto' }}>
            <Button variant="outlined" onClick={exportPDF} disabled={!rows.length} sx={{ mr: 1 }}>Export PDF</Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Jenis Dok</TableCell>
                <TableCell>Nomor</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Kode Barang</TableCell>
                <TableCell>Nama Barang</TableCell>
                <TableCell align="right">Jumlah</TableCell>
                <TableCell>Satuan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 2 }}>Tidak ada data</TableCell></TableRow>
              ) : (
                rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.doc_type}</TableCell>
                    <TableCell>{r.doc_number}</TableCell>
                    <TableCell>{r.doc_date}</TableCell>
                    <TableCell>{r.item_code}</TableCell>
                    <TableCell>{r.item_name}</TableCell>
                    <TableCell align="right">{r.qty}</TableCell>
                    <TableCell>{r.unit}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {summary && <Box sx={{ mt: 1 }}>Rows: {summary.totalRows}</Box>}
    </div>
  );
}
