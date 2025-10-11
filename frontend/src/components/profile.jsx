// // src/pages/Profile.jsx
// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-hot-toast";
// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// const Profile = () => {
//   const navigate = useNavigate();

//   const [profile, setProfile] = useState({
//     username: "",
//     email: "",
//     upiId: "",
//   });

//   const [user, setUser] = useState(null);

//   // === Added for profile photo upload ===
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   // =======================================

//   useEffect(() => {
//     const userId = Cookies.get("id");

//     async function getDetails() {
//       if (!user && userId) {
//         try {
//           const response = await axios.get(
//             `${API_BASE}/user/${userId}`
//           );
//           if (response.status === 200) {
//             const fetchedUser = response.data.user;
//             setUser(fetchedUser);
//             setProfile(fetchedUser);
//             // set preview if profilePhotoUrl exists
//             if (fetchedUser.profilePhotoUrl) setPreview(fetchedUser.profilePhotoUrl);
//             localStorage.setItem("user", JSON.stringify({ user: fetchedUser }));
//           }
//         } catch (err) {
//           console.error("Error fetching user:", err);
//         }
//       }
//     }

//     getDetails();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   // === Added: file input change -> preview & validation ===
//   const handleFileChange = (e) => {
//     const selected = e.target.files && e.target.files[0];
//     if (!selected) return;
//     if (!selected.type.startsWith("image/")) {
//       toast.error("Please select an image file");
//       return;
//     }
//     if (selected.size > 5 * 1024 * 1024) {
//       toast.error("Image must be < 5MB");
//       return;
//     }
//     setFile(selected);
//     const reader = new FileReader();
//     reader.onload = (ev) => setPreview(ev.target.result);
//     reader.readAsDataURL(selected);
//   };
//   // ========================================================

//   // Update textual profile (existing PUT /user/:id JSON route)
//   const saveProfileFields = async (userId) => {
//     return axios.put(`${API_BASE}/user/${userId}`, {
//       username: profile.username,
//       upiId: profile.upiId,
//     });
//   };

//   // === Added: upload photo to server (Cloudinary via backend) ===
//   const uploadPhoto = async (userId) => {
//     if (!file) return null;
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("profilePhoto", file);
//       // NOTE: If your auth is cookie-based, ensure withCredentials is set elsewhere or configured globally.
//       const resp = await axios.put(`${API_BASE}/user/${userId}/photo`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       return resp;
//     } catch (err) {
//       console.error("Photo upload error:", err);
//       toast.error("Photo upload failed");
//       throw err;
//     } finally {
//       setUploading(false);
//     }
//   };
//   // ===============================================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const userId = Cookies.get("id");
//       const response = await saveProfileFields(userId);

//       let fetchedUser = response.data.user;
//       // if a file is selected, upload it
//       if (file) {
//         try {
//           const photoResp = await uploadPhoto(userId);
//           if (photoResp && photoResp.status === 200) {
//             fetchedUser = photoResp.data.user;
//           }
//         } catch (err) {
//           // uploadPhoto already shows toast and logs — continue without blocking
//           console.error("Photo upload failed during submit:", err);
//         }
//       }

//       if (response.status === 200) {
//         localStorage.setItem("user", JSON.stringify(fetchedUser));
//         setUser(fetchedUser);
//         setProfile({
//           username: fetchedUser.username || "",
//           upiId: fetchedUser.upiId || "",
//         });
//         // update preview to server-returned URL if available
//         if (fetchedUser.profilePhotoUrl) setPreview(fetchedUser.profilePhotoUrl);

//         navigate("/dash");
//       } else {
//         console.error("Unexpected response:", response);
//       }
//     } catch (err) {
//       console.error("Error updating profile:", err);
//     }
//   };

//   return (
//     <div className=" relative bg-[#000000] flex items-center justify-center min-h-screen overflow-hidden">
//       <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
//         <button
//           onClick={() => navigate("/dash")}
//           className="p-3 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
//           title="Back to Dashboard"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6 text-white animate-bounce-left"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth={2}
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Share Profile Button */}
//       <div className="absolute cursor-pointer mt-3.5 z-50 top-4 right-4">
//         <button
//           onClick={async () => {
//             const userId = Cookies.get("id");
//             const profileLink = `https://fair-fare-phi.vercel.app/public-profile/${userId}`;
//             const message = `Hey! 👋

// Check out my FairFare profile:

// 🔗 Add me as a friend using this link:
// ${profileLink}

// 📧 Or use my email to add me manually:
// https://fair-fare-phi.vercel.app/addFriend

// Email:
// ${user?.username}

// Let’s split and share smarter with FairFare! 💸`;

//             if (navigator.share) {
//               try {
//                 // await navigator.clipboard.writeText(user.email);
//                 await navigator.share({
//                   title: "Check out my FairFare profile!",
//                   text: message,
//                 });
//               } catch (error) {
//                 console.error("Sharing failed:", error);
//               }
//             } else {
//               // Fallback to copy to clipboard
//               try {
//                 await navigator.clipboard.writeText(profileLink);
//                 alert("Link copied to clipboard!");
//               } catch (err) {
//                 const textarea = document.createElement("textarea");
//                 textarea.value = profileLink;
//                 textarea.setAttribute("readonly", "");
//                 textarea.style.position = "absolute";
//                 textarea.style.left = "-9999px";
//                 document.body.appendChild(textarea);
//                 textarea.select();
//                 document.execCommand("copy");
//                 document.body.removeChild(textarea);
//                 toast.success("Link copied to clipboard!");
//               }
//             }
//           }}
//           className="p-3 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
//           title="Share Profile"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5"
//             fill="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path d="M18 8a3 3 0 1 0-2.83-2h-.34l-7.9 4.58a3 3 0 1 0 0 2.84l7.9 4.58h.34A3 3 0 1 0 18 16a2.98 2.98 0 0 0-1.85-.68L9.25 12.5a3.02 3.02 0 0 0 0-.99l6.9-4.02A3 3 0 0 0 18 8z" />
//           </svg>
//         </button>
//       </div>

//       {/* Animated Background */}
//       <div className="absolute inset-0 z-0">
//         <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
//         <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
//         <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
//         <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
//         <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         action="javascript:void(0);"
//         className="bg-[rgba(255,255,255,0.1)] backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 w-full max-w-md"
//       >
//         <h2 className="text-2xl font-bold mb-4 text-center text-[#00f5ff]">
//           Edit Profile
//         </h2>

//         {/* ===== ADDED: PROFILE PHOTO PREVIEW & UPLOAD ===== */}
//         <div className="flex flex-col items-center mb-4">
//           <div className="w-28 h-28 rounded-full bg-white/10 overflow-hidden mb-2 border border-white/20">
//             {preview ? (
//               <img src={preview} alt="preview" className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-white/70">No Photo</div>
//             )}
//           </div>

//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             className="text-sm text-white"
//           />
//           <p className="text-xs text-slate-300 mt-1">Max 5MB. JPG, PNG, WEBP recommended.</p>
//         </div>
//         {/* ================================================= */}

//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-2 text-[#00f5ff]">
//             Username
//           </label>
//           <input
//             type="text"
//             name="username"
//             value={profile.username}
//             onChange={handleChange}
//             className="w-full h-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your username"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font medium mb-2 text-[#00f5ff]">
//             Email
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={profile.email}
//             readOnly
//             className="w-full h-full p-2 rounded-lg bg-white/20 border border-white/30 text-white cursor-not-allowed opacity-80"
//             placeholder="Email is not editable"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-2 text-[#00f5ff]">
//             UPI ID [Mandatory Field]
//           </label>
//           <input
//             type="text"
//             name="upiId"
//             value={profile.upiId}
//             onChange={handleChange}
//             className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your UPI ID"
//           />
//         </div>
//         <div className="text-right mb-4">
//           <Link
//             to="/change-password"
//             className="text-sm text-slate-300 hover:text-blue-300 hover:underline"
//           >
//             Reset your password?
//           </Link>
//         </div>
//         <button
//           type="submit"
//           disabled={!profile.upiId || uploading}
//           className={`w-full p-2 rounded-lg transition
//     ${
//       !profile.upiId
//         ? "bg-gray-400 cursor-not-allowed"
//         : "bg-gradient-to-r from-[#00FFA3] to-[#A020F0] hover:from-purple-500 hover:to-[#00FFA3]"
//     }
//   `}
//         >
//           {uploading ? 'Saving...' : 'Save Changes'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Profile;




import { useState, useEffect } from "react";
import { ArrowLeft, Share2, Upload, Camera, User, Mail, CreditCard, Lock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;



const ProfileEnhanced = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    upiId: "",
  });

  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);

  const navigate = (path) => {
    window.location.href = path;
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  useEffect(() => {
    const userId = getCookie("id");

    async function getDetails() {
      if (!user && userId) {
        try {
          const response = await fetch(`${API_BASE}/user/${userId}`);
          if (response.ok) {
            const data = await response.json();
            const fetchedUser = data.user;
            setUser(fetchedUser);
            setProfile(fetchedUser);
            if (fetchedUser.profilePhotoUrl) setPreview(fetchedUser.profilePhotoUrl);
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

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert("Image must be < 5MB");
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result);
    reader.readAsDataURL(selected);
  };

  const saveProfileFields = async (userId) => {
    return fetch(`${API_BASE}/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: profile.username,
        upiId: profile.upiId,
      }),
    });
  };

  const uploadPhoto = async (userId) => {
    if (!file) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      const resp = await fetch(`${API_BASE}/user/${userId}/photo`, {
        method: "PUT",
        body: formData,
      });
      return resp;
    } catch (err) {
      console.error("Photo upload error:", err);
      alert("Photo upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = getCookie("id");
      if (!userId) return;

      const response = await saveProfileFields(userId);
      const data = await response.json();
      let fetchedUser = data.user;

      if (file) {
        try {
          const photoResp = await uploadPhoto(userId);
          if (photoResp?.ok) {
            const photoData = await photoResp.json();
            fetchedUser = photoData.user;
          }
        } catch (err) {
          console.error("Photo upload failed during submit:", err);
        }
      }

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        setUser(fetchedUser);
        setProfile({
          username: fetchedUser.username || "",
          upiId: fetchedUser.upiId || "",
          email: fetchedUser.email || "",
        });
        if (fetchedUser.profilePhotoUrl) setPreview(fetchedUser.profilePhotoUrl);
        navigate("/dash");
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleShareProfile = async () => {
    const userId = getCookie("id");
    const profileLink = `https://fair-fare-phi.vercel.app/public-profile/${userId}`;
    const message = `Hey! 👋

Check out my FairFare profile:

🔗 Add me as a friend using this link:
${profileLink}

📧 Or use my email to add me manually:
https://fair-fare-phi.vercel.app/addFriend

Email:
${user?.username}

Let's split and share smarter with FairFare! 💸`;

    if (navigator.share) {
      try {
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
        alert("Link copied to clipboard!");
      }
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center min-h-screen overflow-hidden p-4">
      {/* <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div> */}
             <div className="absolute inset-0 z-0">
      <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
       <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
         <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
         <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
      </div>

      <button
        onClick={() => navigate("/dash")}
        className="fixed top-4 left-4 z-50 group"
      >
        <div className="relative p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/20">
          <ArrowLeft className="h-5 w-5 text-white group-hover:text-cyan-400 transition-colors" />
        </div>
      </button>

      <button
        onClick={handleShareProfile}
        className="fixed top-4 right-4 z-50 group"
      >
        <div className="relative p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/20">
          <Share2 className="h-5 w-5 text-white group-hover:text-emerald-400 transition-colors" />
        </div>
      </button>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="relative h-24 bg-gradient-to-r from-blue-600 via-teal-600 to-orange-500 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDM2YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex flex-col items-center">
              <div
                className="relative group cursor-pointer"
                onMouseEnter={() => setIsHoveringPhoto(true)}
                onMouseLeave={() => setIsHoveringPhoto(false)}
              >
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 p-1 shadow-2xl ring-4 ring-slate-900">
                  <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-slate-600" />
                      </div>
                    )}
                  </div>
                </div>

                <label
                  htmlFor="photo-upload"
                  className={`absolute inset-0 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-opacity duration-300 ${isHoveringPhoto ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Camera className="w-8 h-8 text-white" />
                </label>

                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full p-2 shadow-lg">
                  <Upload className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* <p className="text-xs text-slate-400 mt-3 text-center">
                Click to upload photo • Max 5MB • JPG, PNG, WEBP
              </p> */}
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Edit Profile
              </h2>
              <p className="text-slate-400 text-sm">Update your personal information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-5">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:bg-white/10"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      readOnly
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed"
                      placeholder="Email is not editable"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <CreditCard className="w-4 h-4 text-teal-400" />
                    UPI ID
                    <span className="text-xs text-red-400 font-normal">(Required)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="upiId"
                      value={profile.upiId}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 hover:bg-white/10"
                      placeholder="yourname@upi"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/change-password")}
                  className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-1 group"
                >
                  <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  Reset password
                </button>
              </div>

              <button
                type="submit"
                disabled={!profile.upiId || uploading}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${
                  !profile.upiId || uploading
                    ? "bg-slate-700 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>

              {!profile.upiId && (
                <p className="text-xs text-center text-red-400 -mt-2">
                  Please add your UPI ID to save changes
                </p>
              )}
            </form>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Your information is secure and encrypted
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfileEnhanced;
