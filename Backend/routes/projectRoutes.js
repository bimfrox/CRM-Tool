import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

// GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("projectManager", "name").populate("teamMembers", "name role");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create project
router.post("/", async (req, res) => {
  try {
    const project = await Project.create(req.body);
    const populatedProject = await project.populate("projectManager", "name").populate("teamMembers", "name role");
    res.status(201).json(populatedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update project
router.put("/:id",async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("projectManager", "name")
      .populate("teamMembers", "name role");
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE project
router.delete("/:id",async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
