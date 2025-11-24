import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import BRidgeKepabeananLayout from '../BRidgeKepabeananLayout';
import { fetchMutasiAggregation } from '../../services/kepabeananService';

export default function MutasiBahanReport() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', item: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const now = new Date();
    const prior = new Date(now);
    prior.setMonth(prior.getMonth() - 1);
    setFilters((f) => ({ ...f, startDate: prior.toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) }));
    // eslint-disable-next-line
  }, []);

  async function handleSearch() {
    setLoading(true);
    setError('');
    try {
      const resp = await fetchMutasiAggregation(filters);
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

  function exportCSV() {
    if (!rows || rows.length === 0) return;
    const headers = ['Kode Barang', 'Nama Barang', 'Satuan', 'Saldo Awal', 'Pemasukan', 'Pengeluaran', 'Penyesuaian', 'Saldo Buku', 'Stock Opname', 'Selisih'];
    const lines = rows.map((r) =>
      [r.item_code, r.item_name, r.unit, r.opening_balance, r.total_in, r.total_out, r.total_adj, r.book_balance, r.stock_opname, r.variance]
        .map(v => csvSafe(String(v || '')))
        .join(',')
    );
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutasi-bahan-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvSafe(v) {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/\"/g, '""')}"`;
    }
    return v;
  }

  return (
    <BRidgeKepabeananLayout
      title="Laporan Mutasi Bahan Baku"
      subtitle="Laporan Pertanggungjawaban Mutasi Bahan Baku - Agregasi Pemasukan, Pengeluaran, dan Penyesuaian"
      breadcrumbs={['Portal Kepabeanan', 'Mutasi Bahan']}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DownloadIcon />}
            onClick={exportCSV}
            disabled={!rows.length}
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            Export CSV
          </Button>
        </Box>
      }
    >
      {/* Filters Section */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 3, backgroundColor: 'white' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
          Filter Data
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Tanggal Mulai"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Tanggal Akhir"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Kode/Nama Barang"
              value={filters.item}
              onChange={(e) => setFilters({ ...filters, item: e.target.value })}
              placeholder="Cari..."
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ mt: 0.5 }}
            >
              {loading ? 'Mencari...' : 'Cari'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Section */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Card */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" variant="body2" sx={{ opacity: 0.8 }}>
                  Total Item Barang
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {summary.totalItems || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Table Section */}
      <TableContainer component={Paper} elevation={1} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Kode</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Nama Barang</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Satuan</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Saldo Awal</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Pemasukan</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Pengeluaran</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Penyesuaian</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Saldo Buku</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Stock Opname</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>Selisih</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">Tidak ada data ditemukan</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.04)' },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold' }}>{row.item_code}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>{row.item_name}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>{row.unit}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>{(row.opening_balance || 0).toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5, color: '#43e97b', fontWeight: 'bold' }}>{(row.total_in || 0).toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5, color: '#f5576c', fontWeight: 'bold' }}>{(row.total_out || 0).toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>{(row.total_adj || 0).toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>{(row.book_balance || 0).toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>{(row.stock_opname || 0).toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', color: row.variance > 0 ? '#43e97b' : row.variance < 0 ? '#f5576c' : '#333' }}>
                    {(row.variance || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </BRidgeKepabeananLayout>
  );
}
