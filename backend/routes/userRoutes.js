const express = require("express");
const {
  updateUserProfile,
  followUser,
  searchUsers,
  getUserProfile,
} = require("../controllers/userController");

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");
const router = express.Router();
const { getAllUsers } = require("../controllers/userController");
router.put("/:id/follow", verifyToken, followUser);

router.get("/search", verifyToken, searchUsers);

router.put(
  "/:id/profile-picture",
  verifyToken,
  upload.single("profilePicture"),
  updateUserProfile
);
router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserProfile);

module.exports = router;
