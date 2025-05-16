import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    upiId: "",
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = Cookies.get("id");

    async function getDetails() {
      if (!user && userId) {
        try {
          const response = await axios.get(
            `https://fairfare-0hyl.onrender.com/user/${userId}`
          );
          if (response.status === 200) {
            const fetchedUser = response.data.user;
            setUser(fetchedUser);
            setProfile(fetchedUser);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = Cookies.get("id");
      const response = await axios.put(
        `https://fairfare-0hyl.onrender.com/user/${userId}`,
        profile
      );

      if (response.status === 200) {
        const fetchedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        setUser(fetchedUser);
        setProfile({
          username: fetchedUser.username || "",
          upiId: fetchedUser.upiId || "",
        });

        navigate("/dash");
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div className=" relative bg-[#000000] flex items-center justify-center min-h-screen overflow-hidden">
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
        <button
          onClick={() => navigate("/dash")}
          className="p-3 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
          title="Back to Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white animate-bounce-left"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Share Profile Button */}
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 right-4">
        <button
          onClick={async () => {
            const userId = Cookies.get("id");
            const profileLink = `https://fair-fare-phi.vercel.app/public-profile/${userId}`;
            // const profileLink = `https://a286-2405-201-603c-3806-54f2-bca2-fbc8-598e.ngrok-free.app/public-profile/${userId}`;
            const message = `Hey! 👋

Check out my FairFare profile:

🔗 Add me as a friend using this link:
${profileLink}

📧 Or use my email to add me manually:
https://fair-fare-phi.vercel.app/addFriend

Email:
${user.email}

Let’s split and share smarter with FairFare! 💸`;

            if (navigator.share) {
              try {
                await navigator.clipboard.writeText(user.email);
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
      <path d="M18 8a3 3 0 1 0-2.83-2h-.34l-7.9 4.58a3 3 0 1 0 0 2.84l7.9 4.58h.34A3 3 0 1 0 18 16a2.98 2.98 0 0 0-1.85-.68L9.25 12.5a3.02 3.02 0 0 0 0-.99l6.9-4.02A3 3 0 0 0 18 8z"/>
    </svg>
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

      <form
        onSubmit={handleSubmit}
        action="javascript:void(0);"
        className="bg-[rgba(255,255,255,0.1)] backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-[#00f5ff]">
          Edit Profile
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#00f5ff]">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className="w-full h-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#00f5ff]">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            readOnly
            className="w-full h-full p-2 rounded-lg bg-white/20 border border-white/30 text-white cursor-not-allowed opacity-80"
            placeholder="Email is not editable"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#00f5ff]">
            UPI ID [Mandatory Field]
          </label>
          <input
            type="text"
            name="upiId"
            value={profile.upiId}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your UPI ID"
          />
        </div>
        <div className="text-right mb-4">
          <Link
            to="/change-password"
            className="text-sm text-slate-300 hover:text-blue-300 hover:underline"
          >
            Reset your password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={!profile.upiId}
          className={`w-full p-2 rounded-lg transition
    ${
      !profile.upiId
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-[#00FFA3] to-[#A020F0] hover:from-purple-500 hover:to-[#00FFA3]"
    }
  `}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
