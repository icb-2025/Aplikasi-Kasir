// config/redisClient.js
import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379" // ganti sesuai setting redis kamu
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error", err));

await redisClient.connect();

export default redisClient;
