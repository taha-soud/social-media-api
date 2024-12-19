import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircle from "@mui/icons-material/AccountCircle";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="static" className="navbar">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/home"
          className="navbar-title"
        >
          Social Media App
        </Typography>
        {token ? (
          <div className="navbar-actions">
            <IconButton color="inherit" onClick={() => navigate("/home")}>
              <HomeIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate("/profile")}>
              <AccountCircle />
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
