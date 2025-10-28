import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // update port if needed
});

// ✅ Automatically attach token if user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
