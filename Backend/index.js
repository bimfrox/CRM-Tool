import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import nodemailer from "nodemailer";

import leadRoutes from "./routes/leadRoutes.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/taskRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

import Reminder from "./models/Reminder.js"; // ✅ import reminder model

dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://crm-bimfrox.onrender.com",
  process.env.FRONTEND_URL, // deployed frontend (set in .env)
];

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
app.use("/api/leads", leadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teammember", teamRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);

// Default route
app.get("/", (req, res) => res.send("🚀 CRM Backend Running"));

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bimfroxservice@gmail.com", // your email
    pass: "ndkekaqfespuijxt", // app password
  },
});

// ✅ Cron job: check every minute for reminders due in 15 min
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const fifteenMinLater = new Date(now.getTime() + 15 * 60 * 1000);

  const reminders = await Reminder.find({
    start: { $gte: now, $lte: fifteenMinLater },
    isArchived: false,
  });

  for (let r of reminders) {
    console.log(`🔔 Reminder alert: ${r.title} at ${r.start}`);

    if (r.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: r.email,
          subject: "⏰ Reminder Alert",
          text: `Your reminder "${r.title}" is scheduled at ${r.start.toLocaleString()}.`,
        });
      } catch (err) {
        console.error("❌ Email send error:", err.message);
      }
    }
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
