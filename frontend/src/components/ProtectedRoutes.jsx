import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("id");

  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedRoute;