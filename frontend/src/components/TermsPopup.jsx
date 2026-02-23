import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";
import { FaMagic, FaRobot } from "react-icons/fa";

const PRIVACY_TEMPLATES = [
    // Template 1 (Short Version)
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="p1">
        <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <FaMagic className="text-xl" />
            <h3 className="text-lg font-bold">AI Summary: Short Version</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/80 leading-7 text-sm">
                FairFare collects basic personal information such as your name, email, UPI ID, and expense-related data to provide and improve its services. Device and usage information may also be collected for analytics and performance monitoring. Your data is used to manage transactions, send notifications, prevent misuse, and enhance user experience. FairFare does not sell personal information and only shares data with trusted service providers or when legally required. Security measures such as encryption and password protection are implemented, although absolute security cannot be guaranteed. Users may request access, correction, or deletion of their data by contacting support.
            </p>
        </div>
    </div>,

    // Template 2 (User-Friendly Version)
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="p2">
        <div className="flex items-center gap-3 text-blue-400 mb-2">
            <FaRobot className="text-xl" />
            <h3 className="text-lg font-bold">AI Summary: User-Friendly Version</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/80 leading-7 text-sm">
                FairFare gathers only the information necessary to help users track and split expenses effectively. This includes account details, transaction records, and limited technical data like device information and app usage. The information is used to operate the platform, send reminders, and improve functionality. Personal data is never sold and is shared only with essential service partners or when required by law. Data is stored securely and retained only as long as necessary. Users have the right to access, update, or request deletion of their information at any time.
            </p>
        </div>
    </div>,

    // Template 3 (Compact Legal Version)
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="p3">
        <div className="flex items-center gap-3 text-purple-400 mb-2">
            <FaMagic className="text-xl" />
            <h3 className="text-lg font-bold">AI Summary: Compact Legal Version</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/80 leading-7 text-sm">
                FairFare collects personal, transactional, and technical data to deliver and maintain its expense-management services. Information is processed for service functionality, communication, fraud prevention, and analytics. Data may be shared with authorized service providers or legal authorities when necessary but is never sold. Reasonable security safeguards are applied, and information is retained only for operational or legal purposes. Users may exercise rights relating to access, correction, or deletion of their personal data by contacting FairFare.
            </p>
        </div>
    </div>
];

const TERMS_TEMPLATES = [
    // Template 1 (Short Version)
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="t1">
        <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <FaMagic className="text-xl" />
            <h3 className="text-lg font-bold">AI Summary: Short Version</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/80 leading-7 text-sm">
                By using FairFare, users agree to follow the platform’s rules and use the service only for lawful purposes. Users are responsible for maintaining account security and ensuring accurate information. FairFare provides tools for tracking and splitting expenses but does not directly process payments. The service is provided as is, without guarantees of uninterrupted operation or absolute accuracy. FairFare is not liable for payment disputes, user errors, or third-party service failures.
            </p>
        </div>
    </div>,

    // Template 2 (User-Friendly Version)
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="t2">
        <div className="flex items-center gap-3 text-rose-400 mb-2">
            <FaRobot className="text-xl" />
            <h3 className="text-lg font-bold">AI Summary: User-Friendly Version</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/80 leading-7 text-sm">
                FairFare allows users to manage shared expenses and track balances with friends or groups. Users must be eligible to use the service, protect their account credentials, and avoid misuse or illegal activity. Payments between users are handled externally or through third-party services, and FairFare is not responsible for transaction disputes. The platform may suspend accounts that violate its rules. Continued use of the service means acceptance of any updated terms.
            </p>
        </div>
    </div>,

    // Template 3 (Compact Legal Version)
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" key="t3">
        <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <FaMagic className="text-xl" />
            <h3 className="text-lg font-bold">AI Summary: Compact Legal Version</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/80 leading-7 text-sm">
                These Terms govern access to and use of FairFare services. Users must comply with eligibility requirements, maintain account security, and use the platform lawfully. FairFare functions as an expense-tracking tool and does not assume responsibility for external payment transactions. The service is provided without warranties, and liability is limited to the extent permitted by law. FairFare may suspend or terminate access for violations, and all disputes are governed by Indian law under the jurisdiction of New Delhi courts.
            </p>
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
    const [summaryIndex, setSummaryIndex] = useState(0);

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
            
            // Auto-advance to the next unagreed document
            const nextIndex = terms.findIndex((t, index) => index !== activeTermIndex && !t.hasAgreed);
            if (nextIndex !== -1) {
                setActiveTermIndex(nextIndex);
            }
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
        setSummaryIndex(Math.floor(Math.random() * 3));
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
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
                            {activeTerm?.type === 'privacy' 
                                ? PRIVACY_TEMPLATES[summaryIndex] 
                                : TERMS_TEMPLATES[summaryIndex]
                            }
                            <button
                                onClick={() => setShowSummary(false)}
                                className="mt-6 text-sm text-indigo-400 hover:text-indigo-300 underline self-start"
                            >
                                Back to Full Text
                            </button>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            {/* Dynamic Content based on Active Tab */}
                            {activeTerm?.updatedAt && (
                                <div className="text-xs text-zinc-400 mb-6 pb-4 border-b border-zinc-800/50">
                                    Last updated: {new Date(activeTerm.updatedAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            )}
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
                                {loading ? "Accepting..." : `Accept ${activeTerm?.type === 'privacy' ? "Privacy Policy" : "Terms & Conditions"}`}
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
