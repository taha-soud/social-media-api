import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import "../styles/Home.css";
import Rightbar from "../components/Rightbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/posts", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleSearch = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/users/search?query=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const addPost = async (content, media) => {
    try {
      const formData = new FormData();
      if (content) formData.append("content", content);
      if (media) formData.append("media", media);

      const { data } = await axios.post(
        "http://localhost:5000/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPosts([data, ...posts]);
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div className="home">
      <Topbar />
      <div className="home-container">
        <Sidebar />
        <div className="feed">
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className="search-result"
                >
                  <img
                    src={user.profilePicture || "/defaultProfile.png"}
                    alt={user.name}
                  />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          )}

          <CreatePost addPost={addPost} />
          {posts.length > 0 ? (
            posts.map((post) => (
              <Post key={post._id} post={post} onDelete={handleDeletePost} />
            ))
          ) : (
            <p>No posts to show.</p>
          )}
        </div>
        <Rightbar />
      </div>
    </div>
  );
};

export default Home;
