import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./database/db.js";
import barangRoutes from "./routes/BarangRoutes.js";
import transaksiRoutes from "./routes/TransaksiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import updateProfile from "./routes/profile.js"
import usersRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cart.js"
import dashboardRoutes from "./routes/manager/dashboard.js";
import riwayatRoutes from "./routes/manager/riwayat.js";
import stokBarang from "./routes/manager/stokbarang.js";
import laporanManagerRoutes from "./routes/manager/laporan.js";
import biayaoperasional from "./routes/manager/biayaoperasional.js";
import managerSettingsRoutes from "./routes/manager/settings.js";
import adminSettingsRoutes from "./routes/admin/settings.js";
import adminDashboardRoutes from "./routes/admin/dashboard.js";
import adminStatusPesanan from "./routes/admin/status.js";
import adminRiwayat from "./routes/admin/riwayat.js";
import adminStok from "./routes/admin/stok.js";
import adminLaporan from "./routes/admin/laporan.js";
import adminUsers from "./routes/admin/user.js";
import adminbiayaoperasional from "./routes/admin/biayaoperasional.js";
import userAuth from "./middleware/user.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
connectDB();

// pelanggan, kasir
app.use("/api/barang", barangRoutes);
app.use("/api/transaksi", userAuth, transaksiRoutes);
app.use("/api/update-profile", updateProfile);
app.use("/api/users/history", userAuth, usersRoutes);
app.use("/api/cart", cartRoutes)
app.use("/auth", authRoutes);

// manager
app.use("/api/manager/dashboard", dashboardRoutes);
app.use("/api/manager/riwayat", riwayatRoutes);
app.use("/api/manager/stok-barang", stokBarang);
app.use("/api/manager/laporan", laporanManagerRoutes);
app.use("/api/manager/biaya-operasional", biayaoperasional);
app.use("/api/manager/settings", managerSettingsRoutes);


// admin
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/status-pesanan", adminStatusPesanan);
app.use("/api/admin/riwayat", adminRiwayat);
app.use("/api/admin/stok-barang", adminStok);
app.use("/api/admin/laporan", adminLaporan);
app.use("/api/admin/users", adminUsers);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/biaya-operasional", adminbiayaoperasional);

app.use(cors())
app.get("/", (req, res) => {
  res.json({ message: "Welcome To API" });
});

app.use((err, req, res, next) => {
  console.error(" Error:", err.stack);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: "*",
    allowedHeaders: "*"
  },
});

io.on("connection", (socket) => {
  console.log("Client terhubung:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client terputus:", socket.id);
  });
});

export { io };

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
