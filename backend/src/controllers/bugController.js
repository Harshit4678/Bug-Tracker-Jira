// src/controllers/bugController.js
import Bug from "../models/Bug.js";
import Activity from "../models/Activity.js";

// helper to log activity
async function logActivity({
  actorId,
  actorName,
  action,
  targetType = "Bug",
  targetId,
  targetTitle,
  meta,
}) {
  try {
    await Activity.create({
      actorId,
      actorName,
      action,
      targetType,
      targetId,
      targetTitle,
      meta,
    });
  } catch (err) {
    console.error("Failed to log activity", err);
  }
}

// create bug
export const createBug = async (req, res) => {
  try {
    const bug = new Bug({ ...req.body, createdBy: req.user.id });
    await bug.save();

    // log activity
    await logActivity({
      actorId: req.user.id,
      actorName: req.user.name || req.user.email || "User",
      action: "reported a bug",
      targetId: bug._id,
      targetTitle: bug.title,
      meta: { severity: bug.severity },
    });

    res.json(bug);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Error creating bug" });
  }
};

// get bugs with filter & search (unchanged)
export const getBugs = async (req, res) => {
  try {
    const { status, severity, q } = req.query;
    const filter = {};
    if (req.user.role === "reporter") filter.createdBy = req.user.id;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (q) filter.title = { $regex: q, $options: "i" };
    const bugs = await Bug.find(filter).populate("createdBy", "name email");
    res.json(bugs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching bugs" });
  }
};

// update status (and log)
export const updateBug = async (req, res) => {
  try {
    const { status } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ msg: "Not found" });

    if (
      req.user.role === "reporter" &&
      bug.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    const oldStatus = bug.status;
    if (status) bug.status = status;
    // optionally update other fields if allowed
    await bug.save();

    // log activity
    await logActivity({
      actorId: req.user.id,
      actorName: req.user.name || req.user.email || "User",
      action: "updated bug status",
      targetId: bug._id,
      targetTitle: bug.title,
      meta: { from: oldStatus, to: bug.status },
    });

    res.json(bug);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating bug" });
  }
};

export const getBugStats = async (req, res) => {
  try {
    // optional: accept ?days=7 to limit createdAt range
    const days = parseInt(req.query.days || "0", 10);
    const match = {};
    if (days > 0) {
      const since = new Date(Date.now() - days * 24 * 3600 * 1000);
      match.createdAt = { $gte: since };
    }

    // If reporter, limit to their bugs
    if (req.user.role !== "admin") match.createdBy = req.user.id;

    // Aggregation: counts by status
    const statusAgg = await Bug.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Aggregation: counts by severity
    const severityAgg = await Bug.aggregate([
      { $match: match },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);

    const format = (arr) => {
      const out = {};
      arr.forEach((a) => (out[a._id] = a.count));
      return out;
    };

    res.json({
      total: await Bug.countDocuments(match),
      byStatus: format(statusAgg),
      bySeverity: format(severityAgg),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching stats" });
  }
};
