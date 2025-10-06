import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import Settings from "./settings.js";

const userSchema = new Schema({
  nama_lengkap: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ["aktif", "nonaktif"], default: "nonaktif" },
  role: {
    type: String,
    enum: ["users", "admin", "kasir", "manajer"],
    default: "users",
  },

  profilePicture: { type: String },

  // 🔹 Tambahin array buat tracking update foto profil
  profilePictureUpdates: [
    {
      updatedAt: { type: Date, default: Date.now }
    }
  ]
});

userSchema.pre("save", async function (next) {
  try {
    if (this.isNew && !this.profilePicture) {
      const settings = await Settings.findOne();
      this.profilePicture =
        settings?.defaultProfilePicture ||
        "https://t3.ftcdn.net/jpg/05/87/76/66/360_F_587766653_PkBNyGx7mQh9l1XXPtCAq1lBgOsLl6xH.jpg";
    }

    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

const User = model("User", userSchema, "Users");

export default User;