import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Receipt, CheckCircle, Search, Sparkles, Wand2, Loader2, Mic, MicOff, Users, Wallet, ChevronRight, ArrowLeft } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

const QuickAddExpenseModal = ({ isOpen, onClose, user }) => {
    const navigate = useNavigate();

    // Mode: "personal" (default) or "group"
    const [mode, setMode] = useState("personal");

    // Personal expense fields
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    // Group selection
    const [trips, setTrips] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [tripsLoading, setTripsLoading] = useState(false);

    // AI magic fields
    const [magicPrompt, setMagicPrompt] = useState("");
    const [isMagicLoading, setIsMagicLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [highlightFields, setHighlightFields] = useState(false);
    const recognitionRef = useRef(null);

    // Success overlay
    const [successOverlay, setSuccessOverlay] = useState(null); // { amount, description }

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    // Fetch groups when switching to group mode
    useEffect(() => {
        if (mode === "group" && trips.length === 0) {
            fetchTrips();
        }
    }, [mode]);

    const fetchTrips = async () => {
        try {
            setTripsLoading(true);
            const userId = Cookies.get("id");
            if (!userId) return;
            const response = await api.get(`/group/user-groups/${userId}`);
            if (response.status === 200 && Array.isArray(response.data)) {
                const validGroups = response.data.filter(g => g !== null && g.name);
                setTrips(validGroups);
            }
        } catch (error) {
            console.error("Failed to load trips:", error);
        } finally {
            setTripsLoading(false);
        }
    };

    const filteredTrips = trips.filter(trip =>
        trip.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- AI Magic ---
    const handleMagicAdd = async (passedPrompt) => {
        const query = passedPrompt || magicPrompt;
        if (!query.trim()) {
            toast.error("Tell me what you paid for first!");
            return;
        }

        try {
            setIsMagicLoading(true);
            const userId = Cookies.get("id");
            const response = await api.post("/ai/parse-expense", {
                prompt: query,
                userId: userId,
                context: "personal",
            });

            if (response.status === 200) {
                const { amount: aiAmount, title: aiTitle } = response.data;
                if (aiAmount) setAmount(aiAmount.toString());
                if (aiTitle) setDescription(aiTitle);

                if (aiAmount || aiTitle) {
                    setShowManual(true);
                }

                toast.success("Magic applied! Fields updated.");
                setHighlightFields(true);
                setTimeout(() => setHighlightFields(false), 2000);
            }
        } catch (error) {
            console.error("Magic Add Error:", error);
            toast.error("AI is currently sleepy. Please enter manually.");
            setShowManual(true);
        } finally {
            setIsMagicLoading(false);
        }
    };

    // --- Voice ---
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice input is not supported in your browser.");
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => {
            setIsListening(true);
            toast("Listening...", { icon: '🎤', id: "voice-toast" });
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setMagicPrompt(transcript);
            setIsListening(false);
            handleMagicAdd(transcript);
        };
        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error("Microphone access blocked. Please enable it in browser settings.", { duration: 5000 });
            } else if (event.error !== 'no-speech') {
                toast.error("Could not understand. Try again!");
            }
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognitionRef.current = recognition;
        recognition.start();
    };

    // --- Submit Personal Expense ---
    const handleSubmitPersonal = async (e) => {
        e.preventDefault();
        if (!description || !amount) {
            toast.error("Please fill description and amount");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                description: description,
                amount: Number(amount),
                date: new Date(),
            };

            const response = await api.post("/expenses/personal", payload);

            if (response.status === 201 || response.status === 200) {
                setSuccessOverlay({ amount: Number(amount), description });
                // Auto-close after celebration
                setTimeout(() => {
                    setSuccessOverlay(null);
                    onClose();
                    navigate("/personal-expenses");
                }, 2500);
            }
        } catch (error) {
            console.error("Error creating personal expense:", error);
            toast.error(error.response?.data?.message || "Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    // --- Navigate to group add-expense ---
    const handleGroupSelect = (group) => {
        // Store group in localStorage for addExpense page
        localStorage.setItem("currentGroup", JSON.stringify(group));
        onClose();
        navigate("/add-expense", { 
            state: { 
                propGroupId: group._id,
                prefillTitle: description,
                prefillAmount: amount
            } 
        });
    };

    // Reset state on close
    const handleClose = () => {
        setMode("personal");
        setDescription("");
        setAmount("");
        setMagicPrompt("");
        setShowManual(false);
        setSearchQuery("");
        setSuccessOverlay(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >

                {/* ── SUCCESS CELEBRATION OVERLAY ── */}
                <AnimatePresence>
                    {successOverlay && (
                        <motion.div
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 rounded-2xl overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Background glow */}
                            <motion.div
                                className="absolute w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 2.5, opacity: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />

                            {/* Expanding rings */}
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-28 h-28 rounded-full border border-emerald-500/30"
                                    initial={{ scale: 0, opacity: 0.8 }}
                                    animate={{ scale: 3.5 + i, opacity: 0 }}
                                    transition={{ duration: 1.5, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                                />
                            ))}

                            {/* Confetti particles */}
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={`confetti-${i}`}
                                    className="absolute w-2 h-2 rounded-full"
                                    style={{
                                        background: ['#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'][i % 5],
                                    }}
                                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                    animate={{
                                        scale: [0, 1.5, 0.8],
                                        x: Math.cos((i * Math.PI * 2) / 10) * 100,
                                        y: Math.sin((i * Math.PI * 2) / 10) * 100,
                                        opacity: [1, 1, 0],
                                    }}
                                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                                />
                            ))}

                            {/* Checkmark circle */}
                            <motion.div
                                className="relative w-24 h-24 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-6 z-10"
                                initial={{ scale: 0, rotate: -60 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                            >
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-emerald-600/20"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, duration: 0.3 }}
                                />
                                <svg className="w-12 h-12 text-emerald-400 z-10" viewBox="0 0 24 24" fill="none">
                                    <motion.path
                                        d="M5 13l4 4L19 7"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
                                    />
                                </svg>
                            </motion.div>

                            {/* Text */}
                            <motion.h3
                                className="text-xl font-bold text-white mb-1 z-10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                Expense Added! 🎉
                            </motion.h3>
                            <motion.p
                                className="text-zinc-400 text-sm mb-6 z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                Personal expense tracked successfully
                            </motion.p>

                            {/* Amount card */}
                            <motion.div
                                className="bg-zinc-800/80 border border-emerald-500/20 rounded-xl px-6 py-4 text-center z-10"
                                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.65, type: "spring", stiffness: 200 }}
                            >
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">
                                    Amount
                                </p>
                                <p className="text-3xl font-bold text-emerald-400 font-mono">
                                    ₹{successOverlay.amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-zinc-400 mt-1 truncate max-w-[200px]">
                                    {successOverlay.description}
                                </p>
                            </motion.div>

                            {/* Redirect hint */}
                            <motion.p
                                className="text-zinc-600 text-xs mt-5 z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                            >
                                Redirecting to your expenses...
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── HEADER ── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                    className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50"
                >
                    <div className="flex items-center gap-3">
                        {mode === "group" && (
                            <motion.button
                                onClick={() => setMode("personal")}
                                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </motion.button>
                        )}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === "personal" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"} transition-colors`}>
                            {mode === "personal" ? <Wallet className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">
                                {mode === "personal" ? "Quick Expense" : "Choose a Group"}
                            </h2>
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                {mode === "personal" ? "Personal • Powered by AI" : "Select a group to add expense"}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500">
                        <X className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* ── BODY ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
                    className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto scrollbar-hide"
                >
                    <AnimatePresence mode="wait">
                        {mode === "personal" ? (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col gap-5"
                            >
                                {/* ── AI Magic Box ── */}
                                <div className="relative">
                                    <div className={`relative bg-zinc-950 border transition-all duration-300 rounded-2xl p-4 ${isListening ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/10'}`}>
                                        {isListening && (
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/20 blur-sm overflow-hidden rounded-t-2xl">
                                                <div className="h-full bg-red-500 w-1/3 animate-[shimmer_1.5s_infinite]" />
                                            </div>
                                        )}
                                        <div className="flex items-start gap-4">
                                            <motion.button
                                                type="button"
                                                onClick={startListening}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl flex-shrink-0 ${isListening
                                                    ? "bg-red-500 text-white animate-pulse"
                                                    : "bg-emerald-500 text-white hover:bg-emerald-400"
                                                    }`}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            </motion.button>
                                            <div className="flex-1 min-w-0">
                                                <textarea
                                                    value={magicPrompt}
                                                    onChange={(e) => setMagicPrompt(e.target.value)}
                                                    placeholder={isListening ? "I'm listening..." : "Tell me what you spent on, e.g.\n'Coffee 150' or 'Groceries 500'"}
                                                    rows={2}
                                                    className="w-full bg-transparent border-none text-white text-base focus:outline-none placeholder:text-zinc-600 resize-none py-1 scrollbar-hide"
                                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleMagicAdd())}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                                            <span className="text-[10px] text-zinc-500 font-medium italic">
                                                {isMagicLoading ? "AI is thinking..." : isListening ? "Listening closely..." : "Press Enter or Wand to apply"}
                                            </span>
                                            <motion.button
                                                type="button"
                                                onClick={() => handleMagicAdd()}
                                                disabled={isMagicLoading || (!magicPrompt.trim() && !isListening)}
                                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold transition-all flex items-center gap-2"
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isMagicLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                                                Apply Magic
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                                {/* Manual toggle */}
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowManual(!showManual)}
                                        className="text-[11px] font-bold text-zinc-500 hover:text-emerald-400 transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
                                    >
                                        {showManual ? "Hide manual details" : "Show manual details"}
                                        <motion.div
                                            animate={{ rotate: showManual ? 180 : 0 }}
                                            transition={{ duration: 0.25 }}
                                        >↓</motion.div>
                                    </button>
                                </div>

                                {/* Manual Fields */}
                                <AnimatePresence>
                                    {showManual && (
                                        <motion.form
                                            onSubmit={handleSubmitPersonal}
                                            className="flex flex-col gap-5"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            {/* Amount */}
                                            <motion.div
                                                className={`transition-all duration-500 ${highlightFields ? 'scale-[1.02] ring-2 ring-emerald-500/50 rounded-2xl' : ''}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 }}
                                            >
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block px-1">Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 text-3xl font-bold text-white text-center focus:outline-none focus:border-emerald-500/50 transition-colors"
                                                />
                                            </motion.div>

                                            {/* Description */}
                                            <motion.div
                                                className={`transition-all duration-500 delay-75 ${highlightFields ? 'scale-[1.02] ring-2 ring-emerald-500/50 rounded-2xl' : ''}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block px-1">Description</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                                        <Receipt className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        placeholder="What did you spend on?"
                                                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                                    />
                                                </div>
                                            </motion.div>

                                            {/* Submit Button */}
                                            <motion.button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                                                whileTap={{ scale: 0.97 }}
                                                whileHover={{ scale: 1.01 }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 }}
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-5 h-5" />
                                                        Add Personal Expense
                                                    </>
                                                )}
                                            </motion.button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>

                                {/* ── Switch to Group ── */}
                                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                                <motion.button
                                    type="button"
                                    onClick={() => setMode("group")}
                                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-zinc-950/50 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm text-zinc-400 group-hover:text-indigo-300 font-medium transition-colors">
                                            Add to a Group instead?
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                </motion.button>
                            </motion.div>
                        ) : (
                            /* ── GROUP SELECTION VIEW ── */
                            <motion.div
                                key="group"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col gap-4"
                            >
                                {/* Search */}
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search your groups..."
                                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 transition-colors"
                                        autoFocus
                                    />
                                </div>

                                {/* Group List */}
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto scrollbar-hide">
                                    {tripsLoading ? (
                                        <div className="flex flex-col items-center py-8 gap-2 text-zinc-500">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="text-xs">Loading groups...</span>
                                        </div>
                                    ) : filteredTrips.length > 0 ? (
                                        filteredTrips.map((trip, index) => (
                                            <motion.button
                                                key={trip._id}
                                                onClick={() => handleGroupSelect(trip)}
                                                className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-950/50 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group text-left"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.04 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{trip.name}</p>
                                                        <p className="text-[10px] text-zinc-500">
                                                            {trip.members?.length || 0} members
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                            </motion.button>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center py-8 text-center">
                                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                                                <Users className="w-6 h-6 text-zinc-600" />
                                            </div>
                                            <p className="text-zinc-400 text-sm font-medium">
                                                {searchQuery ? "No matching groups" : "No groups yet"}
                                            </p>
                                            <p className="text-zinc-600 text-xs mt-1">
                                                {searchQuery ? "Try a different search" : "Create a group first to add group expenses"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default QuickAddExpenseModal;
