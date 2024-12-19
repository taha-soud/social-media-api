import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <ul>
        <li onClick={() => handleNavigation("/messages")}>
          <i className="fa fa-messages"></i> Messages
        </li>
        <li onClick={() => handleNavigation("/feed")}>
          <i className="fa fa-home"></i> Feed
        </li>
        <li onClick={() => handleNavigation("/friends")}>
          <i className="fa fa-user-friends"></i> Friends
        </li>
        <li onClick={() => handleNavigation("/events")}>
          <i className="fa fa-calendar"></i> Events
        </li>
        <li onClick={() => handleNavigation("/videos")}>
          <i className="fa fa-video"></i> Watch Videos
        </li>
        <li onClick={() => handleNavigation("/photos")}>
          <i className="fa fa-image"></i> Photos
        </li>
        <li onClick={() => handleNavigation("/files")}>
          <i className="fa fa-file-alt"></i> Files
        </li>
        <li onClick={() => handleNavigation("/marketplace")}>
          <i className="fa fa-store"></i> Marketplace
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
