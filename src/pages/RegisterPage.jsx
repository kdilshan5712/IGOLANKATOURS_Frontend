import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Mail, Lock, AlertCircle, Phone, MapPin } from "lucide-react";
import { authAPI } from "../services/api";
import { validatePassword } from "../utils/passwordValidation";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setLoading(true);

    try {
      // Call backend API for registration
      const data = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        phone: formData.phone
      });

      if (data.success) {
        // Store email for verification page
        localStorage.setItem("userEmail", data.email || formData.email);
        
        // Redirect to email verification page instead of auto-login
        navigate("/check-email", {
          state: { email: data.email || formData.email }
        });
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join us and start your Sri Lankan adventure</p>
          </div>

          {error && (
            <div className="register-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-form-group">
              <label className="register-label">
                <User size={18} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="register-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="register-form-group">
              <label className="register-label">
                <Mail size={18} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="register-input"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="register-form-group">
              <label className="register-label">
                <MapPin size={18} />
                <span>Country (optional)</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="register-input"
                placeholder="Your country"
              />
            </div>

            <div className="register-form-group">
              <label className="register-label">
                <Phone size={18} />
                <span>Mobile Number (optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="register-input"
                placeholder="e.g., +94 71 234 5678"
              />
            </div>

            <div className="register-form-group">
              <label className="register-label">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="register-input"
                placeholder="Create a strong password"
              />
              <small className="password-hint">
                Must contain: 8+ characters, uppercase, lowercase, number, special character
              </small>
            </div>

            <div className="register-form-group">
              <label className="register-label">
                <Lock size={18} />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="register-input"
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="register-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
