import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/logout", logoutUser);
router.post("/forgot-password", (req, res) => res.json({ message: "Password reset link sent to email (Mocked)" }));
router.post("/reset-password", (req, res) => res.json({ message: "Password reset successfully (Mocked)" }));
router.put("/profile", protect, updateProfile);
router.get("/profile", protect, (req, res) => res.json(req.user));


export default router;

