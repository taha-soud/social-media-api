const User = require("../models/users");
const Post = require("../models/posts");
const cloudinary = require("../config/cloudinaryConfig");

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "profile_pictures",
          },
          async (error, result) => {
            if (error) {
              console.error("Error uploading to Cloudinary:", error);
              return res
                .status(500)
                .json({ message: "Cloudinary upload failed" });
            }

            updates.profilePicture = result.secure_url;

            try {
              const updatedUser = await User.findByIdAndUpdate(id, updates, {
                new: true,
              });
              if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
              }
              res.status(200).json(updatedUser);
            } catch (error) {
              console.error(error);
              res
                .status(500)
                .json({ message: "Server error while updating user" });
            }
          }
        )
        .end(req.file.buffer);
    } else {
      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;

    if (currentUserId === id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentlyFollowing = userToFollow.followers.includes(currentUserId);

    if (isCurrentlyFollowing) {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(
        (followerId) => followerId.toString() !== currentUserId
      );
      currentUser.following = currentUser.following.filter(
        (followingId) => followingId.toString() !== id
      );
    } else {
      userToFollow.followers.push(currentUserId);
      currentUser.following.push(id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      message: isCurrentlyFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
      updatedFollowers: userToFollow.followers,
      updatedFollowing: currentUser.following,
      isFollowing: !isCurrentlyFollowing,
    });
  } catch (error) {
    console.error("Error toggling follow:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const users = await User.find({
      name: { $regex: query, $options: "i" },
    }).select("name profilePicture");

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;

    const user = await User.findById(id)
      .select("-password")
      .populate("followers following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ user: id }).populate(
      "user",
      "name profilePicture"
    );

    const isFollowing = user.followers.some(
      (followerId) => followerId.toString() === currentUserId
    );

    res.status(200).json({ user, posts, isFollowing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.find({ _id: { $ne: currentUserId } });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};
module.exports = {
  updateUserProfile,
  followUser,
  searchUsers,
  getUserProfile,
  getAllUsers,
};
