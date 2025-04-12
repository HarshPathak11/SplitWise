import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ExpenseCard from "./expenseCard"; // Ensure this path is correct

const TripDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [members, setMembers] = useState([]);

  // Utility to deduplicate members (assuming members are strings or objects with 'username')
  const dedupeMembers = (list) => {
    const map = new Map();
    list.forEach((member) => {
      const key = typeof member === "string" ? member : member?.username || member;
      if (!map.has(key)) {
        map.set(key, member);
      }
    });
    return Array.from(map.values());
  };

  // Initial loading of trip members + add current user
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const currentUser = userData?.user?.username;
  
    const stored = JSON.parse(localStorage.getItem("tripMembers"));
  
    if (!stored && currentUser) {
      // If tripMembers does not exist, create it with current user
      localStorage.setItem("tripMembers", JSON.stringify([currentUser]));
      setMembers([currentUser]);
    } else {
      // If it exists, ensure current user is included
      let initialMembers = stored || [];
      if (currentUser && !initialMembers.includes(currentUser)) {
        initialMembers.push(currentUser);
      }
  
      const uniqueMembers = dedupeMembers(initialMembers);
      setMembers(uniqueMembers);
      localStorage.setItem("tripMembers", JSON.stringify(uniqueMembers));
    }
  }, []);
  
  // Handle incoming new members from "Add Members" screen
  useEffect(() => {
    if (location.state?.selectedMembers?.length) {
      const stored = JSON.parse(localStorage.getItem("tripMembers")) || [];
      const incoming = location.state.selectedMembers;

      const allMembers = dedupeMembers([...stored, ...incoming]);
      setMembers(allMembers);
      localStorage.setItem("tripMembers", JSON.stringify(allMembers));
    }
  }, [location.state]);

  const handleAddExpenseClick = () => {
    if (members.length === 0) {
      alert("Please add at least one more member to the group before adding an expense.");
      return;
    }
    navigate("/add-expense", { state: { members } });
  };

  const handleAddMember = () => {
    navigate("/add-members", { state: { members } });
  };

  const expenses = [
    {
      category: "Grocery",
      time: "5:12 pm",
      description: "Belanja di pasar",
      amount: "1289.80",
      iconColor: "bg-blue-500",
      paidBy: "John Doe",
      beneficiaries: ["Alice", "Bob", "Charlie", "John Doe"],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6">
      {/* Back Button */}
      <button
        className="flex items-center text-white mb-6 hover:text-gray-300"
        onClick={() => navigate("/dash")}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Card Container */}
      <div className="p-6 sm:p-8 max-w-4xl mx-auto shadow-lg rounded-2xl bg-black space-y-10">
        {/* Trip Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold">Goa Trip</h1>
            <p className="text-base sm:text-lg text-gray-300 mt-1">
              Trip Description
            </p>
          </div>
        </div>

        {/* Members Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl sm:text-2xl font-semibold">Members</h2>
            <button
              onClick={handleAddMember}
              className="text-sm border border-white px-3 py-1 rounded hover:bg-white hover:text-black transition"
            >
              + Add Member
            </button>
          </div>
          {members.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="bg-gray-800 text-white py-2 px-4 rounded-xl text-center"
                >
                  {typeof member === "string"
                    ? member
                    : member?.username || JSON.stringify(member)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No members added yet.</p>
          )}
        </div>

        {/* Expenses Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Expenses</h2>
            <button
              className="border border-white text-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition whitespace-nowrap"
              onClick={handleAddExpenseClick}
            >
              Add Expense
            </button>
          </div>

          <div className="mt-10">
            {expenses.length === 0 ? (
              <div className="text-center text-xl sm:text-2xl font-medium text-gray-300 mt-16">
                No Expenses Yet
              </div>
            ) : (
              expenses.map((expense, idx) => (
                <ExpenseCard
                  key={idx}
                  category={expense.category}
                  time={expense.time}
                  description={expense.description}
                  amount={expense.amount}
                  iconColor={expense.iconColor}
                  paidBy={expense.paidBy}
                  beneficiaries={expense.beneficiaries}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
