import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../../notifications";

const Settings = () => {
  const navigate = useNavigate();
  const [permission, setPermission] = useState("default");
  const [browser, setBrowser] = useState("unknown");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Detect browser
    detectBrowser();
  }, []);

  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod/.test(userAgent);

    if (isMobile) {
      setBrowser("mobile");
    } else if (userAgent.includes("firefox")) {
      setBrowser("firefox");
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      setBrowser("safari");
    } else if (userAgent.includes("chrome") || userAgent.includes("edg")) {
      setBrowser("chrome");
    } else {
      setBrowser("unknown");
    }
  };

  const handleEnableNotifications = async () => {
    if (permission === "denied") {
      // Try to open settings on mobile
      if (browser === "mobile") {
        openMobileSettings();
      }
      return;
    }

    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setPermission("granted");
        // Clear the banner dismissal flag
        localStorage.removeItem("notificationBannerDismissed");
      } else {
        setPermission(Notification.permission);
        // If permission was denied, try to open settings on mobile
        if (Notification.permission === "denied" && browser === "mobile") {
          openMobileSettings();
        }
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openMobileSettings = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Try different approaches to open settings
    if (/android/.test(userAgent)) {
      // Android: Try to open app settings
      // Note: This may not work in all browsers due to security restrictions
      const settingsUrl = "app-settings:";
      window.location.href = settingsUrl;
      
      // Fallback: Show instructions after a delay
      setTimeout(() => {
        alert("Please enable notifications in your browser settings:\n1. Open Chrome menu (⋮)\n2. Go to Settings > Site Settings > Notifications\n3. Find this website and enable notifications");
      }, 1000);
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      // iOS: Try to open settings (limited support)
      // iOS doesn't allow direct deep-linking to settings from web
      alert("To enable notifications on iOS:\n1. Open Settings app\n2. Scroll down and tap Safari (or your browser)\n3. Tap Notifications\n4. Enable notifications for this website");
    } else {
      // Generic mobile fallback
      alert("Please enable notifications in your browser settings");
    }
  };

  const getBrowserInstructions = () => {
    switch (browser) {
      case "chrome":
        return (
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
            <li>Click the lock icon (🔒) in the address bar</li>
            <li>Find "Notifications" and change to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
        );
      case "firefox":
        return (
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
            <li>Click the lock icon (🔒) in the address bar</li>
            <li>Click "More Information" → "Permissions"</li>
            <li>Find "Receive Notifications" and uncheck "Use Default"</li>
            <li>Select "Allow"</li>
          </ol>
        );
      case "safari":
        return (
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
            <li>Safari → Settings → Websites → Notifications</li>
            <li>Find this website and change to "Allow"</li>
          </ol>
        );
      case "mobile":
        return (
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
            <li>Open your browser settings</li>
            <li>Find "Site Settings" or "Website Settings"</li>
            <li>Locate this website in the list</li>
            <li>Enable notifications for this site</li>
          </ol>
        );
      default:
        return (
          <p className="text-sm text-zinc-300">
            Please check your browser settings to enable notifications for this site.
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 hover:border-white/10 text-zinc-400 hover:text-white transition-all duration-300 shadow-lg shadow-black/20 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-zinc-500 font-medium">
              Manage your notification preferences
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-zinc-900 via-indigo-600 to-zinc-900 opacity-50"></div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Notification Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <h2 className="text-lg font-bold text-white">Notifications</h2>
              </div>

              {/* Status Card */}
              <div
                className={`p-4 rounded-xl border ${
                  permission === "granted"
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : permission === "denied"
                    ? "bg-rose-500/10 border-rose-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      permission === "granted"
                        ? "bg-emerald-500/20"
                        : permission === "denied"
                        ? "bg-rose-500/20"
                        : "bg-yellow-500/20"
                    }`}
                  >
                    {permission === "granted" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : permission === "denied" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-rose-400"
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        permission === "granted"
                          ? "text-emerald-400"
                          : permission === "denied"
                          ? "text-rose-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {permission === "granted"
                        ? "Notifications Enabled"
                        : permission === "denied"
                        ? "Notifications Blocked"
                        : "Notifications Not Enabled"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {permission === "granted"
                        ? "You'll receive updates and reminders"
                        : permission === "denied"
                        ? "Follow the instructions below to enable"
                        : "Enable notifications to stay updated"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button or Instructions */}
              {permission === "default" && (
                <button
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Requesting Permission..." : "Enable Notifications"}
                </button>
              )}

              {permission === "denied" && browser === "mobile" && (
                <button
                  onClick={handleEnableNotifications}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 transition-all active:scale-[0.98]"
                >
                  Open Settings
                </button>
              )}

              {permission === "denied" && (
                <div className="space-y-4">
                  <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-3">
                      How to Enable Notifications:
                    </h3>
                    {getBrowserInstructions()}
                  </div>
                  <p className="text-xs text-zinc-500 text-center">
                    After enabling, refresh this page to see the updated status
                  </p>
                </div>
              )}

              {permission === "granted" && (
                <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-zinc-400 text-center">
                    ✓ You're all set! You'll receive notifications for reminders and updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
