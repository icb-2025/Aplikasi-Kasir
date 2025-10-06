import express from "express";
import upload from "../middleware/upload.js";
import { updateUserProfilePicture } from "../controllers/profilecontroller.js";
import userMiddleware from "../middleware/user.js";
import { getUserHistory } from "../controllers/datatransaksiController.js";

const router = express.Router();

// User update foto profile sendiri
router.put(
  "/users/:userId/profile-picture",
  userMiddleware, // jangan pakai ()
  upload.single("profilePicture"),
  updateUserProfilePicture
);

router.get("/", userMiddleware, getUserHistory);


export default router;
