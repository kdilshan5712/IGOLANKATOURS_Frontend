import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userAPI } from "../services/api";
import "./UserLayout.css";

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch user profile for display name
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const data = await userAPI.getProfile(token);
        if (data.profile) {
          const { first_name, last_name } = data.profile;
          setUserName(`${first_name || ""} ${last_name || ""}`.trim() || "User");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="user-layout">
      <aside className="user-sidebar">
        <div className="sidebar-header">
          <h2>Welcome, {userName}</h2>
          <p className="user-role">Tourist Dashboard</p>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>

          <Link
            to="/dashboard/bookings"
            className={`nav-item ${isActive("/dashboard/bookings") ? "active" : ""}`}
          >
            <span className="nav-icon">📅</span>
            My Bookings
          </Link>

          <Link
            to="/dashboard/profile"
            className={`nav-item ${isActive("/dashboard/profile") ? "active" : ""}`}
          >
            <span className="nav-icon">👤</span>
            Profile
          </Link>

          <Link to="/packages" className="nav-item">
            <span className="nav-icon">🌴</span>
            Explore Tours
          </Link>

          <button onClick={handleLogout} className="nav-item logout-btn">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </nav>
      </aside>

      <main className="user-content">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
