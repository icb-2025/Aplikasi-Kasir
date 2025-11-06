import Transaksi from "../../models/datatransaksi.js";

export const getStatusTransaksi = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, silakan login dulu" });
    }

    let filter = { order_id };

    if (req.user.role === "kasir") {
      filter.kasir_id = req.user.id;
    }

    console.log("Filter query:", filter);

    const transaksi = await Transaksi.findOne(filter);

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan!" });
    }

    res.json({
      order_id: transaksi.order_id,
      status: transaksi.status,
      metode_pembayaran: transaksi.metode_pembayaran,
      total_harga: transaksi.total_harga,
      no_va: transaksi.no_va || null,
    });
  } catch (err) {
    console.error("Error getStatusTransaksi:", err);
    res.status(500).json({ message: err.message });
  }
};
