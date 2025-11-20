# Local Storage Server

A simple Express server that stores warehouses and inventory into a local `data.json` file. Intended for development and local integration testing; later you can replace it with a serverless DB-backed service.

## Install

From repository root or directly in `local_storage_server`:

```bash
cd local_storage_server
npm install
```

## Run

```bash
npm start
# or for dev (requires nodemon)
# npm run dev
```

Server runs on `http://localhost:4000` by default.

## Useful endpoints

- `GET /` - health
- `POST /api/warehouses/sync` - body `{ event: 'warehouse.created'|'warehouse.updated'|'warehouse.deleted', data: {...} }` with optional `Idempotency-Key` header
- `GET /api/warehouses` - list warehouses
- `GET /api/locations` - list simplified warehouse locations
- `GET /api/inventory` - list inventory
- `POST /api/inventory/receive` - body `{ sku, name, warehouseId, qty }` to add stock
- `POST /api/inventory/dispatch` - body `{ sku, warehouseId, qty }` to remove stock

## Notes

- Data persisted in `data.json` at repo `local_storage_server/data.json`.
- Endpoint `/api/warehouses/sync` is idempotent if caller supplies `Idempotency-Key` header; otherwise a default key is composed from event and warehouse id.
- This server is intentionally minimal for local testing. For production, replace storage with a proper DB and add authentication, validation, and audit logs.
