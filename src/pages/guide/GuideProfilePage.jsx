import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, CheckCircle, AlertCircle, Camera, Upload, X } from "lucide-react";
import { guideAPI } from "../../services/api";
import "./GuideProfile.css";

const GuideProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Profile photo states
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "guide") {
      navigate("/login");
      return;
    }

    // Fetch profile from backend
    const fetchProfile = async () => {
      try {
        const response = await guideAPI.getProfile(token);
        
        if (response.success && response.guide) {
          setProfile({
            name: response.guide.full_name || "Guide",
            email: response.guide.email || "",
            phone: response.guide.contact_number || "N/A",
            joinedDate: new Date(response.guide.created_at || new Date()).toLocaleDateString(),
            status: response.guide.status || "pending",
            verified: response.guide.approved || false,
            photo: response.guide.profile_photo || null,
            rejectionReason: response.guide.rejection_reason || null,
            rejectedAt: response.guide.rejected_at || null,
          });

          // Set initial photo preview if exists
          if (response.guide.profile_photo) {
            setPhotoPreview(response.guide.profile_photo);
          }

          setDocuments(response.guide.documents || []);
        } else {
          setError(response.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("An error occurred while loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setPhotoMessage("Please select an image file");
        setTimeout(() => setPhotoMessage(""), 3000);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setPhotoMessage("Image size must be less than 5MB");
        setTimeout(() => setPhotoMessage(""), 3000);
        return;
      }

      setProfilePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhoto) {
      setPhotoMessage("Please select a photo first");
      setTimeout(() => setPhotoMessage(""), 3000);
      return;
    }

    setUploadingPhoto(true);
    setPhotoMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profile_photo", profilePhoto);

      // UI-only: Simulate upload (backend will handle actual upload)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPhotoMessage("Profile photo uploaded successfully!");
      setShowPhotoUpload(false);
      setProfilePhoto(null);
      
      // Update profile state
      setProfile({ ...profile, photo: photoPreview });

      setTimeout(() => setPhotoMessage(""), 3000);
      
      console.log("📸 Photo uploaded:", profilePhoto.name);
    } catch (err) {
      console.error("Photo upload error:", err);
      setPhotoMessage("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Remove profile photo?")) return;

    try {
      setUploadingPhoto(true);
      const token = localStorage.getItem("token");

      // UI-only: Simulate removal (backend will handle actual removal)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPhotoPreview(null);
      setProfilePhoto(null);
      setProfile({ ...profile, photo: null });
      setPhotoMessage("Profile photo removed");
      
      setTimeout(() => setPhotoMessage(""), 3000);
      
      console.log("🗑️ Photo removed");
    } catch (err) {
      console.error("Photo removal error:", err);
      setPhotoMessage("Failed to remove photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <main className="guide-profile-page">
        <div className="guide-profile-loading">Loading...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="guide-profile-page">
        <div className="guide-profile-error">
          <AlertCircle size={24} />
          <p>Failed to load profile</p>
        </div>
      </main>
    );
  }

  return (
    <main className="guide-profile-page">
      <div className="guide-profile-container">
        <div className="guide-profile-header">
          <h1 className="guide-profile-title">Your Profile</h1>
          <p className="guide-profile-subtitle">View and manage your guide information</p>
        </div>

        {/* Profile Card */}
        <div className="guide-profile-card">
          <div className="guide-profile-avatar-container">
            <div className="guide-profile-avatar" style={{
              backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {!photoPreview && <User size={48} />}
            </div>
            <button
              onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              className="guide-profile-photo-btn"
              title="Change photo"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#e74c3c',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <Camera size={16} style={{ color: 'white' }} />
            </button>
          </div>

          {/* Photo Upload Panel */}
          {showPhotoUpload && (
            <div style={{
              position: 'absolute',
              top: '120px',
              left: '30px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              zIndex: 10,
              minWidth: '300px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Update Profile Photo</h3>
                <button
                  onClick={() => setShowPhotoUpload(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={20} style={{ color: '#6b7280' }} />
                </button>
              </div>

              {photoMessage && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontSize: '13px',
                  backgroundColor: photoMessage.includes('success') ? '#d1fae5' : '#fee2e2',
                  color: photoMessage.includes('success') ? '#059669' : '#dc2626',
                  border: `1px solid ${photoMessage.includes('success') ? '#6ee7b7' : '#fca5a5'}`
                }}>
                  {photoMessage}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backgroundColor: '#f9fafb'
                }}>
                  <Upload size={20} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    {profilePhoto ? profilePhoto.name : 'Choose Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                    disabled={uploadingPhoto}
                  />
                </label>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                  Max size: 5MB. Supported: JPG, PNG, GIF
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto || !profilePhoto}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: (uploadingPhoto || !profilePhoto) ? '#d1d5db' : '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (uploadingPhoto || !profilePhoto) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploadingPhoto ? 'Uploading...' : 'Save Photo'}
                </button>
                {photoPreview && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'white',
                      color: '#dc2626',
                      border: '1px solid #dc2626',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: uploadingPhoto ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="guide-profile-info">
            <div className="guide-profile-info-row">
              <h2 className="guide-profile-name">{profile.name}</h2>
              {profile.verified && (
                <span className="guide-profile-badge">
                  <CheckCircle size={16} />
                  Verified
                </span>
              )}
            </div>

            <div className="guide-profile-details">
              <div className="guide-profile-detail-item">
                <Mail size={18} />
                <span>{profile.email}</span>
              </div>
              <div className="guide-profile-detail-item">
                <Phone size={18} />
                <span>{profile.phone}</span>
              </div>
            </div>

            <div className="guide-profile-stats">
              <div className="guide-profile-stat">
                <p className="guide-profile-stat-label">Status</p>
                <p className="guide-profile-stat-value">{profile.status}</p>
              </div>
              <div className="guide-profile-stat">
                <p className="guide-profile-stat-label">Member Since</p>
                <p className="guide-profile-stat-value">{profile.joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Reason Alert */}
        {profile.status === 'rejected' && profile.rejectionReason && (
          <div className="guide-profile-section">
            <div className="guide-rejection-alert">
              <div className="guide-rejection-header">
                <AlertCircle size={24} />
                <h3>Application Status: Rejected</h3>
              </div>
              <div className="guide-rejection-content">
                <p className="guide-rejection-label">Reason for Rejection:</p>
                <p className="guide-rejection-reason">{profile.rejectionReason}</p>
                {profile.rejectedAt && (
                  <p className="guide-rejection-date">
                    Rejected on: {new Date(profile.rejectedAt).toLocaleString()}
                  </p>
                )}
                <div className="guide-rejection-actions">
                  <p className="guide-rejection-help">
                    Please address the issues mentioned above and contact support at{' '}
                    <a href="mailto:support@igolankatours.com">support@igolankatours.com</a> to reapply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approval Alert */}
        {profile.status === 'pending' && !profile.verified && (
          <div className="guide-profile-section">
            <div className="guide-pending-alert">
              <div className="guide-pending-header">
                <AlertCircle size={24} />
                <h3>Application Under Review</h3>
              </div>
              <div className="guide-pending-content">
                <p>
                  Your application is currently being reviewed by our admin team. 
                  You will receive an email notification once your application is approved or if any additional information is needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="guide-profile-section">
          <h2 className="guide-profile-section-title">Verified Documents</h2>

          {documents.length === 0 ? (
            <div className="guide-profile-empty">
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="guide-profile-documents">
              {documents.map((doc) => (
                <div key={doc.id} className="guide-profile-document">
                  <div className="guide-profile-document-info">
                    <h3 className="guide-profile-document-name">{doc.name}</h3>
                    <p className="guide-profile-document-uploaded">
                      Uploaded: {doc.uploadedAt}
                    </p>
                  </div>
                  <span className={`guide-profile-document-status ${doc.status}`}>
                    {doc.status === "approved" ? "✓ Approved" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="guide-profile-section">
          <h2 className="guide-profile-section-title">Performance</h2>
          <div className="guide-profile-stats-grid">
            <div className="guide-profile-stat-card">
              <p className="guide-profile-stat-card-label">Tours Completed</p>
              <p className="guide-profile-stat-card-value">0</p>
            </div>
            <div className="guide-profile-stat-card">
              <p className="guide-profile-stat-card-label">Average Rating</p>
              <p className="guide-profile-stat-card-value">-</p>
            </div>
            <div className="guide-profile-stat-card">
              <p className="guide-profile-stat-card-label">Completion Rate</p>
              <p className="guide-profile-stat-card-value">0%</p>
            </div>
          </div>
        </div>

        {/* Settings Link */}
        <div className="guide-profile-actions">
          <button className="guide-profile-edit-btn">Edit Profile</button>
        </div>
      </div>
    </main>
  );
};

export default GuideProfilePage;
