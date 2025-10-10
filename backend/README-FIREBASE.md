Firebase RTDB integration

What I changed

- Added `config/firebaseAdmin.js` to initialize `firebase-admin` using either the `FIREBASE_SERVICE_ACCOUNT` env var (JSON string) or a local `config/firebase-service-account.json` file.
- Added `scripts/migrate-to-firebase.js` to copy all `databarang` documents from MongoDB to Realtime Database under `/barang`.
- Updated `controllers/databarangControllers.js` to:
  - Read stock from RTDB and merge into responses (`getAllBarang`).
  - Sync stock/name/price to RTDB on create/update/delete.
  - Added `decrementStock` endpoint to atomically decrement stock in RTDB and best-effort sync back to MongoDB.
- Exposed `POST /barang/:id/decrement` route in `routes/BarangRoutes.js`.

How to provide credentials

Option A (recommended for local testing):
- Save your service account JSON to `config/firebase-service-account.json` (ensure it's gitignored).

Option B (CI / env var):
- Set `FIREBASE_SERVICE_ACCOUNT` to the full JSON content (escaped) and optionally set `FIREBASE_RTDB_URL` to your RTDB URL.

Example (bash):

export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account", ... }'
export FIREBASE_RTDB_URL='https://aplikasi-kasir-21236-default-rtdb.asia-southeast1.firebasedatabase.app'

Migrate data from MongoDB to RTDB

Run the migration script (ensure MongoDB connection is available via existing project config):

node scripts/migrate-to-firebase.js

Testing realtime stock updates

- Start the server: npm start
- Create a product via POST /barang (or migrate existing ones)
- Use POST /barang/:id/decrement with JSON body { "qty": 1 } to atomically decrement stock in RTDB.
- The `getAllBarang` endpoint will return stocks merged from RTDB.

Notes and caveats

- The repo now depends on `firebase-admin` (already present in package.json). Make sure network access to Firebase is allowed.
- The service account provided in the prompt should NOT be committed to the repository. Use env var or local file excluded from git.
- This approach keeps MongoDB as the canonical metadata store and uses RTDB for realtime stock updates and syncing.

If you want, I can:
- Add automated tests for the decrement endpoint.
- Add a small client example that listens to RTDB changes via the regular Firebase JS SDK.
