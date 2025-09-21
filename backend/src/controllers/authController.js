// backend/src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js"; // ensure this exists
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_EXPIRES = "7d";

// helper: generate 6-digit numeric code
function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function genResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

function normalizeEmail(email) {
  return (email || "").toLowerCase().trim();
}

// -------------------- register --------------------
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Missing fields" });

    const normalizedEmail = normalizeEmail(email);
    const exist = await User.findOne({ email: normalizedEmail }); // <-- move this up

    if (exist) {
      if (exist.googleId && !exist.password) {
        return res.status(400).json({
          msg: "An account already exists via Google. Please sign in using Google.",
        });
      }
      return res.status(400).json({ msg: "User already exists" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail))
      return res.status(400).json({ msg: "Invalid email" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });

    const hashed = await bcrypt.hash(password, 10);
    const code = genCode();
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashed,
      isVerified: false,
      verifyCode: code,
      verifyExpires: expires,
    });

    await user.save();

    // send verification email (do not include sensitive info)
    try {
      const html = `<p>Hi ${user.name},</p>
        <p>Your EnterSoft verification code: <strong>${code}</strong></p>
        <p>This code expires in 15 minutes.</p>`;
      await sendMail({
        to: user.email,
        subject: "EnterSoft — Verify your email",
        html,
      });
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
      // Still return success because user is created — frontend will allow resend
    }

    return res.json({ msg: "Verification code sent to email" });
  } catch (err) {
    console.error("register err", err);
    return res.status(500).json({ msg: "Error during register" });
  }
};

// -------------------- verify --------------------
export const verify = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ msg: "Missing email or code" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log("verify: user not found for", normalizedEmail);
      return res.status(400).json({ msg: "User not found" });
    }
    if (user.isVerified)
      return res.status(400).json({ msg: "Already verified" });
    if (!user.verifyCode || user.verifyCode !== code)
      return res.status(400).json({ msg: "Invalid code" });
    if (user.verifyExpires && user.verifyExpires < new Date())
      return res.status(400).json({ msg: "Code expired" });

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    return res.json({ token });
  } catch (err) {
    console.error("verify err", err);
    return res.status(500).json({ msg: "Verification failed" });
  }
};

// -------------------- resend verification --------------------
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ msg: "Already verified" });

    const code = genCode();
    user.verifyCode = code;
    user.verifyExpires = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();

    try {
      const html = `<p>Hi ${user.name},</p>
        <p>Your new verification code: <strong>${code}</strong></p>
        <p>This code expires in 15 minutes.</p>`;
      await sendMail({
        to: user.email,
        subject: "EnterSoft — Verification code (resend)",
        html,
      });
    } catch (mailErr) {
      console.error("resend mail error", mailErr);
      return res.status(500).json({ msg: "Failed to send email" });
    }

    return res.json({ msg: "Verification code resent" });
  } catch (err) {
    console.error("resendVerification err", err);
    return res.status(500).json({ msg: "Error" });
  }
};

// -------------------- login --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Missing email or password" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (user && user.googleId && !user.password) {
      return res.status(400).json({
        msg: "This account uses Google sign-in. Please sign in with Google.",
      });
    }
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

    // Only enforce verification for non-admins
    if (!user.isVerified && user.role !== "admin")
      return res.status(403).json({ msg: "Email not verified" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    return res.json({ token });
  } catch (err) {
    console.error("login err", err);
    return res.status(500).json({ msg: "Login failed" });
  }
};

// -------------------- forgot password (OTP) --------------------export const forgotPassword = async (req, res) => {
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // generate 6-digit OTP
    const resetCode = genCode();
    user.resetToken = undefined; // clear old token, keep consistency
    user.resetCode = resetCode; // new field (will be saved on model)
    user.resetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await user.save();

    const html = `<p>Hi ${user.name},</p>
      <p>Your EnterSoft password reset code is: <strong>${resetCode}</strong></p>
      <p>This code expires in 1 hour. If you didn't request this, ignore this email.</p>`;

    try {
      await sendMail({
        to: user.email,
        subject: "EnterSoft — Password reset code",
        html,
      });
    } catch (mailErr) {
      console.error("forgot mail error", mailErr);
      return res.status(500).json({ msg: "Failed to send reset email" });
    }

    return res.json({ msg: "Reset code sent to email" });
  } catch (err) {
    console.error("forgot err", err);
    return res.status(500).json({ msg: "Error" });
  }
};

// authController.js - verifyResetCode (replace existing)
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ msg: "Missing email or code" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({
      email: normalizedEmail,
      resetCode: code,
    });
    if (!user) return res.status(400).json({ msg: "Invalid code or user" });
    if (user.resetExpires && user.resetExpires < new Date())
      return res.status(400).json({ msg: "Code expired" });

    // create resetToken but DO NOT clear resetCode here
    const resetToken = genResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 min
    // remove the lines that clear resetCode/resetExpires
    await user.save();

    return res.json({ resetToken, msg: "Verified" });
  } catch (err) {
    console.error("verifyResetCode err", err);
    return res.status(500).json({ msg: "Error" });
  }
};

// inside authController.js (replace existing resetPassword)
export const resetPassword = async (req, res) => {
  try {
    const { email, code, resetToken, password } = req.body;

    // DEBUG: log incoming payload (will show in server console)
    console.log("resetPassword called ->", {
      email,
      code,
      resetToken,
      pwLen: password ? password.length : 0,
    });

    if (!email || !password)
      return res.status(400).json({ msg: "Missing fields" });

    const normalizedEmail = normalizeEmail(email);
    let user = null;

    if (resetToken) {
      user = await User.findOne({ email: normalizedEmail, resetToken });
      console.log("found by resetToken:", !!user);
      if (!user)
        return res.status(400).json({ msg: "Invalid or expired reset token" });
      if (user.resetTokenExpires && user.resetTokenExpires < new Date())
        return res.status(400).json({ msg: "Reset token expired" });
    } else {
      if (!code) return res.status(400).json({ msg: "Missing code" });
      user = await User.findOne({ email: normalizedEmail });
      console.log(
        "found by email for code-check:",
        !!user,
        "storedCode:",
        user ? user.resetCode : null
      );
      if (!user) return res.status(400).json({ msg: "Invalid code or user" });

      const stored = String(user.resetCode || "").trim();
      const sent = String(code || "").trim();
      console.log("comparing codes -> stored:", stored, "sent:", sent);
      if (!stored || stored !== sent)
        return res.status(400).json({ msg: "Invalid code or user" });
      if (user.resetExpires && user.resetExpires < new Date())
        return res.status(400).json({ msg: "Code expired" });
    }

    if (password.length < 6)
      return res.status(400).json({ msg: "Password must be at least 6 chars" });

    user.password = await bcrypt.hash(password, 10);
    // clear all reset fields
    user.resetCode = undefined;
    user.resetExpires = undefined;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.json({ msg: "Password updated" });
  } catch (err) {
    console.error("reset err", err);
    return res.status(500).json({ msg: "Error" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ msg: "Missing id token" });

    // verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // payload contains: email, email_verified, name, picture, sub (google user id)
    const { email, email_verified, name, picture, sub: googleId } = payload;

    if (!email) return res.status(400).json({ msg: "No email in token" });

    const normalizedEmail = (email || "").toLowerCase().trim();

    // 1) find by googleId first
    let user = await User.findOne({ googleId });

    // 2) if not found, find by email
    if (!user) {
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        // Case: user registered manually earlier with same email
        // Link googleId to existing account (do NOT erase password)
        user.googleId = googleId;
        user.provider = "google";
        user.avatarUrl = user.avatarUrl || picture;
        user.isVerified = true;
        await user.save();
      }
    }

    // 3) create new user if still not found
    if (!user) {
      user = new User({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId,
        provider: "google",
        avatarUrl: picture,
        isVerified: !!email_verified,
        // password: undefined (no local password)
      });
      await user.save();
    }

    // issue JWT (same as login)
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("googleAuth err", err);
    return res.status(500).json({ msg: "Google auth failed" });
  }
};
