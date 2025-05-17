import React from "react";

const Footer = () => {
  return (
    <footer className="relative bg-transparent py-8 border-t border-white/20">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Three Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Column 1 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <img
              src="./pfp1.jpeg"
              alt="Person 1"
              className="w-24 object-cover"
            />
            <h3 className="text-white font-bold text-lg">Shikhar Singh</h3>
            <p className="text-white/70 text-sm">
              I am an Engineering student currently pursuing B.Tech in CSE
              branch from G.L.Bajaj in Greater Noida .
            </p>
            <div className="flex space-x-4">
              {/* Instagram */}
              <a
                target="_blank"
                href="https://www.instagram.com/shkhr__sngh?igsh=cnkzdWt6cGc1ZXg0"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              {/* GitHub */}
              <a
                target="_blank"
                href="https://github.com/Shkhr278"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                target="_blank"
                href="https://www.linkedin.com/in/shikhar-singh-59610425a/"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <img
              src="./pfp2.jpeg"
              alt="Person 2"
              className="w-24 h-25  object-cover"
            />
            <h3 className="text-white font-bold text-lg">Shubhankar Tiwari</h3>
            <p className="text-white/70 text-sm">
              I am an Engineering student currently pursuing B.Tech in IT branch
              from G.L.Bajaj in Greater Noida .
            </p>
            <div className="flex space-x-4">
              {/* Instagram */}
              <a
                target="_blank"
                href="https://www.instagram.com/shubhankar_tiwari007?igsh=b3BpbXBuY3hjY2cx"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              {/* GitHub */}
              <a
                target="_blank"
                href="https://github.com/ShubhKr7"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                target="_blank"
                href="https://www.linkedin.com/in/shubhankar-tiwari-a15266214?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <img
              src="./pfp3.jpeg"
              alt="Person 3"
              className="w-24 object-cover"
            />
            <h3 className="text-white font-bold text-lg">Harsh Pathak</h3>
            <p className="text-white/70 text-sm">
              I am an Engineering student currently pursuing B.Tech in CSE
              branch from HBTU Kanpur .
            </p>
            <div className="flex space-x-4">
              {/* Instagram */}
              <a
                target="_blank"
                href="#"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              {/* GitHub */}
              <a
                target="_blank"
                href="http://github.com/HarshPathak11"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                target="_blank"
                href="http://linkedin.com/in/harsh-pathak-818163298/"
                className="text-white/70 hover:text-white transform hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="space-y-4 backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
          <p className="text-center text-white/70 text-sm mb-4 leading-relaxed hover:text-white transition-colors duration-300">
            About Us: FairFare simplifies group expenses, making shared cost
            management effortless, transparent, and stress-free for friends and
            groups.
          </p>

          <p className="text-center text-sm bg-clip-text text-transparent bg-gradient-to-r from-white/60 to-white">
            &copy; 2025 FairFare
          </p>
        </div>
      </div>

      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </footer>
  );
};

export default Footer;
