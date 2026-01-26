import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { authAPI } from "../services/api";
import Logo from "../assets/Logo.jpg";
import "./Navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Destinations", to: "/destinations" },
    { name: "Packages", to: "/packages" },
    { name: "Gallery", to: "/gallery" },
    { name: "Custom Chat", to: "/custom-tour-chat" },
    { name: "Reviews", to: "/reviews" },
    { name: "About", to: "/about" },
    { name: "Contact", to: "/contact" },
  ];

  const isLoggedIn = authAPI.isAuthenticated();
  const currentUser = authAPI.getCurrentUser();
  const userRole = localStorage.getItem("userRole");

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem("userRole");
    setShowUserMenu(false);
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : "transparent"}`}>
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img src={Logo} alt="I GO LANKA TOURS" className="navbar-logo-image" />
            <div className="navbar-logo-text-container">
              <span className={`navbar-logo-text ${isScrolled ? "scrolled" : "transparent"}`}>
                I GO LANKA
              </span>
              <span className="navbar-logo-accent">TOURS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isScrolled ? "scrolled" : "transparent"} ${isActive ? "active" : ""}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="navbar-cta">
            {isLoggedIn ? (
              <div className="navbar-user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`user-menu-button ${isScrolled ? "scrolled" : "transparent"}`}
                >
                  <User size={18} />
                  <span>{currentUser?.name || "Account"}</span>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    {userRole !== "admin" && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setShowUserMenu(false)}
                        className="user-dropdown-item"
                      >
                        My Bookings
                      </Link>
                    )}
                    {userRole === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="user-dropdown-item"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="user-dropdown-item logout"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`cta-button ${isScrolled ? "scrolled" : "transparent"}`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`mobile-menu-btn ${isScrolled ? "scrolled" : "transparent"}`}
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <div className="mobile-nav-links">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {isLoggedIn ? (
              <>
                {userRole !== "admin" && (
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileOpen(false)}
                    className="mobile-cta"
                  >
                    My Bookings
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="mobile-cta"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="mobile-cta mobile-logout"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mobile-cta"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
