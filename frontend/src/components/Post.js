import React, { useState, useEffect } from "react";
import "../styles/Post.css";
import {
  Avatar,
  IconButton,
  TextField,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Post = ({ post, onDelete }) => {
  const userId = localStorage.getItem("userId");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [commentAnchorEls, setCommentAnchorEls] = useState({});
  const [openDeleteCommentDialog, setOpenDeleteCommentDialog] = useState(null);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [shareOption, setShareOption] = useState("feed");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const likedPost = localStorage.getItem(`likedPost-${post._id}`);
    setLiked(likedPost === "true");
    setLikesCount(post.likes?.length || 0);
  }, [post]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim()) {
        try {
          const { data } = await axios.get(
            `http://localhost:5000/api/users/search?query=${searchQuery}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setUsersList(data);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      } else {
        setUsersList([]);
      }
    };

    fetchUsers();
  }, [searchQuery]);

  const handleLike = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        const newLiked = !liked;
        setLiked(newLiked);
        setLikesCount(newLiked ? likesCount + 1 : likesCount - 1);
        localStorage.setItem(`likedPost-${post._id}`, newLiked.toString());
      }
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleAddComment = async () => {
    if (comment.trim() === "") return;

    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text: comment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments(data.comments);
      setComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/posts/${post._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.status === 200) {
        onDelete(post._id);
        setOpenDeleteDialog(false);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleCommentMenuOpen = (event, commentId) => {
    setCommentAnchorEls((prev) => ({
      ...prev,
      [commentId]: event.currentTarget,
    }));
  };

  const handleCommentMenuClose = (commentId) => {
    setCommentAnchorEls((prev) => ({
      ...prev,
      [commentId]: null,
    }));
  };

  const handleOpenDeleteCommentDialog = (commentId) => {
    setOpenDeleteCommentDialog(commentId);
    handleCommentMenuClose(commentId);
  };

  const handleCloseDeleteCommentDialog = () => {
    setOpenDeleteCommentDialog(null);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/posts/${post._id}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments(data.comments);
      setOpenDeleteCommentDialog(null);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const navigateToProfile = () => {
    if (post.user && post.user._id) {
      navigate(`/profile/${post.user._id}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShareOpen = () => {
    setOpenShareModal(true);
  };

  const handleShareClose = () => {
    setOpenShareModal(false);
    setMessage("");
    setSearchQuery("");
    setUsersList([]);
    setSelectedUser(null);
  };

  const handleSharePost = async () => {
    console.log(
      `Sending request to: http://localhost:5000/api/posts/${post._id}/share`
    );

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/share`,
        {
          shareOption,
          message,
          recipientId: selectedUser ? selectedUser._id : null,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(response.data.message);
      setOpenShareModal(false);
    } catch (error) {
      console.error("Failed to share post:", error);
    }
  };

  return (
    <div className="post-container">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-header-left">
          <Avatar
            src={post.user?.profilePicture || "/defaultProfile.png"}
            alt={post.user?.name || "User"}
            onClick={navigateToProfile}
            className="post-avatar"
          />
          <div className="post-user-info">
            <h4 onClick={navigateToProfile} className="post-username">
              {post.user?.name || "Unknown User"}
            </h4>
            <span className="post-timestamp">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        {post.user?._id === userId && (
          <>
            <IconButton onClick={handleMenuOpen} className="post-more-btn">
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleOpenDeleteDialog}>Delete Post</MenuItem>
            </Menu>
          </>
        )}
      </div>

      {/* Post Content */}
      <div className="post-content">
        <div className="post-text scrollable-post-text">
          <p>{post.content}</p>
        </div>
        {post.media && (
          <img src={post.media} alt="Post media" className="post-media" />
        )}
      </div>

      {/* Post Interactions */}
      <div className="post-interactions">
        <Tooltip title={liked ? "Unlike" : "Like"}>
          <div
            className={`interaction-button ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <LikeIcon className="interaction-icon" />
            <span>{likesCount}</span>
          </div>
        </Tooltip>

        <Tooltip title="Comments">
          <div
            className="interaction-button"
            onClick={() => setShowCommentInput(!showCommentInput)}
          >
            <CommentIcon className="interaction-icon" />
            <span>{comments.length}</span>
          </div>
        </Tooltip>

        <Tooltip title="Share">
          <div className="interaction-button" onClick={handleShareOpen}>
            <ShareIcon className="interaction-icon" />
            <span>Share</span>
          </div>
        </Tooltip>
      </div>

      {/* Post Comments Section */}
      <div
        className={`post-comments-section ${showCommentInput ? "show" : ""}`}
      >
        {showCommentInput && (
          <>
            <div
              className={`comments-list ${
                comments.length > 3 ? "scrollable-comments" : ""
              }`}
            >
              {comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <Avatar
                    src={comment.user?.profilePicture || "/defaultProfile.png"}
                    alt={comment.user?.name}
                    className="comment-avatar"
                  />
                  <div className="comment-details">
                    <div className="comment-header">
                      <span className="comment-username">
                        {comment.user?.name || "Unknown User"}
                      </span>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                      {comment.user?._id === userId && (
                        <>
                          <IconButton
                            onClick={(event) =>
                              handleCommentMenuOpen(event, comment._id)
                            }
                            className="comment-more-btn"
                          >
                            <MoreIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={commentAnchorEls[comment._id]}
                            open={Boolean(commentAnchorEls[comment._id])}
                            onClose={() => handleCommentMenuClose(comment._id)}
                          >
                            <MenuItem
                              onClick={() =>
                                handleOpenDeleteCommentDialog(comment._id)
                              }
                            >
                              Delete Comment
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="comment-input-container">
              <TextField
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                fullWidth
                multiline
                minRows={2}
                size="small"
                InputProps={{
                  style: {
                    color: "white",
                    border: "1px solid white",
                    backgroundColor: "#2c3e50",
                    borderRadius: "8px",
                  },
                }}
                InputLabelProps={{
                  style: {
                    color: "white",
                  },
                }}
                className="comment-input"
              />

              <Button
                onClick={handleAddComment}
                variant="contained"
                color="primary"
                size="small"
                className="comment-submit-btn"
              >
                Comment
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Share Post Modal */}
      <Dialog open={openShareModal} onClose={handleShareClose}>
        <DialogTitle>Share Post</DialogTitle>
        <DialogContent>
          <div>
            <label>
              <input
                type="radio"
                value="feed"
                checked={shareOption === "feed"}
                onChange={() => setShareOption("feed")}
              />
              Share to my feed
            </label>
            <label>
              <input
                type="radio"
                value="message"
                checked={shareOption === "message"}
                onChange={() => setShareOption("message")}
              />
              Share via direct message
            </label>
            {shareOption === "message" && (
              <div>
                <TextField
                  label="Search User"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                />
                <div>
                  {usersList.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      style={{
                        cursor: "pointer",
                        background:
                          selectedUser?._id === user._id ? "#e0e0e0" : "",
                      }}
                    >
                      <Avatar src={user.profilePicture} />
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
                <TextField
                  label="Add a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  fullWidth
                />
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareClose}>Cancel</Button>
          <Button onClick={handleSharePost}>Share</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Post Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeletePost}
            color="secondary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Comment Confirmation Dialog */}
      <Dialog
        open={openDeleteCommentDialog !== null}
        onClose={handleCloseDeleteCommentDialog}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDeleteCommentDialog}>Cancel</Button>
          <Button
            onClick={() => handleDeleteComment(openDeleteCommentDialog)}
            color="secondary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Post;
