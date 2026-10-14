import axios from "axios";

// Scaffold: wire baseURL / headers when you're ready to talk to the API.
const http = axios.create(
  {
    baseURL: import.meta.env.VITE_API_URL || "",
    headers: { "Content-Type": "application/json" },
  });

export default http;
