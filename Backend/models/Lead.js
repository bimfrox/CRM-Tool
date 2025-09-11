// backend/models/Lead.js
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    whatsapp: { type: String },
    source: { type: String },
    industry: { type: String },
    address: { type: String },
    status: {
      type: String,
      enum: ["New", "Contacted", "In-progress", "Converted", "Lost"],
      default: "New",
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
