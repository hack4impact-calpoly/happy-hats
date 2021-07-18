const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["admin", "volunteer", "hospital", "none"],
    required: true,
    default: "none",
  },
  cognito_id: { type: String, required: true },
  firstName: { type: String, required: false},
  lastName: { type: String, required: false},
  email: { type: String, required: true },
  completedHours: { type: Number, required: true, default: 0 },
  scheduledHours: { type: Number, required: true, default: 0 },
  nonCompletedHours: { type: Number, required: true, default: 0 },
  approved: {type: Boolean, required: true, default: false},
  decisionMade: {type: Boolean, required: true, default: false},
});

module.exports = userSchema;
