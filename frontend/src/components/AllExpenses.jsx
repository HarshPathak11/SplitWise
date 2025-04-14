import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseCard from "./expenseCard"; // Ensure this component is styled properly
import { FaArrowLeft } from "react-icons/fa";

const AllExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Fetch expenses from backend API
    const fetchExpenses = async () => {
      try {
        const response = await fetch("http://localhost:8000/user/expenses");
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
    <div className="min-h-screen flex flex-col bg-[#000000] text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
      </div>

      {/* Back Button */}
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
        <button
          onClick={() => navigate("/dash")} // Navigate to the dashboard
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
          title="Back to Dashboard"
        >
          <FaArrowLeft className="text-white text-xl" />
        </button>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center text-[#00F5FF] mb-6">
          All Expenses
        </h1>
        <p className="text-center text-white mb-8">
          View all your expenses in one place.
        </p>
      </div>

      {/* Expenses List */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto z-10 relative">
        {expenses.length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            No expenses found.
          </p>
        ) : (
          <div className="space-y-4">
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
    </div>
  );
};

export default AllExpensesPage;
