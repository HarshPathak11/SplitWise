import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const EditExpense = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const expenseId=state.originalExpense._id
  const [tripId,setTripId]=useState();
  // console.log(expenseId)

  // State variables
  const [splitMode, setSplitMode] = useState("equally");
  const [selected, setSelected] = useState([]); // Array of selected member _ids
  const [amounts, setAmounts] = useState({});   // For uneven split
  const [selectAll, setSelectAll] = useState(false);
  const [paidBy, setPaidBy] = useState("");      // _id of the payer
  const [members, setMembers] = useState([]);    // Combined list: logged-in user + friends
  const [title, setTitle] = useState("");
  const [mainAmount, setMainAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [originalCreatedAt, setOriginalCreatedAt] = useState(null); // preserve timestamp

  // Determine groupId from localStorage (same as AddExpense)
  const currentGroup = JSON.parse(localStorage.getItem("currentGroup") || "null");
  const groupId = currentGroup ? currentGroup._id : null;

  // Load group members from localStorage
  useEffect(() => {
    try {
      const currentGroupLocal = localStorage.getItem("currentGroup");
      const groupMembers = currentGroupLocal ? JSON.parse(currentGroupLocal).members : [];
      setMembers(groupMembers);
    } catch (err) {
      console.error("Error loading user and friends from localStorage:", err);
    }
  }, []);

  // Fetch existing expense data to pre-fill
  useEffect(() => {
    // console.log("hii")
    const fetchExpense = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/group/expense/${expenseId}`
        // `//http://localhost:8000/group/expense/${expenseId}`
        );
        // console.log(data)
        if (data.success) {
          const exp = data.expense;
          setTitle(exp.title);
          setTripId(exp.group)
          setMainAmount(exp.amount.toString());
          setPaidBy(exp.paidBy._id);
          setSplitMode(exp.owedBy.every(o => o.amount === parseFloat((exp.amount / exp.owedBy.length).toFixed(2)))
            ? "equally"
            : "unequally"
          );
          setOriginalCreatedAt(exp.createdAt);

          // Build `selected` and `amounts` from exp.owedBy
          const selIds = exp.owedBy.map((o) => o.user._id);
          setSelected(selIds);

          if (exp.owedBy && exp.owedBy.length > 0) {
            const amtObj = {};
            exp.owedBy.forEach((o) => {
              amtObj[o.user._id] = o.amount.toString();
            });
            setAmounts(amtObj);
          }
        }
      } catch (err) {
        console.error("Error fetching expense:", err);
        toast.error("Failed to load expense data");
      }
    };

    fetchExpense();
  }, [expenseId]);

  // Sync selectAll checkbox
  useEffect(() => {
    const memberIds = members.map((m) => m._id);
    setSelectAll(selected.length === memberIds.length);
  }, [selected, members]);

  // Toggle individual checkbox
  const handleCheckboxChange = (memberId) => {
    if (selected.includes(memberId)) {
      setSelected(selected.filter((id) => id !== memberId));
    } else {
      setSelected([...selected, memberId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      const allMemberIds = members.map((member) => member._id);
      setSelected(allMemberIds);
    }
  };

  // For uneven split: capture custom amounts
  const handleAmountChange = (e, memberId) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmounts({ ...amounts, [memberId]: value });
    }
  };

  // Calculate sum of custom amounts
  const calculateCustomTotal = () => {
    return selected.reduce((sum, memberId) => {
      const value = parseFloat(amounts[memberId]) || 0;
      return sum + value;
    }, 0);
  };

  // Main “Save” handler: DELETE old expense → POST new expense with original createdAt
  const handleEditExpense = async () => {
    const totalEntered = parseFloat(mainAmount) || 0;
    const customTotal = calculateCustomTotal();

    // Validation for uneven
    if (
      splitMode === "unequally" &&
      totalEntered.toFixed(2) !== customTotal.toFixed(2)
    ) {
      const diff = (customTotal - totalEntered).toFixed(2);
      toast.error(
        `Calculation mismatch of ₹${Math.abs(diff)}. Please correct the values.`
      );
      return;
    }

    const payload = {
      title: title,
      amount: totalEntered,
      paidBy: paidBy,
      groupId: groupId,
      splitMode: splitMode,
      involvedMembers: selected,
      customAmounts: splitMode === "unequally" ? amounts : {},
      createdAt: originalCreatedAt, // preserve original timestamp
    };

    try {
      setIsLoading(true);

      // 1) DELETE the old expense
      await axios.delete(
        `${API_BASE}/group/del-expense/${expenseId}`,
        // `//http://localhost:8000/group/del-expense/${expenseId}`,
        {data :{action:"edit"}}
      );

      // 2) POST the new one
      const response = await axios.post(
        `${API_BASE}/group/del-add-expense`,
        // `//http://localhost:8000/group/del-add-expense`,
        payload
      );
      if (response.status === 200) {
        toast.success("Expense updated successfully!");
        navigate(`/tripDetails/${tripId}`,{state:{expenseEdited:true}});
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      const errorMsg =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "Error updating expense. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-10 font-sans">
      <button
        className="flex items-center text-white mb-6 hover:text-gray-300 transition"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>
      <div className="max-w-3xl mx-auto bg-black p-4 sm:p-6 md:p-10 rounded-2xl shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
            Edit Expense
          </h1>
        </div>

        {/* Title and Amount inputs */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#121212] border border-gray-600 text-white w-full px-4 py-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="text"
            placeholder="Amount"
            inputMode="decimal"
            value={mainAmount}
            onChange={(e) => setMainAmount(e.target.value)}
            pattern="^\d*(\.\d{0,2})?$"
            className="bg-[#121212] border border-gray-600 text-white w-full px-4 py-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Paid By dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-lg font-medium whitespace-nowrap">
            Paid By:
          </label>
          <select
            className="bg-[#121212] border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            <option value="">Select Payer</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.username}
              </option>
            ))}
          </select>
        </div>

        {/* Split Mode Selector */}
        <div className="space-y-2">
          <p className="text-lg font-medium">Split:</p>
          <div className="flex flex-wrap gap-4">
            <button
              className={`px-6 py-2 rounded-lg ${
                splitMode === "equally"
                  ? "bg-white text-black font-semibold"
                  : "bg-[#121212] border border-gray-600 hover:bg-gray-800"
              } transition`}
              onClick={() => setSplitMode("equally")}
            >
              Equally
            </button>
            <button
              className={`px-6 py-2 rounded-lg ${
                splitMode === "unequally"
                  ? "bg-white text-black font-semibold"
                  : "bg-[#121212] border border-gray-600 hover:bg-gray-800"
              } transition`}
              onClick={() => setSplitMode("unequally")}
            >
              Unequally
            </button>
          </div>
        </div>

        {/* Involved Members Selection */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4"
            />
            <span className="text-sm">Select All</span>
          </label>
          {members.map((member) => (
            <div
              key={member._id}
              className="flex flex-col sm:flex-row sm:items-center cursor-pointer gap-2 sm:gap-4 bg-[#121212] p-3 rounded-lg"
            >
              <div
                className="flex items-center gap-3"
                onClick={() => handleCheckboxChange(member._id)}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(member._id)}
                  className="w-4 h-4"
                />
                <span className="max-w-3xl">{member.username}</span>
              </div>
              {splitMode === "unequally" && selected.includes(member._id) && (
                <input
                  type="text"
                  placeholder="Amount"
                  inputMode="decimal"
                  pattern="^\d*(\.\d{0,2})?$"
                  value={amounts[member._id] || ""}
                  onChange={(e) => handleAmountChange(e, member._id)}
                  className="px-3 py-2 bg-black border border-gray-600 text-white rounded-lg w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-white"
                />
              )}
            </div>
          ))}
        </div>

        {/* Total Difference for Unequal Splitting */}
        {splitMode === "unequally" && (
          <div className="text-center text-lg font-semibold">
            Total Difference:{" "}
            <span
              className={
                (parseFloat(mainAmount) - calculateCustomTotal()).toFixed(2) !==
                "0.00"
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {(-1 * (parseFloat(mainAmount) - calculateCustomTotal())).toFixed(
                2
              )}
            </span>
          </div>
        )}

        {/* Save Button */}
        <div className="text-center pt-6">
          <button
            onClick={handleEditExpense}
            disabled={!mainAmount || !title || !paidBy || isLoading}
            className={`font-semibold px-10 py-3 rounded-xl transition text-lg ${
              !mainAmount || !title || !paidBy || isLoading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;
