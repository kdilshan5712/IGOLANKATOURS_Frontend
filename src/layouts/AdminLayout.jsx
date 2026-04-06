import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "../components/admin/AdminSidebar";
import { useInactivityTimeout } from "../hooks/useInactivityTimeout";
import "../styles/AdminTheme.css";
import "./AdminLayout.css";

function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Enable inactivity timeout for admin users
  useInactivityTimeout();

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="mobile-menu-btn">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="mobile-logo-text">Admin Panel</div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar - Fixed width */}
      <div className={`admin-sidebar-container ${isMobileOpen ? "mobile-open" : ""}`}>
        <AdminSidebar isOpen={isMobileOpen} onClose={closeMobileMenu} />
      </div>

      {/* Main Content - Scrollable */}
      <div className="admin-main-content">
        <main className="admin-content-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
