// src/middleware/auth.js
import jwt from "jsonwebtoken";

export default function auth(roles = []) {
  // roles = ['reporter','admin'] etc.
  return (req, res, next) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) return res.status(401).json({ msg: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ msg: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error("Auth middleware error:", err.message);
      res.status(401).json({ msg: "Invalid or expired token" });
    }
  };
}
