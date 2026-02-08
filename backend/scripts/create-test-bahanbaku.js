import mongoose from "mongoose";
import bcrypt from "bcrypt";
import BahanBaku from "../models/bahanbaku.js";
import connectDB from "../database/db.js";

const createTestBahanBaku = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing test data
    await BahanBaku.deleteMany({ nama: { $regex: /^Test/ } });
    console.log("Cleared existing test bahan baku");

    // Create test bahan baku
    const testBahanBaku = [
      {
        nama: "Test Ayam Fillet",
        kategori: "Protein",
        stok: 50,
        satuan: "kg",
        harga_beli: 80000,
        harga_jual: 120000,
        deskripsi: "Ayam fillet segar untuk bahan baku",
        gambar_url: "https://example.com/ayam-fillet.jpg",
        status: "pending",
        is_bahan_siapp: false
      },
      {
        nama: "Test Tepung Terigu",
        kategori: "Bahan Pokok",
        stok: 100,
        satuan: "kg",
        harga_beli: 15000,
        harga_jual: 25000,
        deskripsi: "Tepung terigu protein tinggi",
        gambar_url: "https://example.com/tepung-terigu.jpg",
        status: "pending",
        is_bahan_siapp: false
      },
      {
        nama: "Test Minyak Goreng",
        kategori: "Bahan Pokok",
        stok: 200,
        satuan: "liter",
        harga_beli: 20000,
        harga_jual: 30000,
        deskripsi: "Minyak goreng premium",
        gambar_url: "https://example.com/minyak-goreng.jpg",
        status: "pending",
        is_bahan_siapp: false
      },
      {
        nama: "Test Bawang Merah",
        kategori: "Bumbu",
        stok: 30,
        satuan: "kg",
        harga_beli: 40000,
        harga_jual: 60000,
        deskripsi: "Bawang merah segar",
        gambar_url: "https://example.com/bawang-merah.jpg",
        status: "pending",
        is_bahan_siapp: false
      },
      {
        nama: "Test Cabai Rawit",
        kategori: "Bumbu",
        stok: 20,
        satuan: "kg",
        harga_beli: 50000,
        harga_jual: 75000,
        deskripsi: "Cabai rawit pedas",
        gambar_url: "https://example.com/cabai-rawit.jpg",
        status: "pending",
        is_bahan_siapp: false
      }
    ];

    const createdBahanBaku = await BahanBaku.insertMany(testBahanBaku);
    console.log("Created test bahan baku:", createdBahanBaku.length);

    // Create test productions for chef
    const Production = mongoose.model("Production", new mongoose.Schema({
      bahan_baku_id: { type: mongoose.Schema.Types.ObjectId, ref: "BahanBaku" },
      chef_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      jumlah_diproses: Number,
      status: { type: String, enum: ["pending", "approved", "cancelled"], default: "pending" },
      waktu_mulai: Date,
      waktu_selesai: Date,
      catatan: String
    }));

    // Get a chef user (assuming there's at least one chef)
    const User = mongoose.model("User", new mongoose.Schema({
      role: String
    }));

    const chef = await User.findOne({ role: "chef" });
    if (!chef) {
      console.log("No chef user found, creating test chef");
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash("12345678", saltRounds);

      const testChef = new User({
        nama_lengkap: "Test Chef",
        username: "testchef",
        password: hashedPassword,
        status: "aktif",
        role: "chef",
        profilePicture: "https://example.com/chef.jpg"
      });

      await testChef.save();
      console.log("Test chef created");
      // Continue to create productions with the new chef
      const chef = testChef;
    }

    console.log("Using chef:", chef.username);

    // Clear existing test productions
    await Production.deleteMany({ catatan: "Test production" });

    // Create test productions
    const testProductions = createdBahanBaku.map(bahan => ({
      bahan_baku_id: bahan._id,
      chef_id: chef._id,
      jumlah_diproses: Math.floor(Math.random() * 10) + 1,
      status: "pending",
      catatan: "Test production"
    }));

    await Production.insertMany(testProductions);
    console.log("Created test productions:", testProductions.length);

    console.log("Test data creation completed");
    process.exit(0);
  } catch (error) {
    console.error("Error creating test data:", error);
    process.exit(1);
  }
};

createTestBahanBaku();