import express from "express";
import Task from "../models/Task.js";
import Team from "../models/Team.js";

const router = express.Router();

// Get all tasks with populated assignee name
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignee", "name role email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post("/", async (req, res) => {
  try {
    const { title, description, assignee, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const task = new Task({ title, description, assignee, priority, dueDate });
    await task.save();
    const populatedTask = await Task.findById(task._id).populate("assignee", "name role email");
    res.json(populatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate("assignee", "name role email");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
