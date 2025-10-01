import express from "express";
import { login, logout } from "../auth/Login.js";
import { register } from "../auth/Register.js";
import apiMiddleware from "../middleware/api.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", apiMiddleware(), logout); // Tambahkan apiMiddleware di sini

export default router;