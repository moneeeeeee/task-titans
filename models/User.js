const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  groups:   { 
    type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    default: [] // When creating a user, we dont provide groups field. Made an empty array by default
  }
});

module.exports = mongoose.model("User", userSchema);
