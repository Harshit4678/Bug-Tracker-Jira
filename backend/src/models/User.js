// backend/src/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["reporter", "admin"], default: "reporter" },

    // verification & reset
    isVerified: { type: Boolean, default: false },
    verifyCode: { type: String },
    verifyExpires: { type: Date },

    // Google / OAuth fields
    googleId: { type: String, index: true, sparse: true },
    provider: { type: String }, // 'google' or null
    avatarUrl: { type: String },

    resetCode: { type: String }, // OTP code
    resetExpires: { type: Date }, // OTP expiry
    resetToken: { type: String }, // token after OTP verify
    resetTokenExpires: { type: Date }, // token expiry
  },
  { timestamps: true }
);

// Ensure email is always stored lowercased
UserSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase();
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
