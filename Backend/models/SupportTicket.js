import mongoose from "mongoose";

const SupportTicketSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    issueType: { type: String, enum: ["Delivery", "Product", "Billing", "General"], default: "General" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    message: { type: String, required: true },
    status: { type: String, enum: ["New", "In Progress", "Resolved", "Closed"], default: "New" },
    assignedTo: { type: String, default: "Unassigned" },
    feedback: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", SupportTicketSchema);
