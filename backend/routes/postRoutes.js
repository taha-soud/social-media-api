const express = require("express");
const {
  getPosts,
  createPost,
  likePost,
  addComment,
  deleteComment,
  deletePost,
  sharePost,
} = require("../controllers/postController");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");
const router = express.Router();

router.get("/", verifyToken, getPosts);
router.post("/", verifyToken, upload.single("media"), createPost);
router.put("/:id/like", verifyToken, likePost);
router.post("/:id/comment", verifyToken, addComment);
router.route("/:id/comments/:commentId").delete(verifyToken, deleteComment);
router.route("/:id").delete(verifyToken, deletePost);

router.post("/:id/share", verifyToken, sharePost);

module.exports = router;
