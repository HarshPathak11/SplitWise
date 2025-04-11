import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const AddExpense = () => {
  const navigate = useNavigate();
  const [splitMode, setSplitMode] = useState("equally");
  const [selected, setSelected] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [paidBy, setPaidBy] = useState();
  const [members, setmembers] = useState([]);
  const [title, setTitle] = useState("");
  const [mainAmount, setMainAmount] = useState("");

  useEffect(() => {
    setSelectAll(selected.length === filteredMember.length);
  }, [selected, members]);

  useEffect(() => {
    try {
      const tripMembers = localStorage.getItem("tripMembers");
      if (tripMembers) {
        const members = JSON.parse(tripMembers);
        if (members.length > 0) {
          const memberList = Object.values(members);
          setmembers(memberList);
        }
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }
  }, []);

  const handleCheckboxChange = (name) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((n) => n !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  const filteredMember = members.filter((member) => member.toLowerCase());

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected([...filteredMember.map((member) => member)]);
    }
  };

  const handleAmountChange = (e, name) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmounts({ ...amounts, [name]: value });
    }
  };

  const calculateTotal = () => {
    return selected.reduce((sum, name) => {
      const value = parseFloat(amounts[name]) || 0;
      return sum + value;
    }, 0);
  };

  const handleAddExpense = () => {
    console.log("Adding expense...");

    const totalEntered = parseFloat(mainAmount) || 0;
    const customTotal = calculateTotal();

    if (
      splitMode === "unequally" &&
      totalEntered.toFixed(2) !== customTotal.toFixed(2)
    ) {
      const diff = (customTotal - totalEntered).toFixed(2);
      alert(
        `Calculation mismatch of ₹${Math.abs(diff)}. Please correct the values.`
      );
      return;
    }

    // Continue with actual form submission logic here
    console.log("Expense added!");
  };

  const customTotal = calculateTotal();
  const totalDiff = parseFloat(mainAmount || 0) - customTotal;
  const isMismatch = totalDiff.toFixed(2) !== "0.00";

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-10 font-sans">
      <button
        className="flex items-center text-white mb-6 hover:text-gray-300 transition"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-3xl mx-auto bg-black p-4 sm:p-6 md:p-10 rounded-2xl shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
            Add Expense
          </h1>
        </div>

        {/* Title + Amount */}
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

        {/* Paid By */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-lg font-medium whitespace-nowrap">
            Paid By:
          </label>
          <select
            className="bg-[#121212] border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {filteredMember.map((member) => (
              <option key={member._id} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        {/* Split Mode */}
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

        {/* Split Details */}
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

          {filteredMember.map((member) => (
            <div
              key={member}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-[#121212] p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(member)}
                  onChange={() => handleCheckboxChange(member)}
                  className="w-4 h-4"
                />
                <span className="max-w-3xl">{member}</span>
              </div>
              {splitMode === "unequally" && selected.includes(member) && (
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="^\d*(\.\d{0,2})?$"
                  placeholder="Amount"
                  value={amounts[member] || ""}
                  onChange={(e) => handleAmountChange(e, member)}
                  className="px-3 py-2 bg-black border border-gray-600 text-white rounded-lg w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-white"
                />
              )}
            </div>
          ))}
        </div>

        {/* Amount Tracker */}
        {splitMode === "unequally" && (
          <div className="text-center text-lg font-semibold">
            Total Difference:{" "}
            <span
              className={`${isMismatch ? "text-red-500" : "text-green-500"}`}
            >
              {-1 * totalDiff.toFixed(2)}
            </span>{" "}
            From:{" "}
            <span className={"text-white-500"}>
              ₹{Math.abs(mainAmount).toFixed(2)}
            </span>
          </div>
        )}

        {/* Add Button */}
        <div className="text-center pt-6">
          <button
            onClick={handleAddExpense}
            disabled={mainAmount === "" || title === ""}
            className={`font-semibold px-10 py-3 rounded-xl transition text-lg 
    ${
      mainAmount === "" || title === ""
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
