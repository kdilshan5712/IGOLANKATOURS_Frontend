import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Phone, AlertCircle } from "lucide-react";
import { guideAPI } from "../../services/api";
import { validatePassword } from "../../utils/passwordValidation";
import "./GuideRegister.css";

const GuideRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact_number: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword) {
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
      const response = await guideAPI.register({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.full_name.trim(),
        contactNumber: formData.contact_number.trim() || null
      });

      if (response.success && response.token) {
        // Store token for document upload
        localStorage.setItem("token", response.token);
        localStorage.setItem("guideEmail", formData.email);
        localStorage.setItem("guideName", formData.full_name);
        localStorage.setItem("userRole", "guide");

        navigate("/guide/documents");
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="guide-register-page">
      <div className="guide-register-container">
        <div className="guide-register-card">
          <div className="guide-register-header">
            <h1 className="guide-register-title">Become a Tour Guide</h1>
            <p className="guide-register-subtitle">Join our network of trusted local experts</p>
          </div>

          {error && (
            <div className="guide-register-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="guide-register-form">
            <div className="guide-register-form-group">
              <label className="guide-register-label">
                <User size={18} />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="guide-register-input"
                placeholder="Your full name"
              />
            </div>

            <div className="guide-register-form-group">
              <label className="guide-register-label">
                <Mail size={18} />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="guide-register-input"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="guide-register-form-group">
              <label className="guide-register-label">
                <Phone size={18} />
                <span>Contact Number (optional)</span>
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="guide-register-input"
                placeholder="+94 71 234 5678"
              />
            </div>

            <div className="guide-register-form-group">
              <label className="guide-register-label">
                <Lock size={18} />
                <span>Password *</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="guide-register-input"
                placeholder="Create a strong password"
              />
              <small className="guide-password-hint">
                Must contain: 8+ characters, uppercase, lowercase, number, special character
              </small>
            </div>

            <div className="guide-register-form-group">
              <label className="guide-register-label">
                <Lock size={18} />
                <span>Confirm Password *</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="guide-register-input"
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="guide-register-button" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="guide-register-footer">
            <p className="guide-register-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="guide-register-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GuideRegisterPage;
