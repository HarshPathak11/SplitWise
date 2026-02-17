import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "./utils/api";
import Cookies from "js-cookie";
import TermsPopup from "./components/TermsPopup";

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

  // Terms Logic
  const [showTerms, setShowTerms] = useState(false);
  const [termsList, setTermsList] = useState([]);

  useEffect(() => {
    const checkTerms = async () => {
      const token = Cookies.get("authToken"); // or whatever your token key is
      const id = Cookies.get("id");

      // Only check if user is logged in
      if (!token || !id) return;

      try {
        const response = await api.get("/terms/check-status");
        if (response.data && response.data.mustSign) {
          setTermsList(response.data.terms);
          setShowTerms(true);
        }
      } catch (error) {
        console.error("Error checking terms status:", error);
      }
    };

    checkTerms();
  }, [useLocation().pathname]); // Re-check on route change if you want, or just once on mount. Pathname ensures it runs if they navigate.

  const handleTermsAccept = async (termId) => {
    try {
      await api.post("/terms/accept", { termId });
      
      // Update local state to mark this term as agreed
      setTermsList(prev => {
        const updatedList = prev.map(t => 
            t._id === termId ? { ...t, hasAgreed: true } : t
        );
        
        // check if all are agreed now
        const allDone = updatedList.every(t => t.hasAgreed);
        if (allDone) {
            setShowTerms(false);
        }
        return updatedList;
      });

    } catch (error) {
      console.error("Error accepting terms:", error);
      // You might want to show an error toast here
    }
  };

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
      <TermsPopup
        isOpen={showTerms}
        terms={termsList}
        onAccept={handleTermsAccept}
      />
    </div>
  );
};

export default AppLayout;
