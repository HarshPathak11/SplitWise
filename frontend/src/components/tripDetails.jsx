import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ExpenseCard from "./expenseCard"; // Ensure this path is correct
import { FaChartBar } from "react-icons/fa";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TripDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { tripId } = useParams(); // Now you get tripId directly from URL
  const [members, setMembers] = useState([]);
  const [tripDetails, setTripDetails] = useState(null); // Store trip details
  const [loading, setLoading] = useState(true); // Loading state for the GET request
  const [expenses, setExpenses] = useState([]);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!tripId) return;
      const getCurrentGroup = localStorage.getItem("currentGroup");

      if (getCurrentGroup) {
        const parsedGroup = JSON.parse(getCurrentGroup); // Parse the string into an object
        setTripDetails(parsedGroup);
        // Extract only the usernames from group members
        const groupMembers = parsedGroup.members.map((m) => {
          return { _id: m._id, username: m.username };
        });
        const sortedExpenses = parsedGroup.expenses.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setExpenses(sortedExpenses);

        // Refresh expenses to get updated categories/subcategories
        (async () => {
          try {
            const refreshed = await Promise.all(
              sortedExpenses.map(async (exp) => {
                // If category is missing or equals title (uncategorized), fetch fresh expense
                if (!exp.category || exp.category === exp.title) {
                  try {
                    const res = await axios.get(
                      `${API_BASE}/group/expense/${exp._id}`
                    );
                    if (res.data && res.data.expense) {
                      return { ...exp, ...res.data.expense };
                    }
                  } catch (e) {
                    // ignore per-expense fetch errors
                    return exp;
                  }
                }
                return exp;
              })
            );
            setExpenses(refreshed);
          } catch (err) {
            console.error("Error refreshing trip expenses:", err);
          }
        })();
        // Set directly to localStorage (no merge)
        localStorage.setItem("tripMembers", JSON.stringify(groupMembers));
        setMembers(groupMembers);
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE}/group/get-group/${tripId}`
          // `//http://localhost:8000/group/get-group/${tripId}` // Use your local or production URL
        );
        if (response.status === 200) {
          const group = response.data;

          setTripDetails(group);
          setLoading(false);
          const sortedExpenses = group.expenses.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setExpenses(sortedExpenses);

          // Refresh expenses to get updated categories/subcategories
          (async () => {
            try {
              const refreshed = await Promise.all(
                sortedExpenses.map(async (exp) => {
                  // If category is missing or equals title (uncategorized), fetch fresh expense
                  if (!exp.category || exp.category === exp.title) {
                    try {
                      const res = await axios.get(
                        `${API_BASE}/group/expense/${exp._id}`
                      );
                      if (res.data && res.data.expense) {
                        return { ...exp, ...res.data.expense };
                      }
                    } catch (e) {
                      // ignore per-expense fetch errors
                      return exp;
                    }
                  }
                  return exp;
                })
              );
              setExpenses(refreshed);
            } catch (err) {
              console.error("Error refreshing trip expenses:", err);
            }
          })();

          // Extract only the usernames from group members
          const groupMembers = group.members.map((m) => {
            return { _id: m._id, username: m.username };
          });

          // Set directly to localStorage (no merge)
          localStorage.setItem("tripMembers", JSON.stringify(groupMembers));
          localStorage.setItem("currentGroup", JSON.stringify(group));
          setMembers(groupMembers);
        }
      } catch (error) {
        console.error("Error fetching trip details:", error);
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);
  // 2) Re-fetch only the expenses if `expenseEdited` is true
  useEffect(() => {
    // console.log(location.state?.expenseEdited)
    if (location.state?.expenseEdited) {
      // Clear the flag so we don't loop
      navigate(location.pathname, { replace: true, state: {} });

      // Re-fetch just the group (or just the expenses part)
      const reloadExpenses = async () => {
        try {
          const response = await axios.get(
            `${API_BASE}/group/get-group/${tripId}`
            // `//http://localhost:8000/group/get-group/${tripId}`
          );
          if (response.status === 200) {
            const group = response.data;
            // Only update the `expenses` list (you could also update members/tripDetails if needed)
            const sortedExpenses = group.expenses
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setExpenses(sortedExpenses);

            // Keep localStorage in sync
            const rawCurrentGroup = localStorage.getItem("currentGroup");
            if (rawCurrentGroup) {
              try {
                const cg = JSON.parse(rawCurrentGroup);
                cg.expenses = group.expenses;
                localStorage.setItem("currentGroup", JSON.stringify(cg));
              } catch (e) {
                console.error("Failed to patch localStorage after edit:", e);
              }
            }
          }
        } catch (err) {
          console.error("Error reloading expenses:", err);
          toast.error("Could not refresh expenses after edit");
        }
      };

      reloadExpenses();
    }
  }, [location.state?.expenseEdited, tripId, navigate]);

  // Handle adding new members (avoid adding existing ones)
  const handleAddMember = () => {
    navigate(`/add-members/${tripId}`);
  };
  // console.log(expenses)

  const handleRemoveMember = () => {
    if (members.length <= 1) {
      toast.error("You must have at least one member in the group.");
      return;
    }
    navigate(`/remove-members/${tripId}`);
  };

  const handleAddExpenseClick = () => {
    if (members.length <= 1) {
      toast.error(
        "Please add at least one more member to the group before adding an expense."
      );
      return;
    }
    navigate("/add-expense", { state: { members, propGroupId: tripId } });
  };

  const handleBackClick = () => {
    // Remove trip members and current group from localStorage
    localStorage.removeItem("tripMembers");
    localStorage.removeItem("currentGroup");

    // Navigate back to the dashboard
    navigate("/dash");
  };

  const HandleLeaveGroup = async () => {
    if (members.length <= 1) {
      toast.error("You cannot leave the group as you are the only member.");
      return;
    }
    try {
      const storedUser = localStorage.getItem("user");
      const user = JSON.parse(storedUser);
      const currentUserId = user._id;
      const res = await axios.post(
        `${API_BASE}/group/remove-members/${tripId}`,
        // `//http://localhost:8000/group/remove-members/${tripId}`,
        {
          members: [currentUserId], // Send only the current user ID to remove
        }
      );

      if (res.status !== 200) {
        toast.error("Failed to leave group. Try again.");
        return;
      }

      toast.success("You left the group successfully!");

      // Clear local storage
      localStorage.removeItem("tripMembers");
      localStorage.removeItem("currentGroup");

      // Redirect to dashboard
      navigate("/dash");
    } catch (error) {
      console.error("Leave Group Error:", error);
      toast.error("An error occurred while leaving the group.");
    }
  };
  const handleDeleteExpense = (deletedExpenseId) => {
    // 2a) Filter it out of local `expenses`
    setExpenses((prev) => prev.filter((exp) => exp._id !== deletedExpenseId));

    // 2b) Also remove it from the `currentGroup` in localStorage
    const rawCurrentGroup = localStorage.getItem("currentGroup");
    if (rawCurrentGroup) {
      try {
        const cg = JSON.parse(rawCurrentGroup);
        cg.expenses = cg.expenses.filter((exp) => exp._id !== deletedExpenseId);
        localStorage.setItem("currentGroup", JSON.stringify(cg));
      } catch (e) {
        console.error("Failed to remove expense from localStorage:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-48 md:w-72 h-48 md:h-72 bg-[#9e27ff] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-0 -right-4 w-48 md:w-72 h-48 md:h-72 bg-[#00FFA3] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-48 md:w-72 h-48 md:h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      <div className="justify-between items-center flex flex-wrap gap-4 mb-5">
        {/* Back Button */}
        <button
          className="flex items-center text-white hover:text-gray-300 backdrop-blur-lg bg-[rgba(255,255,255,0.1)] mt-5  p-2 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
          onClick={handleBackClick}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Leave Button */}
        <button
          className="flex items-center text-white hover:text-gray-300 backdrop-blur-lg bg-[rgba(255,255,255,0.1)] mt-5  p-2 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
          onClick={() => setShowLeaveConfirmation(true)}
        >
          Leave Group
        </button>
        
        {/* Leave Group Confirmation Popup */}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Leave Group</h3>
              <p className="mb-6">Are you sure you want to leave this group? You will no longer have access to the group's expenses.</p>
              <div className="flex justify-end gap-4">
                <button 
                  className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition"
                  onClick={() => setShowLeaveConfirmation(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                  onClick={() => {
                    setShowLeaveConfirmation(false);
                    HandleLeaveGroup();
                  }}
                >
                  Leave Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Container */}
      <div className="backdrop-blur-lg bg-[rgba(255,255,255,0.1)] mt-5 p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        {/* Trip Header */}
        {/* Use a column layout on small screens and a row layout on md+ so the Analytics button
            sits to the right on larger viewports and stacks centered below the title on small */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            {loading ? (
              <p className="text-lg text-gray-300">Loading trip details...</p>
            ) : (
              <>
                {/* Title and Button row - FIXED: Always horizontal */}
                <div className="flex flex-row justify-between items-center gap-3 w-full">
                  {/* Title - will shrink to make space for button */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] break-words truncate">
                      {tripDetails?.name}
                    </h1>
                  </div>

                  {/* Analytics Button - Always on the right, compact on mobile */}
                  {!loading && (
                    <div className="flex-shrink-0">
                      <button
                        className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2
                  bg-[#0d1117] border border-[#00FFA3] rounded-md shadow-md
                  text-sm font-medium text-white
                  hover:bg-[#1a1f29] 
                  transition relative overflow-hidden group"
                        onClick={() =>
                          navigate("/analytics", {
                            state: { group: tripDetails },
                          })
                        }
                      >
                        <FaChartBar />
                        {/* Shiny effect */}
                        <span
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                    -translate-x-full group-hover:translate-x-full
                    transition-transform duration-700 ease-in-out"
                        />

                        {/* Icon - hidden on smallest screens, shown on sm+ */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="hidden xs:block h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-[#00FFA3]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3v18h18M9 17l3-3 4 4 5-6"
                          />
                        </svg>

                        {/* Text */}
                        <span className="truncate text-xs pl-1 sm:text-sm">
                          Analytics
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-base sm:text-lg mt-2 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] hover:animate-text break-words">
                  {tripDetails?.description}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl sm:text-2xl font-semibold">Members</h2>
            <div>
              <button
                onClick={handleAddMember}
                className="text-sm border border-white text-black px-3 py-1 rounded bg-white hover:bg-black hover:text-white transition"
              >
                + Add
              </button>

              <button
                onClick={handleRemoveMember}
                className="text-sm border border-white px-3 py-1 ml-4 rounded hover:bg-white hover:text-black transition"
              >
                - Remove
              </button>
            </div>
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
          <div className="flex justify-between items-center mb-4 mt-4">
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
              expenses.map((expense, idx) => {
                return (
                  <ExpenseCard
                    key={idx}
                    _id={expense._id}
                    title={expense.title}
                    category={expense.category}
                    subcategory={expense.subcategory}
                    time={expense.createdAt}
                    description={""}
                    amount={expense.amount}
                    iconColor={"bg-blue-500"}
                    paidBy={expense.paidBy}
                    beneficiaries={expense.owedBy}
                    onDelete={handleDeleteExpense}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
