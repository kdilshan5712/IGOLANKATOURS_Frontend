import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, CalendarDays, User, LogOut, Search, Settings, Menu, X, Sparkles } from "lucide-react";
import { userAPI } from "../services/api";
import { useInactivityTimeout } from "../hooks/useInactivityTimeout";
import "./UserLayout.css";

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Enable inactivity timeout for tourist users
  useInactivityTimeout();

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
          const { first_name, last_name, full_name, profile_photo } = data.profile;
          const displayFirst = first_name || full_name?.split(' ')[0] || "Tourist";
          const displayLast = last_name || full_name?.split(' ').pop() || "";

          setUserName(`${displayFirst} ${displayLast}`.trim());

          if (displayFirst) {
            let inits = displayFirst.charAt(0);
            if (displayLast && displayLast !== displayFirst) inits += displayLast.charAt(0);
            setUserInitials(inits.toUpperCase());
          }

          if (profile_photo) {
            setProfilePhoto(profile_photo);
          }
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

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="user-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="mobile-menu-btn">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="mobile-logo-text">Tourist Dashboard</div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      <aside className={`user-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>

        {/* Profile Card Section */}
        <div className="sidebar-profile-card">
          <div className="profile-avatar" style={{ overflow: 'hidden', padding: 0 }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              userInitials || "U"
            )}
          </div>
          <div className="profile-info">
            <h2>{userName || "Loading..."}</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-title">MAIN MENU</p>
          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
          >
            <LayoutDashboard className="nav-icon" size={20} />
            Overview
          </Link>

          <Link
            to="/dashboard/bookings"
            onClick={closeMobileMenu}
            className={`nav-item ${isActive("/dashboard/bookings") ? "active" : ""}`}
            title="My Bookings"
          >
            <CalendarDays className="nav-icon" size={20} />
            My Bookings
          </Link>

          <Link
            to="/dashboard/custom-tours"
            onClick={closeMobileMenu}
            className={`nav-item ${isActive("/dashboard/custom-tours") ? "active" : ""}`}
            title="My Custom Tours"
          >
            <Sparkles className="nav-icon" size={20} />
            My Custom Tours
          </Link>

          <Link
            to="/dashboard/profile"
            onClick={closeMobileMenu}
            className={`nav-item ${isActive("/dashboard/profile") ? "active" : ""}`}
          >
            <User className="nav-icon" size={20} />
            Personal Info
          </Link>

          <div className="nav-divider"></div>
          <p className="nav-section-title">DISCOVER</p>

          <Link to="/packages" onClick={closeMobileMenu} className="nav-item">
            <Search className="nav-icon" size={20} />
            Explore Tours
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout-btn">
            <LogOut className="nav-icon" size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="user-content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
