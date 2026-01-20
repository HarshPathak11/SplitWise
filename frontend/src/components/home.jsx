import { useState, useEffect } from "react";
import ComparisonTable from "./check";
import Footer from "./footer";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import Documentation from "./documentation";
import FAQ from "./FaqSection";
import Navbar from "./Navbar";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  // const [showInstallButton, setShowInstallButton] = useState(false);
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

  // return (
  //   <div className="min-h-screen bg-[#000000] flex flex-col items-center relative overflow-hidden">
  //     {/* PWA Install Modal */}
  //     {showPrompt && (
  //       <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
  //         <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 w-11/12 max-w-sm text-center">
  //           <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400 mb-4">
  //             Install FairFare App
  //           </h2>
  //           <p className="text-gray-400 mb-6">
  //             Add FairFare to your home screen for quick access.
  //           </p>
  //           <div className="flex justify-center gap-4">
  //             <button
  //               onClick={handleNoThanks}
  //               className="bg-transparent border text-white border-white/30 py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-300"
  //             >
  //               No Thanks
  //             </button>
  //             <button
  //               onClick={handleInstallClick}
  //               className="bg-blue-600/80 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-blue-700/80 transition-all duration-300 border border-blue-400/30"
  //             >
  //               Install
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     )}

  //     {/* Detailed Installation Steps Popup */}
  //     {showInstallSteps && (
  //       <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
  //         <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
  //           <div className="flex justify-between items-center mb-4">
  //             <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
  //               Install FairFare App
  //             </h2>
  //             <button
  //               onClick={() => setShowInstallSteps(false)}
  //               className="text-gray-400 hover:text-white text-2xl font-bold"
  //             >
  //               ×
  //             </button>
  //           </div>

  //           <p className="text-gray-300 mb-6 text-center">
  //             Follow these steps to add FairFare to your home screen:
  //           </p>

  //           {/* iOS Instructions */}
  //           {isIOS && (
  //             <div className="space-y-4">
  //               <div className="flex items-start space-x-3">
  //                 <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
  //                   1
  //                 </div>
  //                 <div className="text-gray-300">
  //                   <p className="font-medium">Tap the Share button</p>
  //                   <p className="text-sm text-gray-400">
  //                     Look for the share icon at the bottom of your Safari
  //                     browser
  //                   </p>
  //                 </div>
  //               </div>

  //               <div className="flex items-start space-x-3">
  //                 <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
  //                   2
  //                 </div>
  //                 <div className="text-gray-300">
  //                   <p className="font-medium">
  //                     Scroll down and tap "Add to Home Screen"
  //                   </p>
  //                   <p className="text-sm text-gray-400">
  //                     You'll see this option in the share menu
  //                   </p>
  //                 </div>
  //               </div>

  //               <div className="flex items-start space-x-3">
  //                 <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
  //                   3
  //                 </div>
  //                 <div className="text-gray-300">
  //                   <p className="font-medium">Tap "Add" to confirm</p>
  //                   <p className="text-sm text-gray-400">
  //                     The app will be added to your home screen
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
  //           )}

  //           {/* Android Instructions */}
  //           {!isIOS && /Android/.test(navigator.userAgent) && (
  //             <div className="space-y-4">
  //               <div className="flex items-start space-x-3">
  //                 <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
  //                   1
  //                 </div>
  //                 <div className="text-gray-300">
  //                   <p className="font-medium">
  //                     Tap the menu button (three dots)
  //                   </p>
  //                   <p className="text-sm text-gray-400">
  //                     Look for the menu icon in your Chrome browser
  //                   </p>
  //                 </div>
  //               </div>

  //               <div className="flex items-start space-x-3">
  //                 <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
  //                   2
  //                 </div>
  //                 <div className="text-gray-300">
  //                   <p className="font-medium">
  //                     Select "Add to Home screen" or "Install app"
  //                   </p>
  //                   <p className="text-sm text-gray-400">
  //                     This option should be visible in the menu
  //                   </p>
  //                 </div>
  //               </div>

  //               <div className="flex items-start space-x-3">
  //                 <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
  //                   3
  //                 </div>
  //                 <div className="text-gray-300">
  //                   <p className="font-medium">
  //                     Tap "Add" or "Install" to confirm
  //                   </p>
  //                   <p className="text-sm text-gray-400">
  //                     The app will be installed on your device
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
  //           )}

  //           {/* Generic Instructions for other devices */}
  //           {!isIOS && !/Android/.test(navigator.userAgent) && (
  //             <div className="space-y-4">
  //               <div className="flex items-start space-x-3">
  //                 <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
  //                   1
  //                 </div>
  //                 <div className="text-gray-300">
  //                   <p className="font-medium">
  //                     Look for the install button in your browser
  //                   </p>
  //                   <p className="text-sm text-gray-400">
  //                     Most modern browsers show an install prompt
  //                   </p>
  //                 </div>
  //               </div>

  //               <div className="flex items-start space-x-3">
  //                 <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
  //                   2
  //                 </div>
  //                 <div className="text-gray-300">
  //                   <p className="font-medium">Click "Install" when prompted</p>
  //                   <p className="text-sm text-gray-400">
  //                     Follow your browser's installation process
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
  //           )}

  //           <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
  //             <p className="text-blue-200 text-sm text-center">
  //               💡 <strong>Tip:</strong> Once installed, you can access FairFare
  //               directly from your home screen like any other app!
  //             </p>
  //           </div>

  //           <div className="flex justify-center gap-4 mt-6">
  //             <button
  //               onClick={() => setShowInstallSteps(false)}
  //               className="bg-transparent border text-white border-white/30 py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-300"
  //             >
  //               Got it!
  //             </button>
  //             {deferredPrompt && (
  //               <button
  //                 onClick={handleDirectInstall}
  //                 className="bg-blue-600/80 backdrop-blur-sm text-white py-2 px-6 rounded-lg hover:bg-blue-700/80 transition-all duration-300 border border-blue-400/30"
  //               >
  //                 Try Direct Install
  //               </button>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     )}

  //     {/* Bottom-right Install Button */}
  //     {!isPWA && (
  //       <button
  //         onClick={handleInstallClick}
  //         className="bg-blue-600/80 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-blue-700/80 transition-all duration-300 border border-blue-400/30"
  //         style={{
  //           position: "fixed",
  //           bottom: "20px",
  //           right: "20px",
  //           padding: "12px 16px",
  //           border: "none",
  //           borderRadius: "8px",
  //           boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  //           zIndex: 1000,
  //         }}
  //       >
  //         Install App
  //       </button>
  //     )}

  //     {/* Animated background elements */}
  //     <div className="absolute inset-0 overflow-hidden">
  //       <div className="absolute -inset-[10px] opacity-30">
  //         <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
  //         <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
  //         <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
  //         <div className="absolute -bottom-8 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
  //       </div>
  //     </div>
  //     <Navbar />

  //     {/* Main Content */}

  //     <div className="flex flex-col-reverse md:flex-row items-center justify-center lg:space-x-10 px-11 lg:px-10 py-20 relative z-10">
  //       <div>
  //         <img src="/save.svg" className="drop-shadow-2xl" alt="Illustration" />
  //       </div>

  //       <div className="lg:w-1/2 text-center lg:text-left backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
  //         <p>
  //           Some content on this page might be from previous versions and not
  //           upto date
  //         </p>
  //         <h1 className="text-4xl lg:text-5xl font-bold  p-5 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400 hover:animate-text">
  //           Split it <br /> Its easy this way.
  //         </h1>
  //         <p className="text-gray-400 mb-8">
  //           Why use Splitwise if we can do the same job but for free.
  //         </p>
  //         <div className="flex justify-center lg:justify-start space-x-4">
  //           <Link to="/login">
  //             <button className="bg-blue-600/80 backdrop-blur-sm text-white py-3 px-6 rounded-lg hover:bg-blue-700/80 transition-all duration-300 hover:scale-105 border border-blue-400/30">
  //               Login
  //             </button>
  //           </Link>
  //           <button
  //             className="bg-transparent border text-white border-white/30 py-3 px-6 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
  //             onClick={() => {
  //               const comparisonTable =
  //                 document.getElementById("comparison-table");
  //               if (comparisonTable) {
  //                 comparisonTable.scrollIntoView({ behavior: "smooth" });
  //               }
  //             }}
  //           >
  //             Learn More
  //           </button>
  //         </div>
  //         {/* </div> */}
  //         {/* </SpotlightCard> */}
  //       </div>
  //     </div>

  //     <div id="comparison-table">
  //       <ComparisonTable />
  //     </div>

  //     <div id="doc">
  //       <Documentation />
  //     </div>

  //     {/* Testimonials Section */}
  //     <section className="w-full backdrop-blur-lg bg-[#000000] bg-[url('../../div.png')] bg-cover bg-center py-20 relative z-10">
  //       <div className="container mx-auto px-4">
  //         <div className="flex flex-wrap justify-center text-center mb-24">
  //           <div className="w-full lg:w-6/12 px-4">
  //             <h2 className="text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400 hover:animate-pulse">
  //               What Our Users Say
  //             </h2>
  //             <p className="text-lg leading-relaxed m-4 text-gray-400">
  //               Hear from our satisfied users
  //             </p>
  //           </div>
  //         </div>
  //         <div className="flex flex-wrap">
  //           {/* Testimonial Cards */}
  //           <div className="w-full md:w-4/12 px-4 text-center">
  //             <div className="relative flex flex-col min-w-0 break-words backdrop-blur-lg bg-white/5 w-full mb-8 shadow-lg rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:animate-float">
  //               <div className="px-4 py-5 flex-auto">
  //                 <p className="mt-2 mb-4 text-white">
  //                   &quot;FairFare makes managing expenses with friends so easy!
  //                   The interface is clean, and splitting bills has never been
  //                   this hassle-free.&quot;
  //                 </p>
  //                 <h6 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
  //                   - Nico Robin
  //                 </h6>
  //               </div>
  //             </div>
  //           </div>

  //           <div className="w-full md:w-4/12 px-4 text-center">
  //             <div className="relative flex flex-col min-w-0 break-words backdrop-blur-lg bg-white/5 w-full mb-8 shadow-lg rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:animate-float">
  //               <div className="px-4 py-5 flex-auto">
  //                 <p className="mt-2 mb-4 text-white">
  //                   &quot;I love how intuitive and fast FairFare is. No more
  //                   awkward conversations about who owes what—this app does it
  //                   all!&quot;
  //                 </p>
  //                 <h6 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
  //                   - Satoru Gojo
  //                 </h6>
  //               </div>
  //             </div>
  //           </div>

  //           <div className="w-full md:w-4/12 px-4 text-center">
  //             <div className="relative flex flex-col min-w-0 break-words backdrop-blur-lg bg-white/5 w-full mb-8 shadow-lg rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:animate-float">
  //               <div className="px-4 py-5 flex-auto">
  //                 <p className="mt-2 mb-4 text-white">
  //                   &quot;FairFare is a lifesaver for group trips! Tracking
  //                   expenses and settling up is super simple. Highly recommend
  //                   it!&quot;
  //                 </p>
  //                 <h6 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
  //                   - Naruto Uzumaki
  //                 </h6>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     <section className="w-full bg-[#000000]  relative z-10">
  //       <FAQ />
  //     </section>

  //     {/* Add the animation keyframes */}
  //     <style>{`
  //       @keyframes blob {
  //         0% {
  //           transform: translate(0px, 0px) scale(1);
  //         }
  //         33% {
  //           transform: translate(30px, -50px) scale(1.1);
  //         }
  //         66% {
  //           transform: translate(-20px, 20px) scale(0.9);
  //         }
  //         100% {
  //           transform: translate(0px, 0px) scale(1);
  //         }
  //       }

  //       @keyframes float {
  //         0% {
  //           transform: translateY(0px);
  //         }
  //         50% {
  //           transform: translateY(-10px);
  //         }
  //         100% {
  //           transform: translateY(0px);
  //         }
  //       }

  //       .animate-blob {
  //         animation: blob 7s infinite;
  //       }

  //       .animate-float {
  //         animation: float 3s ease-in-out infinite;
  //       }

  //       .animation-delay-2000 {
  //         animation-delay: 2s;
  //       }

  //       .animation-delay-4000 {
  //         animation-delay: 4s;
  //       }

  //       .hover\\:animate-text:hover {
  //         animation: text-flicker 1.5s infinite;
  //       }

  //       @keyframes text-flicker {
  //         0%,
  //         100% {
  //           opacity: 1;
  //         }
  //         50% {
  //           opacity: 0.5;
  //         }
  //       }
  //     `}</style>

  //     <Footer />
  //   </div>
  // );

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
