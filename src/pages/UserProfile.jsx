import { useEffect, useState, useRef } from "react";
import { userAPI, authAPI } from "../services/api";
import { Mail, AlertCircle, Camera, Trash2, Loader } from "lucide-react";
import "./UserProfile.css";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [uploadingInfo, setUploadingInfo] = useState({ uploading: false, message: "" });
  const fileInputRef = useRef(null);
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploadingInfo({ uploading: true, message: "Uploading..." });
    try {
      const response = await userAPI.uploadProfilePhoto(file, localStorage.getItem('token'));
      if (response.success) {
        const updatedPhoto = response.profile_photo;
        setProfile({ ...profile, profile_photo: updatedPhoto });
        
        // Update local storage user session
        authAPI.updateCurrentUser({ profile_photo: updatedPhoto });
        
        setUploadingInfo({ uploading: false, message: "Photo updated!" });
        setTimeout(() => setUploadingInfo({ uploading: false, message: "" }), 3000);
      } else {
        alert(response.message || "Failed to upload photo");
        setUploadingInfo({ uploading: false, message: "" });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect");
      setUploadingInfo({ uploading: false, message: "" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your profile photo?")) return;

    setUploadingInfo({ uploading: true, message: "Deleting..." });
    try {
      const response = await userAPI.deleteProfilePhoto(localStorage.getItem('token'));
      if (response.success) {
        setProfile({ ...profile, profile_photo: null });
        
        // Update local storage user session
        authAPI.updateCurrentUser({ profile_photo: null });
        
        setUploadingInfo({ uploading: false, message: "Photo deleted!" });
        setTimeout(() => setUploadingInfo({ uploading: false, message: "" }), 3000);
      } else {
        alert(response.message || "Failed to delete photo");
        setUploadingInfo({ uploading: false, message: "" });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect");
      setUploadingInfo({ uploading: false, message: "" });
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
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <div className="avatar-wrapper">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-circle">
                  {profile?.first_name?.charAt(0) || "U"}
                </div>
              )}

              <div className="avatar-overlay">
                <button
                  className="avatar-action-btn upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Photo"
                >
                  <Camera size={20} />
                </button>
                {profile?.profile_photo && (
                  <button
                    className="avatar-action-btn delete-btn"
                    onClick={handlePhotoDelete}
                    title="Remove Photo"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>
          {uploadingInfo.message && (
            <div className={`avatar-status ${uploadingInfo.uploading ? 'uploading' : 'success'}`}>
              {uploadingInfo.uploading && <Loader size={14} className="spin-icon" />}
              <span>{uploadingInfo.message}</span>
            </div>
          )}
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
