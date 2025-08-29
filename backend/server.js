import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./routes/userRoutes.js";
import barangRoutes from "./routes/BarangRoutes.js";
import transaksiRoutes from "./routes/TransaksiRoutes.js";
import laporanRoutes from "./routes/LaporanRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/api.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"]
}));

connectDB();

// Routes
app.use("/api/users", authMiddleware, userRoutes); 
app.use("/api/barang", barangRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/auth", authRoutes); // login, register

app.get("/", (req, res) => {
  res.json({ message: "API Aplikasi Kasir berjalan 🚀" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(" Error:", err.stack);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
