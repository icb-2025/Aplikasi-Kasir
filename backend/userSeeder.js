import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv"

dotenv.config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const salt = await bcrypt.genSalt(10);
const defaultHash = await bcrypt.hash("12345678", salt); //Default Passowrd All Dummy User

async function generateUsers(count = 500) {
  const users = [];

  for (let i = 0; i < count; i++) {
    const isGoogleUser = Math.random() < 0.5;

    let password = null;
    let googleId = null;

    if (!isGoogleUser) {
      password = defaultHash;
    } else {
      googleId = faker.string.uuid();
    }

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullname = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`; 

    users.push({
      nama_lengkap: fullname,
      username,
      password,
      googleId,
      status: Math.random() < 0.8 ? "aktif" : "nonaktif",
      role: ["user", "admin", "kasir", "manajer", "chef"][Math.floor(Math.random() * 5)],
      profilePicture: faker.image.avatar(),
      profilePictureUpdates: [
        { updatedAt: faker.date.recent() },
      ],
    });
  }

  return users;
}

async function seed() {
  try {
    const users = await generateUsers(100);
    await User.insertMany(users);
    console.log("500 users berhasil ditambahkan!");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
