import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import { Toaster } from 'react-hot-toast';

const AppLayout = () => {
  return (
    <div>
      <ErrorBoundary>
     <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 8000,  // default duration 8 seconds for all toasts
          style: {
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />
      <Outlet />
      </ErrorBoundary>
    </div>
  );
};

export default AppLayout;