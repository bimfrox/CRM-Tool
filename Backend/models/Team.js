import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    image: { type: String, required: true }, // base64 or URL
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;
