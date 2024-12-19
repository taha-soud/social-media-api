import React, { useState, useRef } from "react";
import { Button, TextField, IconButton } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import GifBoxIcon from "@mui/icons-material/GifBox";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmojiPicker from "emoji-picker-react";
import "../styles/CreatePost.css";

const CreatePost = ({ addPost }) => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const fileInputRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    setContent(content + emoji.emoji);
    setShowEmojis(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content || selectedImage) {
      const formData = new FormData();
      formData.append("content", content);
      if (selectedImage) {
        formData.append("media", selectedImage);
      }

      await addPost(content, selectedImage);
      setContent("");
      setSelectedImage(null);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        {/* Input Field */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="post-input"
          multiline
          rows={2}
        />

        {/* Display Selected Image Preview */}
        {selectedImage && (
          <div className="image-preview">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              className="preview-img"
            />
          </div>
        )}

        {}
        <div className="actions">
          <div className="media-icons">
            <IconButton onClick={handleGalleryClick}>
              <ImageIcon />
            </IconButton>
            <IconButton>
              <GifBoxIcon />
            </IconButton>
            {/* Emoji Button */}
            <IconButton onClick={() => setShowEmojis(!showEmojis)}>
              <InsertEmoticonIcon />
            </IconButton>
            <IconButton>
              <LocationOnIcon />
            </IconButton>
          </div>
          <Button type="submit" variant="contained" className="post-button">
            Post
          </Button>
        </div>

        {}
        {showEmojis && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiSelect} />
          </div>
        )}

        {}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </form>
    </div>
  );
};

export default CreatePost;
