import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  priority: { type: String, default: "Normal" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // if multi-user
});

export default mongoose.model("Reminder", reminderSchema);
