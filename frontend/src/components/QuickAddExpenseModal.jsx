import { useState, useEffect } from "react";
import { X, Receipt, CheckCircle, Search } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const QuickAddExpenseModal = ({ isOpen, onClose, user }) => {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [trips, setTrips] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
            <div
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">Quick Add</h3>
                            <p className="text-xs text-zinc-400">Split equally in a group</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

                    {/* Amount input - Large and prominent */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                            Amount (₹)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-4 text-3xl font-bold text-white text-center focus:outline-none focus:border-indigo-500/50 transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                            What was this for?
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Dinner, Uber, Groceries..."
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                    </div>

                    {/* Group Select */}
                    <div className="relative">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                            Which group?
                        </label>

                        {trips.length > 0 ? (
                            <div className="relative">
                                {/* Search and Selection UI */}
                                <div className="flex flex-col gap-2">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            placeholder="Search groups..."
                                            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        />
                                    </div>

                                    {/* Filtered List / Dropdown */}
                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-40 overflow-y-auto bg-zinc-900 border border-white/10 rounded-xl shadow-xl scrollbar-hide">
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
                                                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${selectedTripId === trip._id ? 'text-indigo-400 font-bold bg-white/5' : 'text-zinc-300'}`}
                                                    >
                                                        {trip.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-xs text-zinc-500 italic">No matches found</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Visual Indicator if dropdown closed */}
                                {!isDropdownOpen && selectedTripId && (
                                    <div className="mt-2 text-[10px] text-indigo-400 font-medium px-1 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Selected: {trips.find(t => t._id === selectedTripId)?.name}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-500 text-sm italic">
                                No groups found. Create one first!
                            </div>
                        )}
                    </div>

                    {/* Spacer */}
                    <div className="h-2"></div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || trips.length === 0}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold tracking-wide transition-all ${loading || trips.length === 0
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white/100 rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Add Expense
                            </>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default QuickAddExpenseModal;
