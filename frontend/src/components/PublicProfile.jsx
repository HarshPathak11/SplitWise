import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../../public/newIcon-192x192.png";
import { FaCopy } from "react-icons/fa";
import { toast } from "react-hot-toast";
import userIcon from "../../public/userIcon.png";
import Swal from "sweetalert2";
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
          setFriendId(res.data.user._id);
          setEmail(res.data.user.email);
          setUsername(res.data.user.username);
          setProfilePhotoUrl(res.data.user.profilePhotoUrl);
          setHasError(false); // reset if previously true

          if (currentUserId === userId) {
            setIsFriend(true);
          } else if (currentUserId !== userId) {
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

  // const handleTopRightClick = async () => {
  //   if (!currentUserId) {
  //     // Save current location path
  //     const currentPath = window.location.pathname;
  //     navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
  //   } else {
  //     // frontend-only placeholder for adding friend
  //     if (!isFriend) {
  //       const response = await axios.post(`${API_BASE}/user/add-friends`, {
  //         email: email,
  //         autoAdd: true,
  //         friendsArray: [currentUserId],
  //       });
  //       if (response.status === 200) {
  //         setIsFriend(true);
  //         toast.success("Friend Added!", {
  //           duration: 2000,
  //           position: "top-center",
  //           style: {
  //             background: "#333",
  //             color: "#fff",
  //           },
  //         });
  //       }
  //     } else {
  //       // Unfriend: remove both sides from friends list
  //       try {
  //         const res = await axios.post(`${API_BASE}/user/remove-friend`, {
  //           friendId: userId,
  //           userId: currentUserId,
  //         });
  //         if (res.status === 200) {
  //           setIsFriend(false);
  //           toast.success("Unfriended successfully!", {
  //             duration: 2000,
  //             position: "top-center",
  //             style: {
  //               background: "#333",
  //               color: "#fff",
  //             },
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Failed to unfriend:", error);
  //         toast.error("Failed to unfriend. Please try again.");
  //       }
  //     }
  //   }
  // };

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
        <div className="min-h-screen flex items-center justify-center bg-black text-white text-2xl font-semibold">
          Loading...
        </div>
      ) : hasError ? (
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold mb-4">
            Cannot find any such user
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#00f5ff] text-black font-semibold rounded hover:scale-105 transition duration-300"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <>
          <div className="relative bg-black flex items-center justify-center min-h-screen overflow-hidden">
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-50">
              <button
                onClick={() => navigate(-1)}
                className="p-2 mt-3.5 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
                title="Back to Landing Page"
              >
                <FaArrowLeft className="text-white text-xl" />
              </button>
            </div>

            {/* Share Profile Button */}
            <div className="absolute cursor-pointer mt-3.5 z-50 top-4 right-4">
              <button
                onClick={async () => {
                  const profileLink = `https://fair-fare-phi.vercel.app/public-profile/${friendId}`;
                  // const profileLink = `http://localhost:8000/public-profile/${userId}`;
                  const message = `Hey! 👋
            
Check out my FairFare profile:
            
🔗 Add me as a friend using this link:
${profileLink}
            
📧 Or use my email to add me manually:
https://fair-fare-phi.vercel.app/addFriend
            
Email: ${email}
            
            Let’s split and share smarter with FairFare! 💸`;

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
                    // Fallback to copy to clipboard
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
                      toast.success("Link copied to clipboard!");
                    }
                  }
                }}
                className="p-3 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
                title="Share Profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 8a3 3 0 1 0-2.83-2h-.34l-7.9 4.58a3 3 0 1 0 0 2.84l7.9 4.58h.34A3 3 0 1 0 18 16a2.98 2.98 0 0 0-1.85-.68L9.25 12.5a3.02 3.02 0 0 0 0-.99l6.9-4.02A3 3 0 0 0 18 8z" />
                </svg>
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
                  <img src={logo} alt="Icon" className="w-8 h-8 mr-2" />
                  <span className="text-4xl text-center font-bold text-white">
                    FairFare
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Profile Photo */}
                  <div className="w-full flex items-center justify-center mb-2">
                    {/* Purana code hata nahi rahe, naya image add kiya gaya */}
                    <img
                      src={profilePhotoUrl || userIcon}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border border-white/30 shadow-md"
                    />
                  </div>
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
              <div className="relative z-10 flex items-center justify-center mt-6">
                <button
                  onClick={handleTopRightClick}
                  className={`px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur rounded-lg shadow-md transition-all duration-200${
                    !currentUserId
                      ? "bg-blue-500"
                      : isFriend
                      ? // "bg-green-500 cursor-not-allowed"
                        " bg-red-500 hover:bg-red-600"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  {!currentUserId
                    ? "Login"
                    : isFriend
                    ? // ? "Friend Added"
                      "Remove Friend"
                    : "Add Friend"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PublicProfile;
