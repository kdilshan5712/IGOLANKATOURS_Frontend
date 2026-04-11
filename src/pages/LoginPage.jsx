import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { authAPI } from "../services/api";
import { Button, Card } from "../components/shared";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect handling: Priority Query Parameter -> State -> SessionStorage -> Home
  const queryRedirect = new URLSearchParams(location.search).get("redirect");
  const sessionRedirect = sessionStorage.getItem('returnUrl');
  const from = queryRedirect || location.state?.from || sessionRedirect || "/";
  const bookingFlow = location.state?.bookingFlow || false;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(location.state?.error || "");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

        // Store login timestamp for session validation
        localStorage.setItem("loginTimestamp", Date.now().toString());

        // Role-based redirect
        if (data.user.role === "admin") {
          // Admin → redirect to admin dashboard
          navigate("/admin/dashboard", { replace: true });
        } else if (data.user.role === "guide") {
          // Check if guide is rejected
          if (data.user.isRejected || data.user.status === 'rejected') {
            // Rejected guide → redirect to rejection page for resubmission
            navigate("/guide/rejected", { replace: true });
          } else if (data.user.status === 'pending' || data.user.isPending) {
            // Pending guide → check if they uploaded docs
            if (data.user.hasUploadedDocuments === false) {
              navigate("/guide/documents", { replace: true });
            } else {
              navigate("/guide/pending", { replace: true });
            }
          } else {
            // Active guide → redirect to guide dashboard
            navigate("/guide/dashboard", { replace: true });
          }
        } else if (data.user.role === "tourist") {
          // Tourist → redirect back to booking flow or original page or home
          if (bookingFlow) {
            const packageId = from.split("/").pop();
            sessionStorage.removeItem('returnUrl');
            navigate(`/booking/${packageId}`);
          } else {
            sessionStorage.removeItem('returnUrl');
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
        <Card className="login-card" padding="large">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account to continue</p>
            <p className="login-info-text">
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
                autoComplete="email"
              />
            </div>

            <div className="login-form-group">
              <label className="login-label">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-forgot">
              <Link to="/forgot-password" className="login-link">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="login-button-full"
            >
              Sign In
            </Button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Don't have an account?{" "}
              <Link to="/register" className="login-link">
                Create account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
