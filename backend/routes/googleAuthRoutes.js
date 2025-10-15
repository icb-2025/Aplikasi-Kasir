import express from "express";
import passport from "../config/passportGoogle.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Step 1: Redirect ke Google
router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Callback dari Google
router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Redirect balik ke frontend setelah sukses login
    res.redirect(
      `http://localhost:5173/login-success?token=${token}`
    );
  }
);

router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "Login Google gagal" });
});

export default router;
