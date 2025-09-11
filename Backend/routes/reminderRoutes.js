import express from "express";
import Reminder from "../models/Reminder.js";

const router = express.Router();

// Get all reminders
router.get("/", async (req, res) => {
  const reminders = await Reminder.find();
  res.json(reminders);
});

// Add new reminder
router.post("/", async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update reminder (reschedule, edit)
router.put("/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete reminder
router.delete("/:id", async (req, res) => {
  await Reminder.findByIdAndDelete(req.params.id);
  res.json({ message: "Reminder deleted" });
});

export default router;
