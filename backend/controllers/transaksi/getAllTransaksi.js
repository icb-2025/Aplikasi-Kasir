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

    const transaksi = await Transaksi.find(filter).populate({
      path: "kasir_id",
      select: "nama_lengkap ProfilePicture",
    });
    console.log("Jumlah transaksi ditemukan:", transaksi.length);

    res.json(transaksi);
  } catch (error) {
    console.error("Error getAllTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};