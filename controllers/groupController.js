const Group = require("../models/Group");
const User = require("../models/User");


exports.createGroup = async (req, res) => {
  try {
    const { name, userId } = req.body;

    const group = new Group({
      name,
      members: [userId]
    });

    await group.save();

    // Add group to the user's profile
    const user = await User.findById(userId);
    user.groups.push(group._id);
    await user.save();

    res.status(201).json({ message: "Group created!", groupId: group._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addChore = async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const { name } = req.body;
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      // Check if chore already exists
      const exists = group.chores.find(chore => chore.name === name);
      if (exists) return res.status(400).json({ message: "Chore already exists" });
  
      group.chores.push({ name });
      await group.save();
  
      res.status(201).json({ message: "Chore added!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.logChoreTime = async (req, res) => {
    try {
      const { groupId, choreName } = req.params;
      const { userId, duration } = req.body;
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      // Find the chore
      const chore = group.chores.find(c => c.name === choreName);
      if (!chore) return res.status(404).json({ message: "Chore not found" });
  
      // Add log
      chore.logs.push({ userId, duration, date: new Date() });
      await group.save();
  
      res.status(200).json({ message: "Chore time logged!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  exports.getLeaderboard = async (req, res) => {
    try {
      const { groupId, choreName } = req.params;
      const range = req.query.range || "all";
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      const chore = group.chores.find(c => c.name === choreName);
      if (!chore) return res.status(404).json({ message: "Chore not found" });
  
      // Date filtering
      let filteredLogs = chore.logs;
      const now = new Date();
  
      if (range === "today") {
        const start = new Date(now.setHours(0, 0, 0, 0));
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= start);
      } else if (range === "week") {
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= oneWeekAgo);
      } else if (range === "month") {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= oneMonthAgo);
      }
  
      // Sort and map
      const sorted = filteredLogs
        .sort((a, b) => a.duration - b.duration)
        .slice(0, 5);
  
      const leaderboard = await Promise.all(
        sorted.map(async (log) => {
          const user = await User.findById(log.userId);
          return {
            username: user?.username || "Unknown",
            duration: log.duration,
            date: log.date
          };
        })
      );
  
      res.status(200).json({ chore: choreName, range, leaderboard });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.joinGroup = async (req, res) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      // Prevent duplicate adds
      if (group.members.includes(userId)) {
        return res.status(400).json({ message: "User already in group" });
      }
  
      group.members.push(userId);
      await group.save();
  
      // Update user to include this group
      const user = await User.findById(userId);
      if (!user.groups.includes(groupId)) {
        user.groups.push(groupId);
        await user.save();
      }
  
      res.status(200).json({ message: "User added to group!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  