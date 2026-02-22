import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Check, X, ArrowUpRight } from "lucide-react";
import ExpenseCard from "./expenseCard"; // Ensure this path is correct
import { FaChartBar } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import api from "../utils/api";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TripDetails = () => {
  const navigate = useNavigate();

  const { tripId } = useParams(); // Now you get tripId directly from URL
  const [members, setMembers] = useState([]);
  const [tripDetails, setTripDetails] = useState(null); // Store trip details
  const [loading, setLoading] = useState(true); // Loading state for the GET request
  const [expenses, setExpenses] = useState([]);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showArchiveConfirmation, setShowArchiveConfirmation] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setEditName(tripDetails?.name || "");
    setEditDescription(tripDetails?.description || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEditing = async () => {
    if (!editName.trim()) {
      toast.error("Trip name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const storedUser = localStorage.getItem("user");
      const user = JSON.parse(storedUser);
      const res = await api.put(`${API_BASE}/group/update/${tripId}`, {
        name: editName,
        description: editDescription,
        userId: user._id,
      });
      if (res.status === 200) {
        setTripDetails((prev) => ({
          ...prev,
          name: editName.trim(),
          description: editDescription.trim(),
        }));
        // Update localStorage too
        const cg = JSON.parse(localStorage.getItem("currentGroup") || "{}");
        cg.name = editName.trim();
        cg.description = editDescription.trim();
        localStorage.setItem("currentGroup", JSON.stringify(cg));
        toast.success("Trip updated!");
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating trip:", err);
      toast.error(err.response?.data?.message || "Failed to update trip.");
    } finally {
      setSaving(false);
    }
  };

  //Fetching group Meta Data
  useEffect(() => {
    const fetchMeta = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${API_BASE}/group/get-group/${tripId}`);
        setTripDetails(res.data);

        localStorage.setItem("currentGroup", JSON.stringify(res.data));

        const groupMembers = (res.data.members || []).map((m) => ({
          _id: m._id,
          username: m.username,
        }));

        localStorage.setItem("tripMembers", JSON.stringify(groupMembers));
        setMembers(groupMembers);
      } catch (e) {
        toast.error("Failed to load trip");
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [tripId]);

  //Fetching Group Expenses
  useEffect(() => {
    if (loadingExpenses || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadExpenses();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef.current, hasMore, loadingExpenses]);

  useEffect(() => {
    const onScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

      if (bottom) {
        loadExpenses();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [cursor, hasMore, loadingExpenses]);

  const loadExpenses = async () => {
    if (!hasMore || loadingExpenses) return;

    setLoadingExpenses(true);

    try {
      const res = await api.get(`${API_BASE}/group/${tripId}/expenses`, {
        params: { limit: 20, cursor },
      });

      setExpenses([...expenses, ...res.data.expenses]);
      setCursor(res.data.nextCursor);
      setHasMore(Boolean(res.data.nextCursor));
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Handle adding new members (avoid adding existing ones)
  const handleAddMember = () => {
    navigate(`/add-members/${tripId}`);
  };
  // console.log(expenses)

  const handleRemoveMember = () => {
    if (members.length <= 1) {
      toast.error("You must have at least one more member in the group.");
      return;
    }
    navigate(`/remove-members/${tripId}`);
  };

  const handleAddExpenseClick = () => {
    if (members.length <= 1) {
      toast.error(
        "Please add at least one more member to the group before adding an expense."
      );
      return;
    }
    navigate("/add-expense", { state: { members, propGroupId: tripId } });
  };

  const handleBackClick = () => {
    // Remove trip members and current group from localStorage
    localStorage.removeItem("tripMembers");
    localStorage.removeItem("currentGroup");

    // Navigate back to the dashboard
    navigate("/dash");
  };

  const HandleLeaveGroup = async () => {
    if (members.length <= 1) {
      toast.error("You cannot leave the group as you are the only member.");
      return;
    }
    try {
      const storedUser = localStorage.getItem("user");
      const user = JSON.parse(storedUser);
      const currentUserId = user._id;
      const res = await api.post(
        `${API_BASE}/group/remove-members/${tripId}`,
        // `//http://localhost:8000/group/remove-members/${tripId}`,
        {
          members: [currentUserId], // Send only the current user ID to remove
        }
      );

      if (res.status !== 200) {
        toast.error("Failed to leave group. Try again.");
        return;
      }

      toast.success("You left the group successfully!");

      // Clear local storage
      localStorage.removeItem("tripMembers");
      localStorage.removeItem("currentGroup");

      // Redirect to dashboard
      navigate("/dash");
    } catch (error) {
      console.error("Leave Group Error:", error);
      toast.error("An error occurred while leaving the group.");
    }
  };
  // true if the current user is in this group's hiddenBy list
  const isArchived = (() => {
    const userId = Cookies.get("id");
    return (tripDetails?.hiddenBy || []).some(
      (id) => id === userId || id?.toString?.() === userId
    );
  })();

  const handleToggleArchive = async () => {
    setIsArchiving(true);
    try {
      const userId = Cookies.get("id");
      if (isArchived) {
        await api.put(`${API_BASE}/group/unarchive/${tripId}`, { userId });
        // Refresh group data so isArchived recalculates
        const res = await api.get(`${API_BASE}/group/get-group/${tripId}`);
        setTripDetails(res.data);
        toast.success("Group unarchived! It's back in your trips list.");
      } else {
        await api.put(`${API_BASE}/group/archive/${tripId}`, { userId });
        toast.success("Group archived. Find it anytime in Archived Trips.");
        localStorage.removeItem("tripMembers");
        localStorage.removeItem("currentGroup");
        navigate("/dash");
      }
    } catch (err) {
      console.error("Archive toggle error:", err);
      toast.error(isArchived ? "Failed to unarchive group." : "Failed to archive group.");
    } finally {
      setIsArchiving(false);
      setShowArchiveConfirmation(false);
    }
  };

  const handleDeleteExpense = (deletedExpenseId) => {
    // 2a) Filter it out of local `expenses`
    setExpenses((prev) => prev.filter((exp) => exp._id !== deletedExpenseId));

    // 2b) Also remove it from the `currentGroup` in localStorage
    const rawCurrentGroup = localStorage.getItem("currentGroup");
    if (rawCurrentGroup) {
      try {
        const cg = JSON.parse(rawCurrentGroup);
        cg.expenses = cg.expenses.filter((exp) => exp._id !== deletedExpenseId);
        localStorage.setItem("currentGroup", JSON.stringify(cg));
      } catch (e) {
        console.error("Failed to remove expense from localStorage:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative font-sans selection:bg-indigo-500/30">
      {/* --- BACKGROUND ATMOSPHERE --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* --- NAVIGATION BAR --- */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackClick}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
              Dashboard
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchiveConfirmation(true)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider border border-transparent ${
                isArchived
                  ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20"
                  : "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20"
              }`}
            >
              {isArchived ? "Unarchive" : "Archive"}
            </button>
            <button
              onClick={() => setShowLeaveConfirmation(true)}
              className="text-xs font-bold text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors uppercase tracking-wider border border-transparent hover:border-red-500/20"
            >
              Leave Group
            </button>
          </div>
        </div>

        {/* --- HERO SECTION: Compact Mission Brief --- */}
        <div className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl mb-6">
          {/* Subtle Top Glow */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0"></div>

          <div className="px-5 py-5 sm:px-6 sm:py-6">
            {loading ? (
              <div className="animate-pulse flex justify-between items-center">
                <div className="space-y-2 w-1/2">
                  <div className="h-8 w-3/4 bg-zinc-800 rounded-lg"></div>
                  <div className="h-3 w-1/2 bg-zinc-800 rounded-lg"></div>
                </div>
                <div className="h-10 w-24 bg-zinc-800 rounded-lg"></div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Trip Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20 px-1.5 rounded">
                      Trip #
                      {tripDetails?._id?.slice(-4).toUpperCase() || "0000"}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 mt-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xl font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                        placeholder="Trip name"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        placeholder="Description (optional)"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveEditing}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors border border-white/10"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 group/title">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tight truncate">
                          {tripDetails?.name}
                        </h1>
                        <button
                          onClick={startEditing}
                          className="p-1 rounded-md hover:bg-white/10 text-zinc-500 hover:text-indigo-400 transition-all"
                          title="Edit trip details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-zinc-500 text-sm mt-1 line-clamp-1 max-w-xl font-medium">
                        {tripDetails?.description || "No description provided."}
                      </p>
                    </>
                  )}
                </div>

                {/* Compact Actions */}
                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <button
                    onClick={() =>
                      navigate("/analytics", { state: { group: tripDetails } })
                    }
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <FaChartBar className="text-indigo-400 group-hover:text-indigo-300 text-xs" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Analytics
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT COLUMN: The Crew (Members) --- */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 sm:p-5 backdrop-blur-sm lg:sticky lg:top-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  The Crew
                  <span className="text-[10px] sm:text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5">
                    {members.length}
                  </span>
                </h2>
              </div>

              {/* Members List - Compact on Mobile */}
              <div className="space-y-2 sm:space-y-3 max-h-[180px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {members.length > 0 ? (
                  members.map((member, index) => {
                    const storedUser = localStorage.getItem("user");
                    const currentUser = storedUser ? JSON.parse(storedUser) : null;
                    const isCurrentUser = currentUser && member._id === currentUser._id;

                    const handleMemberClick = (e) => {
                      if (isCurrentUser) {
                        e.preventDefault();
                        toast.error("Cannot view transaction history with yourself!");
                      }
                    };

                    return (
                      <div key={index}>
                        {isCurrentUser ? (
                          <div
                            onClick={handleMemberClick}
                            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-indigo-400 font-bold text-xs sm:text-sm shadow-inner group-hover:border-indigo-500/50 transition-colors">
                              {typeof member === "string"
                                ? member.charAt(0)
                                : member?.username?.charAt(0) || "?"}
                            </div>
                            <span className="text-xs sm:text-sm text-zinc-300 font-medium truncate flex-1">
                              {typeof member === "string"
                                ? member
                                : member?.username}
                            </span>
                          </div>
                        ) : (
                          <Link to={`/transaction-history/${member._id}`}>
                            <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-white/5 transition-colors group">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-indigo-400 font-bold text-xs sm:text-sm shadow-inner group-hover:border-indigo-500/50 transition-colors">
                                {typeof member === "string"
                                  ? member.charAt(0)
                                  : member?.username?.charAt(0) || "?"}
                              </div>
                              <span className="text-xs sm:text-sm text-zinc-300 font-medium truncate flex-1">
                                {typeof member === "string"
                                  ? member
                                  : member?.username}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-zinc-500 italic text-xs sm:text-sm">
                    Flying solo?
                  </p>
                )}
              </div>

              {/* Member Actions */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/5">
                <button
                  onClick={handleAddMember}
                  className="flex items-center justify-center gap-2 py-1.5 sm:py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] sm:text-xs font-bold uppercase transition-colors"
                >
                  + Add
                </button>
                <button
                  onClick={handleRemoveMember}
                  className="flex items-center justify-center gap-2 py-1.5 sm:py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-400 text-[10px] sm:text-xs font-bold uppercase transition-colors"
                >
                  - Remove
                </button>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: The Log (Expenses) --- */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Mission Log
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </h2>
              <button
                onClick={handleAddExpenseClick}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <span>+</span> Add Expense
              </button>
            </div>

            {loadingExpenses && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="space-y-4 min-h-[300px]">
              {expenses.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 text-center p-8">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-300">Log Empty</h3>
                  <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">
                    Start recording your expenses to populate the mission log.
                  </p>
                </div>
              ) : (
                expenses.map((expense, idx) => (
                  <ExpenseCard
                    key={idx}
                    _id={expense._id}
                    title={expense.title}
                    category={expense.category}
                    subcategory={expense.subcategory}
                    time={expense.createdAt}
                    description={""}
                    amount={expense.amount}
                    iconColor={"bg-indigo-500"} // Maintaining the theme
                    paidBy={expense.paidBy}
                    beneficiaries={expense.owedBy}
                    onDelete={handleDeleteExpense}
                  />
                ))
              )}
              <div ref={loaderRef} className="h-1 w-full"></div>
            </div>
          </div>
        </div>

        {/* --- LEAVE CONFIRMATION MODAL --- */}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-zinc-900 border border-red-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl shadow-red-900/10">
              <h3 className="text-xl font-bold text-white mb-2">
                Abort Mission?
              </h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Leaving this group will remove your access to all shared
                expenses and analytics. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveConfirmation(false)}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={() => {
                    setShowLeaveConfirmation(false);
                    HandleLeaveGroup();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all"
                >
                  Leave Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ARCHIVE / UNARCHIVE CONFIRMATION MODAL --- */}
        {showArchiveConfirmation && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className={`bg-zinc-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl border ${
              isArchived ? "border-emerald-500/30 shadow-emerald-900/10" : "border-amber-500/30 shadow-amber-900/10"
            }`}>
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${
                isArchived ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"
              }`}>
                <svg className={`w-6 h-6 ${isArchived ? "text-emerald-400" : "text-amber-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isArchived ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  )}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {isArchived ? "Unarchive this group?" : "Archive this group?"}
              </h3>
              <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
                {isArchived
                  ? "This group will be restored to your active trips list. Everything is still intact."
                  : <>This group will be hidden from your dashboard and trips list. <span className="text-zinc-200 font-medium">Everything stays intact</span> — members, expenses, and balances are untouched.</>}
              </p>
              {!isArchived && (
                <p className="text-zinc-600 text-xs mb-6 leading-relaxed border-t border-white/5 pt-3">
                  You can unarchive it anytime from the Archived Trips section.
                </p>
              )}
              <div className={`flex gap-3 ${isArchived ? "mt-6" : ""}`}>
                <button
                  onClick={() => setShowArchiveConfirmation(false)}
                  disabled={isArchiving}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleArchive}
                  disabled={isArchiving}
                  className={`flex-1 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all disabled:opacity-50 ${
                    isArchived
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
                      : "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20"
                  }`}
                >
                  {isArchiving ? "Please wait..." : isArchived ? "Unarchive" : "Archive"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetails;
