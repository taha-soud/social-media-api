import React from "react";
import { Link } from "react-router-dom";
import "../styles/Topbar.css";

const Topbar = () => {
  const userId = localStorage.getItem("userId");

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2>App Name</h2>
      </div>
      <div className="topbar-right">
        {/* Navigate to the logged-in user's profile */}
        <Link to={`/profile/${userId}`} className="profile-link">
          My Profile
        </Link>
      </div>
    </div>
  );
};

export default Topbar;
