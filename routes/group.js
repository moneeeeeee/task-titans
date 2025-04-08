const express = require("express");
const router = express.Router();
const controller = require("../controllers/groupController");
const { createGroup, addTask, logTaskTime, getLeaderboard, joinGroup, getGroupBestLeaderboard, getGroupAverageLeaderboard } =controller;



router.post("/create", createGroup);
router.post("/:groupId/add-task", addTask);
router.post("/:groupId/task/:taskName/log", logTaskTime);
router.get("/:groupId/task/:taskName/leaderboard", getLeaderboard);
router.post("/:groupId/join", joinGroup);
router.get("/:groupId/task/:taskName/leaderboard/best", getGroupBestLeaderboard);
router.get("/:groupId/task/:taskName/leaderboard/average", getGroupAverageLeaderboard);


module.exports = router;