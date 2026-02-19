// src/utils/authFetch.js
import Cookies from "js-cookie";

export async function authFetch(url, options = {}) {
  const token = Cookies.get("authToken"); // read JWT
  const id = Cookies.get("id");

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "", // attach JWT
    id: id,
  };

  // Only add Content-Type: application/json if it's not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });

  return response; // you can also auto-parse JSON if you want
}