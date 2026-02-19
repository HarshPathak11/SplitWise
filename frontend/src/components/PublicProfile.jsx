import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
const logo = "/newIconV3-192x192.png";
import { toast } from "react-hot-toast";
const userIcon = "/userIcon.png";
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
  Clock,
} from "lucide-react";
import api from "../utils/api";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PublicProfile = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [friendId, setFriendId] = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);

  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const currentUserId = Cookies.get("id");
  const fromTransactions = new URLSearchParams(location.search).get("from") === "transactions";

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        // Use the public endpoint — no auth required
        const res = await api.get(`${API_BASE}/user/public/${userId}`);
        setLoading(false);
        if (res.status === 200) {
          setFriendId(res?.data?.user?._id);
          setEmail(res.data.user.email);
          setUsername(res.data.user.username);
          setProfilePhotoUrl(res.data.user.profilePhotoUrl);
          setHasError(false); // reset if previously true

          if (currentUserId === userId) {
            setIsFriend(true);
          } else if (currentUserId && currentUserId !== userId) {
            res.data.user.friends.forEach((friend) => {
              if (friend?.friend?._id === currentUserId) {
                setIsFriend(true);
              }
            });

            // Check if a friend request is already pending
            try {
              const reqRes = await api.get(
                `${API_BASE}/user/friend-request-status/${currentUserId}/${res.data.user._id}`
              );
              if (reqRes.data?.pending) setRequestSent(true);
            } catch (e) {
              // ignore — just won't show "Request Sent"
            }
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

    if (requestSent) return;

    if (!isFriend) {
      // Add Friend Confirmation
      const result = await Swal.fire({
        title: `Add ${username || "this user"} as a friend?`,
        text: "They’ll be able to share and split expenses with you.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, send request",
        cancelButtonText: "Cancel",
        background: "#0b0b0b",
        color: "#fff",
        confirmButtonColor: "#128b5fff",
        cancelButtonColor: "#555",
        customClass: {
          popup:
            "rounded-2xl shadow-lg backdrop-blur-md border border-white/10",
        },
      });

      if (!result.isConfirmed) return;

      try {
        const response = await api.post(`${API_BASE}/user/friend-requests/send`, {
          fromUserId: currentUserId,
          toEmail: [email],
        });

        if (response.status === 200) {
          setRequestSent(true);
          Swal.fire({
            title: "Request Sent!",
            text: `A friend request has been sent to ${username}.`,
            icon: "success",
            background: "#0b0b0b",
            color: "#fff",
            confirmButtonColor: "#128b5fff",
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
        const res = await api.post(`${API_BASE}/user/remove-friend`, {
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
        // Extract error message from backend response
        const errorMessage = error.response?.data?.message || "Could not remove friend. Please try again.";
        const balance = error.response?.data?.balance;

        Swal.fire({
          title: "Failed!",
          text: errorMessage + (balance !== undefined ? ` Current balance: ₹${Math.abs(balance).toFixed(2)}` : ""),
          icon: "error",
          background: "#0b0b0b",
          color: "#fff",
          confirmButtonColor: "#ff4b4b",
          customClass: {
            popup:
              "rounded-2xl shadow-lg backdrop-blur-md border border-white/10",
          },
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
              onClick={() => navigate("/dash")}
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
              onClick={() => fromTransactions ? navigate("/dash") : navigate(-1)}
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
                      onClick={() => setShowPhoto(true)}
                      className="w-full h-full rounded-full object-cover bg-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
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

                {/* Contextual banner when redirected from transaction history */}
                {fromTransactions && !isFriend && currentUserId && currentUserId !== userId && (
                  <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-sm text-amber-300 font-medium">
                      🔗 You opened a shared transaction link
                    </p>
                    <p className="text-xs text-amber-400/70 mt-1">
                      Add <strong className="text-white">{username}</strong> as a friend to start tracking expenses together.
                    </p>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  onClick={handleTopRightClick}
                  className={`
                    w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200
                    ${
                      !currentUserId
                        ? "bg-slate-100 text-slate-900 hover:bg-white border border-transparent"
                        : currentUserId === userId
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                        : isFriend
                        ? "bg-transparent text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                        : requestSent
                        ? "bg-transparent text-amber-400 border border-amber-500/30 cursor-default opacity-80"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20"
                    }
                  `}
                  disabled={requestSent || currentUserId === userId}
                >
                  {!currentUserId ? (
                    <>
                      {" "}
                      <LogIn className="w-4 h-4" /> Login to Connect{" "}
                    </>
                  ) : currentUserId === userId ? (
                    <>
                      {" "}
                      <ShieldCheck className="w-4 h-4" /> Yes, it's you!{" "}
                    </>
                  ) : isFriend ? (
                    <>
                      {" "}
                      <UserMinus className="w-4 h-4" /> Remove Connection{" "}
                    </>
                  ) : requestSent ? (
                    <>
                      {" "}
                      <Clock className="w-4 h-4" /> Request Sent{" "}
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
      {showPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setShowPhoto(false)}
        >
          <img
            src={profilePhotoUrl || userIcon}
            alt="Enlarged Profile"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300"
          />
        </div>
      )}
    </>
  );
};

export default PublicProfile;
