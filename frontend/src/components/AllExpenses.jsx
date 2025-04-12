import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseCard from "./expenseCard"; // Make sure this component exists and is styled properly

const AllExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Example: fetch expenses from backend API
    const fetchExpenses = async () => {
      try {
        const response = await fetch("/api/user/expenses");
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  const handleExpenseClick = (expense) => {
    navigate("/expenseDetails", { state: { expense } });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">All Expenses</h1>

      {expenses.length === 0 ? (
        <p className="text-red-500 text-center font-semibold">
          No expenses found.
        </p>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense._id || expense.id}
              expense={expense}
              onClick={() => handleExpenseClick(expense)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllExpensesPage;