import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
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
    if (!window.confirm("Approve this review?")) return;

    try {
      const result = await reviewAPI.approve(token, reviewId);
      if (result.success) {
        setMessage("Review approved successfully");
        setMessageType("success");
        setTimeout(() => setMessage(null), 3000);
        await fetchReviews();
      } else {
        setMessage(result.message || "Failed to approve review");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error approving review:", error);
      setMessage("Failed to approve review");
      setMessageType("error");
    }
  };

  const handleRejectSubmit = async (reviewId) => {
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection");
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
    if (!window.confirm("Permanently delete this review? This action cannot be undone.")) return;

    try {
      const result = await reviewAPI.delete(token, reviewId);
      if (result.success) {
        setMessage("Review deleted successfully");
        setMessageType("success");
        setTimeout(() => setMessage(null), 3000);
        await fetchReviews();
      } else {
        setMessage(result.message || "Failed to delete review");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      setMessage("Failed to delete review");
      setMessageType("error");
    }
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
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
          {message && (
            <div className={`admin-message admin-message-${messageType}`}>
              {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <p>{message}</p>
            </div>
          )}

          <div className="reviews-filters">
            <button
              className={statusFilter === "pending" ? "filter-btn active" : "filter-btn"}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({statusCounts.pending || 0})
            </button>
            <button
              className={statusFilter === "approved" ? "filter-btn active" : "filter-btn"}
              onClick={() => setStatusFilter("approved")}
            >
              Approved ({statusCounts.approved || 0})
            </button>
            <button
              className={statusFilter === "rejected" ? "filter-btn active" : "filter-btn"}
              onClick={() => setStatusFilter("rejected")}
            >
              Rejected ({statusCounts.rejected || 0})
            </button>
          </div>

          <div className="reviews-grid">
            {reviews.length === 0 ? (
              <p className="no-data">No {statusFilter} reviews found</p>
            ) : (
              reviews.map((review) => (
                <div key={review.review_id} className="review-card">
                  <div className="review-header">
                    <div className="review-user">
                      <div className="user-avatar">
                        {(review.reviewer_name || "?").charAt(0).toUpperCase()}
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

                  {review.title && <h4 className="review-title">{review.title}</h4>}

                  <div className="review-rating">
                    {renderStars(review.rating)}
                    <span className="rating-number">({review.rating}/5)</span>
                  </div>

                  <p className="review-message">{review.comment}</p>

                  {/* Display review images if present */}
                  {review.images && review.images.length > 0 && (
                    <div className="review-images-preview">
                      {review.images.slice(0, 3).map((imageUrl, idx) => (
                        <img 
                          key={idx}
                          src={imageUrl} 
                          alt={`Review image ${idx + 1}`}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '8px' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ))}
                      {review.images.length > 3 && (
                        <span style={{ fontSize: '12px', color: '#666' }}>+{review.images.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Show booking info */}
                  {review.booking_id && (
                    <p className="review-booking-info" style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                      Booking ID: {review.booking_id.substring(0, 8)}...
                    </p>
                  )}

                  {rejectingReviewId === review.review_id ? (
                    <div className="reject-form">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        rows="3"
                      />
                      <div className="reject-actions">
                        <button
                          className="btn-cancel"
                          onClick={() => {
                            setRejectingReviewId(null);
                            setRejectReason("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-submit-reject"
                          onClick={() => handleRejectSubmit(review.review_id)}
                        >
                          Submit Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="review-actions">
                      {review.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(review.review_id)}
                            className="btn-approve"
                            title="Approve this review"
                          >
                            <ThumbsUp size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingReviewId(review.review_id)}
                            className="btn-reject"
                            title="Reject this review"
                          >
                            <ThumbsDown size={16} />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(review.review_id)}
                        className="btn-delete"
                        title="Delete this review"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
    </div>
  );
  }

export default AdminReviewsPage;
