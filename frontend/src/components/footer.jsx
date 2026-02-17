import React, { useState } from "react";
import { Github, Linkedin, Instagram, ArrowUpRight } from "lucide-react";

const Footer = () => {
  // --- UI LOGIC STATE ---
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("idle"); // idle | loading | success

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;

    // Simulate an API call
    setSubscribeStatus("loading");
    setTimeout(() => {
      setSubscribeStatus("success");
      setEmail("");
    }, 1500);
  };

  const team = [
    {
      name: "Shikhar Singh",
      role: "B.Tech CSE • G.L. Bajaj",
      image: "./pfp1.jpeg",
      links: {
        instagram:
          "https://www.instagram.com/shkhr__sngh?igsh=cnkzdWt6cGc1ZXg0",
        github: "https://github.com/Shkhr278",
        linkedin: "https://www.linkedin.com/in/shikhar-singh-59610425a/",
      },
    },
    {
      name: "Shubhankar Tiwari",
      role: "B.Tech IT • G.L. Bajaj",
      image: "./pfp2.jpeg",
      links: {
        instagram:
          "https://www.instagram.com/shubhankar_tiwari007?igsh=b3BpbXBuY3hjY2cx",
        github: "https://github.com/ShubhKr7",
        linkedin:
          "https://www.linkedin.com/in/shubhankar-tiwari-a15266214?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      },
    },
    {
      name: "Harsh Pathak",
      role: "B.Tech CSE • HBTU Kanpur",
      image: "./pfp3.jpeg",
      links: {
        instagram: "#",
        github: "http://github.com/HarshPathak11",
        linkedin: "http://linkedin.com/in/harsh-pathak-818163298/",
      },
    },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-16 lg:gap-24">
          {/* LEFT: Brand & Mission */}
          <div className="lg:w-1/3 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                FairFare
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Simplifying group expenses with transparency and speed. We
                believe financial clarity strengthens friendships.
              </p>
            </div>
          </div>

          {/* RIGHT: The Engineers */}
          <div className="lg:w-2/3">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-8">
              Built by Engineers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {team.map((member, index) => (
                <div
                  key={index}
                  className={`group relative flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/10 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all duration-300 ${
                    index === 2
                      ? "md:col-span-2 md:w-[calc(50%_-_0.75rem)] md:mx-auto"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-indigo-500 transition-colors">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online Dot */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate group-hover:text-indigo-200 transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {member.role}
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a
                      href={member.links.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Github size={16} />
                    </a>
                    <a
                      href={member.links.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    >
                      <Linkedin size={16} />
                    </a>
                    <a
                      href={member.links.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-pink-400/10 rounded-lg transition-colors"
                    >
                      <Instagram size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-20 text-center">
          <p className="text-slate-500 text-xs">
            &copy; 2025 FairFare Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
