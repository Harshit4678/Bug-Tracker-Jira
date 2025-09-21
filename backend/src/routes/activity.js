// backend/src/routes/activity.js
import express from "express";
import { getActivities } from "../controllers/activityController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/activities?limit=12&skip=0
router.get("/", auth(["reporter", "admin"]), getActivities);

export default router;
