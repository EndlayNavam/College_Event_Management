import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { getDb } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

function formatUser(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const normalizedRole = String(role).toLowerCase();
    if (!["student", "organizer", "admin"].includes(normalizedRole)) {
      res.status(400).json({ message: "Invalid role selected." });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = getDb()
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(normalizedEmail);

    if (existingUser) {
      res.status(409).json({ message: "Email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = getDb()
      .prepare(
        `
          INSERT INTO users (name, email, password_hash, role)
          VALUES (?, ?, ?, ?)
        `
      )
      .run(name.trim(), normalizedEmail, hashedPassword, normalizedRole);

    const user = getDb()
      .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
      .get(Number(insertResult.lastInsertRowid));

    const token = createToken(user.id);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    const user = getDb()
      .prepare(
        `
          SELECT id, name, email, role, password_hash
          FROM users
          WHERE email = ?
        `
      )
      .get(normalizedEmail);

    if (!user) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const isValidPassword = await bcrypt.compare(
      String(password || ""),
      user.password_hash
    );

    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = createToken(user.id);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Failed to login." });
  }
});

router.get("/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
