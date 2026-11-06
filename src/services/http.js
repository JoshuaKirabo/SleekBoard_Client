import axios from "axios";

// Every call to the server. withCredentials sends the session cookie along: the API sits on another port, and the
// browser leaves cookies off cross-origin requests unless asked. VITE_API_URL has to use the same host the board is
// on (localhost, not 127.0.0.1), or the browser treats them as different sites and the cookie never goes.
const http = axios.create(
  {
    baseURL: import.meta.env.VITE_API_URL || "",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

// A 401 from anything but sign-in itself means the session ran out mid-use, so it's back to the login screen.
// SignedIn handles the first check on its own.
http.interceptors.response.use(undefined, (error) =>
  {
    const signInCall = String(error.config?.url || "").startsWith("/auth/");
    if(error.response?.status === 401 && !signInCall) window.location.assign("/login");
    return Promise.reject(error);
  });

export default http;
