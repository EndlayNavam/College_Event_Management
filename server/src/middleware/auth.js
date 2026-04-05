import jwt from "jsonwebtoken";
import { getDb } from "../config/db.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      res.status(401).json({ message: "Authentication token is missing." });
      return;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = getDb()
      .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
      .get(Number(payload.userId));

    if (!user) {
      res.status(401).json({ message: "Invalid token." });
      return;
    }

    req.user = {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized request." });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied for this role." });
      return;
    }

    next();
  };
}
