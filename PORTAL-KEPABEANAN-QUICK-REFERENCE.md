# Portal Kepabeanan - Quick Reference Guide

## 📍 Access Portal Kepabeanan

### Frontend Routes
```
http://localhost:3000/bridge/kepabeanan/
├── inbound           → Laporan Pemasukan Barang
├── outbound          → Laporan Pengeluaran Barang
├── wip               → Laporan Posisi WIP
├── mutasi_bahan      → Laporan Mutasi Bahan Baku/Penolong
├── mutasi_produk     → Laporan Mutasi Barang Jadi
├── mutasi_asset      → Laporan Mutasi Mesin & Peralatan
└── reject            → Laporan Barang Reject/Scrap
```

---

## 📊 Table Structures Quick View

| Report | Columns | Highlighted | Status |
|--------|---------|-------------|--------|
| Pemasukan | 13 | Doc Type, Receipt Info, Sender | ✅ |
| Pengeluaran | 13 | Same as Pemasukan | ✅ |
| WIP | 4 | Simplified view | ✅ |
| Mutasi Bahan | 12 | Opening Bal, In(↑green), Out(↓red) | ✅ |
| Mutasi Produk | 12 | Same structure | ✅ |
| Mutasi Asset | 12 | Same structure | ✅ |
| Reject | 12 | Same structure | ✅ |

---

## 🎨 Color Coding

| Element | Color | Usage |
|---------|-------|-------|
| Inbound | 🟢 Green | Pemasukan (incoming goods) |
| Outbound | 🔴 Red | Pengeluaran (outgoing goods) |
| Balance | 🟣 Purple | Saldo Buku, Stock Opname |
| Header | 💜 Gradient | All report headers (blue→purple) |
| Variance + | 🟢 Green | Positive variance |
| Variance - | 🔴 Red | Negative variance |

---

## 📁 Component Files

### Core Components
```
src/components/kepabeanan/

1. BRidgeKepabeananLayout.js
   - Wrapper component
   - Header with gradient
   - Breadcrumb navigation
   - Common styling

2. InboundReport.js
   - 13-column table
   - Pemasukan data
   - Filter: Date range, Doc type, Item

3. OutboundReport.js
   - 13-column table (same as Inbound)
   - Pengeluaran data
   - Filter: Date range, Item

4. WipReport.js
   - 4-column simplified table
   - Work-in-progress inventory
   - Quick overview only

5. MutasiBahanReport.js
   - 12-column reconciliation table
   - Raw materials/packaging materials
   - Saldo calculation
   - Variance analysis
   - [RECOVERED from corruption]

6. MutasiProdukReport.js
   - 12-column reconciliation table
   - Finished goods
   - Same structure as MutasiBahanReport

7. MutasiAssetReport.js
   - 12-column reconciliation table
   - Fixed assets (machinery & equipment)
   - Uses fetchMutasiAggregation('asset')

8. RejectReport.js
   - 12-column reconciliation table
   - Reject/Scrap tracking
   - Uses fetchOutbound with reject filter
```

---

## 🔌 Service Integration

### kepabeananService.js Functions

```javascript
// Import
import * as kepabeananService from '@services/kepabeananService';

// Available Methods
kepabeananService.fetchInbound(filters)
  → Query: /api/kepabeanan/inbound
  → Returns: Array of inbound movements

kepabeananService.fetchOutbound(filters)
  → Query: /api/kepabeanan/outbound
  → Returns: Array of outbound movements

kepabeananService.fetchWip(filters)
  → Query: /api/kepabeanan/wip
  → Returns: Array of WIP items

kepabeananService.fetchMutasiAggregation(type, filters)
  → Query: /api/kepabeanan/mutasi/{type}
  → Params: type = 'bahan' | 'produk' | 'asset'
  → Returns: Aggregated movement data with balances
```

---

## 🚀 Quick Development Tasks

### Add a New Filter
```javascript
// In any report component:
const [filters, setFilters] = useState({
  startDate: '',
  endDate: '',
  itemCode: '',
  // ADD NEW FILTER
  warehouseLocation: ''
});

// In filter form JSX:
<TextField
  label="Warehouse Location"
  value={filters.warehouseLocation}
  onChange={(e) => setFilters({...filters, warehouseLocation: e.target.value})}
/>
```

### Modify Column Colors
```javascript
// In table cell:
<TableCell 
  align="right" 
  sx={{ 
    color: value > 0 ? '#4caf50' : '#f44336', // Green or Red
    fontWeight: 'bold'
  }}
>
  {value}
</TableCell>
```

### Add Summary Card
```javascript
<Box sx={{
  p: 3,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 2,
  mb: 3
}}>
  <Typography variant="h6">Total Nilai</Typography>
  <Typography variant="h4">{totalValue.toLocaleString('id-ID')}</Typography>
</Box>
```

---

## 🔧 Common Issues & Fixes

### Issue: Component Not Showing
**Check:**
1. Route added in App.js
2. Component imported in App.js
3. No console errors (check browser DevTools)
4. Build completed successfully

```bash
npm run build  # Check for errors
npm start      # Restart dev server
```

### Issue: Data Not Loading
**Check:**
1. Backend running on port 4000
2. Service endpoint exists
3. Network tab in DevTools shows successful request
4. Filter parameters correct

```bash
curl http://localhost:4000/api/kepabeanan/inbound
# Should return data or error message
```

### Issue: Styling Issues
**Check:**
1. MUI theme provider in App.js
2. CSS grid/flex layout correct
3. Responsive breakpoints (xs, sm, md, lg)
4. Material-UI version matches (v5.11.0)

---

## 📈 Performance Tips

### Data Optimization
- ✅ Use date range filters to limit data volume
- ✅ Implement pagination for large tables (>1000 rows)
- ✅ Add column sorting
- ✅ Use virtual scrolling for very large datasets

### Rendering Optimization
- ✅ Memoize expensive components (React.memo)
- ✅ Use useCallback for event handlers
- ✅ Lazy load table data with useMemo
- ✅ Debounce filter changes

---

## 🧪 Testing Checklist

Before deploying:
- [ ] All 7 submenus accessible
- [ ] Tables display data correctly
- [ ] Filters work for all columns
- [ ] Export CSV produces valid file
- [ ] No console errors
- [ ] Responsive on mobile (breakpoint check)
- [ ] Color coding visible and correct
- [ ] Summary cards calculate correctly
- [ ] Breadcrumbs navigate correctly
- [ ] Build compiles: `npm run build`

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| PORTAL-KEPABEANAN-FINAL-REPORT.md | Comprehensive implementation guide |
| PORTAL-KEPABEANAN-QUICK-REFERENCE.md | This file |
| README.md | Project overview |

---

## 👥 Support & Contact

For issues or questions about Portal Kepabeanan:
1. Check console for errors
2. Review component file structure
3. Verify backend API endpoints
4. Check git history for recent changes
5. Review PORTAL-KEPABEANAN-FINAL-REPORT.md

---

## 📝 Git Commands

```bash
# View recent commits
git log --oneline -10

# View changes in specific component
git diff HEAD~1 src/components/kepabeanan/InboundReport.js

# Create new feature branch
git checkout -b feature/kepabeanan-enhancement

# Commit changes
git add src/components/kepabeanan/
git commit -m "feat(kepabeanan): [your feature description]"

# Push to remote
git push origin fix/vendor-seed
```

---

**Last Updated:** Portal Kepabeanan Final Implementation  
**Status:** ✅ Production Ready  
**Build Version:** 1.0.0  

