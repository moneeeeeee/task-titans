const User = require("../models/User");
const Group = require("../models/Group");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existing) return res.status(400).json({ message: "Username or email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed });
    await newUser.save();
    
    //  Create a private group
    const privateGroup = new Group({
      name: "Private",
      members: [newUser._id],
      tasks: []
    });
    await privateGroup.save();

    // Attach private group to user's group list
    newUser.groups.push(privateGroup._id);
    await newUser.save();

    res.status(201).json({
      message: "User registered and Private created",
      userId: newUser._id,
      groupId: privateGroup._id
    });

    } catch (err) {
      console.error("Signup Error:", err);
      res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


