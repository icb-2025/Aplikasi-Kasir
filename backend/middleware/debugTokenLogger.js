// middleware/debugTokenLogger.js
export const debugTokenLogger = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔍 [DEBUG] Incoming Request:", req.method, req.originalUrl);

  if (!authHeader) {
    console.log("❌ [DEBUG] Tidak ada Authorization header.");
  } else {
    const token = authHeader.split(" ")[1];
    console.log("✅ [DEBUG] Authorization header ditemukan:");
    console.log("Token:", token.substring(0, 40) + "...");
  }

  next();
};
