import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  nama_lengkap: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "kasir", "manajer"],
    default: "kasir",
  }
});

// Middleware sebelum "save" -> hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // hanya hash jika password diubah
  try {
    const salt = await bcrypt.genSalt(10); // generate salt
    this.password = await bcrypt.hash(this.password, salt); // hash password
    next();
  } catch (err) {
    next(err);
  }
});

// Method untuk verifikasi password
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// Model
const User = mongoose.model("User", userSchema, "Users");

export default User;
