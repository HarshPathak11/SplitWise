// src/api/client.js
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Allow cookies
});

// request interceptor → attach JWT
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("authToken");
    const id = Cookies.get("id");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.id = String(id);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// optional: response interceptor → handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove("authToken");
      Cookies.remove("id");
      toast.error("Session expired. Please log in again.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
