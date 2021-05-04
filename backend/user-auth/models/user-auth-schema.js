const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  role: {
    type: String,
    enum: ["Administrator", "Volunteer", "Hospital"],
  },
  googleId: String,
  secret: String,
});

module.exports = userSchema;
