import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

// Accepts an optional groupId prop so that it can be passed directly if available
const AddExpense = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { propGroupId } = location.state || {};

  // State variables
  const [splitMode, setSplitMode] = useState("equally");
  const [selected, setSelected] = useState([]); // Array of selected member _ids (for splitting)
  const [amounts, setAmounts] = useState({}); // For uneven split: maps member _id => custom amount
  const [selectAll, setSelectAll] = useState(false);
  const [paidBy, setPaidBy] = useState(""); // _id of the payer
  const [members, setMembers] = useState([]); // Combined list: logged-in user + friends
  const [title, setTitle] = useState("");
  const [mainAmount, setMainAmount] = useState("");

  // Determine groupId: either from prop or from localStorage ("currentGroup")
  const currentGroup = JSON.parse(localStorage.getItem("currentGroup") || "null");
  const groupId = propGroupId || (currentGroup ? currentGroup._id : null);

  // Retrieve user info from localStorage and build a combined members list.
  // This list contains the logged-in user plus his friends.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // The logged-in user's own details
        const userInfo = { _id: parsedUser._id, username: parsedUser.username };
        // Extract the friends from the "friends" array where each element has a "friend" key.
        let friendList = [];
        if (parsedUser.friends && parsedUser.friends.length > 0) {
          friendList = parsedUser.friends
            .filter((f) => f.friend && f.friend.username)
            .map((f) => f.friend);
        }
        // Combine logged-in user and friend list (if you need to avoid duplicates, you can filter by _id)
        const allMembers = [userInfo, ...friendList];
        setMembers(allMembers);
      }
    } catch (err) {
      console.error("Error loading user and friends from localStorage:", err);
    }
  }, []);

  // Checkbox handlers for selecting/deselecting a member (by _id)
  const handleCheckboxChange = (memberId) => {
    if (selected.includes(memberId)) {
      setSelected(selected.filter((id) => id !== memberId));
    } else {
      setSelected([...selected, memberId]);
    }
  };

  // "Select All" toggle handler
  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      const allMemberIds = members.map((member) => member._id);
      setSelected(allMemberIds);
    }
  };

  // Keep the state of "Select All" in sync
  useEffect(() => {
    const memberIds = members.map((member) => member._id);
    setSelectAll(selected.length === memberIds.length);
  }, [selected, members]);

  // Handler to capture custom amounts for uneven split. Only allows up to two decimals.
  const handleAmountChange = (e, memberId) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmounts({ ...amounts, [memberId]: value });
    }
  };

  // Calculate total of custom amounts for uneven splitting
  const calculateCustomTotal = () => {
    return selected.reduce((sum, memberId) => {
      const value = parseFloat(amounts[memberId]) || 0;
      return sum + value;
    }, 0);
  };

  // Main handler to add an expense
  const handleAddExpense = async () => {
    const totalEntered = parseFloat(mainAmount) || 0;
    const customTotal = calculateCustomTotal();

    // For uneven split, total of custom amounts must equal the main entered amount.
    if (splitMode === "unequally" && totalEntered.toFixed(2) !== customTotal.toFixed(2)) {
      const diff = (customTotal - totalEntered).toFixed(2);
      alert(`Calculation mismatch of ₹${Math.abs(diff)}. Please correct the values.`);
      return;
    }

    // Construct the payload to send to the backend.
    // The payload includes title, main amount, payer's _id, groupId (if available),
    // splitMode, the list of involved member _ids, and customAmounts if needed.
    const payload = {
      title: title,
      amount: totalEntered,
      paidBy: paidBy,            // _id of the payer
      groupId: groupId,          // may be null if not applicable
      splitMode: splitMode,
      involvedMembers: selected, // array of _ids (which may include the payer as well)
      customAmounts: splitMode === "unequally" ? amounts : {}
    };

    try {
      // Replace with your backend endpoint
      const response = await axios.post("http://localhost:8000/group/add-expense", payload);
      console.log("Expense created successfully", response.data);
      alert("Expense added successfully!");
      // Reset form fields
      setTitle("");
      setMainAmount("");
      setPaidBy("");
      setSelected([]);
      setAmounts({});
      navigate(-1);
    } catch (error) {
      console.error("Error creating expense:", error);
      const errorMsg =
        (error.response && error.response.data && error.response.data.message) ||
        "Error creating expense. Please try again.";
      alert(errorMsg);
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
            Add Expense
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

        {/* Paid By dropdown (includes the logged-in user and friends) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-lg font-medium whitespace-nowrap">Paid By:</label>
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

        {/* Involved Members Selection (Paid For / Owed By) */}
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
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-[#121212] p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(member._id)}
                  onChange={() => handleCheckboxChange(member._id)}
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
                (parseFloat(mainAmount) - calculateCustomTotal()).toFixed(2) !== "0.00"
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {(-1 * (parseFloat(mainAmount) - calculateCustomTotal())).toFixed(2)}
            </span>
          </div>
        )}

        {/* Add Expense Button */}
        <div className="text-center pt-6">
          <button
            onClick={handleAddExpense}
            disabled={!mainAmount || !title || !paidBy}
            className={`font-semibold px-10 py-3 rounded-xl transition text-lg ${
              !mainAmount || !title || !paidBy
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
