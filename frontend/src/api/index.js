import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const loginUser = (formData) => API.post("/auth/login", formData);
export const registerUser = (formData) => API.post("/auth/register", formData);

export const getUserProfile = (id) => API.get(`/users/${id}`);

export const createPost = (postData) => API.post("/posts", postData);
export const getPosts = () => API.get("/posts");
