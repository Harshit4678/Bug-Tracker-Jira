import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import bugRoutes from "./routes/bugs.js";
import activityRoutes from "./routes/activity.js";

const app = express();
await connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/activities", activityRoutes);
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
