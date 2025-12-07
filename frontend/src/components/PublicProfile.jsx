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
        // --- PREMIUM LOADING STATE ---
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-800 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-cyan-500 rounded-full animate-spin border-t-transparent absolute inset-0"></div>
          </div>
          <div className="text-xs tracking-[0.3em] uppercase text-slate-500 font-medium animate-pulse">
            Verifying Identity...
          </div>
        </div>
      ) : hasError ? (
        // --- PREMIUM ERROR STATE ---
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-red-500/20 p-10 rounded-3xl text-center max-w-md shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <UserMinus className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-white text-2xl font-bold mb-3 tracking-tight">
              User Not Found
            </h1>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              The digital identity you are looking for does not exist or has
              been made private.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-all duration-300 shadow-lg shadow-white/5"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        // --- MAIN PREMIUM PROFILE ---
        <div className="relative bg-slate-950 flex items-center justify-center min-h-screen overflow-hidden font-sans selection:bg-cyan-500/30">
          {/* ATMOSPHERIC BACKGROUND */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            <div className="absolute top-[20%] right-[50%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          </div>

          {/* TOP NAVIGATION */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all duration-300 shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Share Button (Preserving your logic) */}
            <button
              onClick={async () => {
                const profileLink = `https://fair-fare-phi.vercel.app/public-profile/${friendId}`;
                const message = `Hey! 👋\n\nCheck out my FairFare profile:\n\n🔗 Add me as a friend using this link:\n${profileLink}\n\n📧 Or use my email to add me manually:\nhttps://fair-fare-phi.vercel.app/addFriend\n\nEmail: ${email}\n\nLet’s split and share smarter with FairFare! 💸`;

                if (navigator.share) {
                  try {
                    await navigator.clipboard.writeText(email);
                    await navigator.share({
                      title: "Check out my FairFare profile!",
                      text: message,
                    });
                  } catch (error) {
                    console.error("Sharing failed:", error);
                  }
                } else {
                  try {
                    await navigator.clipboard.writeText(profileLink);
                    alert("Link copied to clipboard!");
                  } catch (err) {
                    const textarea = document.createElement("textarea");
                    textarea.value = profileLink;
                    textarea.setAttribute("readonly", "");
                    textarea.style.position = "absolute";
                    textarea.style.left = "-9999px";
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                    alert("Link copied to clipboard!"); // Replaced toast with alert if toast not available in scope
                  }
                }
              }}
              className="group flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 shadow-xl"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
                    className="w-4 h-4 opacity-80"
                  />
                  <span className="text-[10px] font-bold tracking-[0.25em] text-slate-300 uppercase">
                    FairFare
                  </span>
                </div>

                {/* Profile Photo */}
                <div className="relative mb-6">
                  {/* Glowing Effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

                  <div className="relative w-28 h-28 p-[3px] rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 shadow-2xl">
                    <img
                      src={profilePhotoUrl || userIcon}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  {/* Verified Tick */}
                  <div className="absolute bottom-1 right-1 bg-cyan-500 text-slate-950 p-1.5 rounded-full border-[3px] border-slate-900 shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Username & Title */}
                <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">
                  {username || "Unknown"}
                </h2>
                <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-8">
                  Verified Member
                </p>

                {/* Interactive Fields */}
                <div className="w-full space-y-3 mb-8">
                  {/* Username Field */}
                  <button
                    onClick={() => handleCopy(username)}
                    className="w-full group relative flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-slate-800/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-cyan-400 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                          Username
                        </span>
                        <span className="text-sm text-slate-200 font-mono">
                          {username}
                        </span>
                      </div>
                    </div>
                    <Copy className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </button>

                  {/* Email Field */}
                  <button
                    onClick={() => handleCopy(email)}
                    className="w-full group relative flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-slate-800/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 overflow-hidden mr-2">
                      {/* Using generic icon if mail icon not available, or standard div */}
                      <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-emerald-400 transition-colors">
                        <span className="font-bold text-xs">@</span>
                      </div>
                      <div className="flex flex-col items-start overflow-hidden w-full">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                          Email ID
                        </span>
                        <span className="text-sm text-slate-200 font-mono truncate w-[160px] text-left">
                          {email}
                        </span>
                      </div>
                    </div>
                    <Copy className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors shrink-0" />
                  </button>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleTopRightClick}
                  className={`
                    w-full py-4 rounded-xl font-bold tracking-wide text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg transform active:scale-[0.98]
                    ${
                      !currentUserId
                        ? "bg-white text-black hover:bg-slate-200 shadow-white/10"
                        : isFriend
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        : "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white hover:shadow-cyan-500/25"
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
