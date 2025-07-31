import mongoose from "mongoose";

const ResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Token expires in 5 minutes
});

export default mongoose.model("ResetToken", ResetTokenSchema);
