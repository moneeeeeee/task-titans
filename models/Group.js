const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tasks: [{
    name: String,
    logs: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now },
      duration: Number // in seconds
    }],
    userBestTimes: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      bestTime: Number
    }]    
  }]  
});

module.exports = mongoose.model("Group", groupSchema);