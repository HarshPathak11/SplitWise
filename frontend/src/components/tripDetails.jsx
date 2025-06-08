import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ExpenseCard from "./expenseCard"; // Ensure this path is correct
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const TripDetails = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  // console.log(location.state+"state")

  const { tripId } = useParams(); // Now you get tripId directly from URL
  const [members, setMembers] = useState([]);
  const [tripDetails, setTripDetails] = useState(null); // Store trip details
  const [loading, setLoading] = useState(true); // Loading state for the GET request
  const [expenses, setExpenses] = useState([]);

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
        // Set directly to localStorage (no merge)
        localStorage.setItem("tripMembers", JSON.stringify(groupMembers));
        setMembers(groupMembers);
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `https://fairfare-0hyl.onrender.com/group/get-group/${tripId}`
        );
        if (response.status === 200) {
          const group = response.data;

          setTripDetails(group);
          setLoading(false);
          const sortedExpenses = group.expenses.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setExpenses(sortedExpenses);

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
  console.log(location.state?.expenseEdited)
   if (location.state?.expenseEdited) {
     // Clear the flag so we don't loop
     navigate(location.pathname, { replace: true, state: {} });

     // Re-fetch just the group (or just the expenses part)
     const reloadExpenses = async () => {
       try {
         const response = await axios.get(
           `https://fairfare-0hyl.onrender.com/group/get-group/${tripId}`
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
  console.log(expenses)

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
    navigate('/dash');
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
        `https://fairfare-0hyl.onrender.com/group/remove-members/${tripId}`,
        // `http://localhost:8000/group/remove-members/${tripId}`,
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
    setExpenses((prev) =>
      prev.filter((exp) => exp._id !== deletedExpenseId)
    );

    // 2b) Also remove it from the `currentGroup` in localStorage
    const rawCurrentGroup = localStorage.getItem("currentGroup");
    if (rawCurrentGroup) {
      try {
        const cg = JSON.parse(rawCurrentGroup);
        cg.expenses = cg.expenses.filter(
          (exp) => exp._id !== deletedExpenseId
        );
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
          onClick={HandleLeaveGroup}
        >
          Leave Group
        </button>
      </div>

      {/* Card Container */}
      <div className="backdrop-blur-lg bg-[rgba(255,255,255,0.1)] mt-5 p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        {/* Trip Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            {loading ? (
              <p className="text-lg text-gray-300">Loading trip details...</p>
            ) : (
              <>
                <h1 className="text-3xl sm:text-5xl mr-auto pb-3 mb-1 font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3]">
                  {tripDetails?.name}
                </h1>
                <p className="text-base sm:text-lg mt-2 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] hover:animate-text">
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
                    category={expense.title}
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
