import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    mobile: "",
    upiId: "",
    dob: "",
    currency: "",
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = Cookies.get("id");

    async function getDetails() {
      if (!user && userId) {
        try {
          const response = await axios.get(`http://localhost:8000/user/${userId}`);
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
      const response = await axios.put(`http://localhost:8000/user/${userId}`, profile);

      if (response.status === 200) {
        const fetchedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        setUser(fetchedUser);
        setProfile({
          username: fetchedUser.username || "",
          email: fetchedUser.email || "",
          mobile: fetchedUser.mobile || "",
          upiId: fetchedUser.upiId || "",
          dob: fetchedUser.dob || "",
          currency: fetchedUser.currency || ""
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center px-6 p-8">
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        action="javascript:void(0);"
        className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mobile Number</label>
          <input
            type="tel"
            name="mobile"
            value={profile.mobile}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your mobile number"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">UPI ID [Mandatory Field]</label>
          <input
            type="text"
            name="upiId"
            value={profile.upiId}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your UPI ID"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={profile.dob}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Default Currency</label>
          <select
            name="currency"
            value={profile.currency}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Currency</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="INR">INR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full p-2 rounded-lg bg-gradient-to-r from-blue-800 via-sky-500 to-indigo-900 hover:from-purple-500 hover:via-blue-600 hover:to-green-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
