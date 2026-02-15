import BahanBaku from "../../models/bahanbaku.js";

// Get all bahan baku
export const getAllBahanBaku = async (req, res) => {
  try {
    const bahanBaku = await BahanBaku.find().sort({ createdAt: -1 });
    res.json(bahanBaku);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create bahan baku baru
export const createBahanBaku = async (req, res) => {
  try {
    const { nama_produk, bahan } = req.body;

    // Validasi input
    if (!nama_produk) {
      return res.status(400).json({ message: "Nama produk harus diisi" });
    }

    if (!Array.isArray(bahan) || bahan.length === 0) {
      return res.status(400).json({ message: "Bahan harus berupa array dan tidak boleh kosong" });
    }

    // Validasi setiap bahan
    for (const item of bahan) {
      if (!item.nama || item.harga <= 0 || item.jumlah <= 0) {
        return res.status(400).json({ message: "Semua bahan harus memiliki nama, harga, dan jumlah yang valid" });
      }
    }

    // Buat dokumen baru, pre-save hook otomatis menghitung total_stok, total_harga, modal_per_porsi
    const bahanBaku = new BahanBaku({
      nama: nama_produk,
      bahan
    });

    await bahanBaku.save();
    res.json({ message: "Bahan baku berhasil ditambahkan", bahanBaku });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update bahan baku
export const updateBahanBaku = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk, bahan } = req.body;

    // Validasi input
    if (!nama_produk) {
      return res.status(400).json({ message: "Nama produk harus diisi" });
    }

    if (!Array.isArray(bahan) || bahan.length === 0) {
      return res.status(400).json({ message: "Bahan harus berupa array dan tidak boleh kosong" });
    }

    // Validasi setiap bahan
    for (const item of bahan) {
      if (!item.nama || item.harga <= 0 || item.jumlah <= 0) {
        return res.status(400).json({ message: "Semua bahan harus memiliki nama, harga, dan jumlah yang valid" });
      }
    }

    // Gunakan findById + save() supaya pre-save hook jalan
    const bahanBaku = await BahanBaku.findById(id);
    if (!bahanBaku) return res.status(404).json({ message: "Bahan baku tidak ditemukan" });

    bahanBaku.nama = nama_produk;
    bahanBaku.bahan = bahan;

    await bahanBaku.save(); // pre-save hook otomatis menghitung total_harga & modal_per_porsi

    res.json({ message: "Bahan baku berhasil diperbarui", bahanBaku });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete bahan baku
export const deleteBahanBaku = async (req, res) => {
  try {
    const { id } = req.params;
    const bahanBaku = await BahanBaku.findByIdAndDelete(id);

    if (!bahanBaku) {
      return res.status(404).json({ message: "Bahan baku tidak ditemukan" });
    }

    res.json({ message: "Bahan baku berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update status bahan baku (pending/publish)
export const updateBahanBakuStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const bahanBaku = await BahanBaku.findById(id);
    if (!bahanBaku) return res.status(404).json({ message: "Bahan baku tidak ditemukan" });

    // Bisa tambah logic status publish/pending di sini
    // contoh: bahanBaku.status = req.body.status;
    // await bahanBaku.save();

    res.json({ message: "Status bahan baku berhasil diperbarui", bahanBaku });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
