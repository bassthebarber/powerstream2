import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "engineer" },
    email: String,
    ratePerHour: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
