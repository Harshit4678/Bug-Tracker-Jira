// backend/src/routes/auth.js
import express from "express";
import {
  register,
  verify,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
  verifyResetCode, // <- new
  googleAuth,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verify); // new
router.post("/login", login);
router.post("/resend", resendVerification);
router.post("/forgot", forgotPassword); // new
router.post("/verify-reset-code", verifyResetCode); // NEW: verify OTP and return resetToken
router.post("/reset", resetPassword); // new
router.post("/google", googleAuth);

export default router;
