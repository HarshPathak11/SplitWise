
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { authFetch } from "../utils/authFetch";
import AvatarSelector from "./AvatarSelector";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SetupProfile = () => {
    const [loading, setLoading] = useState(false);
    const [gender, setGender] = useState("");
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const userId = Cookies.get("id");

    const handleAvatarSelect = async (avatarPath) => {
        try {
            const response = await fetch(avatarPath);
            const blob = await response.blob();
            const file = new File([blob], "avatar.jpeg", { type: "image/jpeg" });

            setFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target?.result);
            reader.readAsDataURL(file);
            toast.success("Avatar selected!");
        } catch (error) {
            console.error("Error loading avatar:", error);
            toast.error("Failed to load avatar");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!gender) {
            toast.error("Please select a gender");
            return;
        }
        if (!file) {
            toast.error("Please select an avatar");
            return;
        }

        setLoading(true);
        try {
            // 1. Update Profile Fields (Gender)
            const profileResp = await authFetch(`${API_BASE}/user/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gender }),
            });

            if (!profileResp.ok) throw new Error("Failed to update gender");

            // 2. Upload Avatar
            const formData = new FormData();
            formData.append("profilePhoto", file);
            const photoResp = await authFetch(`${API_BASE}/user/${userId}/photo`, {
                method: "PUT",
                body: formData,
            });

            if (!photoResp.ok) throw new Error("Failed to upload avatar");

            const data = await photoResp.json();
            localStorage.setItem("user", JSON.stringify(data.user));

            toast.success("Profile setup complete!");
            navigate("/profile");

        } catch (error) {
            console.error("Setup error:", error);
            toast.error("Failed to complete setup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Optional: Check if already set up?
        // For now, relies on the user being routed here.
    }, []);

    return (
        <div className="relative bg-zinc-950 flex items-center justify-center min-h-screen overflow-hidden p-4 font-sans selection:bg-indigo-500/30 text-zinc-100">
            {/* Background FX */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome! 👋</h1>
                    <p className="text-zinc-400">Let's set up your profile to get started.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Avatar Preview */}
                    <div className="flex justify-center mb-6">
                        <div className="w-32 h-32 rounded-full bg-zinc-800 border-4 border-zinc-700 overflow-hidden shadow-lg">
                            {preview ? (
                                <img src={preview} alt="Selected Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-2">
                                    No Avatar Selected
                                </div>
                            )}
                        </div>
                    </div>

                    <AvatarSelector
                        gender={gender}
                        setGender={setGender}
                        onSelectAvatar={handleAvatarSelect}
                    />

                    <button
                        type="submit"
                        disabled={loading || !gender || !file}
                        className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all duration-300 ${loading || !gender || !file
                            ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                            : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20"
                            }`}
                    >
                        {loading ? "Setting up..." : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupProfile;
