import { Navigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import { SESSION_CONFIG } from "../config/session";

/**
 * ProtectedRoute Component
 * Handles role-based route protection with session validation
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string} props.requiredRole - Required role to access route ("admin" | "tourist" | "guide" | null)
 * @param {string} props.redirectTo - Where to redirect if unauthorized
 */
function ProtectedRoute({ children, requiredRole = null, redirectTo = "/login" }) {
  const location = useLocation();
  const isAuthenticated = authAPI.isAuthenticated();
  const userRole = localStorage.getItem("userRole");
  const loginTimestamp = localStorage.getItem("loginTimestamp");

  // Validate session hasn't expired
  const isSessionValid = () => {
    if (!loginTimestamp) return false;

    const elapsed = Date.now() - parseInt(loginTimestamp);
    const isExpired = elapsed > SESSION_CONFIG.SESSION_TIMEOUT;

    if (isExpired) {
      // Session expired, clear everything
      localStorage.clear();
      sessionStorage.clear();
      return false;
    }

    return true;
  };

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Check if session is still valid
  if (!isSessionValid()) {
    return <Navigate
      to="/login"
      state={{ error: "Your session has expired. Please log in again." }}
      replace
    />;
  }

  // Check role authorization (superadmin can access admin routes)
  const isAuthorizedRole = () => {
    if (userRole === requiredRole) return true;
    if (requiredRole === "admin" && userRole === "superadmin") return true;
    return false;
  };

  // Logged in but wrong role - redirect
  if (requiredRole && !isAuthorizedRole()) {
    // Tourist trying to access admin routes → redirect to login with message
    if (requiredRole === "admin" && userRole === "tourist") {
      return <Navigate to="/login" state={{ error: "Access denied. Admin credentials required." }} replace />;
    }
    // Any other unauthorized access
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Authorized - render the protected content
  return children;
}

export default ProtectedRoute;
