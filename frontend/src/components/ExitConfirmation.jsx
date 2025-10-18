import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ExitConfirmation = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = (event) => {
      // Only intercept if user is on dashboard or landing
      if (location.pathname === "/dash" || location.pathname === "/") {
        event.preventDefault();
        setShowConfirm(true);
        // Push same route back to prevent browser from closing immediately
        navigate(location.pathname, { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location, navigate]);

  const handleConfirmExit = () => {
    setShowConfirm(false);
    window.close(); // works if PWA / standalone
  };

  const handleCancelExit = () => {
    setShowConfirm(false);
  };

  if (!showConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-80 text-center shadow-lg">
        <p className="text-lg mb-4">Do you want to exit FairFare?</p>
        <div className="flex justify-around">
          <button
            onClick={handleConfirmExit}
            className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
          >
            Yes
          </button>
          <button
            onClick={handleCancelExit}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmation;
