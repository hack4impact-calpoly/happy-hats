const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["admin", "volunteer", "hospital", "none"],
    required: true,
    default: "none",
  },
  cognito_id: { type: String, required: true },
});

module.exports = userSchema;
