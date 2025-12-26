import { useState, useEffect } from "react";
import { Menu, X, Zap, ChevronRight, Lock } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsLarge(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300">
      {/* --- Ambient Noise Overlay --- */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* --- LOGO SECTOR --- */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 group-hover:border-indigo-500/50 shadow-inner overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Zap
                className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors"
                fill="currentColor"
                fillOpacity={0.2}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-100 transition-colors">
                FairFare
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                System v1.0
              </span>
            </div>
          </a>

          {/* --- DESKTOP COMMAND CENTER --- */}
          {isLarge && <div className="space-x-1 lg-space-x-1 md:flex items-center gap-8">
            {/* Links */}
            <div className="flex items-center gap-6">
              <a
                href="/features"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
              </a>
              <a
                href="/#doc"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
              >
                Documentation
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fuchsia-500 transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(217,70,239,0.8)]"></span>
              </a>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-white/10"></div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <Lock
                  size={14}
                  className="group-hover:text-indigo-400 transition-colors"
                />
                Login
              </a>

              <a
                href="/signup"
                className="group relative px-5 py-2.5 bg-zinc-100 text-zinc-950 font-bold text-sm rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </a>
            </div>
          </div>}

          {/* --- MOBILE MENU TRIGGER --- */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-lg border transition-all duration-300 ${
                isMobileMenuOpen
                  ? "bg-zinc-900 border-indigo-500/50 text-white"
                  : "bg-transparent border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU DRAWER --- */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-zinc-950/95 border-b border-white/10 backdrop-blur-xl transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 space-y-2">
          <a
            href="/features"
            className="block px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="/#doc"
            className="block px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Documentation
          </a>

          <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href="/login"
              className="px-4 py-3 rounded-xl text-center text-sm font-bold text-zinc-300 bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-4 py-3 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 shadow-lg shadow-indigo-900/20 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Decorative bottom line for mobile menu */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      </div>

      {/* --- DECORATIVE BOTTOM GLOW --- */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>
    </nav>
  );
};

export default Navbar;
