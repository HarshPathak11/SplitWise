import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import TripsSection from "./TripsSection";
import FairFareCard from "./FairFareCard";
import FriendsSection from "./friendsSection";
import RecentExpenses from "./RecentExpenses";
import TopNavbar from "./TopNavbar";
import SwipeToFriends from "./SwipeToFriends";
import { requestNotificationPermission } from "../../notifications";
import api from "../utils/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // --- LOGIC SECTION (Unchanged) ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    async function getDetails() {
      const userId = Cookies.get("id");
      localStorage.removeItem("tripMembers");
      localStorage.removeItem("currentGroup");
      let fcmTokens = [];

      try {
        if (user) {
          const lastUpdatedAtUser = await api.get(
            `${API_BASE}/user/last-updated-at/${userId}`
          );
          if (
            new Date(lastUpdatedAtUser.data.lastUpdatedAt).getTime() !==
            new Date(user.updatedAt).getTime()
          ) {
            const response = await api.get(`${API_BASE}/user/${userId}`);
            if (response.status === 200) {
              setUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user));
              fcmTokens = response.data.user.fcmToken || [];
            }
          }
        } else {
          const response = await api.get(`${API_BASE}/user/${userId}`);
          if (response.status === 200) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            fcmTokens = response.data.user.fcmToken || [];
          }
        }

        const fcmToken = await requestNotificationPermission();
        if (fcmToken && (!fcmTokens.includes(fcmToken) || fcmTokens === null)) {
          await api.post(`${API_BASE}/user/set-fcm-token`, {
            fcmToken,
            userId,
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }
    getDetails();
  }, []);

  // --- UI SECTION (Redesigned) ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative selection:bg-indigo-500/30 font-sans">
      {/* 1. Controlled Background Theme (Max 2 colors) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Simple top-down spotlight - Clean, no messy blobs */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950"></div>
        {/* Subtle noise texture for industry feel */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Grid Layout: 7 cols for Main, 5 cols for Data/Friends */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* --- LEFT COLUMN (Primary Actions) --- */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Header Area */}
            <div className="pl-1">
              <TopNavbar />
            </div>

            {/* Main Card Wrapper - Giving it a 'Premium Device' feel */}
            <div className="relative group perspective-1000">
              <FairFareCard />
            </div>

            {/* Trips Section - Wrapped in a clean container */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-1 backdrop-blur-sm overflow-hidden">
              <div className="p-4 md:p-6">
                <TripsSection user={user} />
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN (Data & Social) --- */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            {/* Mobile Swipe Hint */}
            {isMobile && (
              <div>
                <SwipeToFriends />
              </div>
            )}

            {/* Recent Expenses - The 'Ledger' */}
            <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-2xl backdrop-blur-sm overflow-hidden flex flex-col">
              <div className="p-4 md:p-6 flex-1">
                <RecentExpenses user={user} />
              </div>
            </div>

            {/* Friends Section - The 'Contacts' */}
            {!isMobile && (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl backdrop-blur-sm overflow-hidden">
                <div className="p-4 md:p-6">
                  <FriendsSection user={user} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
