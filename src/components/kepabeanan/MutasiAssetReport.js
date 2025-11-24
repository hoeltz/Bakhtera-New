import React from 'react';
import {
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import BRidgeKepabeananLayout from '../BRidgeKepabeananLayout';

export default function MutasiAssetReport() {
  return (
    <BRidgeKepabeananLayout
      title="Laporan Mutasi Mesin dan Peralatan"
      subtitle="Laporan Pergerakan Aset Mesin, Peralatan, dan Perabot (Fixed Assets)"
      breadcrumbs={['Portal Kepabeanan', 'Mutasi Aset']}
    >
      <Paper elevation={1} sx={{ p: 3, backgroundColor: 'white', textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Informasi:</strong> Laporan ini menampilkan data pergerakan aset tetap termasuk lokasi, kondisi, dan catatan penyesuaian.
          </Typography>
        </Alert>
        <Typography variant="body1" color="textSecondary">
          Fitur ini sedang dalam pengembangan. Akan menampilkan detail aset dengan tracking lokasi dan jumlah (jika consumable).
        </Typography>
      </Paper>
    </BRidgeKepabeananLayout>
  );
}
