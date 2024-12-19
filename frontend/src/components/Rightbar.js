// src/components/Rightbar.js
import React from "react";
import "../styles/Rightbar.css";

const Rightbar = () => {
  return (
    <div className="rightbar">
      <div className="stories">
        <h5>Stories</h5>
        <ul>
          <li>Create Your Story</li>
          <li>Story 1</li>
          <li>Story 2</li>
          {/* Add other stories */}
        </ul>
      </div>
      <div className="events">
        <h5>Events</h5>
        <ul>
          <li>Event 1</li>
          <li>Event 2</li>
        </ul>
      </div>
      <div className="suggested-pages">
        <h5>Suggested Pages</h5>
        <ul>
          <li>Page 1</li>
          <li>Page 2</li>
        </ul>
      </div>
    </div>
  );
};

export default Rightbar;
