const Group = require("../models/Group");
const User = require("../models/User");
const parseDurationString = require("../utils/timeParser");


const createGroup = async (req, res) => {
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

const addTask = async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const { name } = req.body;
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      // Check if task already exists
      const exists = group.tasks.find(task => task.name === name);
      if (exists) return res.status(400).json({ message: "Task already exists" });
  
      group.tasks.push({ name });
      await group.save();
  
      res.status(201).json({ message: "Task added!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const logTaskTime = async (req, res) => {
    try {
      const { groupId, taskName } = req.params;
      const { userId, duration , durationStr} = req.body;
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      const task = group.tasks.find(c => c.name === taskName);
      if (!task) return res.status(404).json({ message: "Task not found" });
  
      // Convert string to milliseconds if needed
      let finalDuration = duration;
      if (durationStr) {
        try {
          finalDuration = parseDurationString(durationStr);
        } catch (err) {
          return res.status(400).json({ error: err.message });
        }
      }

      // Log the time
      task.logs.push({ userId, duration: finalDuration, date: new Date() });
  
      // Update userBestTimes
      const bestEntry = task.userBestTimes.find(entry => entry.userId.toString() === userId);
      let isNewRecord = false;
  
      if (!bestEntry) {
        // No previous best, add one
        task.userBestTimes.push({ userId, bestTime: finalDuration });
        isNewRecord = true;
      } else if (finalDuration < bestEntry.bestTime) {
        // New best time!
        bestEntry.bestTime = finalDuration;
        isNewRecord = true;
      }
  
      // Sort to find ranks
      const sorted = [...task.userBestTimes].sort((a, b) => a.bestTime - b.bestTime);
      const rank = sorted.findIndex(entry => entry.userId.toString() === userId) + 1;
  
      await group.save();
  
      // Respond with feedback
      const feedback = isNewRecord
        ? `🔥 New personal best and ranked #${rank} in ${taskName}!`
        : `✅ You ranked #${rank} in ${taskName} today.`;
  
      res.status(200).json({
        message: "Task time logged!",
        currentRank: rank,
        bestTime: duration,
        isNewRecord,
        feedback
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }; 


  const getLeaderboard = async (req, res) => {
    try {
      const { groupId, taskName } = req.params;
      const range = req.query.range || "all";
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      const task = group.tasks.find(c => c.name === taskName);
      if (!task) return res.status(404).json({ message: "Task not found" });
  
      // Date filtering
      let filteredLogs = task.logs;
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
  
      res.status(200).json({ task: taskName, range, leaderboard });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  
  const joinGroup = async (req, res) => {
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
  
  const getGroupBestLeaderboard = async (req, res) => {
  try {
    const { groupId, taskName } = req.params;

    const group = await Group.findById(groupId).populate("members", "username");
    if (!group) return res.status(404).json({ message: "Group not found" });

    const task = group.tasks.find(t => t.name === taskName);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Build best time list (1 entry per user)
    const userTimes = {};

    for (const log of task.logs) {
      const uid = log.userId.toString();
      if (!userTimes[uid] || log.duration < userTimes[uid].duration) {
        userTimes[uid] = {
          duration: log.duration,
          date: log.date
        };
      }
    }

    const leaderboard = await Promise.all(
      Object.entries(userTimes).map(async ([userId, data]) => {
        const user = await User.findById(userId);
        return {
          username: user?.username || "Unknown",
          bestTime: data.duration,
          dateAchieved: data.date
        };
      })
    );

    // Sort by fastest time
    leaderboard.sort((a, b) => a.bestTime - b.bestTime);

    res.status(200).json({
      task: taskName,
      type: "best-time",
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGroupAverageLeaderboard = async (req,res) => {
  try{
    const { groupId, taskName } = req.params;
    const range = req.query.range || "all";

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const task = group.tasks.find(t => t.name === taskName);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const now = new Date();
    let filteredLogs = task.logs;

    // Filter logs by time range
    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0); // midnight today
      filteredLogs = filteredLogs.filter(log => new Date(log.date) >= start);
    }
    else if (range === "week") {
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      filteredLogs = filteredLogs.filter(log => new Date(log.date) >= oneWeekAgo);
    } else if (range === "month") {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredLogs = filteredLogs.filter(log => new Date(log.date) >= oneMonthAgo);
    }

    // Calculate average time per user
    const userTimes = {};

    for (const log of filteredLogs) {
      const uid = log.userId.toString();
      if (!userTimes[uid]) {
        userTimes[uid] = { total: 0, count: 0 };
      }
      userTimes[uid].total += log.duration;
      userTimes[uid].count += 1;
    }

    const leaderboard = await Promise.all(
      Object.entries(userTimes).map(async ([userId, data]) => {
        const user = await User.findById(userId);
        return {
          username: user?.username || "Unknown",
          averageTime: Math.round(data.total / data.count),
          entries: data.count
        };
      })
    );

      // Sort by fastest average
      leaderboard.sort((a, b) => a.averageTime - b.averageTime);

      // Add rank to each entry
      const ranked = leaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      res.status(200).json({
        task: taskName,
        range,
        leaderboard: ranked
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

module.exports = {
  createGroup,
  addTask,
  logTaskTime,
  getLeaderboard,
  joinGroup,
  getGroupBestLeaderboard,
  getGroupAverageLeaderboard 
};
