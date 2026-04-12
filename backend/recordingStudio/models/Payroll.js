import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    hours: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    periodStart: Date,
    periodEnd: Date,
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", payrollSchema);
