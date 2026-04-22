/**
 * 🎯 I GO LANKA TOURS - Reset Password Page
 * 
 * Finalizes the password recovery flow, allowing users to establish
 * new credentials using a temporary verification token.
 * 
 * @module ResetPasswordPage
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button, Card } from "../components/shared";
import { validatePassword } from "../utils/validators";
import "./ResetPasswordPage.css";

/**
 * ResetPasswordPage Component
 * 
 * Handles token validation from URL, password parity checks, and API submission.
 * 
 * @returns {JSX.Element}
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset link.");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // @VALIDATION: Basic presence check
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    // @VALIDATION: Enforce strong password policy
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      // @API_CALL: Submit new password to backend with reset token
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // UI STATE: Success message and delayed redirect
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        // @ERROR_HANDLING: Display server-side verification/token failure
        if (data.errors) {
          setFieldErrors(data.errors);
          setError("Please correct the highlighted errors.");
        } else {
          setError(data.message || "Failed to reset password. Please try again.");
        }
      }
    } catch (err) {
      // @ERROR_HANDLING: Catch network/timeout errors
      console.error("Reset password error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="reset-password-page">
        <div className="reset-password-container">
          <Card className="reset-password-card success-card" padding="large">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h1>Password Reset Successful!</h1>
            <p className="success-message">
              Your password has been reset. You can now log in with your new password.
            </p>
            <div className="countdown">
              Redirecting to login in 3 seconds...
            </div>
            <Button variant="primary" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="reset-password-page">
      <div className="reset-password-container">
        <Card className="reset-password-card" padding="large">
          <Link to="/login" className="back-link">
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <div className="reset-password-header">
            <h1>Reset Your Password</h1>
            <p>Enter your new password below. Make it strong and unique.</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                New Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="form-input"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.newPassword && <span className="field-error-message">{fieldErrors.newPassword}</span>}
              <small className="password-hint">
                Must contain: 8+ characters, uppercase, lowercase, number, special character
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={18} />
                Confirm Password
              </label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="form-input"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="toggle-password"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <p>Password requirements:</p>
              <ul>
                <li className={formData.password.length >= 8 ? "met" : ""}>
                  At least 8 characters
                </li>
                <li className={formData.password === formData.confirmPassword && formData.password ? "met" : ""}>
                  Passwords match
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="btn-submit-full"
            >
              Reset Password
            </Button>
          </form>

          <div className="form-footer">
            <p>Remember your password? <Link to="/login">Sign in here</Link></p>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
