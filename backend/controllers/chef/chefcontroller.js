import Production from "../../models/production.js";
import Barang from "../../models/databarang.js";
import BahanBaku from "../../models/bahanbaku.js";
import db from "../../config/firebaseAdmin.js";

// Get all productions for the logged-in chef
export const getProductions = async (req, res) => {
  try {
    const chefId = req.user.id;
    const productions = await Production.find({ chef_id: chefId })
      .populate("bahan_baku_id")
      .sort({ createdAt: -1 });
    res.json(productions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available bahan baku for chef to take
export const getAvailableBahanBaku = async (req, res) => {
  try {
    // Get bahan baku that are not yet taken by any chef (no production record)
    const takenBahanBakuIds = await Production.distinct("bahan_baku_id");
    
    const availableBahanBaku = await BahanBaku.find({
      _id: { $nin: takenBahanBakuIds },
      stok: { $gt: 0 },
      status: "publish" // only show published bahan baku
    }).sort({ createdAt: -1 });

    res.json(availableBahanBaku);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bahan baku (untuk ditampilkan di chef dashboard)
export const getAllBahanBaku = async (req, res) => {
  try {
    const bahanBakuList = await BahanBaku.find().sort({ createdAt: -1 });
    res.json(bahanBakuList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Take bahan baku (ambil bahan baku untuk diproses)
export const ambilBahanBaku = async (req, res) => {
  try {
    const { bahan_baku_id, jumlah_diproses } = req.body;
    const chefId = req.user.id;

    // Check if bahan baku exists
    const bahanBaku = await BahanBaku.findById(bahan_baku_id);
    if (!bahanBaku) {
      return res.status(404).json({ message: "Bahan baku tidak ditemukan" });
    }

    // Check stok - gunakan total_stok dari struktur baru
    const stokTersedia = bahanBaku.total_stok || 0;
    if (stokTersedia < jumlah_diproses) {
      return res.status(400).json({ 
        message: `Stok ${bahanBaku.nama} tidak cukup. Stok tersedia: ${stokTersedia}` 
      });
    }

    // Create production record - bisa ambil partial (multiple records untuk produk yang sama)
    const production = new Production({
      bahan_baku_id,
      chef_id: chefId,
      jumlah_diproses: parseInt(jumlah_diproses),
      status: "pending"
    });

    await production.save();

    // Kurangi stok bahan baku (update total_stok)
    bahanBaku.total_stok = Math.max(0, bahanBaku.total_stok - parseInt(jumlah_diproses));
    await bahanBaku.save();

    // Buat barang baru dari bahan baku yang diambil
    const ModalUtama = (await import("../../models/modalutama.js")).default;
    const modalUtama = await ModalUtama.findOne();
    
    let produkData = null;
    let totalPorsi = 0;
    let jumlahProduk = 0;
    
    if (modalUtama && modalUtama.bahan_baku) {
      // Cari produk yang nama_produk sesuai dengan bahan baku nama
      for (const produk of modalUtama.bahan_baku) {
        if (produk.nama_produk === bahanBaku.nama) {
          produkData = produk;
          // Hitung total porsi dari semua bahan dalam produk ini
          totalPorsi = (Array.isArray(produk.bahan) ? produk.bahan : []).reduce((sum, b) => sum + (b.jumlah || 0), 0);
          break;
        }
      }
    }

    if (produkData && totalPorsi > 0) {
      // Hitung jumlah produk yang bisa dibuat
      jumlahProduk = Math.floor(parseInt(jumlah_diproses) / totalPorsi);
      
      if (jumlahProduk > 0) {
        // Generate kode barang unik
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const kodeBarang = `BRG${timestamp}${random}`;

        // Hitung harga jual berdasarkan modal per porsi + margin
        const modalPerPorsi = produkData.modal_per_porsi || 0;
        const hargaJual = Math.round(modalPerPorsi * 1.3);

        // Buat barang baru
        const newBarang = new Barang({
          kode_barang: kodeBarang,
          nama_barang: produkData.nama_produk,
          kategori: "Makanan",
          harga_beli: modalPerPorsi,
          harga_jual: hargaJual,
          stok: jumlahProduk,
          stok_awal: 0,
          stok_minimal: 10,
          margin: 50,
          bahan_baku: [{
            nama_produk: produkData.nama_produk,
            bahan: (Array.isArray(produk.bahan) ? produk.bahan : []).map(b => ({
              nama: b.nama,
              harga: b.harga || 0
            }))
          }],
          total_harga_beli: modalPerPorsi * jumlahProduk,
          hargaFinal: hargaJual,
          use_discount: false,
          gambar_url: "",
          status: "pending"
        });

        await newBarang.save();
        console.log(`Barang ${produkData.nama_produk} berhasil dibuat dengan ${jumlahProduk} unit`);
      }
    }

    // Populate bahan_baku_id for response
    await production.populate("bahan_baku_id");

    res.json({ 
      message: "Bahan baku berhasil diambil dan produk siap diproses", 
      production,
      jumlah_produk_dibuat: jumlahProduk,
      stok_tersisa: bahanBaku.total_stok
    });
  } catch (error) {
    console.error('Error in ambilBahanBaku:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update production status (only chef can do this)
export const updateProductionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;
    const chefId = req.user.id;

    if (!["approved", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const production = await Production.findOne({ _id: id, chef_id: chefId }).populate("bahan_baku_id");
    if (!production) {
      return res.status(404).json({ message: "Produksi tidak ditemukan" });
    }

    if (production.status !== "pending") {
      return res.status(400).json({ message: "Produksi sudah diproses" });
    }

    production.status = status;
    if (status === "approved") {
      production.waktu_mulai = new Date(); // Set waktu mulai ketika chef approve
      
      // Update bahan baku menjadi bahan siap
      if (production.bahan_baku_id) {
        production.bahan_baku_id.is_bahan_siapp = true;
        production.bahan_baku_id.chef_id = chefId;
        production.bahan_baku_id.waktu_proses = new Date();
        await production.bahan_baku_id.save();
      }
    } else if (status === "cancelled") {
      production.waktu_selesai = new Date();
    }

    if (catatan) production.catatan = catatan;
    await production.save();

    res.json({ message: "Status produksi berhasil diperbarui", production });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};