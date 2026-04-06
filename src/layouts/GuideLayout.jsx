import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  Settings,
  Home,
  LogOut,
  Star,
  Menu,
  X
} from "lucide-react";
import { useInactivityTimeout } from "../hooks/useInactivityTimeout";
import { guideAPI } from "../services/api";
import "./GuideLayout.css";

function GuideLayout() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem("userName") || localStorage.getItem("guideName") || "Guide");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Enable inactivity timeout for guide users
  useInactivityTimeout();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await guideAPI.getProfile(token);
        if (response.success && response.guide) {
          setUserName(response.guide.full_name || userName);
          if (response.guide.profile_photo) {
            setProfilePhoto(response.guide.profile_photo);
          }

          // Strict Navigation Trap
          // If the API reveals they are still pending, kick them out of the protected layout
          if (response.guide.approved === false) {
             // Let's use the local storage user object to check document state if present
             const userStr = localStorage.getItem("user");
             let userObj = userStr ? JSON.parse(userStr) : null;
             
             if (userObj?.hasUploadedDocuments === false) {
               navigate("/guide/documents", { replace: true });
             } else {
               navigate("/guide/pending", { replace: true });
             }
          }

        }
      } catch (err) {
        console.error("Failed to fetch guide profile", err);
      }
    };
    fetchProfile();
  }, [navigate, userName]);

  // Enable inactivity timeout for guide users
  useInactivityTimeout();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { to: "/guide/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/guide/bookings", icon: CalendarDays, label: "My Tours" },
    { to: "/guide/reviews", icon: Star, label: "My Reviews" },
    { to: "/guide/availability", icon: Settings, label: "Availability" },
    { to: "/guide/profile", icon: UserCircle, label: "Profile" },
  ];

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="guide-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="mobile-menu-btn">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="mobile-logo-text">Guide Dashboard</div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      <aside className={`guide-sidebar glass-panel ${isMobileOpen ? "mobile-open" : ""}`} style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
        {/* Header */}
        <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', marginBottom: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserCircle size={48} color="white" />
            )}
          </div>
          <h2 className="sidebar-title">Guide Panel</h2>
          <p className="sidebar-subtitle">{userName}</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <item.icon className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <NavLink to="/" className="footer-link">
            <Home className="nav-icon" />
            Home
          </NavLink>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut className="nav-icon" />
            Logout
          </button>
        </div>
      </aside>

      <main className="guide-main">
        <Outlet />
      </main>
    </div>
  );
}

export default GuideLayout;
