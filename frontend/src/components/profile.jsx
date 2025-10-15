import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Share2,
  Upload,
  Camera,
  User,
  Mail,
  CreditCard,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ProfileEnhanced = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    upiId: "",
  });
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [username, setUsername] = useState("");
  const controllerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const navigate = useNavigate();
  const userId = Cookies.get("id");

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
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
            if (fetchedUser.profilePhotoUrl)
              setPreview(fetchedUser.profilePhotoUrl);
            localStorage.setItem("user", JSON.stringify(fetchedUser));
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    }

    getDetails();
  }, []);

  // Debounce the username value
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(username.trim());
    }, 300); // 300ms debounce
    return () => clearTimeout(t);
  }, [username]);

  //UseEffect to check username availability using debouncing
  useEffect(() => {
    if (!debouncedQuery) {
      setIsUsernameAvailable(true);
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchSuggestions = async () => {
      setCheckingUsername(true);

      try {
        const url = `${API_BASE}/user/search?username=${encodeURIComponent(
          debouncedQuery
        )}`;
        const res = await axios.get(url, { signal: controller.signal });
        const users = res.data?.users ?? res.data ?? [];

        // 👇 Check if current username is already taken
        const usernameTaken = users.some(
          (u) => u.username === debouncedQuery && u._id !== userId
        );
        setIsUsernameAvailable(!usernameTaken);
      } catch (err) {
        if (!axios.isCancel(err) && err.name !== "CanceledError") {
          console.error("Error fetching suggestions:", err);
        }
        setIsUsernameAvailable(true); // default to true on error
      } finally {
        setCheckingUsername(false);
      }
    };

    fetchSuggestions();

    return () => {
      controller.abort();
      controllerRef.current = null;
    };
  }, [debouncedQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsername(value);
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
    profile.username = profile.username.trim();
    if (!profile.username) {
      toast.error("Username cannot be empty");
      return;
    }
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
        setUsername(fetchedUser.username || "");
        if (fetchedUser.profilePhotoUrl)
          setPreview(fetchedUser.profilePhotoUrl);
        toast.success("Profile updated successfully!");
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
                      <img
                        src={preview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-slate-600" />
                      </div>
                    )}
                  </div>
                </div>

                <label
                  htmlFor="photo-upload"
                  className={`absolute inset-0 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
                    isHoveringPhoto ? "opacity-100" : "opacity-0"
                  }`}
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
              <p className="text-slate-400 text-sm">
                Update your personal information
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-5">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Username
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border ${
                        isUsernameAvailable
                          ? "border-white/10 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                          : "border-red-500 focus:ring-red-500/50"
                      } text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:bg-white/10`}
                      placeholder="Enter your username"
                    />
                    {!isUsernameAvailable && (
                      <p className="text-red-400 text-sm mt-2">
                        Username is already taken
                      </p>
                    )}
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
                    <span className="text-xs text-red-400 font-normal">
                      (Required)
                    </span>
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
                disabled={
                  !profile.upiId ||
                  uploading ||
                  !isUsernameAvailable ||
                  checkingUsername
                }
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${
                  !profile.upiId ||
                  uploading ||
                  !isUsernameAvailable ||
                  checkingUsername
                    ? "bg-slate-700 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
