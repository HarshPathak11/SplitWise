
// src/components/ExpenseCard.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { Trash2, Edit3 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ExpenseCard = ({
  _id,
  category,
  time,
  description, // (we aren’t using description in expanded view, but you can if needed)
  amount,
  iconColor,
  paidBy,        // { _id, username }
  beneficiaries, // [ { user: { _id, username }, amount } ]
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEdit = () => {
    // Navigate to /expense/edit/:expenseId
    navigate(`/expense/edit`, {
      state: { originalExpense: { _id, time, category, description, amount, paidBy, beneficiaries } },
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`https://fairfare-0hyl.onrender.com/group/del-expense/${_id}`);
      toast.success("Expense deleted");
      setShowDeleteModal(false);
      // Option A: reload the page or refetch the expense list
      // Option B: If parent is controlling a list, you can emit an event or use a callback prop to remove it.
      // Here we’ll simply remove the card by unmounting it:
      onDelete(_id)
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
    <div className="flex flex-col bg-gray-800 p-4 rounded-lg mb-4 cursor-pointer transition-all duration-300 ease-in-out">
      {/* Main card content */}
      <div className="flex justify-between items-center">
        <div className="flex items-center" onClick={handleToggle}>
          <div className={`${iconColor} p-3 rounded-full`}></div>
          <div className="ml-4">
            <h3 className="font-semibold">{category}</h3>
            <p className="text-sm text-gray-400">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="text-gray-400 hover:text-white transition-colors"
            title="Edit Expense"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-gray-400 hover:text-white transition-colors"
            title="Delete Expense"
          >
            <Trash2 size={18} />
          </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <p className="text-white text-lg mb-4">
              Are you sure you want to delete this expense?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white rounded px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2"
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
  category: PropTypes.string.isRequired,
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
