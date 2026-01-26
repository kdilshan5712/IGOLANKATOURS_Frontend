import { Navigate } from "react-router-dom";
import { authAPI } from "../services/api";

/**
 * ProtectedRoute Component
 * Handles role-based route protection
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string} props.requiredRole - Required role to access route ("admin" | "tourist" | null)
 * @param {string} props.redirectTo - Where to redirect if unauthorized
 */
function ProtectedRoute({ children, requiredRole = null, redirectTo = "/login" }) {
  const isAuthenticated = authAPI.isAuthenticated();
  const userRole = localStorage.getItem("userRole");

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Logged in but wrong role - redirect
  if (requiredRole && userRole !== requiredRole) {
    // Tourist trying to access admin routes → redirect to login with message
    if (requiredRole === "admin" && userRole === "tourist") {
      return <Navigate to="/login" state={{ error: "Access denied. Admin credentials required." }} replace />;
    }
    // Any other unauthorized access
    return <Navigate to={redirectTo} replace />;
  }

  // Authorized - render the protected content
  return children;
}

export default ProtectedRoute;
