/**
 * 🎯 I GO LANKA TOURS - Admin Profile Management
 * 
 * Provides an administrative interface for viewing and managing account 
 * information. Supports profile photo management, account status 
 * verification, and credential display.
 * 
 * @module AdminProfilePage
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, Calendar, CheckCircle, Camera, Trash2, Loader } from "lucide-react";
import { adminAPI } from "../../services/api";
import "./AdminProfile.css";

/**
 * AdminProfilePage Component
 * 
 * Orchestrates the retrieval and display of administrative account data, 
 * housing profile-specific interaction logic.
 * 
 * @returns {JSX.Element}
 */
const AdminProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingInfo, setUploadingInfo] = useState({ uploading: false, message: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || (userRole !== "admin" && userRole !== "superadmin")) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      // @API_CALL: Fetch the current administrator's profile data
      const data = await adminAPI.getProfile(token);

      if (data.profile) {
        setProfile(data.profile);
      } else {
        // @ERROR_HANDLING: API failure response
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      // @ERROR_HANDLING: Network or server connectivity issues
      console.error("Profile fetch error:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
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
      // @API_CALL: Upload a physical photo file to the profile service
      const response = await adminAPI.uploadProfilePhoto(file, localStorage.getItem('token'));
      if (response.success) {
        setProfile({ ...profile, profile_photo: response.profile_photo });
        setUploadingInfo({ uploading: false, message: "Photo updated!" });
        setTimeout(() => setUploadingInfo({ uploading: false, message: "" }), 3000);
      } else {
        // @ERROR_HANDLING: Upload failed at the service level (size, type, etc)
        alert(response.message || "Failed to upload photo");
        setUploadingInfo({ uploading: false, message: "" });
      }
    } catch (err) {
      // @ERROR_HANDLING: Unexpected network or environment failure
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
      const response = await adminAPI.deleteProfilePhoto(localStorage.getItem('token'));
      if (response.success) {
        setProfile({ ...profile, profile_photo: null });
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
      <div className="admin-profile-container">
        <div className="admin-profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-profile-container">
        <div className="admin-profile-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-header">
        <h1>Admin Profile</h1>
        <p>View your administrator account information</p>
      </div>

      <div className="admin-profile-card">
        <div className="profile-avatar-section">
          <div className="admin-profile-avatar">
            <div className="admin-avatar-wrapper">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt="Profile" className="admin-avatar-image" />
              ) : (
                <div className="admin-avatar-circle">
                  <Shield size={48} />
                </div>
              )}

              <div className="admin-avatar-overlay">
                <button
                  className="admin-avatar-action-btn upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Photo"
                >
                  <Camera size={20} />
                </button>
                {profile?.profile_photo && (
                  <button
                    className="admin-avatar-action-btn delete-btn"
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
            <div className={`admin-avatar-status ${uploadingInfo.uploading ? 'uploading' : 'success'}`}>
              {uploadingInfo.uploading && <Loader size={14} className="spin-icon" />}
              <span>{uploadingInfo.message}</span>
            </div>
          )}
        </div>

        <div className="admin-profile-details">
          <div className="admin-detail-section">
            <h2 className="admin-section-title">Account Information</h2>

            <div className="admin-detail-row">
              <div className="admin-detail-label">
                <User size={18} />
                <span>Name</span>
              </div>
              <span className="admin-detail-value">
                {profile?.full_name || "Administrator"}
              </span>
            </div>

            <div className="admin-detail-row">
              <div className="admin-detail-label">
                <Mail size={18} />
                <span>Email</span>
              </div>
              <span className="admin-detail-value">{profile?.email}</span>
            </div>

            <div className="admin-detail-row">
              <div className="admin-detail-label">
                <Shield size={18} />
                <span>Role</span>
              </div>
              <span className="admin-detail-value">
                <span className="admin-role-badge">Administrator</span>
              </span>
            </div>

            <div className="admin-detail-row">
              <div className="admin-detail-label">
                <CheckCircle size={18} />
                <span>Status</span>
              </div>
              <span className="admin-detail-value">
                <span className="admin-status-badge status-active">
                  {profile?.status || "Active"}
                </span>
              </span>
            </div>

            <div className="admin-detail-row">
              <div className="admin-detail-label">
                <Calendar size={18} />
                <span>Member Since</span>
              </div>
              <span className="admin-detail-value">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="admin-profile-note">
            <Shield size={16} />
            <p>You have full administrative access to manage the I GO LANKA TOURS platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
