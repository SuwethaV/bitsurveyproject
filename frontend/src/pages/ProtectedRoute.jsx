import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isNavigationValid } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated || !isNavigationValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}