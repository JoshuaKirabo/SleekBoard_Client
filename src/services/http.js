import axios from "axios";

// One axios instance for the whole app so the base URL and headers live in one place.
const http = axios.create(
  {
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

// Unwrapping the body and pulling the server's message out so callers just get data or a plain Error.
http.interceptors.response.use(
  (response) => response.data,
  (error) =>
    {
      const message = error.response?.data?.message || error.message || "Request failed";
      return Promise.reject(new Error(message));
    });

export default http;
