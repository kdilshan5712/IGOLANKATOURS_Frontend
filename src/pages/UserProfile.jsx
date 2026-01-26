import { useEffect, useState } from "react";
import { userAPI, authAPI } from "../services/api";
import { Mail, AlertCircle } from "lucide-react";
import "./UserProfile.css";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const currentUser = authAPI.getCurrentUser();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await userAPI.getProfile(token);

      if (data.profile) {
        setProfile(data.profile);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!currentUser?.email) {
      setVerificationMessage("Email not found");
      return;
    }

    setResendingVerification(true);
    setVerificationMessage("");

    try {
      const result = await authAPI.resendVerification(currentUser.email);
      if (result.success) {
        setVerificationMessage("Verification email sent! Please check your inbox.");
      } else {
        setVerificationMessage(result.message || "Failed to send verification email");
      }
    } catch (err) {
      setVerificationMessage("Failed to send verification email. Please try again.");
    } finally {
      setResendingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      {currentUser && currentUser.email_verified === false && (
        <div className="verification-warning">
          <div className="warning-content">
            <AlertCircle size={20} />
            <div>
              <strong>Email not verified</strong>
              <p>Please verify your email to make bookings. Check your inbox for the verification link.</p>
              {verificationMessage && (
                <p className={verificationMessage.includes("sent") ? "success-message" : "error-message"}>
                  {verificationMessage}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={handleResendVerification} 
            disabled={resendingVerification}
            className="resend-btn"
          >
            <Mail size={16} />
            {resendingVerification ? "Sending..." : "Resend Email"}
          </button>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile?.first_name?.charAt(0) || "U"}
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">First Name</span>
            <span className="detail-value">{profile?.first_name || "Not provided"}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Last Name</span>
            <span className="detail-value">{profile?.last_name || "Not provided"}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{profile?.email}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{profile?.phone || "Not provided"}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Country</span>
            <span className="detail-value">{profile?.country || "Not provided"}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Role</span>
            <span className="detail-value role-badge">{profile?.role}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">
              {new Date(profile?.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
