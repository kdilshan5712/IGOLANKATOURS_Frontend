/**
 * 🎯 I GO LANKA TOURS - Admin Payouts Management
 * 
 * Provides an administrative interface for processing guide payout requests.
 * Supports status transitions (pending -> approved -> paid), internal note 
 * management, and comprehensive bank detail verification for secure transfers.
 * 
 * @module AdminPayoutsPage
 */

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  User,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { adminAPI } from "../../services/api";
import "./AdminPayouts.css";

/**
 * AdminPayoutsPage Component
 * 
 * Orchestrates the guide remuneration workflow, interfacing with the 
 * administrative payout service to manage financial disbursements.
 * 
 * @returns {JSX.Element}
 */
const AdminPayoutsPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    paid: 0,
    rejected: 0
  });

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    fetchPayouts();
  }, [filterStatus]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const filters = filterStatus !== "all" ? { status: filterStatus } : {};
      // @API_CALL: Fetch payout requests with optional status filtering
      const response = await adminAPI.getPayoutRequests(token, filters);
      
      if (response.success) {
        setPayouts(response.payouts || []);
        if (response.statusCounts) {
          setStatusCounts(response.statusCounts);
        }
      } else {
        // @ERROR_HANDLING: API failure response
        setError(response.message || "Failed to load payout requests");
      }
    } catch (err) {
      // @ERROR_HANDLING: Connection or major failure
      console.error("Fetch payouts error:", err);
      setError("An error occurred while fetching payout requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedPayout) return;

    setUpdatingStatus(true);
    setUpdateMessage("");

    try {
      const token = localStorage.getItem("token");
      // @API_CALL: Update the lifecycle status of a payout request
      const result = await adminAPI.updatePayoutStatus(
        selectedPayout.payout_id, 
        { status, admin_notes: adminNotes }, 
        token
      );

      if (result.success) {
        setUpdateMessage(`Request ${status} successfully!`);
        // Refresh local data
        fetchPayouts();
        setTimeout(() => {
          setShowStatusModal(false);
          setSelectedPayout(null);
          setAdminNotes("");
          setUpdateMessage("");
        }, 1500);
      } else {
        // @ERROR_HANDLING: Validation or service layer failure during status transition
        setUpdateMessage(result.message || "Failed to update status");
      }
    } catch (err) {
      // @ERROR_HANDLING: Unexpected network or system failure
      console.error("Update status error:", err);
      setUpdateMessage("An error occurred. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredPayouts = payouts.filter(p => 
    p.guide_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.guide_id?.toString().includes(searchTerm) ||
    p.payout_id?.toString().includes(searchTerm)
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'paid': return 'status-paid';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'paid': return <DollarSign size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return null;
    }
  };

  if (loading && payouts.length === 0) {
    return <div className="admin-page-loading">Loading payout requests...</div>;
  }

  return (
    <div className="admin-payouts-page">
      <header className="admin-payouts-header">
        <div>
          <h1 className="admin-payouts-title">Guide Payout Requests</h1>
          <p className="admin-payouts-subtitle">Manage and process payments for tour guides</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="admin-payouts-stats">
        <div className="payout-stat-card">
          <div className="payout-stat-icon pending"><Clock size={24} /></div>
          <div className="payout-stat-info">
            <span className="payout-stat-label">Pending</span>
            <span className="payout-stat-value">{statusCounts.pending}</span>
          </div>
        </div>
        <div className="payout-stat-card">
          <div className="payout-stat-icon approved"><CheckCircle size={24} /></div>
          <div className="payout-stat-info">
            <span className="payout-stat-label">Approved</span>
            <span className="payout-stat-value">{statusCounts.approved}</span>
          </div>
        </div>
        <div className="payout-stat-card">
          <div className="payout-stat-icon paid"><DollarSign size={24} /></div>
          <div className="payout-stat-info">
            <span className="payout-stat-label">Paid</span>
            <span className="payout-stat-value">{statusCounts.paid}</span>
          </div>
        </div>
        <div className="payout-stat-card">
          <div className="payout-stat-icon rejected"><XCircle size={24} /></div>
          <div className="payout-stat-info">
            <span className="payout-stat-label">Rejected</span>
            <span className="payout-stat-value">{statusCounts.rejected}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="admin-payouts-controls">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search by guide name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={20} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="admin-payouts-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Payouts Table */}
      <div className="admin-payouts-table-container">
        <table className="admin-payouts-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Guide</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayouts.length > 0 ? (
              filteredPayouts.map((payout) => (
                <tr key={payout.payout_id}>
                  <td>#{payout.payout_id}</td>
                  <td>
                    <div className="guide-info-cell">
                      <div className="guide-avatar">
                        {payout.guide_name?.[0].toUpperCase() || "G"}
                      </div>
                      <div>
                        <div className="guide-name">{payout.guide_name}</div>
                        <div className="guide-id">ID: {payout.guide_id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="payout-amount">${parseFloat(payout.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(payout.status)}`}>
                      {getStatusIcon(payout.status)}
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {new Date(payout.requested_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="payout-action-btn"
                      onClick={() => {
                        setSelectedPayout(payout);
                        setAdminNotes(payout.admin_notes || "");
                        setShowStatusModal(true);
                        setUpdateMessage("");
                      }}
                    >
                      <Info size={18} />
                      Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data-cell">No payout requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payout Details & Action Modal */}
      {showStatusModal && selectedPayout && (
        <div className="admin-modal-overlay">
          <div className="admin-modal payout-details-modal">
            <div className="admin-modal-header">
              <h2>Payout Request Details</h2>
              <button 
                className="admin-modal-close" 
                onClick={() => {
                  if (!updatingStatus) setShowStatusModal(false);
                }}
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="admin-modal-body">
              {updateMessage && (
                <div className={`modal-message ${updateMessage.includes('success') ? 'success' : 'error'}`}>
                  {updateMessage}
                </div>
              )}

              <div className="payout-details-grid">
                <section className="details-section">
                  <h3>Guide Information</h3>
                  <div className="detail-row">
                    <span>Name</span>
                    <strong>{selectedPayout.guide_name}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Guide ID</span>
                    <strong>{selectedPayout.guide_id}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Email</span>
                    <strong>{selectedPayout.guide_email || "N/A"}</strong>
                  </div>
                </section>

                <section className="details-section">
                  <h3>Bank Information</h3>
                  {selectedPayout.bank_name ? (
                    <>
                      <div className="detail-row">
                        <span>Bank Name</span>
                        <strong>{selectedPayout.bank_name}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Account No</span>
                        <strong className="copy-text">{selectedPayout.account_no}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Account Name</span>
                        <strong>{selectedPayout.account_name}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Branch</span>
                        <strong>{selectedPayout.branch_name || "N/A"}</strong>
                      </div>
                    </>
                  ) : (
                    <div className="no-bank-alert">
                      <AlertCircle size={18} />
                      <span>Bank details not provided!</span>
                    </div>
                  )}
                </section>

                <section className="details-section full-width">
                  <h3>Request Details</h3>
                  <div className="detail-row">
                    <span>Amount</span>
                    <strong className="amount-high">${parseFloat(selectedPayout.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Requested At</span>
                    <strong>{new Date(selectedPayout.requested_at).toLocaleString()}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Current Status</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedPayout.status)}`}>
                      {selectedPayout.status.toUpperCase()}
                    </span>
                  </div>
                </section>
              </div>

              <div className="admin-notes-section">
                <label>Admin Notes</label>
                <textarea 
                  placeholder="Internal notes or reason for rejection..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={updatingStatus || selectedPayout.status === 'paid'}
                />
              </div>

              {selectedPayout.status !== 'paid' && (
                <div className="admin-modal-actions">
                  {selectedPayout.status === 'pending' && (
                    <>
                      <button 
                        className="modal-btn reject"
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={updatingStatus}
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                      <button 
                        className="modal-btn approve"
                        onClick={() => handleUpdateStatus('approved')}
                        disabled={updatingStatus}
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                    </>
                  )}
                  {selectedPayout.status === 'approved' && (
                    <>
                      <button 
                        className="modal-btn reject"
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={updatingStatus}
                      >
                        <XCircle size={18} />
                        Cancel Approval
                      </button>
                      <button 
                        className="modal-btn pay"
                        onClick={() => handleUpdateStatus('paid')}
                        disabled={updatingStatus}
                      >
                        <DollarSign size={18} />
                        Mark as Paid
                      </button>
                    </>
                  )}
                  {selectedPayout.status === 'rejected' && (
                    <button 
                      className="modal-btn approve"
                      onClick={() => handleUpdateStatus('pending')}
                      disabled={updatingStatus}
                    >
                      <Clock size={18} />
                      Set to Pending
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutsPage;
