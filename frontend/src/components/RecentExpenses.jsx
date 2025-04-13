import ExpenseCard from "./expenseCard"; // Make sure this path is correct based on your folder structure
import { Link } from "react-router-dom";

const RecentExpenses = () => {
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
        <ExpenseCard
          category="Grocery"
          time="5:12 pm"
          description="Belanja di pasar"
          amount="326.80"
          iconColor="bg-blue-500"
          paidBy="John Doe"
          beneficiaries={["Alice", "Bob", "Charlie", "Jane"]}
        />
        <ExpenseCard
          category="Pizza"
          time="3:12 am"
          description="Pizza 50"
          amount="180.00"
          iconColor="bg-blue-500"
          paidBy="Richard"
          beneficiaries={["Alice", "Bob", "Charlie", "Jane"]}
        />
        <ExpenseCard
          category="Transportation"
          time="5:12 pm"
          description="Naik bus umum"
          amount="15"
          iconColor="bg-purple-500"
          paidBy="Jane Smith"
          beneficiaries={["John", "Alice"]}
        />
      </div>
    </div>
  );
};

export default RecentExpenses;
