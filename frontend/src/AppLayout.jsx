import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";

const AppLayout = () => {
  return (
    // <ErrorBoundary>
      <Outlet />
    // {/* </ErrorBoundary> */}
  );
};

export default AppLayout;
