import express from "express";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartcontroller.js";
import userAuth from "../middleware/user.js";

const router = express.Router();

router.get("/", userAuth, getCart);
router.post("/", userAuth, addToCart);
router.delete("/:barangId", userAuth, removeFromCart);
router.delete("/", userAuth, clearCart);

export default router;
