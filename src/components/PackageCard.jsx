/**
 * 🎯 I GO LANKA TOURS - Tour Package Card Component
 * 
 * Visual representation of a tour package in grid/list views. Displays 
 * high-level metadata (price, duration, rating) and provides integrated 
 * wishlist management and direct navigation to booking/details.
 * 
 * @module PackageCard
 */

import { Star, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import { usePromotions } from "../context/PromotionsContext";
import "./PackageCard.css";

/**
 * PackageCard Component
 * 
 * Renders a standardized tour package summary card.
 * 
 * @param {Object} props
 * @param {Object} props.pkg - The tour package data object.
 * @returns {JSX.Element}
 */
const PackageCard = ({ pkg }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { maxDiscount } = usePromotions();

  const isSaved = isInWishlist(pkg.package_id);

  // Price calculations
  const displayPrice = pkg.currentPrice || pkg.price;
  const discountedPrice = maxDiscount > 0 ? Math.round(displayPrice * (1 - maxDiscount / 100)) : displayPrice;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(pkg.id);
  };

  return (
    <div className="package-card">
      {/* Image */}
      <div className="package-image-wrapper">
        {maxDiscount > 0 && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#e53e3e', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10 }}>
            {maxDiscount}% OFF
          </div>
        )}
        {/* @ASSETS: Package images are dynamically sourced from backend with Unsplash fallback */}
        <img
          src={pkg.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070"}
          alt={pkg.name}
          className="package-image"
          loading="lazy"
          decoding="async"
        />

        {/* Wishlist Button */}
        <button
          className={`package-wishlist-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={20} className={isSaved ? "fill-current text-red-500" : ""} />
        </button>

        {/* Category */}
        <span className="package-category">
          {pkg.category}
        </span>

        {/* Rating */}
        <div className="package-rating">
          <Star size={14} />
          <span className="package-rating-value">
            {pkg.rating}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="package-content">
        <h3 className="package-title">
          {pkg.name}
        </h3>

        <p className="package-description">
          {pkg.description}
        </p>

        {/* Meta */}
        <div className="package-meta">
          <div className="package-meta-item">
            <Clock size={16} />
            <span>{pkg.duration}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="package-footer">
          <div>
            <span className="package-price-label">From</span>
            <div className="package-price">
              {maxDiscount > 0 ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85em', marginRight: '6px' }}>
                    ${displayPrice}
                  </span>
                  <span style={{ color: '#e53e3e' }}>${discountedPrice}</span>
                </>
              ) : (
                <span>${displayPrice}</span>
              )}
              <span className="package-price-per">
                {" "}
                / person
              </span>
            </div>
            {pkg.seasonLabel && (
              <div className="package-season-label" style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                {pkg.seasonLabel} Pricing
              </div>
            )}
          </div>

          <div className="package-actions">
            <Link to={`/packages/${pkg.id}`} className="package-button package-button-outline">
              View Details
            </Link>
            <Link to={`/booking/${pkg.id}`} className="package-button">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
