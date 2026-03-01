
import React from "react";
import m1 from "../assets/avatars/Male/1.jpeg";
import m2 from "../assets/avatars/Male/2.jpeg";
import m3 from "../assets/avatars/Male/3.jpeg";
import m4 from "../assets/avatars/Male/4.jpeg";
import m5 from "../assets/avatars/Male/5.jpeg";

import f1 from "../assets/avatars/Female/1.jpeg";
import f2 from "../assets/avatars/Female/2.jpeg";
import f3 from "../assets/avatars/Female/3.jpeg";
import f4 from "../assets/avatars/Female/4.jpeg";

const AvatarSelector = ({ gender, setGender, onSelectAvatar }) => {
  // Each avatar has a `src` (Vite-processed for display) and a `publicPath`
  // (served from /public, used to save directly as profilePhotoUrl without Cloudinary)
  const maleAvatars = [
    { src: m1, publicPath: "/Avatars/Male/1.jpeg" },
    { src: m2, publicPath: "/Avatars/Male/2.jpeg" },
    { src: m3, publicPath: "/Avatars/Male/3.jpeg" },
    { src: m4, publicPath: "/Avatars/Male/4.jpeg" },
    { src: m5, publicPath: "/Avatars/Male/5.jpeg" },
  ];
  const femaleAvatars = [
    { src: f1, publicPath: "/Avatars/Female/1.jpeg" },
    { src: f2, publicPath: "/Avatars/Female/2.jpeg" },
    { src: f3, publicPath: "/Avatars/Female/3.jpeg" },
    { src: f4, publicPath: "/Avatars/Female/4.jpeg" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Gender Selection */}
      <div className="flex flex-col items-center gap-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Gender
        </label>
        <div className="flex p-1 bg-zinc-900/60 rounded-xl border border-white/5">
          {["Male", "Female", "Do not disclose"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                (gender === g || (!gender && g === "Do not disclose"))
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mt-2">
        Choose a Default Avatar
      </h3>

      {/* Avatar Grid */}
      <div className="flex flex-wrap justify-center gap-4 py-2">

        {(gender === "Male" ||
          gender === "Do not disclose" ||
          !gender) &&
          maleAvatars.map((avatar, i) => (
            <button
              key={`male-${i}`}
              type="button"
              onClick={() => onSelectAvatar(avatar.src, avatar.publicPath)}
              className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-500 hover:scale-110 transition-all duration-300 group"
            >
              <img
                src={avatar.src}
                alt={`Male Avatar ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </button>
          ))}

        {(gender === "Female" ||
          gender === "Do not disclose" ||
          !gender) &&
          femaleAvatars.map((avatar, i) => (
            <button
              key={`female-${i}`}
              type="button"
              onClick={() => onSelectAvatar(avatar.src, avatar.publicPath)}
              className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-transparent hover:border-fuchsia-500 hover:scale-110 transition-all duration-300 group"
            >
              <img
                src={avatar.src}
                alt={`Female Avatar ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
