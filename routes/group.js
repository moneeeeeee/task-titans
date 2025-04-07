const express = require("express");
const router = express.Router();
const controller = require("../controllers/groupController");
const { createGroup, addChore, logChoreTime, getLeaderboard, joinGroup } =controller;



router.post("/create", createGroup);
router.post("/:groupId/add-chore", addChore);
router.post("/:groupId/chore/:choreName/log", logChoreTime);
router.get("/:groupId/chore/:choreName/leaderboard", getLeaderboard);
router.post("/:groupId/join", joinGroup);


module.exports = router;