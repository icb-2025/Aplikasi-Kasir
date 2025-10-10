# Aplikasi Kasir - Backend

Backend untuk aplikasi kasir yang mendukung manajemen barang, transaksi, laporan, dan integrasi realtime stok menggunakan Firebase Realtime Database.

---

## Ringkasan Fitur Utama

- Manajemen Transaksi
   - Menyimpan transaksi, mendukung Midtrans (VA, QRIS, credit card, dsb) dan callback untuk update status.
   - Stock decrement otomatis saat transaksi (RTDB transaction bila tersedia).
- Manajemen Barang
   - CRUD barang (nama, harga, stok, gambar).
   - Stok disimpan di MongoDB (metadata) dan disinkronkan ke Firebase RTDB untuk realtime updates.
- Realtime Stok
   - Perubahan stok ditulis ke Firebase RTDB dan server mem-broadcast event Socket.IO (`stockUpdated`) sehingga UI di browser dapat menerima update tanpa refresh.
- Pengaturan Metode Pembayaran & Biaya Operasional
   - CRUD untuk metode pembayaran dan biaya operasional.
- Laporan
   - Laporan penjualan bulanan/harian dan per-kasir.

---

## Struktur Perubahan Terkait Firebase/Realtime

- `config/firebaseAdmin.js` — inisialisasi `firebase-admin` (mencari `FIREBASE_SERVICE_ACCOUNT` env var atau `config/firebase-service-account.json`).
- `scripts/migrate-to-firebase.js` — skrip migrasi data `databarang` dari MongoDB ke RTDB path `/barang/{mongoId}`.
- `controllers/databarangControllers.js` — sekarang membaca stok dari RTDB (jika tersedia), menulis/sinkron stok ke RTDB saat create/update/delete, dan menyediakan endpoint `POST /api/barang/:id/decrement` untuk decrement atomik.
- `controllers/datatransaksiController.js` — saat membuat transaksi, stok dikurangi via RTDB transaction (jika tersedia) atau fallback ke MongoDB; rollback stok (cancel/expire) juga menambah stok dan mem-broadcast event.
- Server kini mem-broadcast event Socket.IO `stockUpdated` setiap kali stok berubah: payload `{ id, stok }`.

---

## Persyaratan

- Node.js (disarankan v18+)
- MongoDB (Atlas atau lokal)
- Firebase project dengan Realtime Database dan service account

---

## Pengaturan & Instalasi

1. Install dependencies

```bash
npm install
```

2. Siapkan konfigurasi environment (contoh `.env`):

- `MONGODB_URI` — connection string MongoDB
- `PORT` — port server (default 5000)
- `FIREBASE_SERVICE_ACCOUNT` (opsional) — JSON string service account, atau simpan file di `config/firebase-service-account.json` (jangan commit file ini)
- `FIREBASE_RTDB_URL` (opsional) — contoh: `https://aplikasi-kasir-21236-default-rtdb.asia-southeast1.firebasedatabase.app`

Contoh set env sementara saat menjalankan migrasi/server (tidak disimpan di shell history):

```bash
FIREBASE_RTDB_URL='https://aplikasi-kasir-21236-default-rtdb.asia-southeast1.firebasedatabase.app' node scripts/migrate-to-firebase.js
FIREBASE_RTDB_URL='https://aplikasi-kasir-21236-default-rtdb.asia-southeast1.firebasedatabase.app' npm start
```

3. (Opsi A) Simpan service account ke file lokal (jika memakai opsi file):

```bash
mkdir -p config
cat > config/firebase-service-account.json <<'JSON'
{ ...service account JSON... }
JSON
```

Pastikan file ini disebut di `.gitignore` (saya sudah menambahkannya).

---

## Migrasi data `databarang` ke Firebase RTDB

Jika Anda ingin memindahkan stok awal ke RTDB (recommended):

```bash
# pastikan env FIREBASE_RTDB_URL benar dan config/firebase-service-account.json ada atau FIREBASE_SERVICE_ACCOUNT di-set
node scripts/migrate-to-firebase.js
```

Skrip ini akan menulis semua dokumen `databarang` ke `/barang/{mongoId}` di RTDB.

---

## API penting (ringkasan)

- GET /api/barang — list semua barang (stok di-merge dari RTDB bila tersedia)
- POST /api/barang — buat barang baru (juga menulis stok awal ke RTDB)
- PUT /api/barang/:id — update barang (sync ke RTDB)
- DELETE /api/barang/:id — hapus barang (juga dari RTDB)
- POST /api/barang/:id/decrement — kurangi stok atomically di RTDB (body: { qty })

- Admin endpoints (contoh):
   - GET /api/admin/stok-barang — (frontend admin) ambil daftar stok untuk dashboard

Catatan: prefix `/api` dan rute admin diatur di `server.js`.

---

## Realtime di Frontend

Pilihan implementasi di frontend:

- Socket.IO: server mem-broadcast event `stockUpdated` setiap kali stok berubah. Payload: `{ id, stok }`.
- Firebase client SDK: frontend dapat subscribe langsung ke RTDB path `/barang` untuk mendapatkan update realtime.

Contoh singkat (Socket.IO client):

```js
import { io } from 'socket.io-client';
const socket = io('http://192.168.110.16:5000');
socket.on('stockUpdated', ({ id, stok }) => {
   // update UI
});
```

Saya juga menyediakan contoh komponen React/TSX `frontend/StockDashboard.tsx` sebagai starting point untuk dashboard admin.

---

## Debugging & tips

- Jika Anda melihat peringatan tentang URL RTDB (default `.firebaseio.com`) pastikan `FIREBASE_RTDB_URL` diset ke URL RTDB regional Anda (mis. `...-default-rtdb.asia-southeast1.firebasedatabase.app`).
- Jika stok tidak berubah di UI tanpa reload, pastikan frontend terhubung ke Socket.IO atau ke RTDB client.

---

## Keamanan

- Jangan commit file `config/firebase-service-account.json` ke git. Jika key ter-expose, revoke dan generate new key di Firebase Console.

---

Jika Anda mau, saya bisa menambahkan:

- Skrip demo frontend static (HTML + Socket.IO client) untuk verifikasi cepat.
- Unit tests untuk endpoint `decrement`.

Terakhir — beri tahu saya jika mau saya buat demo HTML atau integrasi langsung ke frontend React Anda.