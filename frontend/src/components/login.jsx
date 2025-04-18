import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FaHome } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LogIn = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  //UseEffect to Check if user logged in before or not if yes then directly take them to dashboard
  useEffect(() => {
    async function getDetails() {
      const userId = Cookies.get("id");
      if (userId) {
        try {
          navigate("/dash");
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    }

    getDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        alert("Please fill in all fields.");
        return;
      }

      const response = await axios.post(`https://fairfare-0hyl.onrender.com/user/login`, {
        email,
        password,
      });
      if (response.data.user) {
        Cookies.set("id", response.data.user._id, { expires: 7 });
        navigate("/dash");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      console.log("error ", error.response.data);
      alert("Login failed");
    }
  };

  return (
    <div className="relative bg-[#000000] flex items-center justify-center min-h-screen overflow-hidden">
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
        <button
          onClick={() => navigate("/")} // Navigate to the landing page route
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
          title="Back to Landing Page"
        >
          <FaHome className="text-white text-xl" />
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
      {/* Login Card */}
      <div className="relative w-full max-w-sm p-8 bg-glass rounded-lg shadow-lg overflow-hidden animate-fade-in z-10">
        <div className="relative z-10">
          <div className="flex items-center ">
            <img src="../icon.svg" alt="Icon" className="w-8 h-8 mr-2" />
            <span className="text-4xl text-center font-bold text-white">
              FairFare
            </span>
          </div>
          <div className="flex justify-between items-center mb-6 mt-6">
            <div className="text-2xl font-bold text-[#00f5ff]">LOGIN</div>
            <Link to="/signup">
              <div className=" text-[#00f5ff] cursor-pointer hover:underline">
                SIGN UP
              </div>
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="email"
              ></label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline hover:shadow-lg transition-shadow duration-300"
              />
            </div>
            <div className="mb-4 relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-3 py-2 border rounded-lg pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="text-right mb-4">
              <Link
                to="/forgot-password"
                className="text-sm text-slate-300 hover:text-blue-300 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#00f5ff] text-black rounded-lg hover:bg-green-700 focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
