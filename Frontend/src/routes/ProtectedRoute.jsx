import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Loader from "../components/LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useUser();
 
  if(isLoading || typeof user === 'undefined') {
    return <Loader />;
  }

  if (!user || !user.role) {
    return <Navigate to="/not-authenticated" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="*" replace />;
  }

  return children;
};

export default ProtectedRoute;