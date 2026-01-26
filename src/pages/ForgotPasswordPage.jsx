import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-card success-card">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h1>Check Your Email</h1>
            <p className="success-message">
              We've sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to reset your password.
            </p>
            <p className="success-note">
              The reset link will expire in 1 hour. If you don't see the email, 
              check your spam folder.
            </p>
            <div className="success-actions">
              <button onClick={() => navigate("/login")} className="btn-primary">
                Back to Login
              </button>
              <button 
                onClick={() => { setSubmitted(false); setEmail(""); }} 
                className="btn-secondary"
              >
                Try Another Email
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <Link to="/login" className="back-link">
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <div className="forgot-password-header">
            <h1>Forgot Your Password?</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="form-footer">
            <p>Remember your password? <Link to="/login">Sign in here</Link></p>
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
