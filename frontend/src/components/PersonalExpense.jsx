import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  IndianRupee,
  Trash2,
  Plus,
  Filter,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [deleteConfirm, setDeleteConfirm] = useState(null); // holds expense to confirm delete

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
        // Combine date and time
        const combinedDate = new Date(`${newExpense.date}T${newExpense.time}`);

        const payload = {
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          date: combinedDate,
        };
        const response = await api.post("/expenses/personal", payload);

        setExpenses([response.data, ...expenses]);

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
        toast.success("Expense added successfully");
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
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-2 md:p-4 relative selection:bg-indigo-500/30 font-sans overflow-auto">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-visible">
          {/* Add Expense Form - Left Column on Large Screens */}
          <div className="lg:col-span-4 overflow-y-auto">
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-xl sticky top-4">
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
                  <div className="group flex-1 min-w-0">
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wider">
                      Date
                    </label>
                    <div className="relative overflow-hidden">
                      <input
                        type="date"
                        value={newExpense.date}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            date: e.target.value,
                          })
                        }
                        className="w-full box-border px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm text-zinc-300 [color-scheme:dark]"
                      />
                    </div>
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
                className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* Expenses List & Stats - Right Column */}
          <div className="lg:col-span-8 flex flex-col gap-4 overflow-visible">
            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>

            {/* List */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex-1 max-h-[60vh] md:max-h-full overflow-auto flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-zinc-400" />
                  Recent Transactions
                </h2>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                  {expenses.length} items
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-2">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading expenses...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 font-medium">No expenses found</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Add your first expense to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {expenses.map((expense) => {

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={expense._id}
                          className="bg-zinc-800/40 hover:bg-zinc-800/60 border border-white/5 p-4 rounded-xl flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-zinc-200">
                                {expense.title || expense.description}
                              </h3>
                              <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 mt-0.5 flex-wrap">
                                {expense.category && (
                                  <>
                                    <span>{expense.category}</span>
                                    <span>•</span>
                                  </>
                                )}
                                {expense.subcategory && (
                                  <>
                                    <span>{expense.subcategory}</span>
                                  </>
                                )}
                                <span>
                                  {new Date(expense.date).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(expense.date).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="text-lg font-bold text-white">
                              ₹{expense.amount.toFixed(2)}
                            </p>
                            <button
                              onClick={() => confirmDelete(expense)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Delete Expense?</h3>
              </div>

              <p className="text-zinc-400 text-sm mb-1">Are you sure you want to delete this expense?</p>
              <div className="bg-zinc-800/60 border border-white/5 rounded-xl p-3 mb-5">
                <p className="text-zinc-200 font-medium">{deleteConfirm.title || deleteConfirm.description}</p>
                <p className="text-red-400 font-bold text-lg mt-1">₹{deleteConfirm.amount.toFixed(2)}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 hover:bg-zinc-700 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteExpense}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalExpense;
