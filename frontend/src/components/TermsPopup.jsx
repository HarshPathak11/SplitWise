import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";
import { FaMagic, FaRobot } from "react-icons/fa";

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
                <h4 className="text-purple-300 font-medium mb-1 text-sm">What do you track?</h4>
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
                    You must be 3+ to use FairFare. Keep your login details secret - you are responsible for your account.
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
                By using FairFare, you agree that you are <strong>over 3 years old</strong> and will use the app legally. We provide the platform for tracking expenses "as is", meaning we aren't liable if a third-party payment fails or if data has minor inaccuracies. Basically: <strong>be honest, keep your password safe, and double-check your payments</strong>. We can ban users who violate these rules.
            </p>
        </div>
        <div className="text-center">
            <p className="text-xs text-white/30">Terms last updated recently.</p>
        </div>
    </div>
];

const TermsPopup = ({ isOpen, terms, onAccept }) => {
    // Determine initial active term
    const [activeTermIndex, setActiveTermIndex] = useState(0);
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    // AI Summarization State
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [thinkingText, setThinkingText] = useState("");

    // Make sure we have terms
    const activeTerm = terms && terms.length > 0 ? terms[activeTermIndex] : null;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    // Reset check when switching tabs, BUT only if the new tab is not agreed yet.
    useEffect(() => {
        // If the switched-to term is already agreed, we can auto-check or just ignore the checkbox logic
        setIsChecked(false);
        setShowSummary(false);
        setIsSummarizing(false);
    }, [activeTermIndex]);

    const handleAcceptClick = async () => {
        if (!isChecked || !activeTerm || activeTerm.hasAgreed) return;
        setLoading(true);
        try {
            await onAccept(activeTerm._id);
            // We don't reset index here anymore, we let the user see "Accepted" state
            // or we could auto-advance to next unagreed term?
            // Let's simpler: just mark it done.
        } catch (error) {
            console.error("Error accepting terms:", error);
        } finally {
            setLoading(false);
        }
    };

    // Simulated AI Summary logic
    const handleSummarize = () => {
        setIsSummarizing(true);
        setShowSummary(false);
        let steps = ["Reading...", "Analyzing...", "Summarizing..."];
        let i = 0;
        setThinkingText(steps[0]);
        let interval = setInterval(() => {
            i++;
            if (i < steps.length) setThinkingText(steps[i]);
            else {
                clearInterval(interval);
                setIsSummarizing(false);
                setShowSummary(true);
            }
        }, 800);
    };

    if (!isOpen || !terms || terms.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">

                {/* Header */}
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Terms & Privacy Update</h2>
                        </div>
                        <p className="text-zinc-400 text-sm">
                            Please review and accept the policies below to continue.
                        </p>
                    </div>
                    {!isSummarizing && !showSummary && (
                        <button
                            onClick={handleSummarize}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-full text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-all"
                        >
                            <FaMagic /> Summarize
                        </button>
                    )}
                </div>

                {/* Tabs Navigation */}
                {terms.length > 1 && (
                    <div className="flex border-b border-zinc-800 bg-zinc-900/30">
                        {terms.map((t, idx) => (
                            <button
                                key={t._id}
                                onClick={() => setActiveTermIndex(idx)}
                                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${idx === activeTermIndex
                                    ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                    }`}
                            >
                                {t.type === 'privacy' ? "Privacy Policy" : "Terms & Conditions"}
                                <span className="text-xs opacity-50">v{t.version}</span>
                                {t.hasAgreed && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/30 relative custom-scrollbar text-zinc-300 leading-relaxed term-markdown">
                    {isSummarizing ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                            {/* ... keeping the same loading UI ... */}
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
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3 text-amber-400 mb-2">
                                <FaRobot className="text-xl" />
                                <h3 className="text-lg font-bold">AI Summary</h3>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                <p className="text-white/80 leading-7 text-sm">
                                    This is a new version ({term.version}) of the Terms and Conditions. Please review the changes carefully. Key updates often involve privacy, data usage, or liability clauses.
                                    <br /><br />
                                    <em>(Note: This is a simulated summary for the demo. In production, this would use an LLM API to summarize the actual markdown content above.)</em>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSummary(false)}
                                className="text-sm text-indigo-400 hover:text-indigo-300 underline"
                            >
                                Back to Full Text
                            </button>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            {/* Dynamic Content based on Active Tab */}
                            <ReactMarkdown>{activeTerm ? activeTerm.content : ""}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
                    {!activeTerm?.hasAgreed ? (
                        <>
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => setIsChecked(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border transition-all ${isChecked
                                        ? "bg-indigo-500 border-indigo-500"
                                        : "bg-zinc-800 border-zinc-600 group-hover:border-zinc-500"
                                        }`}>
                                        {isChecked && (
                                            <svg className="w-5 h-5 text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-zinc-400 select-none">
                                    I have read and agree to the <span className="text-white font-medium">
                                        {activeTerm?.type === 'privacy' ? "Privacy Policy" : "Terms & Conditions"} (v{activeTerm?.version})
                                    </span>.
                                </div>
                            </label>

                            <button
                                onClick={handleAcceptClick}
                                disabled={!isChecked || loading}
                                className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${isChecked && !loading
                                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 translate-y-0"
                                    : "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                                    }`}
                            >
                                {loading ? "Accepting..." : `Accept ${activeTerm?.type === 'privacy' ? "Privacy Policy" : "Terms"}`}
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-2 space-y-2">
                            <div className="p-3 bg-emerald-500/10 rounded-full">
                                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="text-emerald-400 font-medium text-sm">You have accepted this document.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Styles for Animation */}
            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
            `}</style>
        </div >
    );
};

TermsPopup.propTypes = {
    isOpen: PropTypes.bool,
    terms: PropTypes.array,
    onAccept: PropTypes.func,
};

export default TermsPopup;
