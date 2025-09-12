import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    client: String,
    startDate: Date,
    deadline: Date,
    status: {
      type: String,
      enum: ["Planning", "In Progress", "On Hold", "Completed"],
      default: "Planning",
    },
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
