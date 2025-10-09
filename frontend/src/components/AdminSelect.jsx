import { Link } from "react-router-dom";

const AdminSelect = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 sm:p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Choose Admin Type</h1>
        <p className="text-gray-300 mb-6">
          Select whether you want to sign in as an Admin or a Super Admin.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/admin-login">
            <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:scale-105 transition-transform">
              Admin Login
            </button>
          </Link>

          <Link to="/super-admin-login">
            <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 shadow-lg hover:scale-105 transition-transform">
              Super Admin Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSelect;
