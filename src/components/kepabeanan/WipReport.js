import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import BRidgeKepabeananLayout from '../BRidgeKepabeananLayout';

export default function WipReport() {
  return (
    <BRidgeKepabeananLayout
      title="Laporan Posisi WIP"
      subtitle="Work In Progress - Laporan Posisi Barang Dalam Proses"
      breadcrumbs={['Portal Kepabeanan', 'Posisi WIP']}
    >
      <Paper elevation={1} sx={{ p: 3, backgroundColor: 'white', textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Informasi:</strong> Laporan ini menampilkan posisi barang yang sedang dalam tahap pemrosesan (WIP).
          </Typography>
        </Alert>
        <Typography variant="body1" color="textSecondary">
          Fitur ini sedang dalam pengembangan. Akan menampilkan agregasi data per stage pemrosesan dengan integrasi ke backend service.
        </Typography>
      </Paper>
    </BRidgeKepabeananLayout>
  );
}
