import ExpenseCard from "./expenseCard"; // Make sure this path is correct based on your folder structure
import OptimizedList from "./OptimizedList";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";

const RecentExpenses = (user) => {
  const [recentExpenses, setRecentExpenses] = useState([]);

  // Memoized recent expenses processing
  const processedExpenses = useMemo(() => {
    if (!user?.user?.recentExpense || !Array.isArray(user.user.recentExpense)) {
      return [];
    }

    // Sort expenses by createdAt in descending order and take top 3
    const sortedExpenses = [...user.user.recentExpense].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sortedExpenses.slice(0, 3);
  }, [user?.user?.recentExpense]);

  useEffect(() => {
    setRecentExpenses(processedExpenses);
  }, [processedExpenses]);

  // Memoized render function for expense cards
  const renderExpenseCard = useCallback((expense, index) => (
    <ExpenseCard
      title={expense?.title}
      category={expense?.category}
      subcategory={expense?.subcategory}
      time={expense?.createdAt}
      description=""
      amount={expense?.amount}
      iconColor="bg-blue-500"
      paidBy={expense?.paidBy}
      beneficiaries={expense?.owedBy}
    />
  ), []);

  // Key extractor for better performance
  const keyExtractor = useCallback((expense) => expense?.id || expense?._id, []);

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

      <OptimizedList
        items={recentExpenses}
        renderItem={renderExpenseCard}
        keyExtractor={keyExtractor}
        emptyMessage="No Expenses Yet"
        spacing="space-y-3 sm:space-y-4"
      />
    </div>
  );
};

export default RecentExpenses;
