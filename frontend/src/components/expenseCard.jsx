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
      className="flex flex-col bg-gray-800 p-4 rounded-lg mb-4 cursor-pointer transition-all duration-300 ease-in-out"
      onClick={handleToggle}
    >
      {/* Main card content */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`${iconColor} p-3 rounded-full`}></div>
          <div className="ml-4">
            <h3 className="font-semibold">{title || category}</h3>
            {/* Inline categorization shown even when card is collapsed */}
            <p className="text-sm text-gray-300 mt-1">
              {category ? (
                <span>
                  <strong className="font-medium text-gray-200">
                    Category:
                  </strong>
                  <span className="text-gray-300"> {category}</span>
                  {subcategory && (
                    <span className="text-gray-400">
                      {" "}
                      &nbsp;→&nbsp; {subcategory}
                    </span>
                  )}
                </span>
              ) : (
                <span className="italic text-gray-500">Categorizing...</span>
              )}
            </p>
            <p className="text-xs pt-1 text-gray-400">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allowEdit && (
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-white transition-colors"
              title="Edit Expense"
            >
              <Edit3 size={18} />
            </button>
          )}
          {allowEdit && (
            <button
              onClick={handleDeleteClick}
              className="text-gray-400 hover:text-white transition-colors"
              title="Delete Expense"
            >
              <Trash2 size={18} />
            </button>
          )}
          <div className="text-lg font-semibold">₹{amount}</div>
        </div>
      </div>

      {/* Expanded section (on click anywhere in the left part) */}
      {isExpanded && (
        <div className="mt-4 bg-gray-900 p-4 rounded-lg">
          <p className="text-gray-300 mb-2">
            <strong>Paid by:</strong> {paidBy.username}
          </p>
          <p className="text-gray-300 mb-2">
            <strong>Beneficiaries:</strong>
          </p>
          <ul className="text-gray-400">
            {beneficiaries.map((person, index) => (
              <li key={index} className="ml-4 list-disc">
                {person.user.username} has a share of ₹{person.amount}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete Confirmation Overlay Inside Card */}
      {showDeleteModal && (
        <div className="relative mt-4">
          {/* Overlay background */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg z-10" />

          {/* Modal content */}
          <div className="relative z-20 bg-gray-800 p-4 rounded-lg border border-gray-600">
            <p className="text-white text-sm mb-3">
              Are you sure you want to delete this expense?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ExpenseCard.propTypes = {
  _id: PropTypes.string.isRequired,
  category: PropTypes.string,
  subcategory: PropTypes.string,
  time: PropTypes.string.isRequired,
  description: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  iconColor: PropTypes.string.isRequired,
  paidBy: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  beneficiaries: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        _id: PropTypes.string,
        username: PropTypes.string,
      }),
      amount: PropTypes.number,
    })
  ).isRequired,
};

export default ExpenseCard;
