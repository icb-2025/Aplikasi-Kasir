import Transaksi from "./../../models/datatransaksi.js";
import { io } from "./../../server.js";
import { addTransaksiToLaporan } from "./helpers/laporanHelper.js";

export const updateStatusTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaksi = await Transaksi.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan!" });
    }

    io.emit("statusUpdated", transaksi);

    if (status === "selesai") {
      await addTransaksiToLaporan(transaksi);
    }

    res.json({
      message: `Status transaksi berhasil diubah menjadi '${status}'`,
      transaksi
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};