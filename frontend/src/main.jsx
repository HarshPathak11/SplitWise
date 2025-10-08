import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import router from './App.jsx'
import './index.css'
import { RouterProvider } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>,
)

// main.jsx
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then((reg) => {
            console.log("✅ Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.error("❌ Service Worker registration failed:", err);
          });
      } else {
        console.log("ℹ️ Service Worker already active:", registration.scope);
      }
    });
  });
}


