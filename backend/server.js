import express from "express";
import cors from "cors";
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
import adminKategori from "./routes/admin/kategori.js"
import adminRiwayat from "./routes/admin/riwayat.js";
import adminStok from "./routes/admin/stok.js";
import adminLaporan from "./routes/admin/laporan.js";
import adminUsers from "./routes/admin/user.js";
import adminbiayaoperasional from "./routes/admin/biayaoperasional.js";
import adminbiayalayanan from "./routes/admin/biayalayanan.js"
import adminmodalutama from "./routes/admin/modalutama.js"
import adminhpptotal from "./routes/admin/hpptotal.js"
import adminBahanBaku from "./routes/admin/bahanbaku.js";
import adminDataSatuan from "./routes/admin/datasatuanRoutes.js";
import adminPengeluaranBiaya from "./routes/admin/pengeluaran-biaya.js";
import chefRoutes from "./routes/chef/chef.js";
import userAuth from "./middleware/user.js";
import session from "express-session";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import passport from "./config/passportGoogle.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import { debugTokenLogger } from "./middleware/debugTokenLogger.js";


const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.set('trust proxy', 1); 
app.use(helmet()); 
app.disable("x-powered-by");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: { message: "Stop Spam, I see you!" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

const trapRoutes = [
  "/.env", 
  "/wp-admin", 
  "/.git", 
  "/phpmyadmin", 
  "/nice%20ports%2C/Tri%6Eity.txt%2ebak"
];

app.use((req, res, next) => {
  if (trapRoutes.includes(req.originalUrl)) {
    console.log(`\x1b[41m\x1b[37m[!!!] HONEYPOT TRIGGERED BY IP: ${req.ip}\x1b[0m`);
    console.log(`\x1b[31m[Target Path]: ${req.originalUrl}\x1b[0m`);
    setTimeout(() => {
      return res.status(418).json({ 
        status: "error", 
        message: "Stop scanning, I see you!",
        detected_ip: req.ip 
      });
    }, 3000); 
    return;
  }
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(debugTokenLogger); 

app.use(express.json());
app.use(cors());

// pelanggan, kasir
app.use("/api/auth/google", googleAuthRoutes);
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
app.use("/api/admin/kategori", adminKategori)
app.use("/api/admin/laporan", adminLaporan);
app.use("/api/admin/users", adminUsers);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/biaya-operasional", adminbiayaoperasional);
app.use("/api/admin/biaya-layanan", adminbiayalayanan)
app.use("/api/admin/modal-utama", adminmodalutama)
app.use("/api/admin/hpp-total", adminhpptotal)
app.use("/api/admin/bahan-baku", adminBahanBaku)
app.use("/api/admin/data-satuan", adminDataSatuan)
app.use("/api/admin/pengeluaran-biaya", adminPengeluaranBiaya);

// chef
app.use("/api/chef", chefRoutes);

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

const startServer = async () => {
  await connectDB();

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
};

startServer();