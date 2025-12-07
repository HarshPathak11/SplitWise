import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import logo from "../../public/newIcon-192x192.png";
import { toast } from "react-hot-toast";
import userIcon from "../../public/userIcon.png";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Share2,
  Copy,
  User,
  ShieldCheck,
  UserPlus,
  UserMinus,
  LogIn,
} from "lucide-react";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PublicProfile = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [friendId, setFriendId] = useState(null);

  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUserId = Cookies.get("id");

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/user/${userId}`); // Adjust this endpoint based on your backend
        setLoading(false);
        if (res.status === 200) {
          setFriendId(res?.data?.user?._id);
          setEmail(res.data.user.email);
          setUsername(res.data.user.username);
          setProfilePhotoUrl(res.data.user.profilePhotoUrl);
          setHasError(false); // reset if previously true

          if (currentUserId === userId) {
            setIsFriend(true);
          } else if (currentUserId !== userId) {
            res.data.user.friends.forEach((friend) => {
              if (friend?.friend?._id === currentUserId) {
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
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!isFriend) {
      // Add Friend Confirmation
      const result = await Swal.fire({
        title: `Add ${username || "this user"} as a friend?`,
        text: "They’ll be able to share and split expenses with you.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, add friend",
        cancelButtonText: "Cancel",
        background: "#0b0b0b",
        color: "#fff",
        confirmButtonColor: "#00f5ff",
        cancelButtonColor: "#555",
        customClass: {
          popup:
            "rounded-2xl shadow-lg backdrop-blur-md border border-white/10",
        },
      });

      if (!result.isConfirmed) return;

      try {
        const response = await axios.post(`${API_BASE}/user/add-friends`, {
          email: email,
          autoAdd: true,
          friendsArray: [currentUserId],
        });

        if (response.status === 200) {
          setIsFriend(true);
          Swal.fire({
            title: "Friend Added!",
            text: `${username} has been added successfully.`,
            icon: "success",
            background: "#0b0b0b",
            color: "#fff",
            confirmButtonColor: "#00f5ff",
            customClass: {
              popup:
                "rounded-2xl shadow-lg backdrop-blur-md border border-white/10",
            },
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Failed!",
          text: "Something went wrong while adding friend.",
          icon: "error",
          background: "#0b0b0b",
          color: "#fff",
          confirmButtonColor: "#ff4b4b",
        });
        console.error("Add friend failed:", error);
      }
    } else {
      // Remove Friend Confirmation
      const result = await Swal.fire({
        title: `Remove ${username || "this user"}?`,
        text: "You will no longer be friends or share expenses.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, remove friend",
        cancelButtonText: "Cancel",
        background: "#0b0b0b",
        color: "#fff",
        confirmButtonColor: "#ff4b4b",
        cancelButtonColor: "#555",
        customClass: {
          popup:
            "rounded-2xl shadow-lg backdrop-blur-md border border-white/10",
        },
      });

      if (!result.isConfirmed) return;

      try {
        const res = await axios.post(`${API_BASE}/user/remove-friend`, {
          friendId: userId,
          userId: currentUserId,
        });
        if (res.status === 200) {
          setIsFriend(false);
          Swal.fire({
            title: "Removed!",
            text: `${username} has been removed from your friends.`,
            icon: "success",
            background: "#0b0b0b",
            color: "#fff",
            confirmButtonColor: "#00f5ff",
            customClass: {
              popup:
                "rounded-2xl shadow-lg backdrop-blur-md border border-white/10",
            },
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Failed!",
          text: "Could not remove friend. Please try again.",
          icon: "error",
          background: "#0b0b0b",
          color: "#fff",
          confirmButtonColor: "#ff4b4b",
        });
        console.error("Failed to unfriend:", error);
      }
    }
  };
  return (
    <>
      {loading ? (
        // --- DASHBOARD LOADING STATE ---
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 gap-4">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-sm font-medium text-slate-500">
            Loading Profile...
          </div>
        </div>
      ) : hasError ? (
        // --- DASHBOARD ERROR STATE ---
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-sm w-full shadow-xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserMinus className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-slate-100 text-xl font-semibold mb-2">
              User Not Found
            </h1>
            <p className="text-slate-400 mb-6 text-sm">
              The profile you are looking for does not exist or is private.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2.5 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        // --- MAIN DASHBOARD PROFILE ---
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
          {/* TOP NAVIGATION (Simplified) */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={async () => {
                // ... (Keep existing share logic) ...
                const profileLink = `https://fair-fare-phi.vercel.app/public-profile/${friendId}`;
                const message = `Hey! 👋\n\nCheck out my FairFare profile:\n${profileLink}`; // Simplified for brevity in example
                if (navigator.share) {
                  await navigator.share({
                    title: "FairFare Profile",
                    text: message,
                  });
                } else {
                  await navigator.clipboard.writeText(profileLink);
                  alert("Link copied!");
                }
              }}
              className="p-2.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* MAIN CARD */}
          <div className="relative z-10 w-full max-w-sm mx-4 perspective-1000">
            <div className="relative bg-gradient-to-b from-slate-800/40 to-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl mb-2 overflow-hidden group hover:border-white/20 transition-colors duration-500">
              {/* Decorative Top Highlight */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>

              <div className="flex flex-col items-center pt-12 pb-10 px-8">
                {/* Brand Badge */}
                <div className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <img
                    src={logo}
                    alt="FairFare"
                    className="w-3.5 h-3.5 opacity-70"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    FairFare
                  </span>
                </div>
              </div>

              <div className="px-6 pb-8">
                {/* Profile Photo - Overlapping Header */}
                <div className="relative -mt-16 mb-4 flex justify-center">
                  <div className="relative w-32 h-32 p-1 rounded-full bg-slate-900 border-4 border-slate-900">
                    <img
                      src={profilePhotoUrl || userIcon}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover bg-slate-800"
                    />
                    {/* Verified Tick */}
                    <div className="absolute bottom-1 right-1 bg-indigo-500 text-white p-1 rounded-full border-[3px] border-slate-900">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {username || "Unknown User"}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Verified Member
                  </p>
                </div>

                {/* Data Fields (Input Style) */}
                <div className="space-y-4 mb-8">
                  {/* Username Field */}
                  <div className="group">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      Username
                    </label>
                    <button
                      onClick={() => handleCopy(username)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950 transition-all group-hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-slate-900 text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-slate-200 font-mono">
                          {username}
                        </span>
                      </div>
                      <Copy className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      Email Address
                    </label>
                    <button
                      onClick={() => handleCopy(email)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950 transition-all group-hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden mr-2">
                        <div className="p-1.5 rounded-md bg-slate-900 text-slate-400">
                          <span className="text-xs font-bold">@</span>
                        </div>
                        <span className="text-sm text-slate-200 font-mono truncate">
                          {email}
                        </span>
                      </div>
                      <Copy className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={handleTopRightClick}
                  className={`
                    w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200
                    ${
                      !currentUserId
                        ? "bg-slate-100 text-slate-900 hover:bg-white border border-transparent"
                        : isFriend
                        ? "bg-transparent text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20"
                    }
                  `}
                >
                  {!currentUserId ? (
                    <>
                      {" "}
                      <LogIn className="w-4 h-4" /> Login to Connect{" "}
                    </>
                  ) : isFriend ? (
                    <>
                      {" "}
                      <UserMinus className="w-4 h-4" /> Remove Connection{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <UserPlus className="w-4 h-4" /> Add to Network{" "}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="text-center opacity-30">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white font-light">
                Secured by FairFare
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicProfile;
