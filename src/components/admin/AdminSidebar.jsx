import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Map,
  Star,
  Image as ImageIcon,
  Users,
  MessageSquare,
  Target,
  ShieldCheck,
  LogOut,
  Tag,
  DollarSign,
  MapPin,
  HelpCircle,
  UserCircle,
  Home
} from "lucide-react";

import { adminAPI } from "../../services/api";
import "../../styles/AdminTheme.css";
import "./AdminSidebar.css";

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [notificationCounts, setNotificationCounts] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await adminAPI.getProfile(token);
        if (response.profile && response.profile.profile_photo) {
          setProfilePhoto(response.profile.profile_photo);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
      }
    };

    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await adminAPI.getNotificationCounts(token);
        if (response.success && response.counts) {
          setNotificationCounts(response.counts);
        }
      } catch (err) {
        console.warn("Failed to fetch notification counts", err);
      }
    };

    fetchProfile();
    fetchNotifications();

    // Poll for notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/packages", icon: Package, label: "Packages" },
    { to: "/admin/destinations", icon: MapPin, label: "Destinations" },
    { to: "/admin/pricing-rules", icon: Tag, label: "Pricing Rules" },
    { to: "/admin/bookings", icon: CalendarDays, label: "Bookings" },
    { 
      to: "/admin/guides", 
      icon: Map, 
      label: "Tour Guides",
      badge: notificationCounts.pending_guides 
    },
    { 
      to: "/admin/payouts", 
      icon: DollarSign, 
      label: "Payout Requests",
      badge: notificationCounts.pending_payouts
    },
    { 
      to: "/admin/reviews", 
      icon: Star, 
      label: "Reviews",
      badge: notificationCounts.pending_reviews
    },
    { to: "/admin/gallery", icon: ImageIcon, label: "Gallery" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { 
      to: "/admin/contacts", 
      icon: MessageSquare, 
      label: "Messages",
      badge: notificationCounts.unread_messages
    },
    { 
      to: "/admin/custom-tours", 
      icon: Target, 
      label: "Custom Tours",
      badge: notificationCounts.pending_custom_tours
    },
    { to: "/admin/admins", icon: ShieldCheck, label: "Manage Admins" },
    { to: "/admin/faqs", icon: HelpCircle, label: "Manage FAQs" },
    { to: "/admin/profile", icon: LayoutDashboard, label: "Profile" },
  ];

  return (
    <aside className="admin-sidebar glass-panel">
      {/* Header */}
      <div className="sidebar-header">
        <div className="admin-avatar-wrapper">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Admin" className="admin-avatar" />
          ) : (
            <UserCircle size={48} color="#475569" />
          )}
        </div>
        <h2 className="sidebar-title">Admin Panel</h2>
        <p className="sidebar-subtitle">I Go Lanka Tours</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <item.icon className="nav-icon" />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge > 0 && (
              <span className="badge-pill">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <NavLink to="/" onClick={onClose} className="footer-link">
          <Home className="nav-icon" />
          Home
        </NavLink>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut className="nav-icon" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
