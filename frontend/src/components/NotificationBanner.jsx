import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../../notifications";

const NotificationBanner = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check notification permission status
    const checkPermission = () => {
      if ("Notification" in window) {
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        // Check if user has dismissed the banner and if 24 hours have passed
        const dismissedTimestamp = localStorage.getItem("notificationBannerDismissed");
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        let shouldShow = currentPermission !== "granted";

        if (dismissedTimestamp) {
          const timeSinceDismissal = now - parseInt(dismissedTimestamp);
          // Only hide if dismissed within last 24 hours
          if (timeSinceDismissal < twentyFourHours) {
            shouldShow = false;
          }
        }

        setShowBanner(shouldShow);
      }
    };

    checkPermission();
  }, []);

  const handleTurnOn = async () => {
    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        // Permission granted
        setPermission("granted");
        setShowBanner(false);
      } else {
        // Permission denied or dismissed
        const newPermission = Notification.permission;
        setPermission(newPermission);
        if (newPermission === "denied") {
          // Redirect to settings for instructions
          navigate("/settings");
        }
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    // Store current timestamp in localStorage
    localStorage.setItem("notificationBannerDismissed", Date.now().toString());
    setShowBanner(false);
    // Navigate to settings
    navigate("/settings");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-500">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Icon */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {permission === "denied"
                  ? "Notifications are blocked. Enable them to stay updated!"
                  : "Turn on notifications to get reminders and updates"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {permission === "default" ? (
              <button
                onClick={handleTurnOn}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-lg bg-white text-indigo-600 font-semibold text-sm hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? "Loading..." : "Turn On"}
              </button>
            ) : (
              <button
                onClick={() => navigate("/settings")}
                className="px-4 py-1.5 rounded-lg bg-white text-indigo-600 font-semibold text-sm hover:bg-white/90 transition-all active:scale-95 whitespace-nowrap"
              >
                Enable in Settings
              </button>
            )}

            {/* Dismiss X button */}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-all"
              title="Dismiss"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
