import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./components/DashBoard";
import LandingPage from "./components/home";
import LogIn from "./components/login";
import SignUp from "./components/signup";
import ReferralSignUp from "./components/referralSignUp";
import Features from "./components/features";
import Profile from "./components/profile";
import ProtectedRoute from "./components/ProtectedRoutes";
import NotFound from "./NotFound";
import AddFriend from "./components/addFriend";
import AddTrip from "./components/addTrip";
import AddExpense from "./components/addExpense";
import ForgotPassword from "./components/forgotPassword";
import ChangePassword from "./components/changePassword";
import TripDetails from "./components/tripDetails";
import AddMembers from "./components/addMembers";
import AllTripsPage from "./components/AllTripsPage";
import AllExpenses from "./components/AllExpenses";
import CashMapAI from "./components/CashMapAI";
import AppLayout from "./AppLayout";
import Documentation from "./components/documentation";
import PublicProfile from "./components/PublicProfile";
import RemoveMembers from "./components/RemoveMembers";
import EditExpense from "./components/editExpense";
import TransactionHistory from "./components/TransactionHistory";
import Categories from "./components/Categories";
import Analytics from "./components/Analytics"
import Subcategories from "./components/Subcategories";
import Expenses from "./components/Expenses";
import AdminDashboard from "./admin/AdminDashboard";
import MarketingCampaigns from "./admin/MarketingCampaigns";
import NotificationCampaign from "./admin/NotificationCampaign";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Wraps everything in ErrorBoundary
    children: [
      {
        path: "dash",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "analytics",
        element: (
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        ),
      },
      {
        path: "categories",
        element: (
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        ),
      },
      {
        path: "subcategories",
        element: (
          <ProtectedRoute>
            <Subcategories />
          </ProtectedRoute>
        ),
      },
      {
        path: "expenses",
        element: (
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        ),
      },
      {
        path: "add-expense",
        element: (
          <ProtectedRoute>
            <AddExpense />
          </ProtectedRoute>
        ),
      },
      {
        path: "expense/edit",
        element: (
          <ProtectedRoute>
            <EditExpense/>
          </ProtectedRoute>
        ),
      },
      {
        path: "add-members/:groupId",
        element: (
          <ProtectedRoute>
            <AddMembers />
          </ProtectedRoute>
        ),
      },
      {
        path: "remove-members/:groupId",
        element: (
          <ProtectedRoute>
            <RemoveMembers />
          </ProtectedRoute>
        ),
      },
      {
        path: "allExpenses",
        element: (
          <ProtectedRoute>
            <AllExpenses />
          </ProtectedRoute>
        ),
      },
      {
        path: "addFriend",
        element: (
          <ProtectedRoute>
            <AddFriend />
          </ProtectedRoute>
        ),
      },
      {
        path: "allTrips",
        element: (
          <ProtectedRoute>
            <AllTripsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "tripDetails/:tripId",
        element: (
          <ProtectedRoute>
            <TripDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "change-password",
        element: (
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: "addTrip",
        element: (
          <ProtectedRoute>
            <AddTrip />
          </ProtectedRoute>
        ),
      },
      {
        path: "transaction-history/:friendId",
        element: (
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "FairAI",
        element: (
          <ProtectedRoute>
            <CashMapAI />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "marketing",
        element: (
          <ProtectedRoute>
            <MarketingCampaigns />
          </ProtectedRoute>
        ),
      },
      {
        path: "marketing/notification",
        element: (
          <ProtectedRoute>
            <NotificationCampaign />
          </ProtectedRoute>
        ),
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "signup/:referId",
        element: <ReferralSignUp />,
      },
      {
        path: "login",
        element: <LogIn />,
      },
      {
        path: "",
        element: <LandingPage />,
      },
      {
        path: "features",
        element: <Features />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },

      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/public-profile/:userId",
        element: <PublicProfile />,
      },
      {
        path: "/documentation",
        element: <Documentation />,
      },
    ],
  },
]);

export default router;
