import axios from "axios";

const axiosInstance = axios.create({
  // Temporary hardcode to bypass Vercel env injection issues
  baseURL: "https://digital-menu-backend-y0dj.onrender.com",
  withCredentials: true,
});

export default axiosInstance;
