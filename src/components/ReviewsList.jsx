
import { useEffect, useState } from "react";
import { reviewAPI } from "../services/api";
import "./ReviewsList.css";

const ReviewsList = ({ packageId = null, limit = 100 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        let result;

        // Validate packageId is not undefined, null, or string 'undefined'/'null'
        if (packageId && packageId !== 'undefined' && packageId !== 'null') {
          // Get reviews for specific package
          result = await reviewAPI.getByPackage(packageId);
        } else if (!packageId) {
          // Get all approved reviews if no packageId provided
          result = await reviewAPI.getAllApproved(limit, 0);
        } else {
          // Invalid packageId
          console.error('[ReviewsList] Invalid packageId provided:', packageId);
          setReviews([]);
          setTotalReviews(0);
          setAverageRating(0);
          setError('Invalid package ID');
          setLoading(false);
          return;
        }

        if (result.success && Array.isArray(result.reviews)) {
          setReviews(result.reviews);
          setTotalReviews(result.reviews.length);
          
          // Calculate average rating
          if (result.reviews.length > 0) {
            const sum = result.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
            const avg = sum / result.reviews.length;
            setAverageRating(avg.toFixed(1));
          }
          
          setError(null);
        } else {
          setReviews([]);
          setTotalReviews(0);
          setAverageRating(0);
          setError(result.message || "Failed to load reviews");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
        setTotalReviews(0);
        setAverageRating(0);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [packageId, limit]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < rating ? "#d97706" : "#d1d5db" }}>★</span>
    ));
  };

  return (
    <div className="reviews-list">
      <div className="reviews-list-header">
        <h2 className="reviews-list-title">Customer Reviews</h2>
        <p className="reviews-list-subtitle">
          See what our travelers have to say about their experiences
        </p>
        
        {/* Average Rating Summary */}
        {totalReviews > 0 && (
          <div className="reviews-summary">
            <div className="average-rating">
              <span className="average-rating-value">{averageRating}</span>
              <div className="average-rating-stars">{renderStars(Math.round(parseFloat(averageRating)))}</div>
              <span className="total-reviews">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="reviews-loading">Loading reviews...</div>
      ) : error ? (
        <div className="reviews-error">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="reviews-empty">No reviews yet. Be the first to share your experience!</div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.review_id} className="review-card">
              <div className="review-card-header">
                <div className="review-author-info">
                  <div className="review-author-avatar">
                    {(review.reviewer_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="review-author-name">{review.reviewer_name || "Anonymous"}</h4>
                    <p className="review-author-date">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                </div>
                <div className="review-rating">{renderStars(review.rating)}</div>
              </div>
              {review.title && <h5 className="review-title">{review.title}</h5>}
              <p className="review-text">{review.comment || ""}</p>
              
              {/* Display actual review images */}
              {review.images && review.images.length > 0 && (
                <div className="review-photos">
                  {review.images.slice(0, 3).map((imageUrl, idx) => (
                    <div key={idx} className="review-photo">
                      <img 
                        src={imageUrl} 
                        alt={`Review photo ${idx + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                  {review.images.length > 3 && (
                    <div className="review-photo-more">
                      +{review.images.length - 3} more
                    </div>
                  )}
                </div>
              )}
              
              <p className="review-meta">Rating: {review.rating}/5 ⭐</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
