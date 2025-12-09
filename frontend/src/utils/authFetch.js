// src/utils/authFetch.js
import Cookies from "js-cookie";

export async function authFetch(url, options = {}) {
  const token = Cookies.get("authToken"); // read JWT

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "", // attach JWT
  };

  const response = await fetch(url, { ...options, headers });

  return response; // you can also auto-parse JSON if you want
}
