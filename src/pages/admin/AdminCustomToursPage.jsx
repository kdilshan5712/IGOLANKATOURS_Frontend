import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import "./AdminCustomTours.css";

function AdminCustomToursPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }

    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.getCustomTourRequests(token);
      
      if (result.success) {
        setRequests(result.requests || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading requests...</div>
    </div>
  );
  }

  return (
    <div className="admin-page">
          <div className="custom-tours-filters">
            <button
              className={filter === "pending" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("pending")}
            >
              Pending ({requests.filter(r => r.status === "pending").length})
            </button>
            <button
              className={filter === "reviewing" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("reviewing")}
            >
              Reviewing ({requests.filter(r => r.status === "reviewing").length})
            </button>
            <button
              className={filter === "quoted" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("quoted")}
            >
              Quoted ({requests.filter(r => r.status === "quoted").length})
            </button>
            <button
              className={filter === "accepted" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("accepted")}
            >
              Accepted ({requests.filter(r => r.status === "accepted").length})
            </button>
            <button
              className={filter === "all" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("all")}
            >
              All ({requests.length})
            </button>
          </div>

          <div className="requests-grid">
            {filteredRequests.length === 0 ? (
              <p className="no-data">No custom tour requests found</p>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.request_id} className="request-card">
                  <div className="request-header">
                    <div className="requester-info">
                      <strong>{request.name}</strong>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <small>{new Date(request.created_at).toLocaleDateString()}</small>
                  </div>

                  <div className="request-info">
                    <div className="info-item">
                      <span className="info-label">Destination:</span>
                      <span>{request.destination || "Not specified"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Duration:</span>
                      <span>{request.duration || "Not specified"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Travelers:</span>
                      <span>{request.travelers_count || "Not specified"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Budget:</span>
                      <span>{request.budget_range || "Not specified"}</span>
                    </div>
                  </div>

                  {request.interests && (
                    <div className="request-interests">
                      <strong>Interests:</strong> {request.interests}
                    </div>
                  )}

                  <div className="request-contact">
                    <span>📧 {request.email}</span>
                    {request.phone && <span>📞 {request.phone}</span>}
                  </div>

                  <button
                    onClick={() => handleViewDetails(request)}
                    className="btn-view-details"
                  >
                    View Full Details
                  </button>
                </div>
              ))
            )}
          </div>

      {selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Custom Tour Request Details</h2>
              <button onClick={handleCloseModal} className="modal-close">✕</button>
            </div>

            <div className="request-details">
              <div className="detail-section">
                <h3>Requester Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedRequest.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedRequest.email}</span>
                  </div>
                  {selectedRequest.phone && (
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedRequest.phone}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge status-${selectedRequest.status}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Tour Requirements</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Destination:</label>
                    <span>{selectedRequest.destination || "Not specified"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Duration:</label>
                    <span>{selectedRequest.duration || "Not specified"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Number of Travelers:</label>
                    <span>{selectedRequest.travelers_count || "Not specified"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Budget Range:</label>
                    <span>{selectedRequest.budget_range || "Not specified"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Travel Dates:</label>
                    <span>{selectedRequest.travel_dates || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {selectedRequest.interests && (
                <div className="detail-section">
                  <h3>Interests & Preferences</h3>
                  <div className="detail-content">
                    {selectedRequest.interests}
                  </div>
                </div>
              )}

              {selectedRequest.special_requirements && (
                <div className="detail-section">
                  <h3>Special Requirements</h3>
                  <div className="detail-content">
                    {selectedRequest.special_requirements}
                  </div>
                </div>
              )}

              {selectedRequest.additional_notes && (
                <div className="detail-section">
                  <h3>Additional Notes</h3>
                  <div className="detail-content">
                    {selectedRequest.additional_notes}
                  </div>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div className="detail-section">
                  <h3>Admin Notes</h3>
                  <div className="admin-notes">
                    {selectedRequest.admin_notes}
                  </div>
                </div>
              )}

              <div className="request-timestamps">
                <small>Requested: {new Date(selectedRequest.created_at).toLocaleString()}</small>
                {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && (
                  <small>Updated: {new Date(selectedRequest.updated_at).toLocaleString()}</small>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomToursPage;
