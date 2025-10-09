import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";

// NOTE: these credentials are for local/testing only. Replace with server-side auth.
const superAdmins = [{ username: "superadmin", password: "super123" }];

export default function SuperAdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const valid = superAdmins.some(
      (u) => u.username === username && u.password === password
    );
    if (valid) {
      try {
        Cookies.set("superAdminUser", username, { expires: 1 });
      } catch (e) {
        // ignore
      }
      navigate("/super-admin", { state: { username } });
    } else {
      alert("Invalid super admin credentials");
    }
  };

  useEffect(() => {
    try {
      const stored = Cookies.get("superAdminUser");
      if (stored) navigate("/super-admin", { state: { username: stored } });
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate("/login")}
            className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
            aria-label="Back to landing page"
          >
            <FaArrowLeft className="text-white text-lg" />
          </button>
        </div>

        <Header title="Super Admin Login" />

        <main className="mt-6">
          <section className="bg-gray-800/40 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Super Administrator Sign In
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              Use your super admin credentials to access system-critical tools.
            </p>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                className="p-3 bg-white/5 border border-white/10 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className="p-3 bg-white/5 border border-white/10 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:scale-105 transition-transform rounded-lg shadow-lg"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
