import { useEffect, useState } from "react";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";

const SuperAdminDash = () => {
  const [username, setUsername] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let stateUser =
      (location && location.state && location.state.username) || "";
    if (!stateUser) {
      try {
        const stored = Cookies.get("superAdminUser");
        if (stored) stateUser = stored;
      } catch (e) {}
    }

    if (!stateUser) navigate("/super-admin-login");
    else setUsername(stateUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    try {
      Cookies.remove("superAdminUser");
    } catch (e) {}
    navigate("/super-admin-login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button to landing page */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/login")}
            className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
            aria-label="Back to landing page"
          >
            <FaArrowLeft className="text-white text-xl" />
          </button>
        </div>
        <Header title="Super Admin Dashboard" />

        <main className="mt-6">
          <section>
            <div className="flex items-center justify-between mb-6 ">
              <h2 className="text-2xl font-semibold">
                Super Admin — {username || "User"}
              </h2>
              <div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/5 rounded-lg flex items-center gap-2"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-800/40 border border-white/10 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600/30 rounded-lg">
                  <FaShieldAlt className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Critical Controls</h3>
                  <p className="text-sm text-gray-300">
                    Access system-critical settings and emergency controls.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDash;
