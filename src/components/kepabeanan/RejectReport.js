import React from 'react';
import {
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import BRidgeKepabeananLayout from '../BRidgeKepabeananLayout';

export default function RejectReport() {
  return (
    <BRidgeKepabeananLayout
      title="Laporan Barang Reject/Scrap"
      subtitle="Laporan Pertanggungjawaban Barang Reject, Cacat, dan Scrap"
      breadcrumbs={['Portal Kepabeanan', 'Barang Reject']}
    >
      <Paper elevation={1} sx={{ p: 3, backgroundColor: 'white', textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Informasi:</strong> Laporan ini mencatat detail barang yang ditolak (reject), cacat, atau diekskraq (scrap) beserta alasan dan disposisi.
          </Typography>
        </Alert>
        <Typography variant="body1" color="textSecondary">
          Fitur ini sedang dalam pengembangan. Akan menampilkan daftar barang reject dengan detail alasan, kuantitas, dan tindak lanjut yang diambil.
        </Typography>
      </Paper>
    </BRidgeKepabeananLayout>
  );
}
