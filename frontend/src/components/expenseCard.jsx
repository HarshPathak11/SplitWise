import { useState } from "react";
import PropTypes from "prop-types";
import { Trash2, Edit3 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ExpenseCard = ({
  _id,
  title,
  category,
  subcategory,
  time,
  description, // (we aren’t using description in expanded view, but you can if needed)
  amount,
  iconColor,
  paidBy, // { _id, username }
  beneficiaries, // [ { user: { _id, username }, amount } ]
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const allowEdit =
    window.location.pathname !== "/dash" &&
    window.location.pathname !== "/allExpenses";

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEdit = () => {
    // Navigate to /expense/edit/:expenseId
    navigate(`/expense/edit`, {
      state: {
        originalExpense: {
          _id,
          time,
          title,
          category,
          subcategory,
          description,
          amount,
          paidBy,
          beneficiaries,
        },
      },
    });
  };

  const handleDeleteClick = () => {
    handleToggle();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE}/group/del-expense/${_id}`
        // `//http://localhost:8000/group/del-expense/${_id}`
      );
      toast.success("Expense deleted");
      setShowDeleteModal(false);
      // Option A: reload the page or refetch the expense list
      // Option B: If parent is controlling a list, you can emit an event or use a callback prop to remove it.
      // Here we’ll simply remove the card by unmounting it:
      onDelete(_id);
      setIsExpanded(false);
      // Since we don’t have a parent callback, you might force a reload:
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete expense");
      setShowDeleteModal(false);
    }
  };

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const date = new Date(time).toLocaleString("en-US", options);

  return (
    <div
      className="group relative flex flex-col bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all duration-300 ease-out overflow-hidden"
      onClick={(e) => {
        // Prevent toggle if clicking buttons or modal
        if (
          e.target.closest("button") ||
          e.target.closest(".delete-modal-content")
        )
          return;
        handleToggle();
      }}
    >
      {/* --- Main Card Content --- */}
      <div className="flex justify-between items-center p-4 cursor-pointer relative z-10">
        {/* Left: Icon & Details */}
        <div className="flex items-center gap-4">
          {/* Glowing Status Orb */}
          <div className="relative flex-shrink-0">
            <div
              className={`absolute inset-0 ${iconColor} blur-md opacity-40 group-hover:opacity-60 transition-opacity`}
            ></div>
            <div
              className={`relative w-10 h-10 rounded-full ${iconColor} bg-opacity-20 flex items-center justify-center border border-white/10 shadow-inner`}
            >
              {/* Optional: You can put an icon here later. For now, a simple dot or initial */}
              <div
                className={`w-2 h-2 rounded-full ${iconColor.replace(
                  "bg-",
                  "bg-"
                )}-200 bg-white`}
              ></div>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-zinc-100 text-base leading-tight group-hover:text-indigo-200 transition-colors">
              {title || category}
            </h3>

            {/* Inline Categorization Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {category ? (
                <>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-white/5">
                    {category}
                  </span>
                  {subcategory && (
                    <>
                      <span className="text-[10px] text-zinc-600">›</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800/50 text-zinc-500 border border-white/5">
                        {subcategory}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-[10px] italic text-zinc-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-zinc-600 animate-ping"></span>
                  Processing
                </span>
              )}
            </div>

            <p className="text-[10px] text-zinc-500 mt-1 font-mono tracking-wide opacity-60">
              {date}
            </p>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex items-center gap-4">
          {/* Actions - Fade in on hover for cleaner look */}
          <div className="flex items-center gap-1 transition-opacity duration-200 translate-x-2 group-hover:translate-x-0">
            {allowEdit && (
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                title="Edit Expense"
              >
                <Edit3 size={16} />
              </button>
            )}
            {allowEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete Expense"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Amount Display */}
          <div className="text-right">
            <div className="text-lg font-mono font-medium text-white tracking-tight">
              ₹{amount?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* --- Expanded Details Section --- */}
      <div
        className={`bg-black/20 border-t border-white/5 overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 flex flex-col sm:flex-row gap-6 text-sm">
          {/* Payer Info */}
          <div className="sm:w-1/3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">
              Transaction Details
            </p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold border border-indigo-500/30">
                P
              </div>
              <span className="text-zinc-300">
                Paid by{" "}
                <span className="text-white font-medium">
                  {paidBy?.username}
                </span>
              </span>
            </div>
          </div>

          {/* Split Details */}
          <div className="sm:w-2/3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">
              Split Breakdown
            </p>
            <div className="space-y-2">
              {beneficiaries?.map((person, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between group/row"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover/row:bg-emerald-500 transition-colors"></div>
                    <span className="text-zinc-400 group-hover/row:text-zinc-200 transition-colors">
                      {person.user?.username}
                    </span>
                  </div>
                  <div className="font-mono text-zinc-500 group-hover/row:text-emerald-400 transition-colors">
                    ₹{person.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Delete Confirmation Modal (Embedded) --- */}
      {showDeleteModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm delete-modal-content animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-red-500/30 rounded-xl p-4 shadow-2xl shadow-red-900/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-white font-medium">Delete Transaction?</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  This action cannot be undone. It will affect balances for
                  everyone involved.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ExpenseCard.propTypes = {
//   _id: PropTypes.string.isRequired,
//   category: PropTypes.string,
//   subcategory: PropTypes.string,
//   time: PropTypes.string.isRequired,
//   description: PropTypes.string,
//   amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//   iconColor: PropTypes.string.isRequired,
//   paidBy: PropTypes.shape({
//     _id: PropTypes.string,
//     username: PropTypes.string,
//   }).isRequired,
//   beneficiaries: PropTypes.arrayOf(
//     PropTypes.shape({
//       user: PropTypes.shape({
//         _id: PropTypes.string,
//         username: PropTypes.string,
//       }),
//       amount: PropTypes.number,
//     })
//   ).isRequired,
// };

export default ExpenseCard;
