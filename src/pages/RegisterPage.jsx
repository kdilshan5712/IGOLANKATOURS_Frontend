import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Mail, Lock, AlertCircle, Phone, MapPin, Eye, EyeOff } from "lucide-react";
import PhoneInputModule from 'react-phone-input-2';
const PhoneInput = PhoneInputModule.default || PhoneInputModule;
import 'react-phone-input-2/lib/style.css';
import { authAPI } from "../services/api";
import { validatePassword } from "../utils/passwordValidation";
import { Button, Card } from "../components/shared";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryRedirect = new URLSearchParams(location.search).get("redirect");
  const from = queryRedirect || location.state?.from || "/";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
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
        full_name: formData.name,
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
          state: { 
            email: data.email || formData.email,
            from: from
          }
        });
      } else {
        if (data.errors) {
          setFieldErrors(data.errors);
          setError("Please correct the highlighted errors.");
        } else {
          setError(data.message || "Registration failed. Please try again.");
        }
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
        <Card className="register-card" padding="large">
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
                autoComplete="name"
              />
              {fieldErrors.name && <span className="field-error-message">{fieldErrors.name}</span>}
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
                autoComplete="email"
              />
              {fieldErrors.email && <span className="field-error-message">{fieldErrors.email}</span>}
            </div>

            <div className="register-form-row">
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
                  autoComplete="country-name"
                />
                {fieldErrors.country && <span className="field-error-message">{fieldErrors.country}</span>}
              </div>

              <div className="register-form-group">
                <label className="register-label">
                  <Phone size={18} />
                  <span>Mobile</span>
                </label>
                <div className="phone-input-container">
                  <PhoneInput
                    country={'lk'}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputClass="register-input-phone"
                    buttonClass="phone-dropdown-button"
                    dropdownClass="phone-dropdown-menu"
                    containerClass="phone-input-wrapper"
                  />
                </div>
                {fieldErrors.phone && <span className="field-error-message">{fieldErrors.phone}</span>}
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-label">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="register-input"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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
              {fieldErrors.password && <span className="field-error-message">{fieldErrors.password}</span>}
              <small className="password-hint">
                Must contain: 8+ characters, uppercase, lowercase, number, special character
              </small>
            </div>

            <div className="register-form-group">
              <label className="register-label">
                <Lock size={18} />
                <span>Confirm Password</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="register-input"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="register-button-full"
            >
              Create Account
            </Button>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="register-link">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default RegisterPage;
