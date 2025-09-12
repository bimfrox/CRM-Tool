import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  priority: { type: String, enum: ["Low", "Normal", "High"], default: "Normal" },
  category: { type: String, default: "General" },
  recurring: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly"],
    default: "none",
  },
  isArchived: { type: Boolean, default: false },
  email: { type: String, default: "user-email@example.com" } // add email per user
});

export default mongoose.model("Reminder", ReminderSchema);
