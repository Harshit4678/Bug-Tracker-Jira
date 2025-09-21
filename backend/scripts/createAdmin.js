// backend/scripts/createAdmin.js  (ESM)
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

const MONGO = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!MONGO || !ADMIN_EMAIL || !ADMIN_PASS) {
  console.error("Missing MONGO_URI, ADMIN_EMAIL or ADMIN_PASS in .env");
  process.exit(1);
}

await mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const existing = await User.findOne({ email: ADMIN_EMAIL });
if (existing) {
  console.log("Admin already exists:", ADMIN_EMAIL);
  process.exit(0);
}

const hashed = await bcrypt.hash(ADMIN_PASS, 10);
const admin = new User({
  name: "Admin",
  email: ADMIN_EMAIL,
  password: hashed,
  role: "admin",
});
await admin.save();
console.log("Admin created:", ADMIN_EMAIL);
process.exit(0);
