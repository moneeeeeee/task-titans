const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  chores: [{
    name: String,
    logs: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now },
      duration: Number // in seconds
    }]
  }]  
});

module.exports = mongoose.model("Group", groupSchema);