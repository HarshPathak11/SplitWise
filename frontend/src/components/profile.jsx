import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Share2,
  User,
  Camera,
  Upload,
  Lock,
  Mail,
  CreditCard,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { authFetch } from "../utils/authFetch";
import api from "../utils/api";

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

  useEffect(() => {
    console.log("userId",userId);

    async function getDetails() {
      if (!user && userId) {
        try {
          const response = await authFetch(`${API_BASE}/user/${userId}`);
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
        const res = await api.get(url, { signal: controller.signal });
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
    return authFetch(`${API_BASE}/user/${userId}`, {
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
      const resp = await authFetch(`${API_BASE}/user/${userId}/photo`, {
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
    <div className="relative bg-zinc-950 flex items-center justify-center min-h-screen overflow-hidden p-2 font-sans selection:bg-indigo-500/30 text-zinc-100">
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* --- NAVIGATION --- */}
      <button
        onClick={() => navigate("/dash")}
        className="fixed top-6 left-6 z-50 group"
      >
        <div className="relative p-3 rounded-full bg-zinc-900/50 backdrop-blur-md border border-white/10 shadow-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300">
          <ArrowLeft className="h-5 w-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
        </div>
      </button>

      <button
        onClick={handleShareProfile}
        className="fixed top-6 right-6 z-50 group"
      >
        <div className="relative p-3 rounded-full bg-zinc-900/50 backdrop-blur-md border border-white/10 shadow-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300">
          <Share2 className="h-5 w-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
        </div>
      </button>

      {/* --- MAIN CARD --- */}
      <div className="relative pt-6 px-2 z-10 w-full max-w-2xl">
        <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden relative">
          {/* --- BANNER --- */}
          <div className="relative h-40 bg-gradient-to-br from-slate-800 via-slate-900 to-black overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            {/* Subtle Industrial Gradient instead of Gold */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent"></div>

            {/* Status Badge in Corner */}
            <div className="absolute top-6 right-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                Premium Member
              </span>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8">
            {/* --- AVATAR SECTION --- */}
            <div className="relative -mt-20 mb-8 flex flex-col items-center">
              <div
                className="relative group cursor-pointer"
                onMouseEnter={() => setIsHoveringPhoto(true)}
                onMouseLeave={() => setIsHoveringPhoto(false)}
              >
                {/* Glowing Ring Effect */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative w-36 h-36 rounded-full p-[3px] bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-700 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden border-4 border-slate-900 relative">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <User className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}

                    {/* Overlay for upload */}
                    <div
                      className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-all duration-300 ${
                        isHoveringPhoto
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-90"
                      }`}
                    >
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-[10px] text-white/80 font-medium tracking-wide uppercase">
                        Change
                      </span>
                    </div>
                  </div>
                </div>

                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Floating Action Button */}
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-1 right-1 bg-zinc-100 text-zinc-950 rounded-full p-2.5 shadow-lg shadow-black/50 cursor-pointer hover:bg-white hover:scale-105 transition-all"
                >
                  <Upload className="w-4 h-4" />
                </label>
              </div>
            </div>

            {/* --- HEADER TEXT --- */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                {profile.username || "User Profile"}
              </h2>
              <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
                Manage your personal identity and preferences
              </p>
            </div>

            {/* --- FORM --- */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="group space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                  Display Name
                </label>
                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-zinc-600 group-focus-within:text-zinc-100 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 bg-zinc-900/40 border ${
                      isUsernameAvailable
                        ? "border-white/5 focus:border-indigo-500/50"
                        : "border-red-500/30"
                    } rounded-xl text-white placeholder-zinc-700 focus:bg-zinc-900/80 focus:outline-none transition-all shadow-inner`}
                    placeholder="Choose a unique handle"
                  />
                  {!isUsernameAvailable && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 text-xs font-medium bg-red-500/10 px-2 py-1 rounded">
                      Taken
                    </div>
                  )}
                </div>
              </div>

              {/* Email Field (Read Only) */}
              <div className="group space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 flex justify-between">
                  <span>Digital ID</span>
                </label>
                <div className="relative opacity-60">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-600" />
                  </div>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="block w-full pl-12 pr-10 py-4 bg-zinc-900/20 border border-zinc-800 rounded-xl text-zinc-400 font-mono text-sm cursor-default focus:outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-700" />
                  </div>
                </div>
              </div>

              {/* UPI Field */}
              <div className="group space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Payment Handle
                </label>
                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-zinc-600 group-focus-within:text-zinc-100 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="upiId"
                    value={profile.upiId}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-zinc-900/40 border border-white/5 rounded-xl text-white placeholder-zinc-700 focus:border-indigo-500/50 focus:bg-zinc-900/80 focus:outline-none transition-all shadow-inner"
                    placeholder="username@bank"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={
                    !profile.upiId ||
                    uploading ||
                    !isUsernameAvailable ||
                    checkingUsername
                  }
                  className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-[0.98] ${
                    !profile.upiId || uploading
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5"
                      : "bg-indigo-400/70 text-zinc-950 hover:bg-white hover:shadow-zinc-500/10"
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    "Update Profile"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/change-password")}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-colors text-center"
                >
                  Change Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEnhanced;
