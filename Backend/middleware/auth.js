import jwt from "jsonwebtoken";

const SECRET_KEY = "supersecret123"; // ⚠️ Replace with env variable in production

// Verify token & attach user to req
export const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
    req.user = decoded; // { username, role, id }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Only admin can perform certain actions
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
