import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", "G-Z1QKE3M5CQ", {
        page_path: location.pathname,
      });
    }
  }, [location]);
};

const AppLayout = () => {
  usePageTracking(); // 👈 call the hook
  return (
    <div>
      {/* <ErrorBoundary> */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000, // default duration 4 seconds for all toasts
          style: {
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />
      <Outlet />
      {/* </ErrorBoundary> */}
    </div>
  );
};

export default AppLayout;
