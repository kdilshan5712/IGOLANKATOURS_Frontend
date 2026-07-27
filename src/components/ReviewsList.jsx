import { useEffect, useState } from "react";
import { Star, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { reviewAPI } from "../services/api";
import "./ReviewsList.css";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

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

  const renderStars = (rating, size = 16) => {
    return (
      <div className="review-stars-wrapper">
        {Array.from({ length: 5 }, (_, index) => (
          <Star 
            key={index} 
            size={size}
            fill={index < rating ? "var(--color-accent)" : "none"}
            color={index < rating ? "var(--color-accent)" : "var(--color-gray-400)"}
            className="review-star-icon"
          />
        ))}
      </div>
    );
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
        <h2 className="reviews-list-title">Customer <span>Reviews</span></h2>
        <p className="reviews-list-subtitle">
          See what our travelers have to say about their experiences
        </p>
        
        {/* Average Rating Summary */}
        {totalReviews > 0 && (
          <motion.div 
            className="reviews-summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="average-rating">
              <span className="average-rating-value">{averageRating}</span>
              <div className="average-rating-stars">{renderStars(Math.round(parseFloat(averageRating)), 20)}</div>
              <span className="total-reviews">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>
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
        <div className="reviews-list-loading">
          <Loader className="animate-spin" size={40} />
          <p>Gathering feedback...</p>
        </div>
      ) : error ? (
        <div className="reviews-list-error">
          <p>{error}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="reviews-list-empty">
          <p>No reviews found for this category.</p>
        </div>
      ) : (
        <motion.div 
          className="reviews-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {filteredReviews.map((review) => (
            <motion.div 
              key={review.review_id} 
              className="review-card"
              variants={fadeUp}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
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
                <div className="review-rating">{renderStars(review.rating, 14)}</div>
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
                        loading="lazy"
                        decoding="async"
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
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ReviewsList;
