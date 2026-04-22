/**
 * 🎯 I GO LANKA TOURS - Admin Custom Tour Management
 * 
 * Administrative workflow for processing AI-generated custom tour requests. 
 * Supports interactive chat with travelers, itinerary modification, and 
 * formal pricing approval to convert requests into bookable tours.
 * 
 * @module AdminCustomToursPage
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, DollarSign, Mail, Phone, FileText, X, Eye, Send, Loader, MessageCircle, CheckCircle2 } from "lucide-react";
import { adminAPI, chatAPI } from "../../services/api";
import "./AdminCustomTours.css";

/**
 * AdminCustomToursPage Component
 * 
 * Orchestrates the conversion of AI design sessions into verified travel products.
 * 
 * @returns {JSX.Element}
 */
function AdminCustomToursPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending_approval");
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);

  // Approval states
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState(""); // "approve", "reject", "needs_changes"
  const [decisionData, setDecisionData] = useState({
    admin_final_price: "",
    rejection_reason: "",
    special_notes: ""
  });
  const [processingDecision, setProcessingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState(null);
  const [decisionSuccess, setDecisionSuccess] = useState(false);

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
    setReplyMessage("");
    setReplyError(null);
    setReplySuccess(false);
    fetchChatMessages(request.session_id);

    // Pre-fill approval data
    const initialPrice = request.admin_final_price || 
                         request.estimated_price_max || 
                         request.estimated_price_min || 
                         "";

    setDecisionData({
      admin_final_price: initialPrice,
      rejection_reason: request.rejection_reason || "",
      special_notes: request.special_notes || ""
    });
  };

  const fetchChatMessages = async (sessionId) => {
    if (!sessionId) return;
    setLoadingChat(true);
    try {
      const token = localStorage.getItem("token");
      const res = await chatAPI.getSessionMessages(sessionId, token);
      if (res.success) {
        setChatMessages(res.messages || []);
      }
    } catch (err) {
      console.error("Error fetching chat:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setReplyMessage("");
    setReplyError(null);
    setReplySuccess(false);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    setReplying(true);
    setReplyError(null);
    setReplySuccess(false);

    try {
      const token = localStorage.getItem("token");
      const res = await chatAPI.sendSessionMessage(selectedRequest.session_id, replyMessage, token);

      if (res.success) {
        setReplySuccess(true);
        setReplyMessage("");
        fetchChatMessages(selectedRequest.session_id);
      } else {
        setReplyError(res.message || "Failed to send message.");
      }
    } catch (err) {
      setReplyError("An unexpected error occurred.");
    } finally {
      setReplying(false);
    }
  };

  const handleDecisionSubmit = async () => {
    setProcessingDecision(true);
    setDecisionError(null);
    try {
      const token = localStorage.getItem("token");
      const targetStatus = decisionType === 'approve' ? 'approved' 
                         : decisionType === 'reject' ? 'rejected' 
                         : 'needs_changes';
      
      const res = await adminAPI.updateCustomTourStatus(selectedRequest.session_id, {
        status: targetStatus,
        admin_final_price: decisionData.admin_final_price,
        rejection_reason: decisionData.rejection_reason,
        special_notes: decisionData.special_notes
      }, token);

      if (res.success) {
        setDecisionSuccess(true);
        setTimeout(() => {
          setShowDecisionModal(false);
          setDecisionSuccess(false);
          setSelectedRequest(null);
          fetchRequests();
        }, 2000);
      } else {
        setDecisionError(res.message || "Failed to update tour status.");
      }
    } catch (err) {
      setDecisionError("An unexpected error occurred during update.");
    } finally {
      setProcessingDecision(false);
    }
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
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Custom Tour Requests</h1>
          <p className="page-subtitle">Tailor-made experiences for travelers</p>
        </div>
      </div>

      <div className="custom-tours-filters">
        {["pending_approval", "under_review", "approved", "needs_changes", "rejected", "all"].map((status) => (
          <button
            key={status}
            className={filter === status ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter(status)}
          >
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            <span className="count-badge">
              {status === 'all'
                ? requests.length
                : requests.filter(r => r.status === status).length}
            </span>
          </button>
        ))}
      </div>

      <div className="requests-grid">
        {filteredRequests.length === 0 ? (
          <div className="no-data glass-panel">No custom tour requests found</div>
        ) : (
          filteredRequests.map((request) => {
            const prefs = request.preferences || {};
            const displayData = {
              id: request.session_id || request.request_id || request.message_id,
              name: request.tourist_name || request.name || "Anonymous Traveler",
              email: request.user_email || request.email || "N/A",
              phone: request.tourist_phone || request.phone || "",
              destination: request.destination || request.title || request.preferences?.destination || "Custom AI Iteration",
              duration: request.duration_days ? `${request.duration_days} Days` : request.preferences?.duration || "Not specified",
              travelers: request.traveler_count || request.preferences?.travelers_count || "Not specified",
              budget: request.estimated_price_max ? `$${request.estimated_price_min} - $${request.estimated_price_max}` : request.preferences?.budget_range || "Not specified",
              status: request.status || "pending_approval",
              created_at: request.created_at
            };

            return (
              <div key={displayData.id} className="request-card glass-panel">
                <div className="request-header">
                  <div className="requester-info">
                    <strong>{displayData.name}</strong>
                    <span className={`status-badge status-${displayData.status}`}>
                      {displayData.status}
                    </span>
                  </div>
                  <small className="text-secondary">{new Date(displayData.created_at).toLocaleDateString()}</small>
                </div>

                <div className="request-info">
                  <div className="info-item">
                    <span className="info-label"><MapPin size={14} /> Destination</span>
                    <span>{displayData.destination}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><Calendar size={14} /> Duration</span>
                    <span>{displayData.duration}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><Users size={14} /> Travelers</span>
                    <span>{displayData.travelers}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><DollarSign size={14} /> Budget</span>
                    <span>{displayData.budget}</span>
                  </div>
                </div>

                <div className="request-contact">
                  <span><Mail size={14} /> {displayData.email}</span>
                  {displayData.phone && <span><Phone size={14} /> {displayData.phone}</span>}
                </div>

                <button
                  onClick={() => handleViewDetails(request)}
                  className="btn btn-primary btn-block"
                >
                  <Eye size={16} /> View Full Details
                </button>
              </div>
            );
          })
        )}
      </div>

      {selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass-panel modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Custom Tour Request</h2>
              <button onClick={handleCloseModal} className="modal-close"><X size={24} /></button>
            </div>

            <div className="request-details-grid">
              <div className="detail-section full-width">
                <h3>Requester Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <span>{selectedRequest.tourist_name || selectedRequest.name || "Anonymous"}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{selectedRequest.user_email || selectedRequest.email || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{selectedRequest.tourist_phone || selectedRequest.phone || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <span className={`status-badge status-${selectedRequest.status || 'pending'}`}>
                      {selectedRequest.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section full-width">
                <h3>Trip Details</h3>
                <div className="info-grid leading-relaxed">
                  <div className="info-item">
                    <label>Destination</label>
                    <span>{selectedRequest.destination || selectedRequest.preferences?.destination || "Not specified"}</span>
                  </div>
                  <div className="info-item">
                    <label>Duration</label>
                    <span>{selectedRequest.duration_days ? `${selectedRequest.duration_days} Days` : selectedRequest.preferences?.duration || "Not specified"}</span>
                  </div>
                  <div className="info-item">
                    <label>Travel Month</label>
                    <span>{selectedRequest.travel_month || selectedRequest.preferences?.travel_dates || "Not specified"}</span>
                  </div>
                  <div className="info-item">
                    <label>Travelers</label>
                    <span>{selectedRequest.traveler_count || selectedRequest.preferences?.travelers_count || "Not specified"}</span>
                  </div>
                  <div className="info-item">
                    <label>Price Range</label>
                    <span>{selectedRequest.estimated_price_max ? `$${selectedRequest.estimated_price_min} - $${selectedRequest.estimated_price_max}` : selectedRequest.preferences?.budget_range || "Not specified"}</span>
                  </div>
                  <div className="info-item">
                    <label>Hotel Preference</label>
                    <span>{selectedRequest.hotel_preference || selectedRequest.preferences?.hotel_preference || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {(selectedRequest.preferences || selectedRequest.interests || selectedRequest.special_requirements || selectedRequest.additional_notes) && (
                <div className="detail-section full-width">
                  <h3>Preferences & Notes</h3>
                  <div className="notes-container">
                    {(selectedRequest.recommendations || selectedRequest.preferences?.itinerary) && (
                      <div className="note-group full-width">
                        <label className="text-primary font-bold mb-2 block">AI Generated Itinerary:</label>
                        <div className="itinerary-details-view" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--admin-glass-border)' }}>
                          {(() => {
                            let rawData = selectedRequest.recommendations || selectedRequest.preferences?.itinerary || [];
                            if (typeof rawData === 'string') {
                              try { rawData = JSON.parse(rawData); } catch(e) { rawData = []; }
                            }
                            const plan = Array.isArray(rawData) ? rawData : (rawData.daily_plan || []);
                            
                            return plan.map((day, idx) => (
                              <div key={idx} className="itinerary-day-row" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: idx === (plan.length - 1) ? 'none' : '1px solid var(--admin-glass-border)' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                  <div style={{ 
                                    background: 'var(--admin-primary)', 
                                    color: 'white', 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                  }}>
                                    {day.day}
                                  </div>
                                  <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-text-primary)', fontSize: '1rem' }}>{day.location}</h4>
                                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>
                                      <strong>Activities:</strong> {Array.isArray(day.activities) ? day.activities.join(' • ') : day.activities}
                                    </p>
                                    {(day.accommodation_type || day.stay) && (
                                      <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.7 }}>
                                        Stay: {day.accommodation_type || day.stay}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                    {(selectedRequest.interests || selectedRequest.preferences?.interests) && (
                      <div className="note-group">
                        <label>Interests:</label>
                        <p>{selectedRequest.interests || selectedRequest.preferences?.interests}</p>
                      </div>
                    )}
                    {(selectedRequest.special_requirements || selectedRequest.preferences?.special_requirements) && (
                      <div className="note-group">
                        <label>Special Requirements:</label>
                        <p>{selectedRequest.special_requirements || selectedRequest.preferences?.special_requirements}</p>
                      </div>
                    )}
                    {(selectedRequest.additional_notes || selectedRequest.preferences?.additional_notes) && (
                      <div className="note-group">
                        <label>Additional Notes:</label>
                        <p>{selectedRequest.additional_notes || selectedRequest.preferences?.additional_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat & Messaging Section */}
              <div className="detail-section full-width chat-section">
                <h3>Message History & Reply</h3>
                <div className="chat-container glass-panel">
                  <div className="messages-list">
                    {loadingChat ? (
                      <div className="loading-chat"><Loader className="spinner" /> Loading messages...</div>
                    ) : chatMessages.length === 0 ? (
                      <div className="no-messages">No messages yet. Send a message to start the conversation.</div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className={`message-bubble ${msg.sender_role === 'admin' ? 'sent' : 'received'}`}>
                          <div className="message-header">
                            <span className="sender">{msg.sender_name}</span>
                            <span className="time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="message-content">{msg.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="reply-box-container">
                    <textarea
                      placeholder="Type your message to the tourist..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="reply-textarea"
                      rows={3}
                      disabled={replying}
                    />
                    {replyError && <div className="reply-alert error-alert">{replyError}</div>}
                    
                    <div className="reply-actions">
                      <button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || replying}
                        className="btn btn-primary"
                      >
                        {replying ? <Loader size={16} className="spinner" /> : <Send size={16} />}
                        {replying ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Actions Section */}
              {selectedRequest.status !== 'approved' && selectedRequest.status !== 'rejected' && (
                <div className="detail-section full-width actions-section">
                  <h3>Admin Decision</h3>
                  <div className="booking-conversion-card glass-panel">
                    <div className="action-info">
                      <p>Review the AI-generated itinerary and finalize pricing. Upon approval, the user will be permitted to proceed to final payment and booking.</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-success" 
                          onClick={() => { setDecisionType('approve'); setShowDecisionModal(true); }}
                        >
                          <CheckCircle2 size={16} /> Approve & Set Price
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => { setDecisionType('needs_changes'); setShowDecisionModal(true); }}
                        >
                          Request Changes
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ background: '#dc2626', color: 'white', border: 'none' }}
                          onClick={() => { setDecisionType('reject'); setShowDecisionModal(true); }}
                        >
                          <X size={16} /> Reject Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Decision Modal */}
      {showDecisionModal && (
        <div className="modal-overlay" onClick={() => setShowDecisionModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {decisionType === 'approve' ? 'Approve & Finalize Pricing' : 
                 decisionType === 'reject' ? 'Reject Tour Request' : 
                 'Request Changes'}
              </h2>
              <button onClick={() => setShowDecisionModal(false)} className="modal-close"><X size={24} /></button>
            </div>
            
            <div className="conversion-form p-4">
              {decisionSuccess ? (
                <div className="success-message text-center p-4">
                  <CheckCircle2 size={48} className="text-success mx-auto mb-2" />
                  <h3>Successfully Submitted!</h3>
                  <p>The tour request status has been updated.</p>
                </div>
              ) : (
                <>
                  {decisionType === 'approve' && (
                    <div className="form-group mb-4">
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Final Approved Price ($)</label>
                      <input 
                        type="number" 
                        value={decisionData.admin_final_price}
                        onChange={(e) => setDecisionData({...decisionData, admin_final_price: e.target.value})}
                        placeholder="e.g. 1500"
                        className="form-control"
                        style={{ fontSize: '1.2rem', padding: '10px' }}
                      />
                      <small className="text-secondary" style={{ display: 'block', marginTop: '5px' }}>
                        This is the exact price the user will be prompted to pay during checkout.
                      </small>
                    </div>
                  )}

                  {decisionType === 'reject' && (
                    <div className="form-group mb-4">
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Reason for Rejection</label>
                      <textarea 
                        value={decisionData.rejection_reason}
                        onChange={(e) => setDecisionData({...decisionData, rejection_reason: e.target.value})}
                        placeholder="Explain why this request cannot be fulfilled..."
                        className="form-control"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="form-group mt-3">
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Special Notes to Customer</label>
                    <textarea 
                      value={decisionData.special_notes}
                      onChange={(e) => setDecisionData({...decisionData, special_notes: e.target.value})}
                      placeholder="Add any specific itinerary modifications, hotel upgrades, or notes for the user..."
                      className="form-control"
                      rows={4}
                    />
                  </div>
                  
                  {decisionError && <div className="reply-alert error-alert mt-3" style={{ color: 'red' }}>{decisionError}</div>}
                  
                  <div className="modal-footer mt-4" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={() => setShowDecisionModal(false)} className="btn btn-secondary">Cancel</button>
                    <button 
                      onClick={handleDecisionSubmit} 
                      disabled={processingDecision || (decisionType === 'approve' && !decisionData.admin_final_price)}
                      className={decisionType === 'reject' ? "btn btn-danger" : "btn btn-success"}
                      style={decisionType === 'reject' ? { background: '#ef4444', color: 'white', border: 'none' } : {}}
                    >
                      {processingDecision ? <Loader className="spinner mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
                      {processingDecision ? "Processing..." : "Confirm Action"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomToursPage;
