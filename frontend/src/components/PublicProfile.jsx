import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FaHome } from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import { toast } from "react-hot-toast";

const PublicProfile = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isFriend, setIsFriend] = useState(false);
  const [hasError, setHasError] = React.useState(false);

  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUserId = Cookies.get("id");

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await axios.get(`https://fairfare-0hyl.onrender.com/user/${userId}`); // Adjust this endpoint based on your backend
        setLoading(false);
        if (res.status === 200) {
          setEmail(res.data.user.email);
          setUsername(res.data.user.username);
          setHasError(false); // reset if previously true
          
          if(currentUserId === userId) {
            setIsFriend(true);
          }
          else if (currentUserId !== userId) {
            res.data.user.friends.forEach((friend) => {
              if (friend.friend._id === currentUserId) {
                setIsFriend(true);
              }
            });
          }
        } else {
          setHasError(true);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setHasError(true);

        console.error("Failed to fetch user:", error);
      }
    }

    if (userId) fetchUser();
  }, [userId, currentUserId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      duration: 2000,
      position: "top-center",
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  };

  const handleTopRightClick = async () => {
    if (!currentUserId) {
      // Save current location path
    const currentPath = window.location.pathname;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      // frontend-only placeholder for adding friend
      if (!isFriend) {
        
        const response = await axios.post(
          "https://fairfare-0hyl.onrender.com/user/add-friends",
          {
            email: email,
            autoAdd: true,
            friendsArray: [currentUserId],
          }
        );
        if(response.status === 200) {
        setIsFriend(true);
        toast.success("Friend Added!", {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
    }
      } else {
        toast.success("Already a friend!", {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      }
    }
  };

  return (
    <>
    {loading ? (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-2xl font-semibold">
        Loading...
      </div>
    ) : 
      hasError ? (
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold mb-4">
            Cannot find any such user
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#00f5ff] text-black font-semibold rounded hover:scale-105 transition duration-300"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <>
          <div className="relative bg-black flex items-center justify-center min-h-screen overflow-hidden">
            {/* Back Button */}
            <div className="absolute mt-10 top-4 left-4 z-50">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
                title="Back to Landing Page"
              >
                <FaHome className="text-white text-xl" />
              </button>
            </div>

            {/* Top Right Button */}
            <div className="absolute mt-10 top-4 right-4 z-50">
              <button
                onClick={handleTopRightClick}
                className={`px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur rounded-lg shadow-md transition-all duration-200${
                  !currentUserId
                    ? "bg-blue-500"
                    : isFriend
                    ? "bg-green-500 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {!currentUserId
                  ? "Login"
                  : isFriend
                  ? "Friend Added"
                  : "Add Friend"}
              </button>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
              <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
              <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
              <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
              <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
            </div>

            {/* Profile Card */}
            <div className="relative w-full max-w-sm p-8 bg-glass rounded-lg shadow-lg overflow-hidden animate-fade-in z-10">
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <img src="../icon.svg" alt="Icon" className="w-8 h-8 mr-2" />
                  <span className="text-4xl text-center font-bold text-white">
                    FairFare
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={username}
                      readOnly
                      placeholder="Username"
                      className="w-full px-3 py-2 border rounded-lg text-white bg-transparent placeholder-gray-400"
                    />
                    <button
                      onClick={() => handleCopy(username)}
                      title="Copy Username"
                    >
                      <FaCopy className="text-white ml-2" />
                    </button>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="text"
                      value={email}
                      readOnly
                      placeholder="Email"
                      className="w-full px-3 py-2 border rounded-lg text-white bg-transparent placeholder-gray-400"
                    />
                    <button
                      onClick={() => handleCopy(email)}
                      title="Copy Email"
                    >
                      <FaCopy className="text-white ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PublicProfile;
