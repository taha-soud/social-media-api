const express = require("express");
const {
  createChat,
  getChat,
  sendMessage,
  handlePresence,
} = require("../controllers/chatController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", verifyToken, createChat);

router.get("/:userId", verifyToken, getChat);

router.post("/:chatId/message", verifyToken, sendMessage);

router.post("/presence", verifyToken, handlePresence);

module.exports = router;
