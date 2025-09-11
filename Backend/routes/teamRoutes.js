import express from "express";
import Team from "../models/Team.js";


const router = express.Router();

// 🔹 Get all members
router.get("/", async (req, res) => {
  try {
    const team = await Team.find();
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Add member
router.post("/", async (req, res) => {
  try {
    const { name, role, email, phone, image } = req.body;

    if (!name || !role || !email || !phone || !image) {
      return res.status(400).json({ error: "All fields required" });
    }

    const newMember = new Team({ name, role, email, phone, image });
    await newMember.save();

    res.json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete member
router.delete("/:id", async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
