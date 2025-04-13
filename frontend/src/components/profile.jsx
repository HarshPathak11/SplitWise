import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    upiId: "",
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = Cookies.get("id");

    async function getDetails() {
      if (!user && userId) {
        console.log("Fetching user details from backend...");

        try {
          const response = await axios.get(
            `http://192.168.1.10:8000/user/${userId}`
          );
          if (response.status === 200) {
            const fetchedUser = response.data.user;
            setUser(fetchedUser);
            setProfile(fetchedUser);
            localStorage.setItem("user", JSON.stringify({ user: fetchedUser }));
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    }

    getDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = Cookies.get("id");
      const response = await axios.put(
        `http://192.168.1.10:8000/user/${userId}`,
        profile
      );

      if (response.status === 200) {
        const fetchedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        setUser(fetchedUser);
        setProfile({
          username: fetchedUser.username || "",
          upiId: fetchedUser.upiId || "",
        });

        navigate("/dash");
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div className=" relative bg-[#000000] flex items-center justify-center min-h-screen overflow-hidden">
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
        <button
          onClick={() => navigate("/dash")}
          className="p-3 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
          title="Back to Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white animate-bounce-left"
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
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        action="javascript:void(0);"
        className="bg-[rgba(255,255,255,0.1)] backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-[#00f5ff]">
          Edit Profile
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#00f5ff]">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className="w-full h-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#00f5ff]">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            readOnly
            className="w-full h-full p-2 rounded-lg bg-white/20 border border-white/30 text-white cursor-not-allowed opacity-80"
            placeholder="Email is not editable"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#00f5ff]">
            UPI ID [Mandatory Field]
          </label>
          <input
            type="text"
            name="upiId"
            value={profile.upiId}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your UPI ID"
          />
        </div>
        <div className="text-right mb-4">
          <Link
            to="/change-password"
            className="text-sm text-slate-300 hover:text-blue-300 hover:underline"
          >
            Reset your password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={!profile.upiId}
          className={`w-full p-2 rounded-lg transition
    ${
      !profile.upiId
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-[#00FFA3] to-[#A020F0] hover:from-purple-500 hover:to-[#00FFA3]"
    }
  `}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
