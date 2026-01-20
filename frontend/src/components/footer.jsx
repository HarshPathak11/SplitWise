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
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
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

            {/* --- FUNCTIONAL NEWSLETTER SECTION --- */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-white mb-2">
                Join the Community
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Stay updated with the latest features.
              </p>

              {subscribeStatus === "success" ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <span className="text-lg">✓</span>
                  <span className="text-sm font-medium">Welcome aboard!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribeStatus === "loading"}
                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  >
                    {subscribeStatus === "loading" ? "..." : "Join"}
                  </button>
                </form>
              )}
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
                  className="group relative flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/10 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all duration-300"
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

              {/* --- FUNCTIONAL JOIN TEAM LINK --- */}
              {/* Now opens Mail client to send email to you */}
              <a
                href="mailto:careers@fairfare.app?subject=I want to join the team!"
                className="flex items-center justify-center gap-3 p-4 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={20} className="text-slate-400" />
                </div>
                <span className="text-slate-500 text-sm font-medium group-hover:text-white transition-colors">
                  Join the team
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            &copy; 2025 FairFare Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                Systems Normal
              </span>
            </div>

            <div className="flex gap-6 text-xs text-slate-500 font-medium">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
