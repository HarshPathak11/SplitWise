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
        path: "add-expense",
        element: (
          <ProtectedRoute>
            <AddExpense />
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
        element:(
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
        path: "CashMapAI",
        element: (
          <ProtectedRoute>
            <CashMapAI />
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
    ],
  },
]);

export default router;
