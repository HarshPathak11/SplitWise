import ExpenseCard from "./expenseCard"; // Make sure this path is correct based on your folder structure
import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const RecentExpenses = (user) => {
  const [recentExpenses, setRecentExpenses] = useState([]);

  useEffect(() => {
    if (user) {
      try {
        const parsedUser = user?.user;

        if (
          parsedUser.recentExpense &&
          Array.isArray(parsedUser.recentExpense)
        ) {
          // Sort expenses by createdAt in descending order (most recent first)
          const sortedExpenses = [...parsedUser.recentExpense].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          // Take the top 4 expenses after sorting.
          const topExpenses = sortedExpenses.slice(0, 3);
          setRecentExpenses(topExpenses);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, [user]);

  return (
    <div className="backdrop-blur-lg bg-gray-800/30 p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h2 className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] hover:animate-text">
          Recent Expenses
        </h2>

        <Link to="/allExpenses">
          <button
            type="button"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
          >
            Show All
          </button>
        </Link>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {recentExpenses && recentExpenses.length > 0 ? (
          recentExpenses.map((expense, index) => (
            <ExpenseCard
              key={expense.id || expense._id || index}
              // Pass explicit title separately so the card header shows the actual expense title
              title={expense.title}
              // Use backend category/subcategory directly (don't fall back to title here)
              category={expense.category}
              subcategory={expense.subcategory}
              time={expense.createdAt}
              description={""}
              amount={expense.amount}
              iconColor={"bg-blue-500"}
              paidBy={expense.paidBy}
              beneficiaries={expense.owedBy}
            />
          ))
        ) : (
          <div className="text-center text-gray-300">No Expenses Yet</div>
        )}
      </div>
    </div>
  );
};

export default RecentExpenses;
