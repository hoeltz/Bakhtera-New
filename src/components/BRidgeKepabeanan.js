import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import BRidgeKepabeananLayout from './BRidgeKepabeananLayout';

export default function BRidgeKepabeanan() {
  return (
    <BRidgeKepabeananLayout
      title="Portal Kepabeanan"
      subtitle="Pusat Kontrol Laporan dan Peraturan Kepabeanan"
      breadcrumbs={['Portal Kepabeanan']}
    >
      <Paper elevation={1} sx={{ p: 4, backgroundColor: 'white', textAlign: 'center' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
            Selamat Datang di Portal Kepabeanan
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3, lineHeight: 1.7 }}>
            Pilih salah satu laporan dari menu samping untuk memulai:
          </Typography>
          
          <Box sx={{ textAlign: 'left', backgroundColor: '#f5f5f5', p: 2.5, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <strong>📋 Laporan Pemasukan Barang</strong> - Lihat detail penerimaan barang ke gudang
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <strong>📤 Laporan Pengeluaran Barang</strong> - Pantau pergerakan barang keluar dari gudang
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <strong>🏢 Laporan Posisi WIP</strong> - Lihat posisi barang dalam proses (Work In Progress)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <strong>📊 Laporan Mutasi Bahan Baku</strong> - Agregasi lengkap pergerakan bahan baku dengan saldo dan selisih
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <strong>✅ Laporan Mutasi Barang Jadi</strong> - Laporan barang produk selesai
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <strong>⚙️ Laporan Mutasi Mesin & Peralatan</strong> - Tracking aset tetap dan peralatan
            </Typography>
            <Typography variant="body2">
              <strong>⛔ Laporan Barang Reject/Scrap</strong> - Catatan barang cacat dan disposition-nya
            </Typography>
          </Box>

          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 3 }}>
            💡 Gunakan menu di sidebar untuk navigasi antar laporan dan filter untuk melihat data spesifik.
          </Typography>
        </Box>
      </Paper>
    </BRidgeKepabeananLayout>
  );
}
