import { useState, useEffect, useRef } from "react";
import { X, Receipt, CheckCircle, Search, Sparkles, Wand2, Loader2, Mic, MicOff } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

const QuickAddExpenseModal = ({ isOpen, onClose, user }) => {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [trips, setTrips] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [magicPrompt, setMagicPrompt] = useState("");
    const [isMagicLoading, setIsMagicLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [highlightFields, setHighlightFields] = useState(false);
    const recognitionRef = useRef(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    // Fetch groups/trips to select from
    useEffect(() => {
        if (isOpen) {
            fetchTrips();
        }
    }, [isOpen]);

    const fetchTrips = async () => {
        try {
            const userId = Cookies.get("id");
            if (!userId) return;
            const response = await api.get(`/group/user-groups/${userId}`);
            if (response.status === 200 && Array.isArray(response.data)) {
                // Filter out any null groups
                const validGroups = response.data.filter(g => g !== null && g.name);
                setTrips(validGroups);
                if (validGroups.length > 0) {
                    setSelectedTripId(validGroups[0]._id);
                    setSearchQuery(validGroups[0].name);
                }
            }
        } catch (error) {
            console.error("Failed to load trips for quick add:", error);
        }
    };

    const filteredTrips = trips.filter(trip =>
        trip.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                context: "group_quick",
            });

            if (response.status === 200) {
                const { amount: aiAmount, title: aiTitle, groupId: aiGroupId } = response.data;

                if (aiAmount) setAmount(aiAmount.toString());
                if (aiTitle) setDescription(aiTitle);

                if (aiGroupId) {
                    const matchedTrip = trips.find(t => t._id === aiGroupId);
                    if (matchedTrip) {
                        setSelectedTripId(aiGroupId);
                        setSearchQuery(matchedTrip.name);
                    }
                }

                if (aiAmount || aiTitle || aiGroupId) {
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
            toast("Listening...", { icon: '🎤' });
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setMagicPrompt(transcript);
            setIsListening(false);
            // Auto-trigger magic add after transcription
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !amount || !selectedTripId) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);
            const userId = Cookies.get("id");

            // Find the selected group to get its members
            const selectedGroup = trips.find(t => t._id === selectedTripId);
            if (!selectedGroup) {
                toast.error("Group not found");
                return;
            }

            // Quick add defaults to EQUAL split
            const payload = {
                title: description, // Backend expects 'title'
                groupId: selectedTripId,
                amount: Number(amount),
                paidBy: userId,
                splitMode: "equally", // Backend expects 'splitMode'
                involvedMembers: selectedGroup.members, // Backend expects 'involvedMembers'
            };

            const response = await api.post(`/group/add-expense`, payload);

            if (response.status === 201 || response.status === 200) {
                toast.success("Expense added successfully!");
                onClose();
                // Optional: you could reload dashboard here if needed, but App.jsx/Dashboard handles polling
            }
        } catch (error) {
            console.error("Error creating quick expense:", error);
            toast.error(error.response?.data?.message || "Failed to add expense");
        } finally {
            setLoading(false);
        }
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
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                    className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Quick Add Expense</h2>
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Powered by FairFare AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500">
                        <X className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Body */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
                    className="p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto scrollbar-hide"
                >

                    {/* Integrated Magic Box - The Hero UI */}
                    <div className="relative">
                        <div className={`relative bg-zinc-950 border transition-all duration-300 rounded-2xl p-4 ${isListening ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/10'}`}>

                            {/* Visual Waveform placeholder for Listening */}
                            {isListening && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/20 blur-sm overflow-hidden rounded-t-2xl">
                                    <div className="h-full bg-red-500 w-1/3 animate-[shimmer_1.5s_infinite]" />
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <button
                                    type="button"
                                    onClick={startListening}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 flex-shrink-0 ${isListening
                                        ? "bg-red-500 text-white animate-pulse"
                                        : "bg-indigo-500 text-white hover:bg-indigo-400"
                                        }`}
                                >
                                    {isListening ? (
                                        <MicOff className="w-5 h-5" />
                                    ) : (
                                        <Mic className="w-5 h-5" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <textarea
                                        value={magicPrompt}
                                        onChange={(e) => setMagicPrompt(e.target.value)}
                                        placeholder={isListening ? "I'm listening to your voice..." : "Tell me what you paid for, e.g.\n'Spent 500 for Uber in Goa trip'"}
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
                                <button
                                    type="button"
                                    onClick={() => handleMagicAdd()}
                                    disabled={isMagicLoading || (!magicPrompt.trim() && !isListening)}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold transition-all flex items-center gap-2"
                                >
                                    {isMagicLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-3.5 h-3.5" />
                                    )}
                                    Apply Magic
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                    {/* Manual Override Toggle */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => setShowManual(!showManual)}
                            className="text-[11px] font-bold text-zinc-500 hover:text-indigo-400 transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
                        >
                            {showManual ? "Hide manual details" : "Show manual details"}
                            <div className={`transition-transform duration-300 ${showManual ? 'rotate-180' : ''}`}>↓</div>
                        </button>
                    </div>

                    {/* Manual Fields Section */}
                    {showManual && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">

                            {/* Amount */}
                            <div className={`transition-all duration-500 ${highlightFields ? 'scale-[1.02] ring-2 ring-indigo-500/50 rounded-2xl' : ''}`}>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block px-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 text-3xl font-bold text-white text-center focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Description */}
                            <div className={`transition-all duration-500 delay-75 ${highlightFields ? 'scale-[1.02] ring-2 ring-indigo-500/50 rounded-2xl' : ''}`}>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block px-1">Description</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                        <Receipt className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                            </div>

                            {/* Group Selection */}
                            <div className={`relative transition-all duration-500 delay-150 ${highlightFields ? 'scale-[1.02] ring-2 ring-indigo-500/50 rounded-2xl' : ''}`}>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block px-1">Which Trip / Group?</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                                    />

                                    {isDropdownOpen && (
                                        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-48 overflow-y-auto bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl scrollbar-hide animate-in fade-in slide-in-from-bottom-2">
                                            {filteredTrips.length > 0 ? (
                                                filteredTrips.map(trip => (
                                                    <button
                                                        key={trip._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTripId(trip._id);
                                                            setSearchQuery(trip.name);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-5 py-3 text-sm transition-colors border-b border-white/5 last:border-none ${selectedTripId === trip._id ? 'text-indigo-400 font-bold bg-white/5' : 'text-zinc-300 hover:bg-white/5'}`}
                                                    >
                                                        {trip.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-5 py-4 text-xs text-zinc-500 italic">No matching groups found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Add Expense
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                </motion.div>
            </motion.div>
        </div>
    );
};

export default QuickAddExpenseModal;
