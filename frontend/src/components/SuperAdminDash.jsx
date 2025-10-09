import { useEffect, useState } from "react";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaSignOutAlt,
  FaArrowLeft,
} from "react-icons/fa";
import toast from "react-hot-toast";
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

  // --- frontend-only super-admin actions (hard-coded, no backend) ---
  const [auditLogs, setAuditLogs] = useState([]);

  const pushLog = (action, details) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actor: username || "superadmin",
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((s) => [entry, ...s]);
  };

  const confirmTyped = (message) => {
    const typed = window.prompt(message + "\nType CONFIRM to continue:");
    return typed === "CONFIRM";
  };

  const handleMockDeleteUser = () => {
    const id = window.prompt("Enter user id to DELETE (mock):");
    if (!id) return;
    if (!confirmTyped(`About to DELETE user ${id} (mock)`)) return;
    pushLog("DELETE_USER", { userId: id });
    toast.success(`deleted user ${id}`);
  };

  const handleMockPurgeUserData = () => {
    const id = window.prompt("Enter user id to PURGE data (mock):");
    if (!id) return;
    if (!confirmTyped(`About to PURGE data for ${id} (mock)`)) return;
    pushLog("PURGE_USER_DATA", { userId: id });
    toast.success(`purged data for ${id}`);
  };

  const handleMockBroadcast = () => {
    const msg = window.prompt("Enter broadcast message (mock):");
    if (!msg) return;
    pushLog("BROADCAST", { message: msg });
    toast.success(`broadcast queued`);
  };

  const handleMockCreatePromo = () => {
    const code = window.prompt("Promo code (mock):");
    const amount = window.prompt("Promo value (mock):");
    if (!code) return;
    pushLog("CREATE_PROMO", { code, amount });
    toast.success(`promo ${code} created`);
  };

  const handleMockRunCategorizer = () => {
    if (!confirmTyped("Trigger mock categorize/run worker?")) return;
    pushLog("RUN_CATEGORIZER", { note: "manual trigger (mock)" });
    toast.success("categorizer triggered");
  };

  const handleMockExportData = () => {
    pushLog("EXPORT_DATA", { scope: "all-users (mock)" });
    toast.success("export prepared");
  };

  const handleMockRotateKeys = () => {
    if (!confirmTyped("Rotate mock service keys?")) return;
    pushLog("ROTATE_KEYS", { service: "firebase/mock" });
    toast.success("keys rotated");
  };

  // Additional mock handlers for the full requested list
  const handleMockCreateUser = () => {
    const uname = window.prompt("Enter new user username (mock):");
    if (!uname) return;
    pushLog("CREATE_USER", { username: uname });
    toast.success(`user ${uname} created`);
  };

  const handleMockChangeRoleSuperAdmin = () => {
    const id = window.prompt("Enter user id to toggle SuperAdmin role (mock):");
    if (!id) return;
    pushLog("TOGGLE_SUPERADMIN_ROLE", { userId: id });
    toast.success(`toggled super-admin role for ${id}`);
  };

  const handleMockImpersonate = () => {
    const id = window.prompt("Enter user id to impersonate (mock):");
    if (!id) return;
    pushLog("IMPERSONATE_USER", { userId: id });
    toast.success(`impersonation started for ${id}`);
  };

  const handleMockResetAuth = () => {
    const id = window.prompt("Enter user id to reset auth (mock):");
    if (!id) return;
    pushLog("RESET_AUTH", { userId: id });
    toast.success(`reset auth for ${id}`);
  };

  const handleMockAdjustBalance = () => {
    const id = window.prompt("Enter user id to adjust balance (mock):");
    if (!id) return;
    const amt = window.prompt(
      "Amount (positive to credit, negative to debit):"
    );
    if (!amt) return;
    pushLog("ADJUST_BALANCE", { userId: id, amount: amt });
    toast.success(`adjusted balance for ${id}`);
  };

  const handleMockSuspendReinstate = () => {
    const id = window.prompt("Enter user id to suspend/reinstate (mock):");
    if (!id) return;
    const action = window.prompt("Type SUSPEND or REINSTATE:");
    if (!action) return;
    pushLog("SUSPEND_REINSTATE", { userId: id, action });
    toast.success(`${action} for ${id}`);
  };

  const handleMockDeleteGroup = () => {
    const id = window.prompt("Enter group/trip id to DELETE (mock):");
    if (!id) return;
    if (!confirmTyped(`About to DELETE group ${id} (mock)`)) return;
    pushLog("DELETE_GROUP", { groupId: id });
    toast.success(`deleted group ${id}`);
  };

  const handleMockReassignGroupOwner = () => {
    const gid = window.prompt("Enter group id (mock):");
    if (!gid) return;
    const newOwner = window.prompt("Enter new owner user id (mock):");
    if (!newOwner) return;
    pushLog("REASSIGN_GROUP_OWNER", { groupId: gid, newOwner });
    toast.success(`reassigned owner for ${gid}`);
  };

  const handleMockForceSettleGroup = () => {
    const gid = window.prompt("Enter group id to force-settle (mock):");
    if (!gid) return;
    pushLog("FORCE_SETTLE_GROUP", { groupId: gid });
    toast.success(`force-settled group ${gid}`);
  };

  const handleMockEditExpense = () => {
    const id = window.prompt("Enter expense id to EDIT (mock):");
    if (!id) return;
    const note = window.prompt("Edit note (mock):");
    pushLog("EDIT_EXPENSE", { expenseId: id, note });
    toast.success(`edited expense ${id}`);
  };

  const handleMockDeleteExpense = () => {
    const id = window.prompt("Enter expense id to DELETE (mock):");
    if (!id) return;
    if (!confirmTyped(`About to DELETE expense ${id} (mock)`)) return;
    pushLog("DELETE_EXPENSE", { expenseId: id });
    toast.success(`deleted expense ${id}`);
  };

  const handleMockRecalcLedgers = () => {
    if (!confirmTyped("Recalculate global ledgers (mock)?")) return;
    pushLog("RECALC_LEDGERS", { note: "manual mock recalculation" });
    toast.success("ledger recalculation started");
  };

  const handleMockRunReversal = () => {
    const id = window.prompt(
      "Enter transaction id to reverse/chargeback (mock):"
    );
    if (!id) return;
    pushLog("RUN_REVERSAL", { txId: id });
    toast.success(`reversal initiated for ${id}`);
  };

  const handleMockModifyBilling = () => {
    const note = window.prompt("Describe billing change (mock):");
    if (!note) return;
    pushLog("MODIFY_BILLING", { note });
    toast.success("billing updated");
  };

  const handleMockCreditPromoBalance = () => {
    const id = window.prompt("Enter user id to credit promo balance (mock):");
    if (!id) return;
    const amt = window.prompt("Amount to credit (mock):");
    if (!amt) return;
    pushLog("CREDIT_PROMO_BALANCE", { userId: id, amount: amt });
    toast.success(`credited promo for ${id}`);
  };

  const handleMockRevokePromo = () => {
    const code = window.prompt("Enter promo code to revoke (mock):");
    if (!code) return;
    pushLog("REVOKE_PROMO", { code });
    toast.success(`revoked promo ${code}`);
  };

  const handleMockRunMigrations = () => {
    if (!confirmTyped("Run DB migrations in production (mock)?")) return;
    pushLog("RUN_MIGRATIONS", { note: "mock" });
    toast.success("migrations executed");
  };

  const handleMockViewModifyEnv = () => {
    const key = window.prompt("Enter env var to view/modify (mock):");
    if (!key) return;
    const val = window.prompt(
      `New value for ${key} (leave empty to only view) (mock):`
    );
    pushLog("VIEW_MODIFY_ENV", { key, value: val });
    toast.success(`env var ${key} updated`);
  };

  const handleMockBackupRestore = () => {
    const action = window.prompt("Type BACKUP or RESTORE (mock):");
    if (!action) return;
    pushLog("BACKUP_RESTORE", { action });
    toast.success(`${action} requested`);
  };

  const handleMockCreateDeleteAdmin = () => {
    const action = window.prompt("Type CREATE or DELETE admin (mock):");
    const id = window.prompt("Admin user id (mock):");
    if (!action || !id) return;
    pushLog("CREATE_DELETE_ADMIN", { action, userId: id });
    toast.success(`${action} admin ${id}`);
  };

  const handleMockGrantRevokeApiKey = () => {
    const action = window.prompt("Type GRANT or REVOKE API key (mock):");
    const who = window.prompt("Target service or user (mock):");
    if (!action || !who) return;
    pushLog("GRANT_REVOKE_API_KEY", { action, target: who });
    toast.success(`${action} for ${who}`);
  };

  const handleMockModifyMLConfig = () => {
    const note = window.prompt("Describe ML config change (mock):");
    if (!note) return;
    pushLog("MODIFY_ML_CONFIG", { note });
    toast.success("ML config changed");
  };

  const handleMockViewRawLogs = () => {
    // This just opens the current mock audit log in a new window as JSON
    const w = window.open();
    w.document.body.innerText = JSON.stringify(auditLogs, null, 2);
    pushLog("VIEW_RAW_LOGS", { count: auditLogs.length });
  };

  const handleMockGenerateAnalytics = () => {
    pushLog("GENERATE_ANALYTICS", { scope: "system (mock)" });
    toast.success("analytics generated");
  };

  const handleMockDisableSecurityChecks = () => {
    if (!confirmTyped("Disable security checks (mock)?")) return;
    pushLog("DISABLE_SECURITY_CHECKS", { note: "mock" });
    toast.success("security checks disabled");
  };

  const handleMockCreateBackdoor = () => {
    if (!confirmTyped("Create emergency backdoor (mock)?")) return;
    pushLog("CREATE_BACKDOOR", { note: "mock" });
    toast.success("backdoor created");
  };

  const handleMockApproveHighSensitivity = () => {
    const note = window.prompt("Describe high-sensitivity approval (mock):");
    if (!note) return;
    pushLog("APPROVE_HIGH_SENSITIVITY", { note });
    toast.success("high-sensitivity action approved");
  };

  const handleMockApproveRefund = () => {
    const id = window.prompt("Enter refund id or user id (mock):");
    if (!id) return;
    pushLog("APPROVE_REFUND", { id });
    toast.success("refund approved");
  };

  const handleMockSignOffRetention = () => {
    const note = window.prompt("Describe retention/deletion sign-off (mock):");
    if (!note) return;
    pushLog("SIGNOFF_RETENTION", { note });
    toast.success("sign-off recorded");
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
              {/* Hard-coded Super Admin Controls (frontend-only mock) */}
              <div className="mt-6 space-y-6">
                {/* User & Account Management */}
                <div>
                  <h4 className="font-semibold">User & Account management</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Critical user-level operations (create/delete users, roles,
                    impersonation, auth reset, balance adjustments,
                    suspend/reinstate)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockCreateUser}
                      className="px-3 py-2 bg-indigo-600 rounded"
                    >
                      Create User
                    </button>
                    <button
                      onClick={handleMockDeleteUser}
                      className="px-3 py-2 bg-red-700 rounded"
                    >
                      Delete User
                    </button>
                    <button
                      onClick={handleMockPurgeUserData}
                      className="px-3 py-2 bg-red-600 rounded"
                    >
                      Purge User Data
                    </button>
                    <button
                      onClick={handleMockChangeRoleSuperAdmin}
                      className="px-3 py-2 bg-yellow-700 rounded"
                    >
                      Toggle SuperAdmin Role
                    </button>
                    <button
                      onClick={handleMockImpersonate}
                      className="px-3 py-2 bg-gray-700 rounded"
                    >
                      Impersonate User
                    </button>
                    <button
                      onClick={handleMockResetAuth}
                      className="px-3 py-2 bg-pink-600 rounded"
                    >
                      Reset Auth
                    </button>
                    <button
                      onClick={handleMockAdjustBalance}
                      className="px-3 py-2 bg-green-700 rounded"
                    >
                      Adjust Balance
                    </button>
                    <button
                      onClick={handleMockSuspendReinstate}
                      className="px-3 py-2 bg-orange-600 rounded"
                    >
                      Suspend/Reinstate
                    </button>
                  </div>
                </div>

                {/* Groups / Trips / Collections */}
                <div>
                  <h4 className="font-semibold">
                    Groups / Trips / Collections
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Group-level destructive or override capabilities (delete
                    group, reassign ownership, force settle)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockDeleteGroup}
                      className="px-3 py-2 bg-red-700 rounded"
                    >
                      Delete Group
                    </button>
                    <button
                      onClick={handleMockReassignGroupOwner}
                      className="px-3 py-2 bg-indigo-600 rounded"
                    >
                      Reassign Group Owner
                    </button>
                    <button
                      onClick={handleMockForceSettleGroup}
                      className="px-3 py-2 bg-yellow-700 rounded"
                    >
                      Force-Settle Group
                    </button>
                  </div>
                </div>

                {/* Expenses & Transactions */}
                <div>
                  <h4 className="font-semibold">Expenses & Transactions</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Financial record edits, reversals and global ledger
                    operations
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockEditExpense}
                      className="px-3 py-2 bg-blue-600 rounded"
                    >
                      Edit 
                    </button>
                    <button
                      onClick={handleMockDeleteExpense}
                      className="px-3 py-2 bg-red-700 rounded"
                    >
                      Delete 
                    </button>
                    <button
                      onClick={handleMockRecalcLedgers}
                      className="px-3 py-2 bg-gray-700 rounded"
                    >
                      Recalc 
                    </button>
                    <button
                      onClick={handleMockRunReversal}
                      className="px-3 py-2 bg-pink-600 rounded"
                    >
                      Run 
                    </button>
                  </div>
                </div>

                {/* Promotions, Coupons & Billing */}
                <div>
                  <h4 className="font-semibold">
                    Promotions, Coupons & Billing
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Controls for promo codes, billing configuration and promo
                    balances
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockCreatePromo}
                      className="px-3 py-2 bg-green-700 rounded"
                    >
                      Create 
                    </button>
                    <button
                      onClick={handleMockRevokePromo}
                      className="px-3 py-2 bg-red-700 rounded"
                    >
                      Revoke 
                    </button>
                    <button
                      onClick={handleMockCreditPromoBalance}
                      className="px-3 py-2 bg-yellow-700 rounded"
                    >
                      Credit Promo 
                    </button>
                    <button
                      onClick={handleMockModifyBilling}
                      className="px-3 py-2 bg-gray-700 rounded"
                    >
                      Modify 
                    </button>
                  </div>
                </div>

                {/* Notifications & Messaging */}
                <div>
                  <h4 className="font-semibold">Notifications & Messaging</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Broadcasts, push key management and global messages
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockBroadcast}
                      className="px-3 py-2 bg-yellow-600 rounded"
                    >
                      Broadcast
                    </button>
                    <button
                      onClick={() => {
                        pushLog("ROTATE_FCM_KEYS", {});
                        toast.success("rotated FCM keys");
                      }}
                      className="px-3 py-2 bg-pink-600 rounded"
                    >
                      Rotate FCM 
                    </button>
                  </div>
                </div>

                {/* System & Data operations */}
                <div>
                  <h4 className="font-semibold">System & Data operations</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Dangerous infra operations: DB drops, exports, migrations,
                    backups
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        if (confirmTyped("Drop collection (mock)?")) {
                          pushLog("DROP_COLLECTION", { mock: true });
                          toast.success("collection dropped");
                        }
                      }}
                      className="px-3 py-2 bg-red-800 rounded"
                    >
                      Drop 
                    </button>
                    <button
                      onClick={handleMockExportData}
                      className="px-3 py-2 bg-gray-600 rounded"
                    >
                      Export 
                    </button>
                    <button
                      onClick={handleMockRunMigrations}
                      className="px-3 py-2 bg-indigo-600 rounded"
                    >
                      Run 
                    </button>
                    <button
                      onClick={handleMockBackupRestore}
                      className="px-3 py-2 bg-gray-700 rounded"
                    >
                      Backup 
                    </button>
                    <button
                      onClick={handleMockViewModifyEnv}
                      className="px-3 py-2 bg-pink-500 rounded"
                    >
                      View/Modify 
                    </button>
                  </div>
                </div>

                {/* Admin / Role & Access Management */}
                <div>
                  <h4 className="font-semibold">
                    Admin / Role & Access Management
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Create/delete admins, API keys, service accounts and
                    credential rotation
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockCreateDeleteAdmin}
                      className="px-3 py-2 bg-indigo-600 rounded"
                    >
                      Create/Delete 
                    </button>
                    <button
                      onClick={handleMockGrantRevokeApiKey}
                      className="px-3 py-2 bg-yellow-700 rounded"
                    >
                      Grant/Revoke API 
                    </button>
                    <button
                      onClick={handleMockRotateKeys}
                      className="px-3 py-2 bg-pink-600 rounded"
                    >
                      Rotate Service 
                    </button>
                  </div>
                </div>

                {/* AI / Categorization / Worker processes */}
                <div>
                  <h4 className="font-semibold">
                    AI / Categorization / Worker processes
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Trigger jobs, retrain models and bulk re-categorization
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockRunCategorizer}
                      className="px-3 py-2 bg-blue-700 rounded"
                    >
                      Run Categorizer  
                    </button>
                    <button
                      onClick={handleMockModifyMLConfig}
                      className="px-3 py-2 bg-indigo-600 rounded"
                    >
                      Modify ML Config  
                    </button>
                  </div>
                </div>

                {/* Analytics, Reporting & Logs */}
                <div>
                  <h4 className="font-semibold">Analytics, Reporting & Logs</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    View and export logs, generate system-wide analytics
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockViewRawLogs}
                      className="px-3 py-2 bg-gray-700 rounded"
                    >
                      View Raw Logs  
                    </button>
                    <button
                      onClick={handleMockGenerateAnalytics}
                      className="px-3 py-2 bg-green-700 rounded"
                    >
                      Generate Analytics  
                    </button>
                  </div>
                </div>

                {/* Security & Forensics */}
                <div>
                  <h4 className="font-semibold">Security & Forensics</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Disable checks, create emergency access and approve
                    sensitive actions
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockDisableSecurityChecks}
                      className="px-3 py-2 bg-red-700 rounded"
                    >
                      Disable Security Checks  
                    </button>
                    <button
                      onClick={handleMockCreateBackdoor}
                      className="px-3 py-2 bg-red-800 rounded"
                    >
                      Create Backdoor  
                    </button>
                    <button
                      onClick={handleMockApproveHighSensitivity}
                      className="px-3 py-2 bg-yellow-600 rounded"
                    >
                      Approve High-Sensitivity  
                    </button>
                  </div>
                </div>

                {/* Legal / Compliance / Financial Controls */}
                <div>
                  <h4 className="font-semibold">
                    Legal / Compliance / Financial Controls
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Refund approvals and data retention/deletion sign-offs
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleMockApproveRefund}
                      className="px-3 py-2 bg-green-700 rounded"
                    >
                      Approve Refund  
                    </button>
                    <button
                      onClick={handleMockSignOffRetention}
                      className="px-3 py-2 bg-gray-700 rounded"
                    >
                      Sign-off Retention  
                    </button>
                  </div>
                </div>
              </div>

              {/* Audit log (frontend only) */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Audit Log (mock)</h4>
                <div className="max-h-60 overflow-y-auto bg-gray-900/40 p-3 rounded">
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-gray-400">No actions yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {auditLogs.map((a) => (
                        <li key={a.id} className="text-sm text-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="mr-2">{a.action}</strong>
                              <span className="text-gray-400">
                                by {a.actor}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(a.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-300">
                            {JSON.stringify(a.details)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
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
