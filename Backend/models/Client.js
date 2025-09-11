import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    bname: { type: String, required: true, trim: true },
    contact: { type: String, required: true },
    services: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Active" }, // Active / Completed / On-hold
    paymentStatus: { type: String, default: "Pending" }, // Pending / Half Paid / Full Paid
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);

export default Client;
