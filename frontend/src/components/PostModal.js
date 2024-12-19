import React, { useState, useEffect } from "react";
import axios from "axios";

const PostModal = ({ open, post, onClose }) => {
  const userId = localStorage.getItem("userId");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  useEffect(() => {
    if (post) {
      const likedPost = localStorage.getItem(`likedPost-${post._id}`);
      setLiked(likedPost === "true");
      setLikesCount(post.likes?.length || 0);
      setComments(post.comments || []);
    }
  }, [post]);

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
    if (commentText.trim() === "") return;

    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments(data.comments);
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (!post) return null;

  return (
    <div className={`post-modal ${open ? "open" : ""}`}>
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={onClose}>Close</button>
        </div>

        <div className="modal-body">
          {/* Post Header */}
          <div className="post-header">
            <img
              src={post.user?.profilePicture || "/defaultProfile.png"}
              alt={post.user?.name}
            />
            <div className="post-info">
              <span>{post.user?.name}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Post Content */}
          <div className="post-content">
            <p>{post.content}</p>
            {post.media && <img src={post.media} alt="Post media" />}
          </div>

          {/* Post Interactions */}
          <div className="post-interactions">
            <button onClick={handleLike}>
              {liked ? "Unlike" : "Like"} ({likesCount})
            </button>
            <button onClick={() => setShowCommentInput(!showCommentInput)}>
              Comment
            </button>
          </div>

          {/* Comment Section */}
          {showCommentInput && (
            <div className="comment-section">
              {comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <p>{comment.text}</p>
                </div>
              ))}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment"
              />
              <button onClick={handleAddComment}>Post Comment</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostModal;
