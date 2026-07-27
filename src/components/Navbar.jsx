/**
 * 🎯 I GO LANKA TOURS - Core Navigation Component
 * 
 * Primary application header providing responsive navigation, authentication 
 * context awareness, and access to role-bound dashboards. Handles scroll 
 * transitions and mobile drawer state.
 * 
 * @module Navbar
 */

import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "../services/api";
import { useWishlist } from "../hooks/useWishlist";
import NotificationBell from "./NotificationBell";

import "./Navbar.css";

/**
 * Navbar Component
 * 
 * Orchestrates global navigation flows and user session visibility.
 * 
 * @returns {JSX.Element}
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { getWishlistCount } = useWishlist();
  const wishlistCount = getWishlistCount();

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
            <img src="https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/Logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9Mb2dvLmpwZyIsImlhdCI6MTc3MDEzMzM2MywiZXhwIjoxOTI3ODEzMzYzfQ.2qbZSGwqCn0kGlcKWf8B1p5BQzYFVnUeXXJy-k2mRIA" alt="I GO LANKA TOURS" className="navbar-logo-image" />
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
                  `nav-link ${isScrolled ? "scrolled" : "transparent"} ${isActive ? "nav-item-active" : ""}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="navbar-cta">
            {/* Wishlist Icon */}
            <Link to="/wishlist" className={`navbar-wishlist-icon ${isScrolled ? "scrolled" : "transparent"}`} aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="navbar-wishlist-badge">{wishlistCount}</span>
              )}
            </Link>

            {isLoggedIn ? (
              <>
                <NotificationBell />
                <div className="navbar-user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`user-menu-button ${isScrolled ? "scrolled" : "transparent"}`}
                  >
                    <User size={18} />
                    <span>{currentUser?.name || "Account"}</span>
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="user-dropdown"
                      >
                        {userRole === "tourist" && (
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="user-dropdown-item"
                          >
                            Dashboard
                          </Link>
                        )}
                        {userRole === "guide" && (
                          <Link
                            to={
                              currentUser?.status === 'active' 
                                ? "/guide/dashboard" 
                                : currentUser?.hasUploadedDocuments === false 
                                  ? "/guide/documents" 
                                  : currentUser?.isRejected 
                                    ? "/guide/rejected"
                                    : "/guide/pending"
                            }
                            onClick={() => setShowUserMenu(false)}
                            className="user-dropdown-item"
                          >
                            {currentUser?.status === 'active' ? "Guide Dashboard" : "Application Status"}
                          </Link>
                        )}
                        {(userRole === "admin" || userRole === "superadmin") && (
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="mobile-menu"
            style={{ overflow: "hidden" }}
          >
            <div className="mobile-menu-content">
              <div className="mobile-nav-links">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive ? "nav-item-active" : ""}`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}

                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="mobile-nav-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="mobile-wishlist-badge">{wishlistCount}</span>
                  )}
                </Link>
              </div>

              {isLoggedIn ? (
                <>
                  {userRole === "tourist" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="mobile-cta"
                    >
                      Dashboard
                    </Link>
                  )}
                  {userRole === "guide" && (
                    <Link
                      to={
                        currentUser?.status === 'active' 
                          ? "/guide/dashboard" 
                          : currentUser?.hasUploadedDocuments === false 
                            ? "/guide/documents" 
                            : currentUser?.isRejected 
                              ? "/guide/rejected"
                              : "/guide/pending"
                      }
                      onClick={() => setMobileOpen(false)}
                      className="mobile-cta"
                    >
                      {currentUser?.status === 'active' ? "Guide Dashboard" : "Application Status"}
                    </Link>
                  )}
                  {(userRole === "admin" || userRole === "superadmin") && (
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
