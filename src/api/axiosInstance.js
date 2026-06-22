import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://digital-menu-backend-y0dj.onrender.com/", 
  withCredentials: true,
});

export default axiosInstance;
