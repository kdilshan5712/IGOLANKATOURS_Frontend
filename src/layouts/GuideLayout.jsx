import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { User, Calendar, MapPin, Settings, LogOut } from "lucide-react";
import { useState } from "react";

function GuideLayout() {
  const navigate = useNavigate();
  const [userName] = useState(() => localStorage.getItem("guideName") || "Guide");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guideEmail");
    localStorage.removeItem("guideName");
    localStorage.removeItem("userRole"); 
    navigate("/login");
  };

  return (
    <div className="guide-layout">
      <aside className="guide-sidebar">
        <div className="guide-sidebar-header">
          <User size={32} />
          <div>
            <h3 className="guide-user-name">{userName}</h3>
            <p className="guide-user-role">Tour Guide</p>
          </div>
        </div>

        <nav className="guide-nav">
          <NavLink to="/guide/dashboard" className={({ isActive }) => isActive ? "guide-nav-item active" : "guide-nav-item"}>
            <Calendar size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/guide/bookings" className={({ isActive }) => isActive ? "guide-nav-item active" : "guide-nav-item"}>
            <MapPin size={18} />
            My Tours
          </NavLink>
          <NavLink to="/guide/availability" className={({ isActive }) => isActive ? "guide-nav-item active" : "guide-nav-item"}>
            <Settings size={18} />
            Availability
          </NavLink>
          <NavLink to="/guide/profile" className={({ isActive }) => isActive ? "guide-nav-item active" : "guide-nav-item"}>
            <User size={18} />
            Profile
          </NavLink>
        </nav>

        <div className="guide-sidebar-footer">
          <NavLink to="/" className="guide-tourist-btn">
            🏠 Go to Tourist Site
          </NavLink>
          <button onClick={handleLogout} className="guide-logout-btn">
            <LogOut size={18} />
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
