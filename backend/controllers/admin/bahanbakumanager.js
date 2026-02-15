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

    // PENTING: Tambahkan juga ke ModalUtama agar chef bisa membuat barang saat approve
    try {
      const ModalUtama = (await import("../../models/modalutama.js")).default;
      let modalUtama = await ModalUtama.findOne();
      
      if (!modalUtama) {
        // Jika ModalUtama tidak ada, buat yang baru
        modalUtama = new ModalUtama({
          total_modal: 0,
          bahan_baku: [{
            nama_produk,
            bahan
          }]
        });
      } else {
        // Cek apakah produk sudah ada di bahan_baku
        const existingProduk = modalUtama.bahan_baku.findIndex(p => p.nama_produk === nama_produk);
        
        if (existingProduk >= 0) {
          // Update produk yang sudah ada
          modalUtama.bahan_baku[existingProduk] = {
            nama_produk,
            bahan
          };
        } else {
          // Tambah produk baru
          modalUtama.bahan_baku.push({
            nama_produk,
            bahan
          });
        }
      }
      
      await modalUtama.save();
    } catch (err) {
      console.warn("Gagal sinkronisasi ke ModalUtama:", err.message);
      // Jangan throw error, tetap response sukses karena BahanBaku sudah berhasil dibuat
    }

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

    const namaBakuLama = bahanBaku.nama; // Simpan nama lama untuk update ModalUtama

    bahanBaku.nama = nama_produk;
    bahanBaku.bahan = bahan;

    await bahanBaku.save(); // pre-save hook otomatis menghitung total_harga & modal_per_porsi

    // PENTING: Update juga di ModalUtama agar tetap sinkron
    try {
      const ModalUtama = (await import("../../models/modalutama.js")).default;
      let modalUtama = await ModalUtama.findOne();
      
      if (modalUtama && modalUtama.bahan_baku) {
        // Cari produk dengan nama lama
        const existingIndex = modalUtama.bahan_baku.findIndex(p => p.nama_produk === namaBakuLama);
        
        if (existingIndex >= 0) {
          // Update produk yang sudah ada
          modalUtama.bahan_baku[existingIndex] = {
            nama_produk,
            bahan
          };
        } else {
          // Jika tidak ketemu nama lama, cari dengan nama baru (buat duplikat)
          const newNameIndex = modalUtama.bahan_baku.findIndex(p => p.nama_produk === nama_produk);
          if (newNameIndex < 0) {
            // Jika juga tidak ada, tambah baru
            modalUtama.bahan_baku.push({
              nama_produk,
              bahan
            });
          } else {
            // Update nama baru jika sudah ada
            modalUtama.bahan_baku[newNameIndex] = {
              nama_produk,
              bahan
            };
          }
        }
        
        await modalUtama.save();
      }
    } catch (err) {
      console.warn("Gagal sinkronisasi ke ModalUtama:", err.message);
      // Jangan throw error, tetap response sukses
    }

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

    // PENTING: Hapus juga dari ModalUtama agar tetap sinkron
    try {
      const ModalUtama = (await import("../../models/modalutama.js")).default;
      let modalUtama = await ModalUtama.findOne();
      
      if (modalUtama && modalUtama.bahan_baku) {
        // Cari dan hapus produk dengan nama yang sama
        const filterIndex = modalUtama.bahan_baku.findIndex(p => p.nama_produk === bahanBaku.nama);
        
        if (filterIndex >= 0) {
          modalUtama.bahan_baku.splice(filterIndex, 1);
          await modalUtama.save();
        }
      }
    } catch (err) {
      console.warn("Gagal hapus dari ModalUtama:", err.message);
      // Jangan throw error, tetap response sukses
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
