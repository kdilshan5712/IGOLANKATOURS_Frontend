import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageCircle, Calendar, MapPin } from "lucide-react";
import { getGuideReviews } from "../../services/api";
import { LoadingSkeleton } from "../../components/shared";
import "./GuideReviews.css";

const GuideReviewsPage = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("userRole");

        if (!token || userRole !== "guide") {
            navigate("/login");
            return;
        }

        fetchReviews();
    }, [navigate]);

    const fetchReviews = async () => {
        try {
            const response = await getGuideReviews();
            if (response.success) {
                setReviews(response.reviews || []);
                if (response.stats) {
                    setStats(response.stats);
                }
            } else {
                setError(response.message || "Failed to load reviews");
            }
        } catch (err) {
            console.error("Fetch reviews error:", err);
            setError("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    fill={i <= rating ? "#fbbf24" : "none"}
                    color={i <= rating ? "#fbbf24" : "#d1d5db"}
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="guide-reviews-page">
                <LoadingSkeleton type="card" count={3} />
            </div>
        );
    }

    return (
        <div className="guide-reviews-page">
            <div className="page-header">
                <h1>My Reviews</h1>
                <p className="subtitle">Feedback from your recent tours</p>
            </div>

            <div className="reviews-summary-card">
                <div className="summary-stat">
                    <div className="stat-value">{stats.averageRating}</div>
                    <div className="stat-label">
                        <div className="stars-container">{renderStars(Math.round(stats.averageRating))}</div>
                        <span>Average Rating</span>
                    </div>
                </div>
                <div className="summary-stat-divider"></div>
                <div className="summary-stat">
                    <div className="stat-value">{stats.totalReviews}</div>
                    <div className="stat-label">Total Reviews</div>
                </div>
            </div>

            {error && (
                <div className="error-alert">
                    {error}
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="empty-state">
                    <MessageCircle size={64} color="#cbd5e1" />
                    <h3>No Reviews Yet</h3>
                    <p>Complete more tours to start receiving feedback from tourists!</p>
                </div>
            ) : (
                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div key={review.review_id} className="review-card">
                            <div className="review-header">
                                <div>
                                    <h3 className="tourist-name">{review.tourist_name || "Anonymous Traveler"}</h3>
                                    <div className="review-stars">
                                        {renderStars(review.rating)}
                                        <span className="rating-number">({review.rating}.0)</span>
                                    </div>
                                </div>
                                <span className="review-date">
                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                </span>
                            </div>

                            <p className="review-comment">"{review.comment}"</p>

                            <div className="review-tour-info">
                                <div className="tour-badge">
                                    <MapPin size={14} />
                                    <span>{review.package_name}</span>
                                </div>
                                <div className="tour-badge">
                                    <Calendar size={14} />
                                    <span>
                                        Tour Date: {new Date(review.travel_date).toLocaleDateString('en-US')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuideReviewsPage;
