import express from "express";
import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import multer from "multer";
import fs from "fs";
import csvParser from "csv-parser";
import { Parser } from "json2csv";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const ALLOWED_STATUS = ["New", "Contacted", "In-progress", "Converted", "Lost"];

/**
 * GET /api/leads
 */
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/leads/export
 * (⚡ important: keep this BEFORE /:id)
 */
router.get("/export", async (req, res) => {
  try {
    const leads = await Lead.find().lean();
    if (!leads || leads.length === 0) return res.status(404).json({ message: "No leads to export" });

    const fields = ["name", "phone", "email", "whatsapp", "source", "industry", "address", "status", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.header("Content-Type", "text/csv");
    res.attachment("leads_export.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/leads/import
 */
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const rows = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (row) => {
        rows.push({
          name: row.name || row["Name"] || row["Lead Name"] || "",
          phone: row.phone || row["Phone"] || "",
          email: row.email || row["Email"] || "",
          whatsapp: row.whatsapp || row["WhatsApp"] || "",
          source: row.source || row["Source"] || "",
          industry: row.industry || row["Industry"] || "",
          address: row.address || row["Address"] || "",
          status: ALLOWED_STATUS.includes(row.status) ? row.status : "New",
        });
      })
      .on("end", async () => {
        if (rows.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "CSV had no rows" });
        }
        await Lead.insertMany(rows);
        fs.unlinkSync(req.file.path);
        res.json({ message: "Leads imported successfully", count: rows.length });
      })
      .on("error", (err) => {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/leads
 */
router.post("/", async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ message: "Name is required" });
    if (req.body.status && !ALLOWED_STATUS.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/leads/:id/status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !ALLOWED_STATUS.includes(status)) return res.status(400).json({ message: "Invalid or missing status" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid id" });

    const lead = await Lead.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/leads/:id
 */
router.put("/:id", async (req, res) => {
  try {
    if (req.body.status && !ALLOWED_STATUS.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid id" });

    const lead = await Lead.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
