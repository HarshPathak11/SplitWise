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
import toast from "react-hot-toast";
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

  // --- Limited admin mock actions (frontend-only) ---
  const [auditLogs, setAuditLogs] = useState([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const pushLog = (action, details) => {
    const e = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      details,
      actor: username || "admin",
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((s) => [e, ...s].slice(0, 200));
  };

  const confirmTyped = (message) => {
    const typed = window.prompt(message + "\nType CONFIRM to continue:");
    return typed === "CONFIRM";
  };

  const handleGenerateReport = () => {
    pushLog("GENERATE_REPORT", { scope: "summary" });
    toast.success("Mock report generated (summary)");
  };

  const handleInviteUser = () => {
    const email = window.prompt("Enter user email to invite (mock):");
    if (!email) return;
    pushLog("INVITE_USER", { email });
    toast.success(`Mock invite sent to ${email}`);
  };

  const handleSuspendUser = () => {
    const id = window.prompt("Enter user id to suspend/reinstate (mock):");
    if (!id) return;
    const action = window.prompt("Type SUSPEND or REINSTATE:");
    if (!action) return;
    pushLog("SUSPEND_REINSTATE_USER", { userId: id, action });
    toast.success(`Mock ${action} for ${id}`);
  };

  const handleTargetedBroadcast = () => {
    const msg = window.prompt(
      "Enter message to send to a user segment (mock):"
    );
    if (!msg) return;
    pushLog("BROADCAST_TARGETED", { message: msg });
    toast.success("Mock targeted broadcast queued");
  };

  const handleViewAuditSummary = () => {
    // show a compact summary of recent actions
    const summary = auditLogs
      .slice(0, 10)
      .map((a) => `${a.action} by ${a.actor}`)
      .join("\n");
    window.alert(summary || "No recent admin actions (mock)");
    pushLog("VIEW_AUDIT_SUMMARY", { count: auditLogs.length });
  };

  const handleToggleMaintenance = () => {
    if (!confirmTyped("Toggle maintenance mode (mock)?")) return;
    setMaintenanceMode((m) => !m);
    pushLog("TOGGLE_MAINTENANCE", { newState: !maintenanceMode });
    toast.success(`Mock maintenance mode: ${!maintenanceMode}`);
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
                      View system and financial reports. (Admins can view
                      summaries only)
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
                      Add or suspend users (limited — admin cannot hard-delete
                      or purge PII).
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
                      Configure non-sensitive app settings (Admins cannot change
                      secrets or infra configs).
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
                      Queue targeted notifications (Admins cannot broadcast to
                      all users without SuperAdmin approval).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-800/30 border border-white/8 rounded-2xl p-6">
              <h4 className="font-semibold mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 bg-indigo-600 rounded-lg shadow"
                >
                  Generate Report
                </button>
                <button
                  onClick={handleInviteUser}
                  className="px-4 py-2 bg-green-600 rounded-lg shadow"
                >
                  Invite User
                </button>
                <button
                  onClick={handleViewAuditSummary}
                  className="px-4 py-2 bg-amber-600 rounded-lg shadow"
                >
                  View Audit Summary
                </button>
                <button
                  onClick={handleToggleMaintenance}
                  className="px-4 py-2 bg-red-600 rounded-lg shadow"
                >
                  Toggle Maintenance
                </button>
                <button
                  onClick={handleSuspendUser}
                  className="px-4 py-2 bg-gray-600 rounded-lg shadow"
                >
                  Suspend/Reinstate User
                </button>
                <button
                  onClick={handleTargetedBroadcast}
                  className="px-4 py-2 bg-yellow-600 rounded-lg shadow"
                >
                  Targeted Broadcast
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
