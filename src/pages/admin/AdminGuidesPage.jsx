import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import "./AdminGuides.css";

function AdminGuidesPage() {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGuides();
  }, []);

  useEffect(() => {
    filterGuides();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guides, statusFilter]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log('🔍 Fetching guides with token:', token ? 'Present' : 'Missing');
      
      // Use new endpoint that includes documents array
      const result = await adminAPI.getGuidesWithDocuments(token);
      
      console.log('📦 API Response:', result);
      
      if (result.success) {
        console.log(`✅ Setting ${result.guides?.length || 0} guides to state`);
        setGuides(result.guides || []);
      } else {
        console.error("❌ Failed to fetch guides:", result.message);
      }
    } catch (error) {
      console.error("❌ Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterGuides = () => {
    if (statusFilter === "all") {
      setFilteredGuides(guides);
    } else if (statusFilter === "pending") {
      setFilteredGuides(guides.filter(g => g.status === "pending" && !g.approved));
    } else if (statusFilter === "approved") {
      setFilteredGuides(guides.filter(g => g.approved === true && g.status === "active"));
    } else if (statusFilter === "rejected") {
      setFilteredGuides(guides.filter(g => g.status === "rejected"));
    }
  };

  const viewGuideDetails = async (guideId) => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.getGuideDetails(guideId, token);
      
      if (result.success) {
        setSelectedGuide(result.guide);
        setShowModal(true);
      } else {
        alert("Failed to fetch guide details");
      }
    } catch (error) {
      console.error("Error fetching guide details:", error);
      alert("Error loading guide details");
    }
  };

  const handleApprove = async (guideId) => {
    if (!confirm("Are you sure you want to approve this guide?")) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      // Use new -action endpoint for approval
      const result = await adminAPI.approveGuideAction(guideId, token);
      
      if (result.success) {
        alert("Guide approved successfully! An email has been sent to the guide.");
        setShowModal(false);
        fetchGuides();
      } else {
        alert(result.message || "Failed to approve guide");
      }
    } catch (error) {
      console.error("Error approving guide:", error);
      alert("Error approving guide");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (guide) => {
    setSelectedGuide(guide);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const viewDocument = async (guideId, documentId) => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.getDocumentUrl(guideId, documentId, token);
      
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        alert("Failed to load document URL");
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      alert("Error loading document");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      // Use new -action endpoint for rejection
      const result = await adminAPI.rejectGuideAction(selectedGuide.guide_id, rejectReason, token);
      
      if (result.success) {
        alert("Guide rejected successfully! An email has been sent with the reason.");
        setShowRejectModal(false);
        setShowModal(false);
        fetchGuides();
      } else {
        alert(result.message || "Failed to reject guide");
      }
    } catch (error) {
      console.error("Error rejecting guide:", error);
      alert("Error rejecting guide");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (guide) => {
    if (guide.approved && guide.status === "active") return "status-badge status-approved";
    if (guide.status === "rejected") return "status-badge status-rejected";
    if (guide.status === "pending") return "status-badge status-pending";
    return "status-badge";
  };

  const getStatusText = (guide) => {
    if (guide.approved && guide.status === "active") return "Approved";
    if (guide.status === "rejected") return "Rejected";
    if (guide.status === "pending") return "Pending";
    return guide.status || "Unknown";
  };

  const parseLanguages = (languagesStr) => {
    try {
      if (!languagesStr) return [];
      const parsed = JSON.parse(languagesStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading guides...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Tour Guides</h1>
          <p>Manage guide applications</p>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="guides-filters">
        <button
          className={statusFilter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setStatusFilter("all")}
        >
          All Guides ({guides.length})
        </button>
        <button
          className={statusFilter === "pending" ? "filter-btn active" : "filter-btn"}
          onClick={() => setStatusFilter("pending")}
        >
          Pending ({guides.filter(g => g.status === "pending" && !g.approved).length})
        </button>
        <button
          className={statusFilter === "approved" ? "filter-btn active" : "filter-btn"}
          onClick={() => setStatusFilter("approved")}
        >
          Approved ({guides.filter(g => g.approved === true && g.status === "active").length})
        </button>
        <button
          className={statusFilter === "rejected" ? "filter-btn active" : "filter-btn"}
          onClick={() => setStatusFilter("rejected")}
        >
          Rejected ({guides.filter(g => g.status === "rejected").length})
        </button>
      </div>

      {/* Guides Table */}
      {filteredGuides.length === 0 ? (
        <div className="no-data">
          <p>No guides found for this filter</p>
        </div>
      ) : (
        <div className="guides-table-container">
          <table className="guides-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>CONTACT</th>
                <th>LANGUAGES</th>
                <th>EXPERIENCE</th>
                <th>LICENSE</th>
                <th>DOCUMENTS</th>
                <th>STATUS</th>
                <th>APPLIED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuides.map((guide) => (
                <tr key={guide.guide_id}>
                  <td className="guide-name">{guide.full_name}</td>
                  <td>{guide.email}</td>
                  <td>{guide.contact_number}</td>
                  <td className="languages">
                    {parseLanguages(guide.languages).join(", ") || "N/A"}
                  </td>
                  <td>{guide.experience_years ? `${guide.experience_years} years` : "N/A"}</td>
                  <td className="license">{guide.license_number || "N/A"}</td>
                  <td className="text-center">
                    <span className="document-badge">
                      {guide.document_count || 0} docs
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(guide)}>
                      {getStatusText(guide)}
                    </span>
                  </td>
                  <td>{new Date(guide.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-view"
                      onClick={() => viewGuideDetails(guide.guide_id)}
                    >
                      View
                    </button>
                    {(guide.status === "pending" && !guide.approved) && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(guide.guide_id)}
                          disabled={actionLoading}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => openRejectModal(guide)}
                          disabled={actionLoading}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guide Details Modal */}
      {showModal && selectedGuide && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content guide-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Guide Application Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="guide-info-section">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Full Name:</label>
                    <p>{selectedGuide.full_name}</p>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <p>{selectedGuide.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Contact Number:</label>
                    <p>{selectedGuide.contact_number}</p>
                  </div>
                  <div className="info-item">
                    <label>Languages:</label>
                    <p>{parseLanguages(selectedGuide.languages).join(", ") || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Experience Years:</label>
                    <p>{selectedGuide.experience_years || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>License Number:</label>
                    <p>{selectedGuide.license_number || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <p>
                      <span className={getStatusBadgeClass(selectedGuide)}>
                        {getStatusText(selectedGuide)}
                      </span>
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Applied On:</label>
                    <p>{new Date(selectedGuide.created_at).toLocaleString()}</p>
                  </div>
                  {selectedGuide.approved_at && (
                    <>
                      <div className="info-item">
                        <label>Approved/Rejected On:</label>
                        <p>{new Date(selectedGuide.approved_at).toLocaleString()}</p>
                      </div>
                      <div className="info-item">
                        <label>Approved/Rejected By:</label>
                        <p>{selectedGuide.approved_by_email || "N/A"}</p>
                      </div>
                    </>
                  )}
                  {selectedGuide.rejection_reason && (
                    <div className="info-item full-width">
                      <label>Rejection Reason:</label>
                      <p className="rejection-reason">{selectedGuide.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedGuide.documents && selectedGuide.documents.length > 0 && (
                <div className="guide-documents-section">
                  <h3>Uploaded Documents ({selectedGuide.documents.length})</h3>
                  <div className="documents-list">
                    {selectedGuide.documents.map((doc) => (
                      <div key={doc.document_id} className="document-item">
                        <div className="document-info">
                          <span className="document-type">{doc.document_type}</span>
                          <span className={doc.verified ? "verified-badge" : "unverified-badge"}>
                            {doc.verified ? "✓ Verified" : "Pending Verification"}
                          </span>
                          <span className="document-date">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => viewDocument(selectedGuide.guide_id, doc.document_id)}
                          className="btn-view-doc"
                        >
                          View Document
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedGuide.status === "pending" && !selectedGuide.approved && (
                <>
                  <button
                    className="btn-approve-modal"
                    onClick={() => handleApprove(selectedGuide.guide_id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Approve Guide"}
                  </button>
                  <button
                    className="btn-reject-modal"
                    onClick={() => {
                      setShowModal(false);
                      openRejectModal(selectedGuide);
                    }}
                    disabled={actionLoading}
                  >
                    Reject Application
                  </button>
                </>
              )}
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedGuide && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content reject-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Guide Application</h2>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p className="reject-warning">
                You are about to reject the application from <strong>{selectedGuide.full_name}</strong>.
                Please provide a detailed reason for rejection.
              </p>
              <textarea
                className="reject-reason-input"
                placeholder="Enter reason for rejection (e.g., Incomplete documents, Invalid license number, etc.)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="5"
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn-confirm-reject"
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? "Processing..." : "Confirm Rejection"}
              </button>
              <button
                className="btn-cancel-reject"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGuidesPage;
