import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Admin Panel</h2>
        <p>I GO LANKA TOURS</p>
      </div>

      <nav className="admin-sidebar-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">📊</span>
          Dashboard
        </NavLink>
        
        <NavLink to="/admin/packages" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">📦</span>
          Packages
        </NavLink>
        
        <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">📅</span>
          Bookings
        </NavLink>

        <NavLink to="/admin/guides" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">🧭</span>
          Tour Guides
        </NavLink>
        
        <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">⭐</span>
          Reviews
        </NavLink>
        
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">👥</span>
          Users
        </NavLink>
        
        <NavLink to="/admin/contacts" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">✉️</span>
          Contact Messages
        </NavLink>
        
        <NavLink to="/admin/custom-tours" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">🎯</span>
          Custom Tours
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer">
        <NavLink to="/" className="tourist-site-btn">
          🏠 Home
        </NavLink>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
