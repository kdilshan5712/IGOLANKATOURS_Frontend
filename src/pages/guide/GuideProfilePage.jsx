import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, CheckCircle, AlertCircle, Camera, Upload, X, Edit } from "lucide-react";
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

  // Edit profile states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    contact_number: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState("");
 
  // Bank details states
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bank_name: "",
    account_no: "",
    account_name: "",
    branch_name: ""
  });
  const [bankLoading, setBankLoading] = useState(false);
  const [bankMessage, setBankMessage] = useState("");

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
            bank_name: response.guide.bank_name || null,
            account_no: response.guide.account_no || null,
            account_name: response.guide.account_name || null,
            branch_name: response.guide.branch_name || null
          });

          // Set initial photo preview if exists
          if (response.guide.profile_photo) {
            setPhotoPreview(response.guide.profile_photo);
          }

          // Initialize edit form data
          setEditFormData({
            full_name: response.guide.full_name || "",
            contact_number: response.guide.contact_number || ""
          });

          // Initialize bank form data
          setBankFormData({
            bank_name: response.guide.bank_name || "",
            account_no: response.guide.account_no || "",
            account_name: response.guide.account_name || "",
            branch_name: response.guide.branch_name || ""
          });

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

      // Call real backend API
      const result = await guideAPI.uploadProfilePhoto(profilePhoto, token);

      if (result.success) {
        setPhotoMessage("Profile photo uploaded successfully!");
        setShowPhotoUpload(false);
        setProfilePhoto(null);

        // Update profile state with new photo URL
        setProfile({ ...profile, photo: result.profile_photo });
        setPhotoPreview(result.profile_photo);
      } else {
        setPhotoMessage(result.message || "Failed to upload photo");
      }

      setTimeout(() => setPhotoMessage(""), 3000);
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

      // Call real backend API
      const result = await guideAPI.deleteProfilePhoto(token);

      if (result.success) {
        setPhotoPreview(null);
        setProfilePhoto(null);
        setProfile({ ...profile, photo: null });
        setPhotoMessage("Profile photo removed");
      } else {
        setPhotoMessage(result.message || "Failed to remove photo");
      }

      setTimeout(() => setPhotoMessage(""), 3000);
    } catch (err) {
      console.error("Photo removal error:", err);
      setPhotoMessage("Failed to remove photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
    setEditMessage("");
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    if (!editFormData.full_name.trim()) {
      setEditMessage("Full name is required");
      return;
    }

    setEditLoading(true);
    setEditMessage("");

    try {
      const token = localStorage.getItem("token");
      const result = await guideAPI.updateProfile({
        full_name: editFormData.full_name,
        contact_number: editFormData.contact_number
      }, token);

      if (result.success) {
        setEditMessage("Profile updated successfully!");
        setProfile({
          ...profile,
          name: result.guide.full_name,
          phone: result.guide.contact_number || "N/A"
        });

        setTimeout(() => {
          setShowEditModal(false);
          setEditMessage("");
        }, 1500);
      } else {
        setEditMessage(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setEditMessage("Failed to update profile. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleBankFormChange = (e) => {
    setBankFormData({
      ...bankFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveBankDetails = async () => {
    if (!bankFormData.bank_name.trim() || !bankFormData.account_no.trim() || !bankFormData.account_name.trim()) {
      setBankMessage("Bank name, account number, and account name are required");
      return;
    }

    setBankLoading(true);
    setBankMessage("");

    try {
      const token = localStorage.getItem("token");
      const result = await guideAPI.updateBankDetails(bankFormData, token);

      if (result.success) {
        setBankMessage("Bank details updated successfully!");
        
        // Update local profile state if needed (though bank info isn't displayed in main card)
        setProfile(prev => ({
          ...prev,
          bank_name: bankFormData.bank_name,
          account_no: bankFormData.account_no,
          account_name: bankFormData.account_name,
          branch_name: bankFormData.branch_name
        }));

        setTimeout(() => {
          setShowBankModal(false);
          setBankMessage("");
        }, 1500);
      } else {
        setBankMessage(result.message || "Failed to update bank details");
      }
    } catch (err) {
      console.error("Bank update error:", err);
      setBankMessage("Failed to update bank details. Please try again.");
    } finally {
      setBankLoading(false);
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
                    <a href="mailto:tours.igolanka@gmail.com">tours.igolanka@gmail.com</a> to reapply.
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
                <div key={doc.document_id} className="guide-profile-document">
                  <div className="guide-profile-document-info">
                    <h3 className="guide-profile-document-name">
                      {doc.document_type ? doc.document_type.replace(/_/g, ' ').toUpperCase() : 'Document'}
                    </h3>
                    <p className="guide-profile-document-uploaded">
                      Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`guide-profile-document-status ${doc.verified ? 'approved' : 'pending'}`}>
                    {doc.verified ? "✓ Approved" : "⏳ Pending Review"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bank Details Section */}
        <div className="guide-profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="guide-profile-section-title" style={{ margin: 0 }}>Bank Details</h2>
            <button 
              onClick={() => { setShowBankModal(true); setBankMessage(""); }} 
              className="guide-profile-edit-btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Edit size={16} />
              {profile.bank_name ? "Edit Bank Info" : "Add Bank Info"}
            </button>
          </div>

          {!profile.bank_name ? (
            <div className="guide-profile-empty">
              <AlertCircle size={20} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
              <p>Requested payouts require verified bank details. Please add your bank information.</p>
            </div>
          ) : (
            <div className="guide-bank-details">
              <div className="guide-bank-grid">
                <div className="guide-bank-item">
                  <span className="guide-bank-label">Bank Name</span>
                  <span className="guide-bank-value">{profile.bank_name}</span>
                </div>
                <div className="guide-bank-item">
                  <span className="guide-bank-label">Account Number</span>
                  <span className="guide-bank-value">{profile.account_no}</span>
                </div>
                <div className="guide-bank-item">
                  <span className="guide-bank-label">Account Holder</span>
                  <span className="guide-bank-value">{profile.account_name}</span>
                </div>
                {profile.branch_name && (
                  <div className="guide-bank-item">
                    <span className="guide-bank-label">Branch</span>
                    <span className="guide-bank-value">{profile.branch_name}</span>
                  </div>
                )}
              </div>
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
          <button onClick={handleEditProfile} className="guide-profile-edit-btn">
            <Edit size={18} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="guide-modal-overlay">
          <div className="guide-modal">
            <div className="guide-modal-header">
              <h2>Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="guide-modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="guide-modal-body">
              {editMessage && (
                <div className={`guide-modal-message ${editMessage.includes('success') ? 'success' : 'error'}`}>
                  {editMessage}
                </div>
              )}

              <div className="guide-modal-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={editFormData.full_name}
                  onChange={handleEditFormChange}
                  className="guide-modal-input"
                  placeholder="Enter your full name"
                  disabled={editLoading}
                />
              </div>

              <div className="guide-modal-form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={editFormData.contact_number}
                  onChange={handleEditFormChange}
                  className="guide-modal-input"
                  placeholder="+94 71 234 5678"
                  disabled={editLoading}
                />
              </div>

              <div className="guide-modal-actions">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="guide-modal-btn guide-modal-btn-cancel"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="guide-modal-btn guide-modal-btn-save"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bank Details Modal */}
      {showBankModal && (
        <div className="guide-modal-overlay">
          <div className="guide-modal">
            <div className="guide-modal-header">
              <h2>Bank Information</h2>
              <button onClick={() => setShowBankModal(false)} className="guide-modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="guide-modal-body">
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Enter your bank details accurately. This information will be used for earnings payouts.
              </p>

              {bankMessage && (
                <div className={`guide-modal-message ${bankMessage.includes('success') ? 'success' : 'error'}`}>
                  {bankMessage}
                </div>
              )}

              <div className="guide-modal-form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  name="bank_name"
                  value={bankFormData.bank_name}
                  onChange={handleBankFormChange}
                  className="guide-modal-input"
                  placeholder="e.g. Bank of Ceylon"
                  disabled={bankLoading}
                />
              </div>

              <div className="guide-modal-form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  name="account_no"
                  value={bankFormData.account_no}
                  onChange={handleBankFormChange}
                  className="guide-modal-input"
                  placeholder="Enter your account number"
                  disabled={bankLoading}
                />
              </div>

              <div className="guide-modal-form-group">
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  name="account_name"
                  value={bankFormData.account_name}
                  onChange={handleBankFormChange}
                  className="guide-modal-input"
                  placeholder="Name as it appears on bank statement"
                  disabled={bankLoading}
                />
              </div>

              <div className="guide-modal-form-group">
                <label>Branch Name</label>
                <input
                  type="text"
                  name="branch_name"
                  value={bankFormData.branch_name}
                  onChange={handleBankFormChange}
                  className="guide-modal-input"
                  placeholder="e.g. Colombo Fort"
                  disabled={bankLoading}
                />
              </div>

              <div className="guide-modal-actions">
                <button
                  onClick={() => setShowBankModal(false)}
                  className="guide-modal-btn guide-modal-btn-cancel"
                  disabled={bankLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBankDetails}
                  className="guide-modal-btn guide-modal-btn-save"
                  disabled={bankLoading}
                >
                  {bankLoading ? "Saving..." : "Save Bank Info"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GuideProfilePage;
