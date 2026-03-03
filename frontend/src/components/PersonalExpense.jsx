import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  IndianRupee,
  Trash2,
  Plus,
  Receipt,
  Mic,
  Loader2,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "./DatePicker";
import Cookies from "js-cookie";

const PersonalExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    date: new Date().toLocaleDateString("en-CA"), // current local date YYYY-MM-DD
    time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [editForm, setEditForm] = useState({ description: "", amount: "", date: "", time: "" });
  const [successOverlay, setSuccessOverlay] = useState(null); // { amount, description }
  const [deleteOverlay, setDeleteOverlay] = useState(null); // { status: 'success' | 'error', message?: string }
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const recognitionRef = useRef(null);

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses/personal");
      setExpenses(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!newExpense.description.trim())
      newErrors.description = "Description is required";
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0)
      newErrors.amount = "Valid amount is required";
    if (!newExpense.date) newErrors.date = "Date is required";
    if (!newExpense.time) newErrors.time = "Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addExpense = async () => {
    if (validateForm()) {
      try {
        const amountNum = parseFloat(newExpense.amount);
        const desc = newExpense.description;
        // Combine date and time
        const combinedDate = new Date(`${newExpense.date}T${newExpense.time}`);

        const payload = {
          description: desc,
          amount: amountNum,
          date: combinedDate,
        };
        const response = await api.post("/expenses/personal", payload);

        // Reset form but keep today's date
        setNewExpense({
          description: "",
          amount: "",
          date: new Date().toLocaleDateString("en-CA"),
          time: new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        setErrors({});

        // Celebration UI
        setSuccessOverlay({ amount: amountNum, description: desc });
        
        // Add to list with animation delay or after celebration starts
        setTimeout(() => {
          setExpenses([response.data, ...expenses]);
        }, 300);

        setTimeout(() => {
          setSuccessOverlay(null);
        }, 2200);

      } catch (error) {
        console.error("Error adding expense:", error);
        toast.error("Failed to add expense");
      }
    }
  };

  const confirmDelete = (expense) => {
    setDeleteConfirm(expense);
  };

  const deleteExpense = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/expenses/personal/${deleteConfirm._id}`);
      setExpenses(expenses.filter((expense) => expense._id !== deleteConfirm._id));
      setDeleteOverlay({ status: 'success' });
      
      setTimeout(() => {
        setDeleteOverlay(null);
      }, 2000);
    } catch (error) {
      console.error("Error deleting expense:", error);
      setDeleteOverlay({ status: 'error', message: error.response?.data?.message || "Purge Failed" });
      
      // Auto-clear error overlay after some time or keep it until user clicks?
      // Usually good to keep until user interaction if it's a big error overlay.
    } finally {
      setDeleteConfirm(null);
    }
  };

  const openEdit = (expense) => {
    const d = new Date(expense.date);
    setEditExpense(expense);
    setEditForm({
      description: expense.title || expense.description || "",
      amount: expense.amount.toString(),
      date: d.toLocaleDateString("en-CA"),
      time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    });
  };

  const saveEditExpense = async () => {
    if (!editExpense) return;
    if (!editForm.description.trim() || !editForm.amount || parseFloat(editForm.amount) <= 0) {
      toast.error("Please fill description and a valid amount");
      return;
    }
    try {
      const combinedDate = new Date(`${editForm.date}T${editForm.time}`);
      const { data } = await api.put(`/expenses/personal/${editExpense._id}`, {
        description: editForm.description,
        amount: parseFloat(editForm.amount),
        date: combinedDate,
      });
      setExpenses(expenses.map((e) => (e._id === data._id ? data : e)));
      setSuccessOverlay({ amount: data.amount, description: data.title || data.description || "Expense updated", isEdit: true });
      
      setTimeout(() => {
        setSuccessOverlay(null);
      }, 2200);
    } catch (error) {
      console.error("Error updating expense:", error);
      setDeleteOverlay({ status: 'error', message: "Failed to update entry" });
    } finally {
      setEditExpense(null);
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast("Listening...", { icon: '🎤', id: "voice-toast" });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      toast.success(`Heard: "${transcript}"`, { id: "voice-toast" });
      setIsListening(false);
      setIsProcessingVoice(true);
      processVoiceExpense(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      console.error("Voice error:", event.error);
      if (event.error === 'not-allowed') {
        toast.error("Mic access blocked. Check your browser permissions.", { id: "voice-toast", duration: 5000 });
      } else {
        toast.error("Error capturing voice. Try again.", { id: "voice-toast" });
      }
    };

    recognition.start();
  };

  const processVoiceExpense = async (transcript) => {
    const toastId = toast.loading("Analyzing expense...");

    const safetyTimeout = setTimeout(() => {
      setIsProcessingVoice(false);
      toast.error("AI is taking too long. Please try again.", { id: toastId });
    }, 15000);

    try {
      const userId = Cookies.get("id");
      const { data } = await api.post("/ai/parse-expense", {
        prompt: transcript,
        userId: userId,
        context: "personal",
      });

      const updatedExpense = { ...newExpense };

      if (data.amount) updatedExpense.amount = data.amount.toString();
      if (data.title) updatedExpense.description = data.title;
      // Note: The AI endpoint might not return date/time for personal expenses standardly,
      // but if it did, we could map it here. For now, we stick to amount and description.

      setNewExpense(updatedExpense);
      toast.success("Expense details filled!", { id: toastId });

    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.error || "Failed to parse voice command.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      clearTimeout(safetyTimeout);
      setIsProcessingVoice(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-2 md:p-4 relative selection:bg-indigo-500/30 font-sans overflow-auto">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {successOverlay && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Background Glow */}
            <motion.div
              className="absolute w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* Expanding Rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-28 h-28 rounded-full border border-emerald-500/30"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3.5 + i, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.2 + i * 0.15, ease: "easeOut" }}
              />
            ))}

            {/* Confetti Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'][i % 5],
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 0.8],
                  x: Math.cos((i * Math.PI * 2) / 12) * 120,
                  y: Math.sin((i * Math.PI * 2) / 12) * 120,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
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
              className="text-2xl font-bold text-white mb-1 z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {successOverlay.isEdit ? "Updated! ✨" : "Saved! 💸"}
            </motion.h3>
            <motion.p
              className="text-zinc-400 text-sm mb-8 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {successOverlay.isEdit ? "Changes synchronized to ledger" : "Transaction added to your records"}
            </motion.p>

            {/* Amount Card */}
            <motion.div
              className="bg-zinc-800/80 border border-emerald-500/20 rounded-2xl px-8 py-5 text-center z-10 shadow-2xl"
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.65, type: "spring", stiffness: 200 }}
            >
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mb-1">
                {successOverlay.isEdit ? "Revised Amount" : "Amount Recorded"}
              </p>
              <p className="text-4xl font-black text-emerald-400 font-mono">
                ₹{successOverlay.amount.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-400 mt-2 truncate max-w-[200px] font-medium">
                {successOverlay.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deletion & Error Feedback Overlay */}
      <AnimatePresence>
        {deleteOverlay && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {deleteOverlay.status === 'success' ? (
              <>
                <motion.div
                  className="w-24 h-24 rounded-full border-2 border-red-500/50 flex items-center justify-center mb-6 relative"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                >
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-red-600/20"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <Trash2 className="w-10 h-10 text-red-500 z-10" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-black text-white uppercase tracking-tighter"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Entry Purged 💀
                </motion.h3>
                <motion.p
                   className="text-[10px] text-zinc-500 font-mono tracking-[0.3em] uppercase mt-2"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.2 }}
                >
                  Ledger data erased
                </motion.p>
              </>
            ) : (
              <>
                <motion.div
                  className="w-20 h-20 rounded-full border-2 border-zinc-700 flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-white uppercase italic">
                  {deleteOverlay.message || "Action Failed"}
                </h3>
                <p className="text-zinc-500 text-xs mt-2 font-medium">Transmission aborted</p>
                <button 
                  onClick={() => setDeleteOverlay(null)}
                  className="mt-8 px-6 py-2 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all shadow-lg active:scale-95"
                >
                  Rescue Protocol
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20, y: -15 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-4"
        >
          <Link to="/dash">
            <button className="p-3 rounded-full bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 hover:border-white/10 text-zinc-400 hover:text-white transition-all duration-300 shadow-lg group backdrop-blur-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Personal Expenses
          </h1>
          <div className="w-12"></div> {/* Spacer for alignment */}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 overflow-visible">
          {/* Add Expense Form - Left Column on Large Screens */}
          <motion.div
            initial={{ opacity: 0, x: -25, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="lg:col-span-4 overflow-y-auto"
          >
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5 lg:p-6 backdrop-blur-xl shadow-xl sticky top-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                New Expense
              </h2>

              <div className="space-y-3">
                <div className="group">
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wider">
                    Description
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="What did you buy?"
                      value={newExpense.description}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          description: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm placeholder:text-zinc-600"
                    />
                  </div>
                  {errors.description && (
                    <p className="text-red-400 text-xs mt-1 ml-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wider">
                    Amount
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-green-400 transition-colors" />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          amount: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-sm placeholder:text-zinc-600"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-400 text-xs mt-1 ml-1">
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Date & Time below Amount; single row on md+ */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="group flex-1 min-w-0 relative">
                    <DatePicker
                      label="Date"
                      placeholder="Pick date"
                      value={newExpense.date}
                      onChange={(val) =>
                        setNewExpense({
                          ...newExpense,
                          date: val,
                        })
                      }
                      labelClassName="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wider"
                      buttonClassName="bg-zinc-800/50 border border-zinc-700/50"
                    />
                    {errors.date && (
                      <p className="text-red-400 text-xs mt-1 ml-1">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="group flex-1 min-w-0">
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wider">
                      Time
                    </label>
                    <div className="relative overflow-hidden">
                      <input
                        type="time"
                        value={newExpense.time}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            time: e.target.value,
                          })
                        }
                        className="w-full box-border px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm text-zinc-300 [color-scheme:dark]"
                      />
                    </div>
                    {errors.time && (
                      <p className="text-red-400 text-xs mt-1 ml-1">
                        {errors.time}
                      </p>
                    )}
                  </div>
                </div>

                {errors.category && (
                  <p className="text-red-400 text-xs mt-1 ml-1">
                    {errors.category}
                  </p>
                )}
              </div>

              <button
                onClick={addExpense}
                className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Add Transaction
              </button>

              {/* Voice Button — inside the form card on all screen sizes */}
              <div className="flex flex-col items-center justify-center mt-5 pt-5 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isListening || isProcessingVoice}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                    isListening
                      ? "bg-red-500 animate-pulse ring-4 ring-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.6)] scale-110"
                      : "bg-gradient-to-br from-red-600 to-red-800 text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] border-4 border-red-900/30 active:scale-95"
                  }`}
                  title="Use Voice Command"
                >
                  {isProcessingVoice ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white/90" />
                  ) : (
                    <Mic className={`w-6 h-6 text-white drop-shadow-md ${isListening ? "animate-bounce" : ""}`} />
                  )}
                </button>
                <p className="text-zinc-500 text-[10px] mt-2 font-medium tracking-wide uppercase opacity-60">
                  Tap to Speak
                </p>
              </div>
            </div>
          </motion.div>



          {/* Expenses List & Stats - Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 25, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="lg:col-span-8 flex flex-col gap-4 overflow-visible"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="text-zinc-500 text-sm font-medium mb-1">
                    Total Spending
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    ₹{totalExpenses.toFixed(2)}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="text-zinc-500 text-sm font-medium mb-1">
                    Total Entries
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {expenses.length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                  <Receipt className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex-1 overflow-auto flex flex-col" style={{minHeight: 0}}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-400" />
                  Recent Transactions
                </h2>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full border border-white/5 font-mono">
                  {expenses.length} RECORDS
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono tracking-widest uppercase animate-pulse">Syncing Ledger...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500 border-2 border-dashed border-zinc-800/50 rounded-2xl bg-zinc-900/20">
                  <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                    <Receipt className="w-10 h-10 text-zinc-600" />
                  </div>
                  <p className="text-zinc-300 font-bold uppercase tracking-wide">Empty Horizon</p>
                  <p className="text-[10px] text-zinc-600 mt-2 font-mono uppercase tracking-widest">
                    No transaction data detected
                  </p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {expenses.map((expense, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30,
                          delay: index < 10 ? index * 0.05 : 0 
                        }}
                        key={expense._id}
                        className="bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 p-4 rounded-xl flex items-center justify-between group transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center text-zinc-500 border border-white/5 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-colors">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-zinc-100 tracking-tight">
                              {expense.title || expense.description}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                              <span>
                                {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(expense.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-xl font-black text-white font-mono">
                            ₹{expense.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1.5 opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => openEdit(expense)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all active:scale-90"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(expense)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 ring-2 ring-red-500/20 ring-offset-4 ring-offset-zinc-900">
                  <Trash2 className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Purge Records?</h3>
                <p className="text-zinc-500 text-xs mt-2 font-medium">This action will permanently delete the transaction.</p>
              </div>

              <div className="bg-zinc-800/40 border border-white/5 rounded-2xl p-4 mb-8">
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Transaction Label</p>
                <p className="text-zinc-100 font-bold text-base truncate">{deleteConfirm.title || deleteConfirm.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Cost</p>
                  <p className="text-red-400 font-black text-2xl font-mono">₹{deleteConfirm.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  Retreat
                </button>
                <button
                  onClick={deleteExpense}
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all font-bold text-xs uppercase tracking-widest active:scale-95"
                >
                  Purge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Expense Modal */}
      <AnimatePresence>
        {editExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setEditExpense(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-lg">
                  <Pencil className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Edit Ledger</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Updating Entry ID: {editExpense._id.slice(-6)}</p>
                </div>
              </div>

              <div className="space-y-5 mb-10">
                <div className="group">
                  <label className="text-[10px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.2em] ml-1">Label</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-3.5 bg-zinc-950 border border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500/50 text-sm text-white font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.2em] ml-1">Credits (₹)</label>
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-4 py-3.5 bg-zinc-950 border border-white/10 rounded-2xl focus:outline-none focus:border-green-500/50 text-lg font-black text-white font-mono transition-colors"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <DatePicker
                      label="Date"
                      placeholder="Pick date"
                      value={editForm.date}
                      onChange={(val) => setEditForm({ ...editForm, date: val })}
                      labelClassName="text-[10px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.2em] ml-1"
                      buttonClassName="bg-zinc-950 border border-white/10 rounded-2xl py-3.5"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.2em] ml-1">Time</label>
                    <input
                      type="time"
                      value={editForm.time}
                      onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                      className="w-full px-3 py-3 bg-zinc-950 border border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500/50 text-sm text-zinc-300 font-mono [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditExpense(null)}
                  className="flex-1 px-4 py-4 rounded-2xl bg-zinc-800 border border-white/5 text-zinc-400 hover:text-zinc-200 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  onClick={saveEditExpense}
                  className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all font-bold text-xs uppercase tracking-widest active:scale-95"
                >
                  Commit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VOICE LISTENING MODAL --- */}
      {isListening && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75 blur-xl"></div>
            <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping delay-75 opacity-50 blur-lg"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10">
              <Mic className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <h3 className="mt-8 text-2xl font-bold text-white tracking-tight animate-pulse">
            Listening...
          </h3>
          <p className="text-zinc-400 mt-2 text-sm italic">
            Say "Groceries 500"
          </p>
          <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-xs">
            <button
              onClick={handleStopListening}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <div className="w-4 h-4 bg-white rounded-sm"></div>
              Stop Listening
            </button>
            <button
              onClick={() => {
                if (recognitionRef.current) recognitionRef.current.abort();
                setIsListening(false);
                toast.dismiss("voice-toast");
              }}
              className="text-zinc-500 hover:text-white text-sm transition-colors py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- PROCESSING MODAL --- */}
      {isProcessingVoice && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative mb-8 w-24 h-24 animate-glow-pulse">
            <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-b-4 border-indigo-400 rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight animate-pulse text-center px-4">
            Processing... 🤖
          </h3>
          <p className="text-zinc-400 mt-4 text-sm max-w-xs text-center">
            Decoding your expense details.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalExpense;
