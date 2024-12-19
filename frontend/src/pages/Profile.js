import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Post from "../components/Post";
import "../styles/Profile.css";

const ProfileEditModal = ({
  isOpen,
  onClose,
  profileData,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profileData?.user?.name || "");
  const [bio, setBio] = useState(profileData?.user?.bio || "");
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    if (name !== profileData.user.name) formData.append("name", name);
    if (bio !== profileData.user.bio) formData.append("bio", bio);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/users/${profileData.user._id}/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onUpdateProfile(data);
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setName(profileData?.user?.name || "");
      setBio(profileData?.user?.bio || "");
      setProfilePicture(null);
      setError("");
    }
  }, [isOpen, profileData]);

  if (!isOpen) return null;

  return (
    <div className="profile-edit-modal-overlay">
      <div className="profile-edit-modal">
        <h2>Edit Profile</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="modal-profile-pic-upload">
            <img
              src={
                profilePicture
                  ? URL.createObjectURL(profilePicture)
                  : profileData.user?.profilePicture || "/defaultProfile.png"
              }
              alt="Profile"
              className="modal-profile-avatar"
            />
            <label className="profile-pic-upload-btn">
              Change Photo
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => setProfilePicture(e.target.files[0])}
              />
            </label>
          </div>

          <div className="modal-form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const { data } = await axios.get(
          `http://localhost:5000/api/users/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfileData(data);

        setIsFollowing(data.isFollowing);
        setIsCurrentUser(
          data.user._id === JSON.parse(atob(token.split(".")[1])).userId
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.put(
        `http://localhost:5000/api/users/${id}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsFollowing(data.isFollowing);

      setProfileData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          followers: data.updatedFollowers,
        },
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const renderProfileContent = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!profileData) return <p>Profile not found.</p>;

    return (
      <div className="profile">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <img
              src={profileData.user?.profilePicture || "/defaultProfile.png"}
              alt={profileData.user?.name}
              className="profile-avatar"
            />
          </div>
          <div className="profile-details">
            <h2>{profileData.user?.name}</h2>
            <p>@{profileData.user?.username}</p>
            {isCurrentUser ? (
              <button
                className="edit-profile-btn"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </button>
            ) : (
              <button
                className={`follow-btn ${isFollowing ? "following" : ""}`}
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="profile-bio">
          <p>{profileData.user?.bio || "No bio available"}</p>
        </div>

        <div className="profile-posts">
          <h3>Posts</h3>
          <div className="posts-grid">
            {profileData.posts.length > 0 ? (
              profileData.posts.map((post) => (
                <Post key={post._id} post={post} />
              ))
            ) : (
              <p>No posts to show.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-container">
      {renderProfileContent()}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        onUpdateProfile={(updatedProfile) =>
          setProfileData((prev) => ({
            ...prev,
            user: { ...prev.user, ...updatedProfile },
          }))
        }
      />
    </div>
  );
};
export default Profile;
