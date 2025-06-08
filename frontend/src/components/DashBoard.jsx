import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import TripsSection from "./TripsSection";
import FairFareCard from "./FairFareCard";
import FriendsSection from "./friendsSection";
import RecentExpenses from "./RecentExpenses";
import TopNavbar from "./TopNavbar";

const Dashboard = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    async function getDetails() {
      const userId = Cookies.get("id");
      // console.log("userId is ", userId);
      localStorage.removeItem("tripMembers");
      localStorage.removeItem("currentGroup");

      // if (!user) {
      try {
        const response = await axios.get(
          `https://fairfare-0hyl.onrender.com/user/${userId}`
        );
        // console.log("response is ", response);

        if (response.status === 200) {
          setUser(response.data.user); // Update state with fetched user data

          localStorage.setItem("user", JSON.stringify(response.data.user)); // Cache in localStorage
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
      // }
    }

    getDetails();
  }, []);
  // console.log("User", user);

  return (
    <div className="bg-[#000000] text-white min-h-screen p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-48 md:w-72 h-48 md:h-72 bg-[#9e27ff] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-0 -right-4 w-48 md:w-72 h-48 md:h-72 bg-[#00FFA3] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-48 md:w-72 h-48 md:h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 ">
        {/* Left side: Expenses */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Title */}
          <TopNavbar />

          {/* Flippable Card */}
          <FairFareCard />

          {/* Today's expenses */}
          <RecentExpenses user={user} />
        </div>

        <div className="space-y-4 h-full flex flex-col">
          {/* Trips Section */}
          <TripsSection />

          {/* Friends Section */}
          <FriendsSection user={user} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
