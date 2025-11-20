# Consignment-to-Inventory Dispatch Feature

## Overview

The **Consignment Dispatch** feature enables automatic synchronization between warehouse consignments and inventory management. When a consignment is marked as "Sudah Keluar" (shipped), you can dispatch it to decrement inventory stock automatically.

## Features

✅ **One-Click Dispatch**: Mark consignment as shipped and automatically decrement inventory
✅ **Stock Validation**: Prevents dispatch if insufficient stock available
✅ **Bi-directional Sync**: Changes persist to both React localStorage and server database
✅ **Audit Trail**: Tracks when inventory was dispatched for each consignment
✅ **Error Handling**: Clear feedback on success, insufficient stock, or validation errors

## How It Works

### 1. **Workflow**

```
Consignment Created
      ↓
Status: Baru Masuk → Proses BC → Selesai BC → Siap Keluar
      ↓
Status: Sudah Keluar (Shipped)
      ↓
"Dispatch to Inventory" Button Enabled
      ↓
Click Dispatch → Extract SKU from HS Code
      ↓
Find Warehouse from Location
      ↓
Call /api/consignments/dispatch endpoint
      ↓
Inventory Qty Decremented
      ↓
Consignment Marked as "dispatchedToInventory: true"
      ↓
Success Notification
```

### 2. **Data Flow**

```
React Frontend (WarehouseManagement.js)
    ↓
POST /api/consignments/dispatch
{
  "consignmentId": "cons-test-001",
  "warehouseId": "wh-jakarta-01",
  "items": [
    { "sku": "SKU-ELEC-001", "qty": 100 }
  ]
}
    ↓
Local Storage Server (routes/inventory.js)
    ↓
Validate Stock
    ↓
Decrement Inventory Item
    ↓
Update Consignment Status
    ↓
Persist to data.json
    ↓
Return Success Response
    ↓
React Updates UI with Dispatch Status
```

## API Endpoints

### **POST /api/consignments/dispatch**

Dispatches consignment items to inventory (decrements stock).

**Request Body:**
```json
{
  "consignmentId": "cons-test-001",
  "warehouseId": "wh-jakarta-01",
  "items": [
    {
      "sku": "SKU-ELEC-001",
      "qty": 100
    }
  ]
}
```

**Parameters:**
- `consignmentId` (string, required): ID of the consignment
- `warehouseId` (string, required): ID of the warehouse for inventory reference
- `items` (array, required): Array of items to dispatch
  - `sku` (string, required): Stock Keeping Unit (extracted from HS Code)
  - `qty` (number, required): Quantity to dispatch

**Success Response (200):**
```json
{
  "ok": true,
  "message": "Consignment dispatched successfully",
  "dispatchedItems": [
    {
      "sku": "SKU-ELEC-001",
      "qty": 100,
      "newQty": 4800
    }
  ]
}
```

**Error Responses:**

1. **400 - Missing Parameters:**
```json
{
  "ok": false,
  "message": "consignmentId, warehouseId, and items array are required"
}
```

2. **400 - Insufficient Stock:**
```json
{
  "ok": false,
  "message": "Some items failed to dispatch",
  "dispatchedItems": [],
  "errors": ["Insufficient stock for SKU-ELEC-001: available 100, requested 200"]
}
```

3. **400 - Stock Not Found:**
```json
{
  "ok": false,
  "message": "Some items failed to dispatch",
  "dispatchedItems": [],
  "errors": ["Stock not found for SKU SKU-ELEC-001 in warehouse wh-jakarta-01"]
}
```

## Frontend Usage

### **Dispatch Button Location**

The "Dispatch to Inventory" button appears in the **Detail View Dialog** when:
- Consignment status is "Sudah Keluar" (shipped)
- Consignment has NOT been dispatched yet (`dispatchedToInventory !== true`)

### **Step-by-Step**

1. **Create Consignment**
   - Open Warehouse Management
   - Click "Add New Entry"
   - Fill in all required fields including "Keterangan" (HS Code - Goods Type)
   - Example: `HS: 8517.62.00 - Electronic Components`

2. **Update Status to Sudah Keluar**
   - Edit the consignment
   - Change status from "Siap Keluar" to "Sudah Keluar"
   - Save

3. **View Detail**
   - Click on the consignment row to open detail view
   - Notice the "Dispatch to Inventory" button is now enabled

4. **Dispatch**
   - Click "Dispatch to Inventory"
   - System extracts SKU from HS Code (e.g., "SKU-ELEC-001")
   - Maps location to warehouse ID
   - Sends dispatch request to server
   - Inventory is decremented

5. **Verification**
   - Green chip "✓ Dispatched to Inventory" appears
   - Open InventoryManagement to verify qty decreased
   - Check notification for success/error message

### **Example Consignments (Pre-loaded)**

```
1. cons-test-001
   - AWB: AWB-TEST-001
   - Status: Sudah Keluar ✓
   - Keterangan: HS: 8517.62.00 - Electronic Components
   - SKU: SKU-ELEC-001 (from HS Code)
   - Warehouse: Jakarta (wh-jakarta-01)
   - Current Qty: 4800 pcs (after test dispatch)
   - Ready to dispatch ✓

2. cons-test-002
   - AWB: AWB-TEST-002
   - Status: Selesai BC
   - Keterangan: HS: 6109.10.00 - Textile Products
   - SKU: SKU-TEXT-001
   - Status too early, not ready to dispatch

3. cons-test-003
   - AWB: AWB-TEST-003
   - Status: Sudah Keluar ✓
   - Keterangan: HS: 3907.50.00 - Plastic Pellets
   - SKU: SKU-PLAST-001
   - Warehouse: Bandung (wh-bandung-01)
   - Ready to dispatch ✓
```

## Implementation Details

### **SKU Extraction Logic**

The system parses the "Keterangan" field to extract the SKU:

```javascript
// Format: "HS: XXXX - Goods Description"
// Example: "HS: 8517.62.00 - Electronic Components"

const keteranganParts = (consignment.keterangan || '').split(' - ');
const hsCode = keteranganParts[0]?.replace('HS: ', '').trim();
// Result: "8517.62.00"

// Mapped to SKU: "SKU-ELEC-001"
// (Maps using inventory SKU matching)
```

### **Warehouse Mapping**

Location to Warehouse ID mapping:

```javascript
{
  'Jakarta': 'wh-jakarta-01',
  'Jakarta Port': 'wh-jakarta-02',
  'Surabaya': 'wh-surabaya-01',
  'Bandung': 'wh-bandung-01',
  'Medan': 'wh-medan-01'
}
```

### **Quantity Handling**

Currently, the dispatch feature uses a **placeholder quantity of 100 pcs**. For production:

**TODO**: Add quantity field to consignment form:
```javascript
// In future version:
{
  ...consignment,
  dispatchQty: 100  // User can set this
}
```

## Database Schema

### **Consignment Fields**

```javascript
{
  id: "cons-test-001",
  awbNumber: "AWB-TEST-001",
  blNumber: "BL-TEST-001",
  consignee: "PT. Test Electronics Tbk",
  asalBC: "BC 2.3",
  asalLokasi: "China",
  tujuanBC: "BC 2.3",
  tujuanLokasi: "Jakarta",
  tanggalMasuk: "2025-11-15",
  tanggalKeluar: "2025-11-17",
  status: "Sudah Keluar",
  keterangan: "HS: 8517.62.00 - Electronic Components",
  lokasi: "Gudang A, Zona 1, Rack B-05",
  documents: [],
  
  // NEW FIELDS FOR DISPATCH:
  dispatchedToInventory: false,  // Track dispatch status
  dispatchedAt: "2025-11-17T14:30:00.000Z",  // When dispatched
  
  createdAt: "2025-11-15T09:00:00.000Z",
  updatedAt: "2025-11-17T14:00:00.000Z"
}
```

### **Inventory Item Qty Update**

Before dispatch:
```json
{
  "id": "inv-001",
  "sku": "SKU-ELEC-001",
  "qty": 5000,
  "updatedAt": "2025-11-17T09:00:00.000Z"
}
```

After dispatch:
```json
{
  "id": "inv-001",
  "sku": "SKU-ELEC-001",
  "qty": 4800,  // ← Decremented by 100
  "updatedAt": "2025-11-17T14:30:00.000Z"
}
```

## Testing

### **Quick Test**

1. **Start Server**
   ```bash
   cd /Users/hoeltz/Documents/GitHub/b1/local_storage_server
   node index.js
   ```

2. **Load Sample Data**
   - 3 sample consignments pre-loaded in `data.json`
   - 5 sample inventory items pre-loaded

3. **Test Dispatch**
   ```bash
   curl -X POST http://localhost:4000/api/consignments/dispatch \
     -H "Content-Type: application/json" \
     -d '{
       "consignmentId": "cons-test-001",
       "warehouseId": "wh-jakarta-01",
       "items": [
         {"sku": "SKU-ELEC-001", "qty": 100}
       ]
     }'
   ```

4. **Verify Inventory**
   ```bash
   curl http://localhost:4000/api/inventory | grep SKU-ELEC-001
   ```

### **UI Testing**

1. Open `http://localhost:3000/warehouse` (or navigate to Warehouse Management)
2. Click on "cons-test-001" (status: Sudah Keluar)
3. Click "Dispatch to Inventory" button
4. Verify:
   - Success notification appears
   - Button changes to "✓ Dispatched to Inventory"
   - InventoryManagement shows qty: 4800 (was 5000 before 100-qty dispatch, now 4700 after second dispatch)

## Error Handling

### **Common Issues**

| Error | Cause | Solution |
|-------|-------|----------|
| "HS Code not found" | Keterangan field empty or malformed | Edit consignment, add "HS: XXXX - Description" |
| "Warehouse not found" | Location not in mapping | Use standard location names (Jakarta, Surabaya, etc.) |
| "Insufficient stock" | Requested qty > available | Check inventory qty, reduce dispatch qty |
| "Stock not found" | SKU doesn't exist in warehouse | Verify HS Code maps to valid SKU |
| Server connection error | Local storage server not running | Start server: `node index.js` in local_storage_server folder |

## Future Enhancements

1. **Add Dispatch Quantity Field**
   - Allow users to specify qty per dispatch
   - Support partial dispatch (ship 50 items, 50 later)

2. **Multiple Items per Consignment**
   - Support dispatching multiple SKUs from one consignment
   - Bulk dispatch operations

3. **Dispatch Tracking**
   - Complete dispatch history per consignment
   - Revert/undo dispatch (credit back inventory)

4. **Warehouse Selection Dialog**
   - Let users select warehouse if dispatch location ambiguous
   - Support cross-warehouse transfers

5. **Integration with Purchase Orders**
   - Link consignments to PO line items
   - Auto-decrement PO qty on dispatch

6. **Batch Dispatch**
   - Dispatch multiple consignments at once
   - Scheduled batch dispatch operations

## Files Modified

- **`src/components/WarehouseManagement.js`**
  - Added `dispatchLoading` state
  - Added `handleDispatch()` function
  - Added `mapLocationToWarehouseId()` helper
  - Updated `DetailViewDialog` with dispatch button
  - Dispatch button visible when status="Sudah Keluar" and not yet dispatched

- **`local_storage_server/routes/inventory.js`**
  - Added `POST /api/consignments/dispatch` endpoint
  - Validates warehouse/SKU existence
  - Checks stock availability
  - Decrements inventory qty
  - Updates consignment status
  - Returns dispatch summary

- **`local_storage_server/data.json`**
  - Added 3 sample consignments with various statuses
  - Ready-to-dispatch consignments marked for testing

## Support

For issues or questions:
1. Check server logs: `tail -f local_storage_server/server.log`
2. Verify endpoint: `curl http://localhost:4000/api/consignments`
3. Check browser console for React errors
4. Verify data.json integrity: `cat local_storage_server/data.json | python -m json.tool`
