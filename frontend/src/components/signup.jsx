import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import logo from "../../public/newIconV3-192x192.png";
import { FaHome } from "react-icons/fa";
import { FaEye, FaEyeSlash, FaRobot, FaMagic } from "react-icons/fa";
import toast from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PRIVACY_TEMPLATES = [
  // 1. Structured Cards
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="p1">
    <div className="flex items-center gap-3 text-emerald-400 mb-2">
      <FaMagic className="text-xl" />
      <h3 className="text-lg font-bold">AI Summary: Key Highlights</h3>
    </div>
    <div className="space-y-4 text-white/90">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-2">📊 Data We Collect</h4>
        <p className="text-sm text-white/70">
          We collect essential details like Name, Email, UPI ID, and device info to make the app work smoothly.
        </p>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-2">🛡️ How We Use It</h4>
        <p className="text-sm text-white/70">
          Your data is used to track expenses, prevent fraud, and send you important updates. We don't sell your data.
        </p>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-2">🔒 Security & Sharing</h4>
        <p className="text-sm text-white/70">
          We use strong encryption and only share data with necessary service providers (like payment processors).
        </p>
      </div>
    </div>
  </div>,

  // 2. Simple List
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="p2">
    <div className="flex items-center gap-3 text-blue-400 mb-2">
      <FaRobot className="text-xl" />
      <h3 className="text-lg font-bold">AI Breakdown: What to Know</h3>
    </div>
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
      <ul className="space-y-3 text-sm text-white/80">
        <li className="flex gap-3">
          <span className="text-blue-400 font-bold">1.</span>
          <span><strong>Identity:</strong> We need your name, email, and UPI ID to create your profile and handle splits.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-blue-400 font-bold">2.</span>
          <span><strong>Privacy First:</strong> We do NOT sell your personal data to advertisers. Never.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-blue-400 font-bold">3.</span>
          <span><strong>Security:</strong> Your passwords are hashed, and connections are encrypted.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-blue-400 font-bold">4.</span>
          <span><strong>Control:</strong> You can request to delete your account and data at any time.</span>
        </li>
      </ul>
    </div>
  </div>,

  // 3. Q&A Style
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="p3">
    <div className="flex items-center gap-3 text-purple-400 mb-2">
      <FaMagic className="text-xl" />
      <h3 className="text-lg font-bold">AI Insights: Common Questions</h3>
    </div>
    <div className="grid gap-4">
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-purple-300font-medium mb-1 text-sm">What do you track?</h4>
        <p className="text-white/70 text-sm">Mainly your expense entries, groups, and basic profile info to keep your balances accurate.</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-purple-300 font-medium mb-1 text-sm">Is my payment info safe?</h4>
        <p className="text-white/70 text-sm">We don't store raw card details. We use secure third-party gateways for any transaction processing.</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-purple-300 font-medium mb-1 text-sm">Can I leave?</h4>
        <p className="text-white/70 text-sm">Yes. You can delete your account anytime, and we'll remove your personal data.</p>
      </div>
    </div>
  </div>,

  // 4. "The Gist" (Short paragraph)
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="p4">
    <div className="flex items-center gap-3 text-amber-400 mb-2">
      <FaRobot className="text-xl" />
      <h3 className="text-lg font-bold">AI Summary: The Gist</h3>
    </div>
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
      <p className="text-white/80 leading-relaxed text-sm">
        FairFare collects standard user information (Name, Email, UPI) to facilitate expense splitting. We prioritize your privacy by <strong>hashing passwords</strong> and <strong>encrypting data</strong>. We do <em>not</em> sell your data. We only share necessary information with service providers (like cloud hosting) to keep the app running. You retain full rights to your data and can opt-out or delete your account whenever you wish.
      </p>
    </div>
  </div>
];

const TERMS_TEMPLATES = [
  // 1. Structured Cards
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="t1">
    <div className="flex items-center gap-3 text-emerald-400 mb-2">
      <FaMagic className="text-xl" />
      <h3 className="text-lg font-bold">AI Summary: Key Rules</h3>
    </div>
    <div className="space-y-4 text-white/90">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-2">✅ Eligibility & Account</h4>
        <p className="text-sm text-white/70">
          You must be 12+ to use FairFare. Keep your login details secret - you are responsible for your account.
        </p>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-2">💳 Payments</h4>
        <p className="text-sm text-white/70">
          We help track expenses but don't hold money directly. Payments are handled by third-party apps like GPay or Razorpay.
        </p>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-2">⚖️ Liability</h4>
        <p className="text-sm text-white/70">
          The app is provided "as is". We aren't liable for user errors or third-party payment failures.
        </p>
      </div>
    </div>
  </div>,

  // 2. Do's and Don'ts
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="t2">
    <div className="flex items-center gap-3 text-rose-400 mb-2">
      <FaRobot className="text-xl" />
      <h3 className="text-lg font-bold">AI Analysis: Do's & Don'ts</h3>
    </div>
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <h4 className="text-emerald-400 font-bold mb-2 text-sm uppercase">Do's</h4>
        <ul className="text-sm text-white/70 space-y-2 list-disc pl-4">
          <li>Provide accurate information.</li>
          <li>Keep your password safe.</li>
          <li>Verify transaction details before paying.</li>
        </ul>
      </div>
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
        <h4 className="text-rose-400 font-bold mb-2 text-sm uppercase">Don'ts</h4>
        <ul className="text-sm text-white/70 space-y-2 list-disc pl-4">
          <li>Use the app for illegal activities.</li>
          <li>Share your account credentials.</li>
          <li>Upload malicious code or spam.</li>
        </ul>
      </div>
    </div>
  </div>,

  // 3. User Responsibility Focus
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="t3">
    <div className="flex items-center gap-3 text-cyan-400 mb-2">
      <FaMagic className="text-xl" />
      <h3 className="text-lg font-bold">AI Brief: Your Responsibilities</h3>
    </div>
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
      <div>
        <h4 className="flex items-center gap-2 text-white font-medium mb-1">
          <span className="text-cyan-400">01.</span> Account Security
        </h4>
        <p className="text-xs text-white/60 pl-6">You are responsible for any activity that happens under your account. Notify us immediately of unauthorized access.</p>
      </div>
      <div>
        <h4 className="flex items-center gap-2 text-white font-medium mb-1">
          <span className="text-cyan-400">02.</span> Payment Risks
        </h4>
        <p className="text-xs text-white/60 pl-6">FairFare tracks debts but doesn't process the money. You assume the risk for third-party transactions (UPI/Banks).</p>
      </div>
      <div>
        <h4 className="flex items-center gap-2 text-white font-medium mb-1">
          <span className="text-cyan-400">03.</span> Content Ownership
        </h4>
        <p className="text-xs text-white/60 pl-6">You own what you post, but you give us a license to display it to your friends for the app to function.</p>
      </div>
    </div>
  </div>,

  // 4. TL;DR Paragraph
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="t4">
    <div className="flex items-center gap-3 text-orange-400 mb-2">
      <FaRobot className="text-xl" />
      <h3 className="text-lg font-bold">AI Summary: TL;DR</h3>
    </div>
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <p className="text-white/80 leading-7 text-sm">
        By using FairFare, you agree that you are <strong>over 12 years old</strong> and will use the app legally. We provide the platform for tracking expenses "as is", meaning we aren't liable if a third-party payment fails or if data has minor inaccuracies. Basically: <strong>be honest, keep your password safe, and double-check your payments</strong>. We can ban users who violate these rules.
      </p>
    </div>
    <div className="text-center">
      <p className="text-xs text-white/30">Terms last updated recently.</p>
    </div>
  </div>
];

const SignUp = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [thinkingText, setThinkingText] = useState("");
  const [summaryTemplateIndex, setSummaryTemplateIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!activeModal) {
      setIsSummarizing(false);
      setShowSummary(false);
      setThinkingText("");
    }
  }, [activeModal]);

  useEffect(() => {
    let interval;
    if (isSummarizing) {
      const steps = [
        "Reading document...",
        "Analyzing legal clauses...",
        "Extracting key points...",
        "Simplifying language...",
        "Finalizing summary...",
      ];
      let stepIndex = 0;
      setThinkingText(steps[0]);

      interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setThinkingText(steps[stepIndex]);
        } else {
          clearInterval(interval);
          setIsSummarizing(false);
          setShowSummary(true);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isSummarizing]);

  const handleSummarize = () => {
    setIsSummarizing(true);
    setShowSummary(false);
    setSummaryTemplateIndex(Math.floor(Math.random() * 4));
  };

  const handleOtpSend = async () => {
    if (!email || !username || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!agreed) {
      toast.error("Please agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/user/send-otp`,
        // "//http://localhost:8000/user/send-otp",
        {
          email,
          username,
        }
      );

      if (response.status === 200) {
        setOtpSent(response.data.otp);
        setOtpGenerated(response.data.otp);
      }
    } catch (error) {
      if (error.response && error.response.status === 410) {
        toast.error("Email already Taken!");
      } else if (error.response && error.response.status === 400) {
        toast.error("Username already Taken!");
      } else {
        toast.error("Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/user/verify-otp`,
        // "//http://localhost:8000/user/verify-otp",
        {
          email,
          otp,
          otpGenerated,
          password,
          username,
          agreedToTerms: agreed,
        }
      );

      if (response.status === 200) {
        const { id, token } = response.data; // ✅ token expected from backend

        // existing behaviour: keep this
        Cookies.set("id", id, { expires: 7 });

        // ✅ NEW: store JWT in a secure cookie (frontend-readable)
        if (token) {
          Cookies.set("authToken", token, {
            expires: 7,
            secure: true,
            sameSite: "strict",
          });
        }

        navigate("/profile");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("OTP verification failed.");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* --- BACKGROUND: The Digital Aurora --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-fuchsia-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
      </div>

      {/* --- NAVIGATION: Back Button --- */}
      <div className="absolute top-8 left-8 z-50">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
        >
          <FaHome className="text-white/70 group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Home
          </span>
        </button>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-3xl blur-xl opacity-50 pointer-events-none"></div>

        <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl ring-1 ring-white/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-white/10 to-transparent border border-white/10 mb-4 shadow-lg">
              <img
                src={logo}
                alt="FairFare"
                className="w-6 h-6 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Join the future of social finance.
            </p>
          </div>

          <div className="space-y-5">
            {/* Step 1: User Details (Hide if OTP sent to focus on verification, or keep visible disabled) */}
            <div
              className={`space-y-4 transition-all duration-500 ${otpSent
                ? "opacity-50 pointer-events-none grayscale"
                : "opacity-100"
                }`}
            >
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <input
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Privacy Checkbox */}
              <div className="flex items-start gap-3 pt-2 group">
                <div className="relative flex items-center pt-0.5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/10 bg-white/5 transition-all checked:border-indigo-500 checked:bg-indigo-500 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <label
                  htmlFor="terms"
                  className="text-xs text-white/40 cursor-pointer select-none leading-relaxed transition-colors group-hover:text-white/60"
                >
                  By creating an account, I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setActiveModal("privacy")}
                    className="text-white/70 underline decoration-white/20 hover:decoration-white/80 hover:text-white transition-all outline-none"
                  >
                    Privacy Policy
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => setActiveModal("terms")}
                    className="text-white/70 underline decoration-white/20 hover:decoration-white/80 hover:text-white transition-all outline-none"
                  >
                    Terms & Conditions
                  </button>
                  .
                </label>
              </div>
            </div>

            {/* Step 2: OTP Verification (Slide in) */}
            {otpSent && (
              <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-400">
                    Verification Code Sent
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                    Enter OTP
                  </label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    type="text"
                    placeholder="• • • • • •"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] font-mono text-lg placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={otpSent ? handleOtpVerify : handleOtpSend}
              disabled={loading}
              className={`relative w-full overflow-hidden rounded-xl py-4 font-semibold text-sm tracking-wide transition-all duration-300 mt-2
                ${loading
                  ? "bg-white/10 text-white/30 cursor-wait"
                  : otpSent
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    : "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                }`}
            >
              <span className="relative z-10">
                {loading
                  ? "Processing..."
                  : otpSent
                    ? "Verify & Complete"
                    : "Send Verification Code"}
              </span>
            </button>

            {/* Footer */}
            <div className="text-center pt-2">
              <span className="text-white/40 text-sm">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="text-white font-medium hover:underline decoration-white/30 underline-offset-4"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveModal(null)}
          ></div>

          <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white">
                {activeModal === "privacy"
                  ? "Privacy Policy"
                  : "Terms & Conditions"}
              </h2>
              {!isSummarizing && !showSummary && (
                <button
                  onClick={handleSummarize}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-full text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-all mr-6"
                >
                  <FaMagic /> Summarize with AI
                </button>
              )}
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar text-white/80 leading-relaxed space-y-4">
              {isSummarizing ? (
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                    <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/30">
                      <FaRobot className="text-2xl text-white animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    AI Processing
                  </h3>
                  <p className="text-white/50 text-sm animate-pulse">
                    {thinkingText}
                  </p>
                </div>
              ) : showSummary ? (
                <>
                  {activeModal === "privacy" ? (
                    <>
                      {PRIVACY_TEMPLATES[summaryTemplateIndex]}
                      <div className="pt-4 border-t border-white/10">
                        <button
                          onClick={() => setShowSummary(false)}
                          className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                        >
                          View Full Legal Text
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {TERMS_TEMPLATES[summaryTemplateIndex]}
                      <div className="pt-4 border-t border-white/10">
                        <button
                          onClick={() => setShowSummary(false)}
                          className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                        >
                          View Full Legal Text
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : activeModal === "privacy" ? (
                <>
                  <p className="text-white/40 italic text-sm mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
                  <p className="mb-4">
                    FairFare (“we”, “our”, or “us”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your data when you use the FairFare mobile app, website, or related services (collectively, the “Service”).
                  </p>
                  <p className="mb-4">By using FairFare, you consent to the practices described in this Privacy Policy.</p>

                  <div className="space-y-4">
                    <section>
                      <h3 className="font-bold text-white mb-2">1. Information We Collect</h3>
                      <p>We may collect the following types of information:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li><strong>Personal Information:</strong> Name, email address, upi id, Profile picture (if uploaded), Login credentials (hashed passwords)</li>
                        <li><strong>Payment & Transaction Data:</strong> Expense entries, amounts, and payment status, Third-party payment details (via integrated gateways, e.g., Razorpay, Google Pay), Notes or descriptions attached to transactions, transaction date</li>
                        <li><strong>Device & Usage Data:</strong> IP address, device type, operating system, App usage logs, crash reports, analytics, Location data (if you enable location services)</li>
                        <li><strong>Notifications:</strong> FCM (Firebase Cloud Messaging) tokens for push notifications, Preferences for notifications and alerts</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">2. How We Use Your Information</h3>
                      <p>We use your information to:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Provide, maintain, and improve the Service</li>
                        <li>Track and manage expenses and transactions</li>
                        <li>Send notifications, reminders, or updates</li>
                        <li>Prevent fraud, misuse, or illegal activity</li>
                        <li>Analyze usage patterns to improve user experience</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">3. Sharing Your Information</h3>
                      <p>We do not sell or rent your personal information. We may share data in limited cases:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>With service providers who help us operate FairFare (e.g., cloud hosting, payment gateways, analytics providers)</li>
                        <li>For legal reasons if required by law or to protect our rights</li>
                        <li>In a business transfer if FairFare is acquired, merged, or sold</li>
                      </ul>
                      <p className="mt-1">All third-party partners are required to protect your data according to this policy.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">4. Data Security</h3>
                      <p>We implement reasonable security measures to protect your information:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Encrypted storage and communication (HTTPS / TLS)</li>
                        <li>Hashed passwords for accounts</li>
                        <li>Limited internal access to personal data</li>
                      </ul>
                      <p className="mt-1">However, no method of transmission over the Internet or storage is 100% secure. We cannot guarantee absolute security.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">5. Data Retention</h3>
                      <p>We retain your personal information as long as your account is active or as needed to provide the Service. Transaction data may be retained for legal, tax, or auditing purposes. You can request deletion of your account, and we will remove personal data where possible, subject to legal obligations.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">6. Your Rights</h3>
                      <p>Depending on your location, you may have rights to:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Access or download your personal information</li>
                        <li>Correct or update your data</li>
                        <li>Request deletion of your account or information</li>
                        <li>Opt out of marketing communications</li>
                      </ul>
                      <p className="mt-1">To exercise your rights, contact us at <a href="mailto:fairfare007@gmail.com" className="text-indigo-400 hover:underline">fairfare007@gmail.com</a>.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">7. Cookies and Analytics</h3>
                      <p>We use analytics tools to monitor app usage and improve the Service. Cookies or similar technologies may be used on web versions for authentication or user preferences.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">8. Children’s Privacy</h3>
                      <p>FairFare is not intended for children under 12. We do not knowingly collect data from children.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">9. Changes to This Policy</h3>
                      <p>We may update this Privacy Policy from time to time. Changes will be posted with an updated “Last Updated” date. Your continued use of the Service after updates means you accept the revised policy.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">10. Contact Us</h3>
                      <p>For questions or concerns about this Privacy Policy:</p>
                      <p>📩 Email: <a href="mailto:fairfare007@gmail.com" className="text-indigo-400 hover:underline">fairfare007@gmail.com</a></p>
                    </section>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white/40 italic text-sm mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
                  <p className="mb-4">
                    Welcome to FairFare (“we”, “our”, or “us”). These Terms and Conditions (“Terms”) govern your use of the FairFare mobile application, website, and related services (collectively, the “Service”).
                  </p>
                  <p className="mb-4">By accessing or using FairFare, you agree to be bound by these Terms. If you do not agree, please do not use the Service.</p>

                  <div className="space-y-4">
                    <section>
                      <h3 className="font-bold text-white mb-2">1. Eligibility</h3>
                      <p>To use FairFare, you must:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Be at least 12 years old or have parental/guardian consent.</li>
                        <li>Provide accurate and complete information during registration.</li>
                        <li>Use the Service only for lawful purposes.</li>
                      </ul>
                      <p className="mt-1">We reserve the right to suspend or terminate any account that violates these conditions.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">2. Your Account</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        <li>You agree to notify us immediately of any unauthorized access or security breach.</li>
                        <li>We are not liable for any loss or damage arising from your failure to protect your credentials.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">3. Use of Service</h3>
                      <p>FairFare helps users split expenses, track balances, and manage shared payments with friends or groups.</p>
                      <p className="mt-2">You agree not to:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Misuse the Service for fraudulent or illegal purposes.</li>
                        <li>Upload harmful or malicious code.</li>
                        <li>Interfere with the operation or integrity of FairFare.</li>
                      </ul>
                      <p className="mt-1">We reserve the right to limit or disable your access if we suspect misuse.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">4. Payments and Transactions</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>FairFare is primarily a tool for expense tracking and management.</li>
                        <li>FairFare does not hold, transfer, or process money directly unless integrated with authorized third-party payment gateways (e.g., Google Pay, Razorpay, Paytm).</li>
                        <li>Any transactions between users are handled outside the app, or through such third parties.</li>
                        <li>We are not responsible for payment disputes, failed transactions, or losses caused by user error or third-party failures.</li>
                        <li>You agree to verify all transactions and use third-party payment services at your own risk.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">5. Privacy and Data</h3>
                      <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your data. By using FairFare, you consent to our data practices as described in the Privacy Policy.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">6. Content and Ownership</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>All trademarks, logos, and content in FairFare are owned by us or licensed to us.</li>
                        <li>You may not copy, distribute, modify, or create derivative works without our permission.</li>
                        <li>You retain ownership of content you submit, but you grant us a license to use it for operating the Service.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">7. Disclaimer of Warranties</h3>
                      <p>FairFare is provided “as is” and “as available”. We make no guarantees that:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>The Service will always be available, uninterrupted, or error-free.</li>
                        <li>The data shown (balances, transactions, etc.) is always accurate or up to date.</li>
                      </ul>
                      <p className="mt-1">We disclaim all warranties, express or implied, including merchantability or fitness for a particular purpose.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">8. Limitation of Liability</h3>
                      <p>To the maximum extent permitted by law, FairFare and its team are not liable for:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Any indirect, incidental, or consequential damages,</li>
                        <li>Loss of data, reputation, or profits,</li>
                        <li>Errors or inaccuracies in user-entered data,</li>
                        <li>Third-party payment or service issues.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">9. Termination</h3>
                      <p>We may suspend or terminate your access to FairFare at any time, without notice, if:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>You violate these Terms, or</li>
                        <li>We are required by law or regulation.</li>
                      </ul>
                      <p className="mt-1">You may stop using FairFare at any time.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">10. Changes to Terms</h3>
                      <p>We may update these Terms from time to time. When we do, we’ll update the “Last Updated” date above. Your continued use of FairFare after changes means you accept the revised Terms.</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">11. Governing Law</h3>
                      <p>These Terms are governed by the laws of India, without regard to conflict of law principles. Any disputes will be subject to the exclusive jurisdiction of courts in [Your City, India].</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-white mb-2">12. Contact Us</h3>
                      <p>If you have any questions or concerns, please contact us:</p>
                      <p>📩 Email: <a href="mailto:fairfare007@gmail.com" className="text-indigo-400 hover:underline">fairfare007@gmail.com</a></p>
                    </section>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SignUp;
