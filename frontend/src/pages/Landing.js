import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-banner">
        <div className="overlay">
          <div className="landing-content">
            <h1>Welcome to Our Social Media App</h1>
            <p>
              Connect with friends, share your moments, and join the community.
            </p>
            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn btn-outline-light"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
