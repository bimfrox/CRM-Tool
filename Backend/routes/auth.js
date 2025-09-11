import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "your_jwt_secret";

// Initialize fixed users if not exist
const initUsers = async () => {
  const adminExists = await User.findOne({ username: "admin" });
  const userExists = await User.findOne({ username: "user" });

  if (!adminExists) {
    const hashedAdmin = await bcrypt.hash("admin123", 10);
    await User.create({ username: "admin", password: hashedAdmin, role: "admin" });
    console.log("Admin created");
  }

  if (!userExists) {
    const hashedUser = await bcrypt.hash("user123", 10);
    await User.create({ username: "user", password: hashedUser, role: "user" });
    console.log("User created");
  }
};

initUsers();

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, username: user.username, role: user.role });
});

// Middleware to verify token
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token provided" });
  jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

export default router;
