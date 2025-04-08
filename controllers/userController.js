const Group = require("../models/Group");
const User = require("../models/User");


const getUserTaskLogWithRank = async (req, res) => {
    try{
        const{ userID, taskName } = req.paramsl

        // 1. Gather all groups the user is in 
        const user = await User.findById(userID);
        if(!user) return res.status(404).json ({ message: "User not found" });
        const groupIds = user.groups;

        // 2. Search for the task logs in all those groups
        let allLogs = [];
    
        for (const groupId of groupIds) {
        const group = await Group.findById(groupId);
        if (!group) continue;
    
        const task = group.tasks.find(t => t.name === taskName);
        if (!task) continue;
    
        const userLogs = task.logs.filter(log => log.userId.toString() === userId);
        allLogs.push(...userLogs);
        }
    
        if (allLogs.length === 0) {
        return res.status(200).json({ message: "No logs found for this task.", logs: [] });
        }
    
        // 3. Sort logs by performance
        const sorted = allLogs.sort((a, b) => a.duration - b.duration);
        const mostRecent = allLogs[allLogs.length - 1];
        const betterCount = sorted.findIndex(l => l.date.getTime() === mostRecent.date.getTime());
    
        const percentile = Math.round((betterCount / sorted.length) * 100);
    
        res.status(200).json({
        task: taskName,
        totalLogs: sorted.length,
        mostRecent: {
            duration: mostRecent.duration,
            date: mostRecent.date,
        },
        logs: sorted.map((log, i) => ({
            rank: i + 1,
            duration: log.duration,
            date: log.date
        })),
        feedback: `You performed better than ${percentile}% of your past logs for "${taskName}".`
        });
    
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

const getUserDailySummary = async (req, res) => {
    try {
        const { userId } = req.params;
    
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
    
        const groupIds = Array.isArray(user.groups) ? user.groups : [];
        const taskLogs = [];
        const allTasks = new Set();
    
        // 1. Collect all logs across all groups
        for (const groupId of groupIds) {
            const group = await Group.findById(groupId);
            if (!group) continue;
    
            for (const task of group.tasks) {
                allTasks.add(task.name);

            for (const log of task.logs) {
                if (log.userId.toString() === userId) {
                taskLogs.push({
                    task: task.name,
                    date: new Date(log.date).toLocaleDateString("en-GB"), // format as dd-mm-yyyy
                    duration: log.duration
                });
                }
            }
            }
        }
    
        // 2. Organize logs into a summary table
        const summary = {};    
        for (const log of taskLogs) {
            if (!summary[log.date]) {
            summary[log.date] = {};
            }
    
            summary[log.date][log.task] = (summary[log.date][log.task] || 0) + log.duration;
        }
    
        // 3. Build final table
        const taskList = Array.from(allTasks);
        const table = [];
    
        for (const [date, tasks] of Object.entries(summary)) {
            const row = { date };
            let total = 0;
    
            for (const task of taskList) {
            if (tasks[task]) {
                row[task] = tasks[task];
                total += tasks[task];
            } else {
                row[task] = "-";
            }
            }
    
            row.total = total;
            table.push(row);
        }
    
        res.status(200).json({
            tasks: taskList,
            summary: table.sort((a, b) => new Date(a.date) - new Date(b.date))
        });
    
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getUserTaskAverage = async (req, res) => {
    try {
        // 1. Extract params and query range
      const { userId, taskName } = req.params;
      const range = req.query.range || "all";
  
       // 2. Check if user exists
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const groupIds = user.groups;
      let allLogs = [];

      // 3. Search for task logs in all the groups the user is in
      for (const groupId of groupIds) {
        const group = await Group.findById(groupId);
        if (!group) continue;
  
        const task = group.tasks.find(t => t.name === taskName);
        if (!task) continue;
  
        const logs = task.logs.filter(log => log.userId.toString() === userId);
        allLogs.push(...logs);
      }
  
      // 4. Apply time filtering based on selected range
      const now = new Date();
      if (range === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        allLogs = allLogs.filter(log => new Date(log.date) >= start);
      } else if (range === "week") {
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        allLogs = allLogs.filter(log => new Date(log.date) >= oneWeekAgo);
      } else if (range === "month") {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        allLogs = allLogs.filter(log => new Date(log.date) >= oneMonthAgo);
      }
  
      if (allLogs.length === 0) {
        return res.status(200).json({ message: "No logs found for this task in the selected range." });
      }

      // 6. Calculate average time
      const total = allLogs.reduce((sum, log) => sum + log.duration, 0);
      const average = Math.round(total / allLogs.length);
  
      res.status(200).json({
        task: taskName,
        range,
        averageTime: average,
        entries: allLogs.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const logChoreAcrossGroups = async (req, res) => {
    try {
      const { userId } = req.params;
      const { taskName, duration } = req.body;
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const groupIds = user.groups;
      let updatedGroups = [];
  
      for (const groupId of groupIds) {
        const group = await Group.findById(groupId);
        if (!group) continue;
  
        let task = group.tasks.find(t => t.name === taskName);
  
        // Add the task if it doesn't exist
        if (!task) {
          task = { name: taskName, logs: [], userBestTimes: [] };
          group.tasks.push(task);
        }
  
        // Add the log
        task.logs.push({ userId, duration, date: new Date() });
  
        // Update best time
        let bestEntry = task.userBestTimes.find(entry => entry.userId.toString() === userId);
        if (!bestEntry) {
          task.userBestTimes.push({ userId, bestTime: duration });
        } else if (duration < bestEntry.bestTime) {
          bestEntry.bestTime = duration;
        }
  
        await group.save();
        updatedGroups.push(group.name);
      }
  
      res.status(200).json({ message: `Chore logged to ${updatedGroups.length} group(s): ${updatedGroups.join(", ")}` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const getUserTasks = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const groupIds = user.groups;
      const taskSet = new Set();
  
      for (const groupId of groupIds) {
        const group = await Group.findById(groupId);
        if (!group) continue;
  
        for (const task of group.tasks) {
          taskSet.add(task.name);
        }
      }
  
      res.status(200).json({ tasks: Array.from(taskSet) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  

module.exports = {
    getUserTaskLogWithRank,
    getUserDailySummary,
    getUserTaskAverage,
    logChoreAcrossGroups,
    getUserTasks
};
  