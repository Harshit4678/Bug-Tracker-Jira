// src/controllers/activityController.js
import Activity from "../models/Activity.js";

export const getActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "12", 10);
    const skip = parseInt(req.query.skip || "0", 10);

    // admin sees all, reporter sees only their actions
    const filter = {};
    if (req.user.role !== "admin") filter.actorId = req.user.id;

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching activities" });
  }
};
