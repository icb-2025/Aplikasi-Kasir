# Aplikasi Kasir - Backend

Backend untuk aplikasi kasir yang mendukung berbagai fitur seperti manajemen transaksi, pengaturan metode pembayaran, laporan, dan biaya operasional.

---

## **Fitur Utama**

1. **Manajemen Transaksi**

   - Tambah transaksi dengan berbagai metode pembayaran.
   - Mendukung Virtual Account, E-Wallet, QRIS, Kartu Debit, dan Kartu Kredit.
   - Callback dari Midtrans untuk pembaruan status transaksi.

2. **Manajemen Barang**

   - Tambah, ubah, dan hapus barang.
   - Stok barang otomatis berkurang setelah transaksi.

3. **Pengaturan Metode Pembayaran**

   - Tambah metode pembayaran baru.
   - Tambah channel ke metode pembayaran yang sudah ada.
   - Aktifkan/nonaktifkan metode pembayaran atau channel tertentu.
   - Update logo channel pembayaran.

4. **Biaya Operasional**

   - Tambah, ubah, dan hapus biaya operasional.
   - Hitung total biaya operasional secara otomatis.

5. **Laporan**
   - Laporan transaksi dan biaya operasional.

---

## **Instalasi**

### **1. Clone Repository**

```bash
git clone https://github.com/username/aplikasi-kasir-backend.git
cd aplikasi-kasir-backend
```




//Tunai
{
  "metode_pembayaran": "Tunai",
  "barang_dibeli": [
    {
      "kode_barang": "BRG001",
      "nama_barang": "Indomie Goreng",
      "jumlah": 2,
      "harga_satuan": 10000,
      "harga_beli": 7000
    }
  ],
  "total_harga": 20000
}


//lainnya
{
  "order_id": "ORD123456",
  "barang_dibeli": [
    {
      "kode_barang": "BRG001",
      "nama_barang": "Indomie Goreng",
      "jumlah": 2,
      "harga_satuan": 50000,
      "harga_beli": 40000,
      "subtotal": 100000
    }
  ],
  "metode_pembayaran": "E-Wallet (Dana)",
  "total_harga": 200000,
  "status": "success"
}
