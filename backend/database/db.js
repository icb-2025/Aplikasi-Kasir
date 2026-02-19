import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
      console.log("\x1b[32mMongoDB Atlas Connected\x1b[0m")
  } catch (err) {
      console.error("\x1b[31mMongoDB Atlas Error\x1b[0m");
    process.exit(1);
  }
};

export default connectDB;
