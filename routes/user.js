const express = require("express");
const router = express.Router();

const { getUserDailySummary, getUserTaskLogWithRank, getUserTaskAverage, logChoreAcrossGroups, getUserTasks } = require("../controllers/userController");


router.get("/:userId/daily-summary", getUserDailySummary);
router.get("/:userId/task/:taskName/logs", getUserTaskLogWithRank); // (optional: personal log+rank view)
router.get("/:userId/task/:taskName/average", getUserTaskAverage); 
router.get("/:userId/log-chore", logChoreAcrossGroups); 
router.get("/:userId/tasks", getUserTasks);


module.exports = router;