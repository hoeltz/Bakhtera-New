import React from 'react';
import {
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import BRidgeKepabeananLayout from '../BRidgeKepabeananLayout';

export default function MutasiProdukReport() {
  return (
    <BRidgeKepabeananLayout
      title="Laporan Mutasi Barang Jadi"
      subtitle="Laporan Agregasi Pergerakan Barang Jadi (Produk Selesai)"
      breadcrumbs={['Portal Kepabeanan', 'Mutasi Produk']}
    >
      <Paper elevation={1} sx={{ p: 3, backgroundColor: 'white', textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Informasi:</strong> Laporan ini menampilkan agregasi pergerakan barang jadi dengan detail pemasukan, pengeluaran, dan penyesuaian.
          </Typography>
        </Alert>
        <Typography variant="body1" color="textSecondary">
          Fitur ini sedang dalam pengembangan. Akan menampilkan data agregasi per produk jadi dengan integrasi ke backend service.
        </Typography>
      </Paper>
    </BRidgeKepabeananLayout>
  );
}
