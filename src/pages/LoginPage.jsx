import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { authAPI } from "../services/api";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const bookingFlow = location.state?.bookingFlow || false;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(location.state?.error || "");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      // Call backend API for authentication
      const data = await authAPI.login(formData.email, formData.password);
      
      if (data.success && data.token) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);

        // Role-based redirect
        if (data.user.role === "admin") {
          // Admin → redirect to admin dashboard
          navigate("/admin/dashboard", { replace: true });
        } else if (data.user.role === "guide") {
          // Guide → redirect to guide dashboard
          navigate("/guide/dashboard", { replace: true });
        } else if (data.user.role === "tourist") {
          // Tourist → redirect back to booking flow or original page or home
          if (bookingFlow) {
            const packageId = from.split("/").pop();
            navigate(`/booking/${packageId}`);
          } else {
            navigate(from);
          }
        } else {
          // Default fallback
          navigate("/");
        }
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account to continue</p>
            <p className="login-info-text" style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Tourist and Admin login supported
            </p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-label">
                <Mail size={18} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="login-input"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="login-form-group">
              <label className="login-label">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="login-input"
                placeholder="Enter your password"
              />
            </div>

            <div className="login-forgot">
              <Link to="/forgot-password" className="login-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Don't have an account?{" "}
              <Link to="/register" className="login-link">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
