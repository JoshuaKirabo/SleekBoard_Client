import http from "./http.js";

// Each api call is a tiny function here so pages never build URLs themselves.
export const getHealth = () => http.get("/health");
