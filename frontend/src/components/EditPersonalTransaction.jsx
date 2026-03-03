import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, IndianRupee, Receipt, Calendar as CalendarIcon, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import DatePicker from "./DatePicker";
import { motion, AnimatePresence } from "framer-motion";

const EditPersonalTransaction = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const originalExpense = state?.originalExpense;

    const [form, setForm] = useState({
        description: "",
        amount: "",
        date: new Date().toLocaleDateString("en-CA"),
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [successOverlay, setSuccessOverlay] = useState(false);
    const [errorOverlay, setErrorOverlay] = useState(null);

    useEffect(() => {
        if (originalExpense) {
            const d = new Date(originalExpense.time || originalExpense.date || originalExpense.createdAt);
            setForm({
                description: originalExpense.title || originalExpense.description || "",
                amount: originalExpense.amount.toString(),
                date: d.toLocaleDateString("en-CA"),
                time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            });
        } else {
            toast.error("No transaction data found");
            navigate(-1);
        }
    }, [originalExpense, navigate]);

    const handleSave = async () => {
        if (!form.description.trim() || !form.amount || parseFloat(form.amount) <= 0) {
            toast.error("Please fill description and a valid amount");
            return;
        }

        try {
            setIsLoading(true);
            const combinedDate = new Date(`${form.date}T${form.time}`);
            const payload = {
                description: form.description,
                amount: parseFloat(form.amount),
                date: combinedDate,
            };

            await api.put(`/expenses/personal/${originalExpense._id}`, payload);
            setSuccessOverlay(true);
            
            setTimeout(() => {
                setSuccessOverlay(false);
                navigate(-1);
            }, 2500);
        } catch (error) {
            console.error("Error updating transaction:", error);
            setErrorOverlay(error.response?.data?.message || "Failed to update record");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-hidden">
            {/* Success Celebration Overlay */}
            <AnimatePresence>
                {successOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
                    >
                        {/* Confetti-like particles */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                initial={{ 
                                    x: 0, 
                                    y: 0, 
                                    scale: 0,
                                    backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][i % 4]
                                }}
                                animate={{ 
                                    x: (Math.random() - 0.5) * 600, 
                                    y: (Math.random() - 0.5) * 600, 
                                    scale: [0, 1.5, 0],
                                    rotate: Math.random() * 360
                                }}
                                transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatDelay: 0.2 }}
                            />
                        ))}

                        {/* Checkmark Circle */}
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
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
                                />
                            </svg>
                        </motion.div>

                        <motion.h3
                            className="text-2xl font-bold text-white mb-2 z-10 uppercase tracking-tight"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            Update Committed ⚡
                        </motion.h3>
                        <motion.p
                            className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase mb-8 z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            Protocol encryption complete
                        </motion.p>

                        {/* Updated Amount Card */}
                        <motion.div
                            className="bg-zinc-900/80 border border-emerald-500/20 rounded-2xl px-8 py-5 text-center z-10 shadow-2xl backdrop-blur-md"
                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.65, type: "spring", stiffness: 200 }}
                        >
                            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mb-1">
                                New Total Recorded
                            </p>
                            <p className="text-4xl font-black text-emerald-400 font-mono">
                                ₹{parseFloat(form.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-zinc-400 mt-2 truncate max-w-[200px] font-medium italic">
                                "{form.description}"
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Feedback Overlay */}
            <AnimatePresence>
                {errorOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: 45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-20 h-20 rounded-full border-2 border-red-500 flex items-center justify-center mb-6 relative"
                        >
                            <motion.div 
                                className="absolute inset-0 rounded-full bg-red-500/10"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                            </svg>
                        </motion.div>

                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Transmission Failed</h3>
                        <p className="text-zinc-500 text-sm mb-8 max-w-xs text-center px-4 font-medium italic">
                           "{errorOverlay}"
                        </p>

                        <button
                            onClick={() => setErrorOverlay(null)}
                            className="px-6 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                        >
                            Resume Protocol
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            </div>

            <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col h-full flex-1 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 mb-10"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="group p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight uppercase">Edit Transaction</h1>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">Personal Record</p>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* Amount Hero */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Total Amount</span>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl text-zinc-600 font-mono">₹</span>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="bg-transparent text-5xl sm:text-6xl font-black text-white placeholder-zinc-800 focus:outline-none w-full max-w-[200px] text-center font-mono"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-5 backdrop-blur-sm">
                        <div className="group">
                            <label className="text-[10px] font-bold text-zinc-500 mb-2 block uppercase tracking-widest ml-1">Label / Description</label>
                            <div className="relative">
                                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                                    placeholder="What was this for?"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="text-[10px] font-bold text-zinc-500 mb-2 block uppercase tracking-widest ml-1">Date</label>
                                <DatePicker
                                    value={form.date}
                                    onChange={(val) => setForm({ ...form, date: val })}
                                    buttonClassName="bg-zinc-950/50 border-white/10 py-3.5"
                                />
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-bold text-zinc-500 mb-2 block uppercase tracking-widest ml-1">Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input
                                        type="time"
                                        value={form.time}
                                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Update Protocol"
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EditPersonalTransaction;
