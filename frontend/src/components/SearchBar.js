// src/components/SearchBar.js
import React, { useState } from "react";
import axios from "axios";

const SearchBar = ({ onUserSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/users/search?query=${query}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {results.length > 0 && (
        <ul>
          {results.map((user) => (
            <li key={user._id} onClick={() => onUserSelect(user)}>
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
