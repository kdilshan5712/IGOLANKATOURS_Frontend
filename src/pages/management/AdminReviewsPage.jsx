import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Trash2, ThumbsUp, ThumbsDown, Star, MessageSquare, X, User } from "lucide-react";
import { reviewAPI } from "../../services/api";
import "./AdminReviews.css";

function AdminReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  const [rejectingReviewId, setRejectingReviewId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }

    fetchReviews();
  }, [navigate, token, role, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const result = await reviewAPI.getAllAdmin(token, {
        status: statusFilter,
        limit: 50,
        offset: 0
      });

      if (result.success) {
        setReviews(result.reviews || []);
        setStatusCounts(result.statusCounts || {});
        setMessage(null);
      } else {
        setMessage(result.message || "Failed to fetch reviews");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setMessage("Failed to fetch reviews");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    setConfirmMessage("Approve this review? The review will be visible to all users.");
    setConfirmAction(() => async () => {
      try {
        const result = await reviewAPI.approve(token, reviewId);
        if (result.success) {
          setMessage("Review approved successfully");
          setMessageType("success");
          setShowConfirmModal(false);
          setTimeout(() => setMessage(null), 3000);
          await fetchReviews();
        } else {
          setMessage(result.message || "Failed to approve review");
          setMessageType("error");
          setShowConfirmModal(false);
        }
      } catch (error) {
        console.error("Error approving review:", error);
        setMessage("Error approving review");
        setMessageType("error");
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleRejectSubmit = async (reviewId) => {
    if (!rejectReason.trim()) {
      setMessage("Please enter a reason for rejection");
      setMessageType("error");
      return;
    }

    try {
      const result = await reviewAPI.reject(token, reviewId, rejectReason);
      if (result.success) {
        setMessage("Review rejected successfully");
        setMessageType("success");
        setTimeout(() => setMessage(null), 3000);
        setRejectingReviewId(null);
        setRejectReason("");
        await fetchReviews();
      } else {
        setMessage(result.message || "Failed to reject review");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error rejecting review:", error);
      setMessage("Failed to reject review");
      setMessageType("error");
    }
  };

  const handleDelete = async (reviewId) => {
    setConfirmMessage("Permanently delete this review? This action cannot be undone.");
    setConfirmAction(() => async () => {
      try {
        const result = await reviewAPI.delete(token, reviewId);
        if (result.success) {
          setMessage("Review deleted successfully");
          setMessageType("success");
          setShowConfirmModal(false);
          setTimeout(() => setMessage(null), 3000);
          await fetchReviews();
        } else {
          setMessage(result.message || "Failed to delete review");
          setMessageType("error");
          setShowConfirmModal(false);
        }
      } catch (error) {
        console.error("Error deleting review:", error);
        setMessage("Failed to delete review");
        setMessageType("error");
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "star-filled" : "star-empty"}
            fill={star <= rating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">Manage customer feedback and ratings</p>
        </div>
      </div>

      {message && (
        <div className={`admin-message admin-message-${messageType}`}>
          {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p>{message}</p>
        </div>
      )}

      <div className="reviews-filters">
        {["pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            className={statusFilter === status ? "filter-btn active" : "filter-btn"}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="count-badge">
              {statusCounts[status] || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="reviews-grid">
        {reviews.length === 0 ? (
          <div className="no-data glass-panel">No {statusFilter} reviews found</div>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="review-card glass-panel">
              <div className="review-header">
                <div className="review-user">
                  <div className="user-avatar">
                    <User size={20} />
                  </div>
                  <div className="user-info">
                    <strong>{review.reviewer_name || "Anonymous"}</strong>
                    <small>{review.created_at ? new Date(review.created_at).toLocaleDateString() : "Recently"}</small>
                  </div>
                </div>
                <div className={`status-badge status-${review.status}`}>
                  {review.status}
                </div>
              </div>

              <div className="review-content">
                {review.title && <h4 className="review-title">{review.title}</h4>}

                <div className="review-rating-row">
                  {renderStars(review.rating)}
                  <span className="rating-number">{review.rating.toFixed(1)}</span>
                </div>

                <p className="review-message">{review.comment}</p>

                {/* Display review images if present */}
                {review.images && review.images.length > 0 && (
                  <div className="review-images-preview">
                    {review.images.slice(0, 3).map((imageUrl, idx) => (
                      <img
                        key={idx}
                        src={imageUrl}
                        alt={`Review ${idx + 1}`}
                        className="review-image-thumb"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ))}
                    {review.images.length > 3 && (
                      <span className="more-images">+{review.images.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Show booking info */}
                {review.booking_id && (
                  <div className="review-booking-info">
                    <small>Booking ref: #{String(review.booking_id).substring(0, 8)}</small>
                  </div>
                )}
              </div>

              {rejectingReviewId === review.review_id ? (
                <div className="reject-form glass-panel-inner">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows="3"
                    className="glass-input"
                  />
                  <div className="reject-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setRejectingReviewId(null);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRejectSubmit(review.review_id)}
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="review-actions">
                  {review.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(review.review_id)}
                        className="btn btn-success"
                        title="Approve"
                      >
                        <ThumbsUp size={16} /> Approve
                      </button>
                      <button
                        onClick={() => setRejectingReviewId(review.review_id)}
                        className="btn btn-warning"
                        title="Reject"
                      >
                        <ThumbsDown size={16} /> Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(review.review_id)}
                    className="btn btn-danger-outline"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay-confirm" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content-confirm glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Action</h3>
            <p>{confirmMessage}</p>
            <div className="modal-footer-confirm">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
              >
                Yes, Confirm
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
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

export default AdminReviewsPage;
