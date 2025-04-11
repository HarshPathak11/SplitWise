import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const AddTrip = () => {
  const [tripName, setTripName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleAddTrip = async (e) => {
    e.preventDefault();
    try {
      const userId = Cookies.get("id");
      const response = await axios.post("http://localhost:8000/trip", {
        name: tripName,
        fromDate,
        toDate,
        totalAmount,
        description,
        userId,
      });
      if (response.status === 200) {
        // Redirect to dashboard or another page
      }
    } catch (err) {
      setError("Error adding trip");
    }
  };

  return (
    <div className="relative bg-[#000000] flex items-center justify-center min-h-screen overflow-hidden">

      <div className="absolute inset-0 z-0">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
      </div>
      
      <div className="absolute top-4 left-4">
        <Link to="/dash">
        <button
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
          title="Back to Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        </Link>
      </div>
      
      <div className="relative w-full max-w-sm p-8 bg-glass rounded-lg shadow-lg overflow-hidden animate-fade-in z-10">
        <h2 className="text-2xl font-bold text-[#00F5FF] mb-4">Add Trip</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleAddTrip}>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="tripName">
              Trip Name
            </label>
            <input
              type="text"
              id="tripName"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-[#00FFA3]"
              required
            />
          </div>
          <div className="mb-4 flex justify-between">
            <div className="w-1/2 pr-2">
              <label className="block text-white mb-2" htmlFor="fromDate">
                From Date
              </label>
              <input
                type="date"
                id="fromDate"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  // Reset toDate if fromDate changes
                  if (toDate < e.target.value) {
                    setToDate("");
                  }
                }}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-[#00FFA3]"
                required
              />
            </div>
            <div className="w-1/2 pl-2">
              <label className="block text-white mb-2" htmlFor="toDate">
                To Date
              </label>
              <input
                type="date"
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate} // Set min date to fromDate
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-[#00FFA3]"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full p-2 rounded bg-[#00F5FF] hover:bg-[#00FFA3] text-black transition-colors"
          >
            Add Trip
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTrip;