const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    dob: { type: String },
    email: { type: String, unique: true, required: true, lowercase: true },
    googleId: { type: String },
    otp: { type: String },
    otpExpires: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
