import React, { useState } from 'react';
import InboundReport from './kepabeanan/InboundReport';
import OutboundReport from './kepabeanan/OutboundReport';
import WipReport from './kepabeanan/WipReport';
import MutasiBahanReport from './kepabeanan/MutasiBahanReport';
import MutasiProdukReport from './kepabeanan/MutasiProdukReport';
import MutasiAssetReport from './kepabeanan/MutasiAssetReport';
import RejectReport from './kepabeanan/RejectReport';

const TABS = [
  { key: 'inbound', label: 'Laporan Pemasukan Barang', comp: InboundReport },
  { key: 'outbound', label: 'Laporan Pengeluaran Barang', comp: OutboundReport },
  { key: 'wip', label: 'Laporan Posisi WIP', comp: WipReport },
  { key: 'mutasi_bahan', label: 'Laporan Pertanggungjawaban Mutasi Bahan Baku', comp: MutasiBahanReport },
  { key: 'mutasi_produk', label: 'Laporan Mutasi Barang jadi', comp: MutasiProdukReport },
  { key: 'mutasi_asset', label: 'Laporan Mutasi Mesin dan Peralatan', comp: MutasiAssetReport },
  { key: 'reject', label: 'Laporan Pertanggungjawaban Barang Reject/ Scrap', comp: RejectReport },
];

export default function BRidgeKepabeanan() {
  const [active, setActive] = useState(TABS[0].key);
  const ActiveComp = TABS.find((t) => t.key === active).comp;

  return (
    <div className="bridge-kepabeanan" style={{ padding: 16 }}>
      <h2>Kepabeanan</h2>

      <nav style={{ marginBottom: 12 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              background: active === t.key ? '#1976d2' : '#efefef',
              color: active === t.key ? '#fff' : '#000',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
        <ActiveComp />
      </div>
    </div>
  );
}
