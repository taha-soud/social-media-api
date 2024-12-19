// controllers/postController.js
const Post = require("../models/posts");
const User = require("../models/users");
const Chat = require("../models/chats");
const cloudinary = require("../config/cloudinaryConfig");

// Get all posts
const sharePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { shareOption, message, recipientId } = req.body;
    const post = await Post.findById(postId).populate(
      "user",
      "name profilePicture"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const currentUserId = req.user.userId;

    if (shareOption === "feed") {
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      currentUser.sharedPosts.push(post._id);
      await currentUser.save();

      return res.status(200).json({ message: "Post shared to your feed" });
    }

    // Share via direct message (DM)
    if (shareOption === "message") {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      const sharedMessage = {
        from: currentUserId,
        post: post._id,
        message: message || "Check out this post!",
        timestamp: new Date(),
      };

      let chat = await Chat.findOne({
        members: { $all: [currentUserId, recipientId] },
      });

      if (!chat) {
        chat = new Chat({
          members: [currentUserId, recipientId],
          channel: `chat-${currentUserId}-${recipientId}`,
          messages: [
            {
              sender: currentUserId,
              text: sharedMessage.message,
              timestamp: sharedMessage.timestamp,
              post: sharedMessage.post,
            },
          ],
        });
        await chat.save();
      } else {
        chat.messages.push({
          sender: currentUserId,
          text: sharedMessage.message,
          timestamp: sharedMessage.timestamp,
          post: sharedMessage.post,
        });
        await chat.save();
      }

      return res
        .status(200)
        .json({ message: "Post shared via direct message" });
    }

    return res.status(400).json({ message: "Invalid share option" });
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ message: "Server error while sharing post" });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePicture")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching posts" });
  }
};

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    let mediaUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });

      mediaUrl = result.secure_url;
    }

    const newPost = new Post({
      user: req.user.userId,
      content: content,
      media: mediaUrl,
    });

    await newPost.save();

    const post = await Post.findById(newPost._id).populate(
      "user",
      "name profilePicture"
    );

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ message: "Internal server error while creating post" });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;

    post.likes = post.likes || [];

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(
        (like) => like && like.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "user",
      "name profilePicture"
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    res
      .status(500)
      .json({ message: "Internal server error while liking/unliking post" });
  }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = {
      user: req.user.userId,
      text: text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate("user", "name profilePicture")
      .populate("comments.user", "name profilePicture");

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Failed to add comment:", error);
    res
      .status(500)
      .json({ message: "Internal server error while adding comment" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );

    await post.save();

    const updatedPost = await Post.findById(id)
      .populate("user", "name profilePicture")
      .populate("comments.user", "name profilePicture");

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Failed to delete comment:", error);
    res
      .status(500)
      .json({ message: "Internal server error while deleting comment" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ message: "Internal server error while deleting post" });
  }
};

module.exports = {
  getPosts,
  createPost,
  likePost,
  addComment,
  deleteComment,
  deletePost,
  sharePost,
};
