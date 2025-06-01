import { useState, useEffect } from "react";
import ComparisonTable from "./check";
import Footer from "./footer";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import Documentation from "./documentation";
import FAQ from "./FaqSection";

// FAQItem Component
// const FAQItem = ({ question, answer, isOpen, onClick }) => {
//   return (
//     <div
//       className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
//       onClick={onClick}
//     >
//       <div className="flex justify-between items-center">
//         <h3 className="text-xl font-semibold text-white">{question}</h3>
//         <span
//           className={`text-white transform transition-transform ${
//             isOpen ? "rotate-180" : "rotate-0"
//           }`}
//         >
//           ▼
//         </span>
//       </div>
//       {isOpen && <p className="text-gray-400 mt-4">{answer}</p>}
//     </div>
//   );
// };

const LandingPage = () => {
  const navigate = useNavigate();
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  // const [showInstallButton, setShowInstallButton] = useState(false);
  useEffect(() => {
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
    }

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
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleNoThanks = () => {
    setShowPrompt(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center relative overflow-hidden">
      {/* PWA Install Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 w-11/12 max-w-sm text-center">
            <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400 mb-4">
              Install FairFare?
            </h2>
            <p className="text-gray-400 mb-6">
              Add FairFare to your home screen for quick access.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleNoThanks}
                className="bg-transparent border text-white border-white/30 py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                No Thanks
              </button>
              <button
                onClick={handleInstallClick}
                className="bg-blue-600/80 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-blue-700/80 transition-all duration-300 border border-blue-400/30"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-right Install Button */}
      {!isPWA &&
        <button
          onClick={handleInstallClick}
          className="bg-blue-600/80 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-blue-700/80 transition-all duration-300 border border-blue-400/30"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "12px 16px",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          isPWA: {isPWA} -
          Install App
        </button>
      }

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-8 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-10 py-5 backdrop-blur-lg bg-black/20 border-b border-white/10 z-50">
        <div className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400 hover:animate-pulse">
          FairFare
        </div>
        <div className="flex space-x-6">
          <Link to="/features">
            <button className="bg-blue-600/80 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-blue-700/80 transition-all duration-300 hover:scale-105 border border-blue-400/30">
              Features
            </button>
          </Link>

          <Link to="/signup">
            <button className="bg-blue-600/80 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-blue-700/80 transition-all duration-300 hover:scale-105 border border-blue-400/30">
              SignUp
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-center lg:space-x-10 px-11 lg:px-10 py-20 relative z-10">
        <div>
          <img src="/save.svg" className="drop-shadow-2xl" alt="Illustration" />
        </div>

        <div className="lg:w-1/2 text-center lg:text-left backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <h1 className="text-4xl lg:text-5xl font-bold  p-5 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400 hover:animate-text">
            Split it <br /> Its easy this way.
          </h1>
          <p className="text-gray-400 mb-8">
            Why use Splitwise if we can do the same job but for free.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4">
            <Link to="/login">
              <button className="bg-blue-600/80 backdrop-blur-sm text-white py-3 px-6 rounded-lg hover:bg-blue-700/80 transition-all duration-300 hover:scale-105 border border-blue-400/30">
                Login
              </button>
            </Link>
            <button
              className="bg-transparent border text-white border-white/30 py-3 px-6 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
              onClick={() => {
                const comparisonTable =
                  document.getElementById("comparison-table");
                if (comparisonTable) {
                  comparisonTable.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      <div id="comparison-table">
        <ComparisonTable />
      </div>

      <div id="documentation-section">
        <Documentation />
      </div>

      {/* Testimonials Section */}
      <section className="w-full backdrop-blur-lg bg-[#000000] bg-[url('../../div.png')] bg-cover bg-center py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center text-center mb-24">
            <div className="w-full lg:w-6/12 px-4">
              <h2 className="text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400 hover:animate-pulse">
                What Our Users Say
              </h2>
              <p className="text-lg leading-relaxed m-4 text-gray-400">
                Hear from our satisfied users
              </p>
            </div>
          </div>
          <div className="flex flex-wrap">
            {/* Testimonial Cards */}
            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words backdrop-blur-lg bg-white/5 w-full mb-8 shadow-lg rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:animate-float">
                <div className="px-4 py-5 flex-auto">
                  <p className="mt-2 mb-4 text-white">
                    &quot;FairFare makes managing expenses with friends so easy!
                    The interface is clean, and splitting bills has never been
                    this hassle-free.&quot;
                  </p>
                  <h6 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                    - Nico Robin
                  </h6>
                </div>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words backdrop-blur-lg bg-white/5 w-full mb-8 shadow-lg rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:animate-float">
                <div className="px-4 py-5 flex-auto">
                  <p className="mt-2 mb-4 text-white">
                    &quot;I love how intuitive and fast FairFare is. No more
                    awkward conversations about who owes what—this app does it
                    all!&quot;
                  </p>
                  <h6 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                    - Satoru Gojo
                  </h6>
                </div>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words backdrop-blur-lg bg-white/5 w-full mb-8 shadow-lg rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:animate-float">
                <div className="px-4 py-5 flex-auto">
                  <p className="mt-2 mb-4 text-white">
                    &quot;FairFare is a lifesaver for group trips! Tracking
                    expenses and settling up is super simple. Highly recommend
                    it!&quot;
                  </p>
                  <h6 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                    - Naruto Uzumaki
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#000000]  relative z-10">
        <FAQ />
      </section>

      {/* Add the animation keyframes */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .hover\\:animate-text:hover {
          animation: text-flicker 1.5s infinite;
        }

        @keyframes text-flicker {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default LandingPage;
