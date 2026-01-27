import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Clock, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { authAPI } from "../services/api";
import "./CheckEmailPage.css";

export default function CheckEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Get email from navigation state or localStorage
  const email = location.state?.email || localStorage.getItem("userEmail") || "";

  // Countdown effect - 60 seconds before resend enabled
  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  // Resend email with API call
  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage("Email address not found. Please register again.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resendVerification(email);
      
      if (response.success || response.message) {
        setResendMessage("✓ Verification email sent! Check your inbox.");
        setMessageType("success");
        setCanResend(false);
        setCountdown(60);
      } else {
        setResendMessage(response.error || "Failed to resend email. Try again.");
        setMessageType("error");
      }
    } catch {
      setResendMessage("Error sending email. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-email-container">
      <div className="check-email-card">
        {/* Mail Icon */}
        <div className="email-icon-wrapper">
          <Mail className="email-icon" size={80} />
        </div>

        {/* Title and Subtitle */}
        <h1 className="check-email-title">Check Your Email</h1>
        <p className="check-email-subtitle">
          We've sent a verification link to complete your registration
        </p>

        {/* Email Display */}
        {email && <div className="email-display">{email}</div>}

        {/* Verification Steps */}
        <div className="verification-info">
          <div className="info-item">
            <div className="info-icon">1</div>
            <div className="info-text">
              <h3>Check Your Inbox</h3>
              <p>Look for an email from us with the subject "Verify Your Email"</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">2</div>
            <div className="info-text">
              <h3>Click the Link</h3>
              <p>Click the verification link in the email to activate your account</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">3</div>
            <div className="info-text">
              <h3>Account Activated</h3>
              <p>You'll be ready to log in and start booking tours!</p>
            </div>
          </div>
        </div>

        {/* Message Box - Success or Error */}
        {resendMessage && (
          <div className={`message-box ${messageType}`}>
            {messageType === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{resendMessage}</span>
          </div>
        )}

        {/* Resend Email Section */}
        <div className="resend-section">
          <p className="resend-text">Didn't receive the email?</p>
          <button
            className="resend-button"
            onClick={handleResendEmail}
            disabled={!canResend || loading}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spinner" />
                Sending...
              </>
            ) : canResend ? (
              <>
                <RefreshCw size={18} />
                Resend Email
              </>
            ) : (
              <>
                <Clock size={18} />
                Resend in {countdown}s
              </>
            )}
          </button>
        </div>

        {/* Action Section */}
        <div className="check-email-actions">
          <p className="help-text">Already verified your email?</p>
          <button className="login-button" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>

        {/* Helpful Tips */}
        <div className="email-tips">
          <h4 className="tips-title">💡 Helpful Tips</h4>
          <ul>
            <li>Check your spam or junk folder if you don't see the email</li>
            <li>The verification link expires in 24 hours</li>
            <li>Make sure you're using the correct email address</li>
            <li>You can resend the email after 60 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
