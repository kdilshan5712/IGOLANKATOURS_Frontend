
import { useEffect, useState } from "react";
import { reviewAPI } from "../services/api";
import "./ReviewsList.css";

const ReviewsList = ({ packageId = null, limit = 100 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");

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

  const filteredReviews = reviews.filter(review => {
    if (activeFilter === "all") return true;
    if (activeFilter === "package") return !!review.package_id;
    if (activeFilter === "website") return !review.package_id;
    return true;
  });

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

        {/* Filter Controls (only if not viewing a specific package) */}
        {!packageId && reviews.length > 0 && (
          <div className="reviews-filters">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Reviews
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'package' ? 'active' : ''}`}
              onClick={() => setActiveFilter('package')}
            >
              Tour Packages
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'website' ? 'active' : ''}`}
              onClick={() => setActiveFilter('website')}
            >
              Website Experience
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="reviews-loading">Loading reviews...</div>
      ) : error ? (
        <div className="reviews-error">{error}</div>
      ) : filteredReviews.length === 0 ? (
        <div className="reviews-empty">No reviews found for this category.</div>
      ) : (
        <div className="reviews-grid">
          {filteredReviews.map((review) => (
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
              
              <p className="review-meta">
                {review.package_name ? (
                  <span className="review-tag package-tag">{review.package_name}</span>
                ) : (
                  <span className="review-tag website-tag">Website Experience</span>
                )}
                <span className="review-rating-label">Rating: {review.rating}/5 ⭐</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
