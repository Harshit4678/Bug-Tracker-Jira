import express from "express";
import {
  createBug,
  getBugs,
  updateBug,
  getBugStats,
} from "../controllers/bugController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Only logged-in reporters/admins can create
router.post("/", auth(["reporter", "admin"]), createBug);

// Fetch bugs (own or all if admin)
router.get("/", auth(["reporter", "admin"]), getBugs);

// Update bug (own if reporter, any if admin)
router.put("/:id", auth(["reporter", "admin"]), updateBug);

router.get("/stats", auth(["reporter", "admin"]), getBugStats);

export default router;
