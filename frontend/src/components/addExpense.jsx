import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, DeleteIcon } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Accepts an optional groupId prop so that it can be passed directly if available
const AddExpense = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { propGroupId } = location.state || {};

  // State variables
  const [splitMode, setSplitMode] = useState("equally");
  const [selected, setSelected] = useState([]); // Array of selected member _ids (for splitting)
  const [amounts, setAmounts] = useState({}); // For uneven split: maps member _id => custom amount
  const [selectAll, setSelectAll] = useState(false);
  const [paidBy, setPaidBy] = useState(""); // _id of the payer
  const [members, setMembers] = useState([]); // Combined list: logged-in user + friends
  const [title, setTitle] = useState("");
  const [mainAmount, setMainAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcExpr, setCalcExpr] = useState("");

  // Determine groupId: either from prop or from localStorage ("currentGroup")
  const currentGroup = JSON.parse(
    localStorage.getItem("currentGroup") || "null"
  );
  const groupId = propGroupId || (currentGroup ? currentGroup._id : null);

  // Retrieve user info from localStorage and build a combined members list.
  // This list contains the logged-in user plus his friends.
  useEffect(() => {
    try {
      const currentGroup = localStorage.getItem("currentGroup");
      const groupMembers = currentGroup ? JSON.parse(currentGroup).members : [];
      setMembers(groupMembers);
    } catch (err) {
      console.error("Error loading user and friends from localStorage:", err);
    }
  }, []);

  // Checkbox handlers for selecting/deselecting a member (by _id)
  const handleCheckboxChange = (memberId) => {
    if (selected.includes(memberId)) {
      setSelected(selected.filter((id) => id !== memberId));
    } else {
      setSelected([...selected, memberId]);
    }
  };

  // "Select All" toggle handler
  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      const allMemberIds = members.map((member) => member._id);
      setSelected(allMemberIds);
    }
  };

  // Keep the state of "Select All" in sync
  useEffect(() => {
    const memberIds = members.map((member) => member._id);
    setSelectAll(selected.length === memberIds.length);
  }, [selected, members]);

  // Handler to capture custom amounts for uneven split. Only allows up to two decimals.
  const handleAmountChange = (e, memberId) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmounts({ ...amounts, [memberId]: value });
    }
  };

  // Calculator helpers
  const appendToCalc = (char) => {
    // allow only safe characters
    if (/^[0-9.+\-*/() ]$/.test(char)) setCalcExpr((s) => s + char);
  };

  const handleCalcBackspace = () => setCalcExpr((s) => s.slice(0, -1));
  const handleCalcClear = () => setCalcExpr("");

  const evaluateExpression = (expr) => {
    // sanitize: allow digits, whitespace, . and +-*/() only
    const safe = expr.replace(/[^0-9.+\-*/() ]/g, "");
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${safe})`)();
      if (typeof result === "number" && Number.isFinite(result)) return result;
      return null;
    } catch (err) {
      return null;
    }
  };

  const handleCalcEqual = () => {
    const res = evaluateExpression(calcExpr);
    if (res === null) {
      toast.error("Invalid expression");
      return false;
    }
    // Just show result in calculator, don't update amount field
    const formatted = Number(res);
    setCalcExpr(formatted.toString());
    return true;
  };

  // handle keyboard input when calculator is open (supports numpad)
  useEffect(() => {
    if (!showCalculator) return;

    const onKey = (e) => {
      const k = e.key;
      if (k === "Enter") {
        e.preventDefault();
        handleCalcEqual();
        return;
      }
      if (k === "Backspace") {
        e.preventDefault();
        handleCalcBackspace();
        return;
      }
      // Allow digits, operators and parentheses and dot
      if (/^[0-9.+\-*/() ]$/.test(k)) {
        e.preventDefault();
        appendToCalc(k);
        return;
      }
      // Numpad keys may appear as e.code like 'Numpad1' but e.key is same as '1'
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCalculator, calcExpr]);

  // Calculate total of custom amounts for uneven splitting
  const calculateCustomTotal = () => {
    return selected.reduce((sum, memberId) => {
      const value = parseFloat(amounts[memberId]) || 0;
      return sum + value;
    }, 0);
  };

  // Main handler to add an expense
  const handleAddExpense = async () => {
    const totalEntered = parseFloat(mainAmount) || 0;
    const customTotal = calculateCustomTotal();

    // For uneven split, total of custom amounts must equal the main entered amount.
    if (
      splitMode === "unequally" &&
      totalEntered.toFixed(2) !== customTotal.toFixed(2)
    ) {
      const diff = (customTotal - totalEntered).toFixed(2);
      toast.error(
        `Calculation mismatch of ₹${Math.abs(diff)}. Please correct the values.`
      );
      return;
    }

    // Construct the payload to send to the backend.
    // The payload includes title, main amount, payer's _id, groupId (if available),
    // splitMode, the list of involved member _ids, and customAmounts if needed.
    const payload = {
      title: title,
      amount: totalEntered,
      paidBy: paidBy, // _id of the payer
      groupId: groupId, // may be null if not applicable
      splitMode: splitMode,
      involvedMembers: selected, // array of _ids (which may include the payer as well)
      customAmounts: splitMode === "unequally" ? amounts : {},
    };

    if (totalEntered > 50000) {
      toast.error("Amount must be smaller than 50k");
      return;
    }

    try {
      setIsLoading(true); // ✅ Start loading
      // Replace with your backend endpoint
      const response = await axios.post(
        `${API_BASE}/group/add-expense`,
        // '//http://localhost:8000/group/add-expense',
        payload
      );

      if (response.status === 400) {
        toast.error(`${response.data.message}`);
        return;
      }

      if (response.status === 200) toast.success("Expense added successfully!");
      // console.log("Expense created successfully", response.data);
      // Reset form fields
      setTitle("");
      setMainAmount("");
      setPaidBy("");
      setSelected([]);
      setAmounts({});

      //Force refresh needed to update the expenses card details
      localStorage.removeItem("currentGroup");

      setTimeout(() => {
        navigate(-1);
      }, 100); // 0.5 seconds is usually enough
    } catch (error) {
      console.error("Error creating expense:", error);
      const errorMsg =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "Error creating expense. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false); // ✅ Stop loading
    }
  };

  const equalSplitAmount =
    splitMode === "equally" && selected.length > 0
      ? (parseFloat(mainAmount || 0) / selected.length).toFixed(2)
      : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 flex flex-col relative">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col h-full flex-1 p-4 sm:p-6">
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">
            New Transaction
          </h1>
        </div>

        {/* --- MAIN FORM --- */}
        <div className="flex-1 space-y-6">
          {/* 1. AMOUNT INPUT (Hero) */}
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-2">
              Total Amount
            </span>
            <div className="relative flex items-center justify-center">
              <span className="text-4xl sm:text-6xl text-zinc-600 font-mono font-light mr-2">
                ₹
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={mainAmount}
                onChange={(e) => setMainAmount(e.target.value)}
                placeholder="0"
                className="bg-transparent text-5xl sm:text-7xl font-mono font-bold text-white placeholder-zinc-800 text-center focus:outline-none w-full max-w-[300px]"
                autoFocus
              />
            </div>
          </div>

          {/* 2. DETAILS CARD (Title & Payer) */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Title Input */}
            <div className="border-b border-white/5 p-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is this for? (e.g. Dinner, Uber)"
                className="w-full bg-transparent px-4 py-4 text-lg text-white placeholder-zinc-600 focus:outline-none focus:bg-white/5 transition-colors rounded-xl"
              />
            </div>

            {/* Payer Selector */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60">
              <span className="text-sm text-zinc-400 font-medium">Paid by</span>
              <div className="relative">
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="appearance-none bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 py-1.5 pl-3 pr-8 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-indigo-600/20 transition-colors"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {members.map((member) => (
                    <option
                      key={member._id}
                      value={member._id}
                      className="bg-zinc-900 text-white"
                    >
                      {member.username}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SPLIT ENGINE */}
          <div className="space-y-4">
            {/* Split Toggle */}
            <div className="bg-zinc-900 border border-white/10 p-1 rounded-xl flex relative">
              <button
                onClick={() => setSplitMode("equally")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative z-10 ${
                  splitMode === "equally"
                    ? "text-white shadow-lg bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Split Equally
              </button>
              <button
                onClick={() => setSplitMode("unequally")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative z-10 ${
                  splitMode === "unequally"
                    ? "text-white shadow-lg bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Split Unequally
              </button>
            </div>

            {/* Select All Toggle */}
            <div className="flex justify-end px-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selectAll
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-zinc-600 group-hover:border-zinc-400"
                  }`}
                >
                  {selectAll && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="hidden"
                />
                <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  Select All
                </span>
              </label>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.map((member) => {
                const isSelected = selected.includes(member._id);
                return (
                  <div
                    key={member._id}
                    onClick={() => handleCheckboxChange(member._id)}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-900/10 border-indigo-500/30 shadow-[0_0_15px_-5px_rgba(99,102,241,0.1)]"
                        : "bg-zinc-900/20 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox Visual */}
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-zinc-700 bg-zinc-900"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? "text-white"
                            : "text-zinc-500 group-hover:text-zinc-300"
                        }`}
                      >
                        {member.username}
                      </span>
                    </div>

                    {/* Amount Input/Display */}
                    {isSelected && (
                      <div onClick={(e) => e.stopPropagation()}>
                        {splitMode === "equally" ? (
                          <span className="text-emerald-400 font-mono font-medium text-sm">
                            ₹{equalSplitAmount}
                          </span>
                        ) : (
                          <div className="relative w-24">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                              ₹
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={amounts[member._id] || ""}
                              onChange={(e) =>
                                handleAmountChange(e, member._id)
                              }
                              placeholder="0"
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1.5 pl-5 pr-2 text-right text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="mt-8 sticky bottom-4 z-20">
          {/* Unequal Split Validator Bar */}
          {splitMode === "unequally" && (
            <div
              className={`mb-3 px-4 py-2 rounded-lg border flex justify-between items-center text-xs font-bold uppercase tracking-wide backdrop-blur-md ${
                (parseFloat(mainAmount || 0) - calculateCustomTotal()).toFixed(
                  2
                ) === "0.00"
                  ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-400"
                  : "bg-red-900/30 border-red-500/30 text-red-400"
              }`}
            >
              <span>Amount Remaining</span>
              <span className="font-mono text-sm">
                ₹
                {Math.abs(
                  parseFloat(mainAmount || 0) - calculateCustomTotal()
                ).toFixed(2)}
              </span>
            </div>
          )}

          <button
            onClick={handleAddExpense}
            disabled={!mainAmount || !title || !paidBy || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all duration-300 transform active:scale-[0.98] ${
              !mainAmount || !title || !paidBy || isLoading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                : "bg-white text-black hover:bg-zinc-200 hover:shadow-white/10"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              "Confirm Transaction"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
