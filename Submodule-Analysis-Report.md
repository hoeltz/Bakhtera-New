# Analisis Submodul Sales Order yang Seharusnya di Modul Quotation

## Ringkasan Temuan

Berdasarkan analisis kode `SalesOrderManagement.js` dan `Quotation.js`, ditemukan bahwa **banyak submodul di Sales Order Management yang secara logis seharusnya berada di modul Quotation** karena dalam alur bisnis freight forwarding, quotation dibuat sebelum sales order.

## Submodul yang Duplikat/Duplikasi Fitur:

### 1. **Cargo Items Management** 
- **Lokasi di SalesOrder**: Lines 858-904
- **Fitur**: Manajemen detail cargo items dengan HS code, dimensi, berat, nilai, detail container
- **Masalah**: Duplikasi fungsi - cargo details seharusnya ditentukan saat quotation, bukan sales order

### 2. **Consignment Fee Structure**
- **Lokasi di SalesOrder**: Lines 2020-2318
- **Fitur**: Struktur fee yang sangat detail (base freight, documentation, handling, insurance, customs clearance, warehousing, delivery, fuel surcharge, security fee, equipment fee, temperature control, hazardous cargo, express service)
- **Masalah**: Fee structure yang kompleks seharusnya ditentukan saat quotation, bukan sales order

### 3. **Documentation Management**
- **Lokasi di SalesOrder**: Lines 906-940
- **Fitur**: Manajemen dokumen dengan tipe, status, tanggal expiry, status required
- **Masalah**: Persiapan dokumen seharusnya bagian dari proses quotation

### 4. **Customs Workflow**
- **Lokasi di SalesOrder**: Lines 942-958
- **Fitur**: Workflow langkah-langkah customs dengan progress tracking
- **Masalah**: Planning customs workflow seharusnya dilakukan saat quotation

### 5. **Customs Declaration Details**
- **Lokasi di SalesOrder**: Lines 2641-2699
- **Fitur**: BC codes, informasi customs, import/export licenses
- **Masalah**: Informasi customs declaration seharusnya disiapkan saat quotation

## Perbandingan dengan Quotation.js

### Quotation.js Saat Ini:
- **Lines 1083-1560**: `CargoDetailsTab` - sudah ada tapi lebih sederhana
- **Lines 1566-2076**: `CostCalculationTab` - ada tapi kurang detail
- **Tidak ada**: Documentation Management
- **Tidak ada**: Customs Workflow
- **Tidak ada**: Customs Declaration Details

## Rekomendasi Refactoring:

### 1. Pindahkan Cargo Items Management
- Enhance existing `CargoDetailsTab` di Quotation dengan fitur dari SalesOrder
- Tambahkan HS code, dimensions, container details, packing type

### 2. Pindahkan Consignment Fee Structure
- Integrate dengan `CostCalculationTab` yang sudah ada
- Tambahkan fee structure detail dari SalesOrder

### 3. Tambahkan Documentation Management
- Buat tab baru `DocumentationManagementTab` di Quotation
- Pindahkan fungsi management dokumen dari SalesOrder

### 4. Tambahkan Customs Workflow
- Buat tab baru `CustomsWorkflowTab` di Quotation
- Pindahkan workflow tracking dari SalesOrder

### 5. Tambahkan Customs Declaration Details
- Buat tab baru `CustomsDeclarationTab` di Quotation
- Pindahkan BC codes dan informasi customs dari SalesOrder

### 6. Sederhanakan Sales Order
- **SalesOrder** tinggal referensi quotation dan tambahkan detail order-specific:
  - Actual departure/arrival dates
  - Tracking numbers (AWB/BL numbers)
  - Real-time status updates
  - Actual costs vs quoted costs

## Dampak Implementasi:

### ✅ **Benefits:**
- **Quotation** menjadi lebih komprehensif dengan semua detail freight forwarding
- **SalesOrder** menjadi lebih lean dan fokus pada execution
- Mengurangi duplikasi kode dan inkonsistensi data
- Alur bisnis yang lebih logis: Quote → Order → Execute → Invoice

### ⚠️ **Challenges:**
- Perlu refactoring besar-besaran
- Migration data existing
- Testing menyeluruh untuk memastikan tidak ada fitur yang hilang

## Status Implementasi:
- ✅ **Analisis**: Selesai
- 🔄 **Refactoring**: Dalam progress
- ❌ **Testing**: Belum dimulai
- ❌ **Deployment**: Belum dimulai