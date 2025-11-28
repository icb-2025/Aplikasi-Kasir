import Transaksi from "./../../models/datatransaksi.js";

export const getAllTransaksi = async (req, res) => {
  try {
    console.log("User dari JWT:", req.user);

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized, silakan login dulu" });
    }

    let filter = {};
    if (req.user.role === "kasir") {
      filter.kasir_id = req.user.username || req.user.id;
    }

    // Ambil page dari query ?page=1,2,3...
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // jumlah data per halaman
    const skip = (page - 1) * limit;

    const totalData = await Transaksi.countDocuments(filter);

    const transaksi = await Transaksi.find(filter)
      .populate({
        path: "kasir_id",
        select: "nama_lengkap ProfilePicture",
      })
      .skip(skip)
      .limit(limit);

    console.log("Jumlah transaksi ditemukan:", totalData);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalData / limit),
      totalData,
      data: transaksi,
    });
  } catch (error) {
    console.error("Error getAllTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};
