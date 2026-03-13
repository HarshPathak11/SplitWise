import { useState, useEffect } from "react";
import ComparisonTable from "./check";
import Footer from "./footer";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import Documentation from "./documentation";
import FAQ from "./FaqSection";
import Navbar from "./Navbar";

const handleScrollTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  // const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    handleScrollTop();
  }, []);

  useEffect(() => {
    // Detect iOS device
    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    const checkPWA = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      );
    };

    // Delay the PWA check slightly (important for mobile PWAs)
    const timeoutId = setTimeout(() => {
      const res = checkPWA();
      setIsPWA(res);

      if (res) {
        const userId = Cookies.get("id");
        if (userId) {
          navigate("/dash");
        }
      }
    }, 500); // Try 300–500ms

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInstallClick = async () => {
    // Always show detailed steps popup first when clicking bottom-right button
    setShowInstallSteps(true);
  };

  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
    setShowInstallSteps(false);
  };

  const handleNoThanks = () => {
    setShowPrompt(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans">
      {/* --- BACKGROUND FX LAYER --- */}
      {/* This creates the 'expensive' financing app atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      {/* --- PWA PROMPT MODAL (Premium Glass) --- */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] relative overflow-hidden group">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 text-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-xl mx-auto mb-5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                Install FairFare
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Add to your home screen for the full-screen native experience.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleNoThanks}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium bg-white text-black hover:bg-indigo-50 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAILED INSTALL STEPS (Glass Popup) --- */}
      {showInstallSteps && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex justify-between items-center z-20">
              <h2 className="text-lg font-semibold text-white">
                Installation Guide
              </h2>
              <button
                onClick={() => setShowInstallSteps(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-8">
              <p className="text-slate-400 text-center text-sm">
                Follow these steps to enable the full experience:
              </p>

              {/* Dynamic Instructions based on Logic */}
              <div className="relative pl-8 border-l border-indigo-500/30 space-y-8">
                {isIOS && (
                  <>
                    <div className="relative group">
                      <span className="absolute -left-[41px] bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-slate-900 group-hover:ring-indigo-900 transition-all">
                        1
                      </span>
                      <h3 className="text-white font-medium mb-1">
                        Tap 'Share'
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Tap the share icon{" "}
                        <span className="inline-block bg-slate-800 p-1 rounded">
                          ⎋
                        </span>{" "}
                        at the bottom.
                      </p>
                    </div>
                    <div className="relative group">
                      <span className="absolute -left-[41px] bg-slate-700 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-slate-900 group-hover:ring-slate-600 transition-all">
                        2
                      </span>
                      <h3 className="text-white font-medium mb-1">
                        Add to Home Screen
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Scroll down and select "Add to Home Screen".
                      </p>
                    </div>
                    <div className="relative group">
                      <span className="absolute -left-[41px] bg-slate-700 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-slate-900 group-hover:ring-slate-600 transition-all">
                        3
                      </span>
                      <h3 className="text-white font-medium mb-1">Confirm</h3>
                      <p className="text-slate-400 text-sm">
                        Tap "Add" in the top right corner.
                      </p>
                    </div>
                  </>
                )}

                {!isIOS && /Android/.test(navigator.userAgent) && (
                  <>
                    <div className="relative group">
                      <span className="absolute -left-[41px] bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-slate-900">
                        1
                      </span>
                      <h3 className="text-white font-medium mb-1">Open Menu</h3>
                      <p className="text-slate-400 text-sm">
                        Tap the three dots icon in Chrome.
                      </p>
                    </div>
                    <div className="relative group">
                      <span className="absolute -left-[41px] bg-slate-700 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-slate-900">
                        2
                      </span>
                      <h3 className="text-white font-medium mb-1">
                        Install App
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Select "Install App" or "Add to Home Screen".
                      </p>
                    </div>
                  </>
                )}

                {!isIOS && !/Android/.test(navigator.userAgent) && (
                  <>
                    <div className="relative">
                      <span className="absolute -left-[41px] bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-slate-900">
                        1
                      </span>
                      <h3 className="text-white font-medium mb-1">
                        Check Browser Bar
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Look for the install icon in your address bar.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
                <span className="text-xl">💡</span>
                <p className="text-indigo-200 text-sm">
                  Pro Tip: The app works offline once installed!
                </p>
              </div>

              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setShowInstallSteps(false)}
                  className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white transition-all"
                >
                  Got it
                </button>
                {deferredPrompt && (
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    Try Install
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING BUTTON (Bottom Right) --- */}
      {!isPWA && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-full font-medium shadow-[0_4px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_4px_30px_rgba(79,70,229,0.6)] transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 border border-indigo-400/30 backdrop-blur-md"
        >
          <span>Install App</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10">
        <Navbar />

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
              {/* Illustration Side */}
              <div className="lg:w-1/2 relative animate-fade-in-right [animation-delay:400ms]">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl transform transition-transform duration-500 hover:scale-[1.01] hover:rotate-1">
                    <img
                      src="/save.svg"
                      className="w-full h-auto drop-shadow-2xl rounded-lg"
                      alt="FairFare Dashboard"
                    />

                    {/* Decorative floating card */}
                    <div className="absolute -bottom-6 -left-6 bg-slate-800/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl animate-float hidden md:block">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <span className="text-lg font-bold">✓</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Total Saved</p>
                          <p className="text-sm font-bold text-white">
                            $4,250.00
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="lg:w-1/2 text-center lg:text-left relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium uppercase tracking-wider mb-8 animate-fade-in-up">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  The New Standard
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] mb-6 animate-fade-in-up [animation-delay:100ms]">
                  Split it. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300">
                    It's easy this way.
                  </span>
                </h1>

                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
                  Stop using complex spreadsheets. FairFare brings MNC-grade
                  financial tracking to your social circle. Zero friction. Zero
                  fees.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up [animation-delay:300ms]">
                  <Link to="/login" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-950 font-bold hover:bg-indigo-50 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-1">
                      Login
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      const el = document.getElementById("comparison-table");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/50 text-white font-medium border border-white/10 hover:bg-slate-800 transition-all duration-300 hover:border-white/20 backdrop-blur-sm"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SPACER & COMPONENTS --- */}
        <div
          id="comparison-table"
          className="border-t border-white/5 bg-slate-900/30 backdrop-blur-sm"
        >
          <ComparisonTable />
        </div>

        <div id="doc" className="bg-slate-950">
          <Documentation />
        </div>

        {/* --- TESTIMONIALS (Glossy Cards) --- */}
        <section className="relative py-24 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 mb-6">
                Community Trust
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                See why thousands of users prefer our clean approach.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "FairFare makes managing expenses with friends so easy! The interface is clean, and splitting bills has never been this hassle-free.",
                  author: "Nico Robin",
                },
                {
                  quote:
                    "I love how intuitive and fast FairFare is. No more awkward conversations about who owes what—this app does it all!",
                  author: "Satoru Gojo",
                },
                {
                  quote:
                    "FairFare is a lifesaver for group trips! Tracking expenses and settling up is super simple. Highly recommend it!",
                  author: "Naruto Uzumaki",
                },
              ].map((item, index) => (
                <div key={index} className="group relative">
                  {/* Card Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

                  {/* Card Body */}
                  <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-2">
                    <div className="mb-6 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-indigo-400 text-lg">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-300 mb-8 leading-relaxed flex-grow font-light">
                      "{item.quote}"
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {item.author.charAt(0)}
                      </div>
                      <div>
                        <h6 className="text-white font-semibold">
                          {item.author}
                        </h6>
                        <p className="text-indigo-400/60 text-xs uppercase tracking-wider">
                          Verified User
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 border-t border-white/5">
          <FAQ />
        </section>

        <Footer />
      </div>

      {/* --- ANIMATION STYLES (Embedded) --- */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-in-right { animation: fade-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LandingPage;
