import express from "express";
import Reminder from "../models/Reminder.js";

const router = express.Router();

// ✅ Get all reminders (with filters)
router.get("/", async (req, res) => {
  const { priority, from, to, category } = req.query;
  const filter = { isArchived: false };

  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (from && to) {
    filter.start = { $gte: new Date(from), $lte: new Date(to) };
  }

  const reminders = await Reminder.find(filter).sort({ start: 1 });
  res.json(reminders);
});

// ✅ Create reminder
router.post("/", async (req, res) => {
  const reminder = new Reminder(req.body);
  await reminder.save();
  res.json(reminder);
});

// ✅ Update reminder
router.put("/:id", async (req, res) => {
  const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(reminder);
});

// ✅ Soft delete (archive)
router.delete("/:id", async (req, res) => {
  const reminder = await Reminder.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
  res.json(reminder);
});

export default router;
