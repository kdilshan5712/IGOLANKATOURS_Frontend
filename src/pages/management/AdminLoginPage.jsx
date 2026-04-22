/**
 * 🎯 I GO LANKA TOURS - Admin Authentication Portal
 * 
 * Provides a secure entry point for administrative personnel. Implements 
 * role-based access control (RBAC) validation at the authentication layer 
 * to ensure only authorized admins can access the backend management suite.
 * 
 * @module AdminLoginPage
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { authAPI } from "../../services/api";
import { Button, Card } from "../../components/shared";
import "./AdminLogin.css";

/**
 * AdminLoginPage Component
 * 
 * Orchestrates the administrative login flow, handling credential 
 * validation and secure session token storage.
 * 
 * @returns {JSX.Element}
 */
function AdminLoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // @API_CALL: Authenticate credentials against the centralized auth service
      const result = await authAPI.login(formData.email, formData.password);

      // @VALIDATION: Ensure the authenticated user has administrative privileges
      if (result.success && result.user.role === "admin") {
        localStorage.setItem("token", result.token);
        localStorage.setItem("userRole", result.user.role);
        localStorage.setItem("userEmail", result.user.email);
        localStorage.setItem("userName", result.user.name || "Admin");
        navigate("/admin/dashboard", { replace: true });
      } else if (result.success && result.user.role !== "admin") {
        // @ERROR_HANDLING: Access denied for non-admin accounts
        setError("Access denied. Admin credentials required.");
      } else {
        // @ERROR_HANDLING: Invalid credentials provided
        setError(result.message || "Invalid email or password");
      }
    } catch {
      // @ERROR_HANDLING: Unexpected network or environment failure during login
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <Card className="admin-login-card" padding="large">
          <div className="admin-login-header">
            <div className="admin-shield-icon">
              <Shield size={48} />
            </div>
            <h1>Admin Portal</h1>
            <p>I GO LANKA TOURS</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="admin-error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="admin-form-group">
              <label htmlFor="email" className="admin-label">
                <Mail size={18} />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@igolankatours.com"
                className="admin-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="password" className="admin-label">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="admin-input"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="admin-login-btn-full"
            >
              Sign In
            </Button>
          </form>

          <div className="admin-login-footer">
            <p>Authorized personnel only</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminLoginPage;
