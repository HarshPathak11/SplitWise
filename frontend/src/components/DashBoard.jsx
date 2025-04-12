import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import ExpenseCard from "./expenseCard";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";
import { FaMandalorian } from "react-icons/fa";
import axios from "axios";
import TripCard from "./tripCard";
import { useNavigate } from "react-router-dom";
import FriendCard from "./FriendCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([
    { name: "Alice", balance: 50 },
    { name: "Bob", balance: -30 },
    { name: "Charlie", balance: 0 },
    { name: "John", balance: 100 },
    { name: "Jane", balance: -20 },
  ]);
  const [last4, setLast4] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState();

  const [trips] = React.useState([
    {
      id: 1,
      name: "Goa Trip",
      date: "15-20 May 2023",
      totalAmount: 25000,
      participants: 5,
      friends: [
        { name: "Alice", balance: 500 },
        { name: "Bob", balance: -300 },
        { name: "Charlie", balance: 0 },
      ],
    },
    {
      id: 2,
      name: "Weekend Getaway",
      date: "10-12 Aug 2023",
      totalAmount: 12000,
      participants: 3,
      friends: [
        { name: "John", balance: 200 },
        { name: "Jane", balance: -150 },
      ],
    },
    {
      id: 3,
      name: "Birthday Party",
      date: "5 Sep 2023",
      totalAmount: 8000,
      participants: 8,
      friends: [
        { name: "John", balance: 200 },
        { name: "Jane", balance: -150 },
      ],
    },
  ]);

  useEffect(() => {
    if (user?.friends) {
      const friendsArray = Object.values(user.friends);
      setFriends(friendsArray);
    }
  }, [user]);

  useEffect(() => {
    async function getDetails() {
      const userId = Cookies.get("id");
      if (!user) {
        try {
          const response = await axios.get(
            `http://localhost:8000/user/${userId}`
          );

          if (response.status === 200) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    }

    getDetails();
  }, []);

  const upiId = user?.upiId || "";

  const getInitials = (name) =>
    name
      ? name
          .trim()
          .split(" ")
          .map((word) => word[0]?.toUpperCase())
          .slice(0, 2)
          .join("")
      : "U";

  const fallbackQuotes = [
    "Believe in yourself.",
    "Every day is a fresh start.",
    "Progress, not perfection.",
    "You are your only limit.",
  ];
  const randomQuote =
    fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];

  const qrValue = upiId ? `upi://pay?pa=${upiId}&cu=INR` : randomQuote;
  const initials = getInitials(user?.username);

  useEffect(() => {
    let storedLast4 = Cookies.get("last4");

    if (!storedLast4) {
      storedLast4 = Math.floor(1000 + Math.random() * 9000).toString();
      Cookies.set("last4", storedLast4);
    }

    setLast4(storedLast4);
  }, []);

  const handleDeleteFriend = (friendToDelete) => {
    setFriends(friends.filter((friend) => friend.name !== friendToDelete));
  };

  const handleTripClick = (trip) => {
    navigate("/tripDetails", { state: { trip } });
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen p-3 sm:p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-48 md:w-72 h-48 md:h-72 bg-[#9e27ff] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-0 -right-4 w-48 md:w-72 h-48 md:h-72 bg-[#00FFA3] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-48 md:w-72 h-48 md:h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 ">
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <div className="backdrop-blur-lg bg-[rgba(255,255,255,0.1)] p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] hover:animate-text">
                  Fair Fare
                </h1>
                <p className="text-sm sm:text-base text-gray-400">DashBoard</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex space-x-8">
                  <Link to="/profile">
                    <button
                      className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
                      title="Edit Profile"
                    >
                      <FaMandalorian className="text-white text-xl" />
                    </button>
                  </Link>
                </div>
                <Link to="/">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div
            className="col-span-1 relative cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="w-88 h-72 perspective">
              <div
                className={`relative w-90 h-full duration-700 z-1 transform-style-preserve-3d ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                <div className="absolute w-full h-full backface-hidden bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-600 text-white rounded-2xl p-6 shadow-2xl">
                  <div className="text-lg font-bold tracking-widest uppercase mt-4 mb-2">
                    FairFare Card
                  </div>
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
                    GOLD MEMBER
                  </div>
                  <div className="w-16 h-12 mb-1 rounded-lg shadow-md flex items-center justify-center p-1">
                    <svg viewBox="0 0 100 80" width="100%" height="100%">
                      <rect
                        x="5"
                        y="5"
                        width="90"
                        height="70"
                        rx="10"
                        ry="10"
                        fill="#facc15"
                        stroke="#b45309"
                        strokeWidth="2"
                      />
                      <line
                        x1="5"
                        y1="30"
                        x2="95"
                        y2="30"
                        stroke="#78350f"
                        strokeWidth="2"
                      />
                      <line
                        x1="5"
                        y1="50"
                        x2="95"
                        y2="50"
                        stroke="#78350f"
                        strokeWidth="2"
                      />
                      <line
                        x1="35"
                        y1="5"
                        x2="35"
                        y2="75"
                        stroke="#78350f"
                        strokeWidth="2"
                      />
                      <line
                        x1="65"
                        y1="5"
                        x2="65"
                        y2="75"
                        stroke="#78350f"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-4 mb-1 mt-2">
                    <div className="w-10 h-10 bg-white text-indigo-700 rounded-full flex items-center justify-center font-bold text-md border-2 border-white shadow">
                      {initials}
                    </div>
                    <div className="text-lg font-semibold tracking-wider uppercase">
                      {user?.username}
                    </div>
                  </div>
                  <div className="font-mono text-xl tracking-widest mb-2">
                    1234 5688 9012 {last4}
                  </div>

                  <div className="text-sm mb-4">
                    <p className="text-gray-300">Joined</p>
                    <p className="font-semibold">01/25</p>
                    <p className="italic text-xs text-gray-300 mt-2">
                      &quot;Spend smart, split easy.&quot;
                    </p>
                  </div>
                </div>

                <div className="absolute w-full h-full backface-hidden bg-gray-800 text-white rounded-2xl p-6 shadow-2xl transform rotate-y-180 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {upiId ? "Scan to Pay" : "Your Daily Motivation"}
                  </h3>
                  <QRCodeCanvas
                    value={qrValue}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                  <p className="text-sm mt-3 text-center text-gray-300 px-2">
                    {upiId
                      ? `Pay to ${user?.username}`
                      : `Scan the above code for some motivation!`}
                  </p>
                </div>
              </div>
            </div>

            <style>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
          </div>

          <div className="backdrop-blur-lg bg-[rgba(255,255,255,0.1)] p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3]">
              Recent
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <ExpenseCard
                category="Grocery"
                time="5:12 pm"
                description="Belanja di pasar"
                amount="326.80"
                iconColor="bg-blue-500"
                paidBy="John Doe"
                beneficiaries={["Alice", "Bob", "Charlie"]}
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
        </div>

        <div className="space-y-4 h-full flex flex-col">
          <div className="backdrop-blur-lg bg-[rgba(255,255,255,0.1)] p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 flex-1">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <h2 className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3]">
                Trips & Events
              </h2>
              <Link to="/addTrip">
                <button
                  type="submit"
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-800 text-white transition-colors"
                  title="Add Trip"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </Link>
            </div>

            <div className="space-y-2 cursor-pointer overflow-y-auto">
              {trips.length === 0 ? (
                <p className="text-red-500 text-center font-semibold">
                  No trips found.
                </p>
              ) : (
                trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onClick={() => handleTripClick(trip)}
                  ></TripCard>
                ))
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Total Spent on Trips:</p>
                <p className="text-lg font-bold text-green-400">
                  ₹
                  {trips
                    .reduce((sum, trip) => sum + trip.totalAmount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-[rgba(255,255,255,0.1)] sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 flex-1 p-2 mb-auto h-42">
            <div className="flex justify-between items-center mb-2 sm:mb-1">
              <h2 className="text-lg sm:text-xl mb-2 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] mr-12">
                Friends
              </h2>
              <div className="flex items-center mb-2 gap-2 ml-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friend's name"
                  className="bg-gray-700/50 text-white px-2 py-1 rounded-lg border border-gray-600/30 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
                <Link to="/addFriend">
                  <button
                    type="submit"
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-800 text-white transition-colors"
                    title="Add Friend"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto">
              {friends.filter(
                (friend) =>
                  friend.name &&
                  friend.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <p className="text-red-500 text-center font-semibold">
                  No friends found.
                </p>
              ) : (
                friends
                  .filter(
                    (friend) =>
                      friend.name &&
                      friend.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((friend, index) => (
                    <FriendCard
                      key={index}
                      friend={friend}
                      index={index}
                      handleDeleteFriend={handleDeleteFriend}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
