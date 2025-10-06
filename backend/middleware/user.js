import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  });
};

export default userAuth;
