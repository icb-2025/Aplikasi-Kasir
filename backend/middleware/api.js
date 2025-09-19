// middleware/api.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const apiMiddleware = (roles = []) => (req, res, next) => {
  // 1. Cek API Key
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: "Forbidden API key" });
  }

  // 2. Cek JWT
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    // cek roles
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = decoded;
    next();
  });
};

export default apiMiddleware;
