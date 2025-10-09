import { useEffect, useState } from "react";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaFileAlt,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaArrowLeft,
} from "react-icons/fa";
import Cookies from "js-cookie";

const AdminDash = () => {
  const [username, setUsername] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // read username passed from login page
    let stateUser =
      (location && location.state && location.state.username) || "";
    if (!stateUser) {
      // try cookie
      try {
        const stored = Cookies.get("adminUser");
        if (stored) stateUser = stored;
      } catch (e) {
        // ignore
      }
    }

    if (!stateUser) {
      // if still no username in state, redirect to admin login
      navigate("/admin-login");
    } else {
      setUsername(stateUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    try {
      Cookies.remove("adminUser");
    } catch (e) {
      // ignore
    }
    navigate("/admin-login");
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

        <Header title="Admin Dashboard" />

        <main className="mt-6">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Welcome, {username || "Admin"}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  title="Sign Out"
                >
                  <FaSignOutAlt />
                  Sign Out
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-gray-800/40 border border-white/10 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600/30 rounded-lg">
                    <FaFileAlt className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">View Reports</h3>
                    <p className="text-sm text-gray-300">
                      View system and financial reports.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gray-800/40 border border-white/10 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/30 rounded-lg">
                    <FaUsers className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manage Users</h3>
                    <p className="text-sm text-gray-300">
                      Add, remove or suspend user accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gray-800/40 border border-white/10 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/30 rounded-lg">
                    <FaCog className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">System Settings</h3>
                    <p className="text-sm text-gray-300">
                      Configure app-wide settings and policies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gray-800/40 border border-white/10 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-pink-500/30 rounded-lg">
                    <FaBell className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Notifications</h3>
                    <p className="text-sm text-gray-300">
                      View and broadcast system-wide notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-800/30 border border-white/8 rounded-2xl p-6">
              <h4 className="font-semibold mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-indigo-600 rounded-lg shadow">
                  Generate Report
                </button>
                <button className="px-4 py-2 bg-green-600 rounded-lg shadow">
                  Invite Admin
                </button>
                <button className="px-4 py-2 bg-amber-600 rounded-lg shadow">
                  System Audit
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDash;
