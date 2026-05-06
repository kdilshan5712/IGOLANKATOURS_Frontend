/**
 * 🎯 I GO LANKA TOURS - Package Card Skeleton
 *
 * Shimmer placeholder rendered while packages are loading.
 * Matches the exact dimensions and layout of PackageCard to prevent
 * layout shift and improve perceived performance.
 *
 * @module PackageCardSkeleton
 */

import "./PackageCardSkeleton.css";

/**
 * PackageCardSkeleton Component
 *
 * @returns {JSX.Element}
 */
const PackageCardSkeleton = () => {
  return (
    <div className="pkg-skeleton" aria-hidden="true">
      {/* Image placeholder */}
      <div className="pkg-skeleton__image shimmer" />

      {/* Content area */}
      <div className="pkg-skeleton__body">
        {/* Title */}
        <div className="pkg-skeleton__line pkg-skeleton__title shimmer" />

        {/* Description lines */}
        <div className="pkg-skeleton__line pkg-skeleton__text shimmer" />
        <div className="pkg-skeleton__line pkg-skeleton__text pkg-skeleton__text--short shimmer" />

        {/* Meta row */}
        <div className="pkg-skeleton__meta">
          <div className="pkg-skeleton__badge shimmer" />
        </div>

        {/* Footer */}
        <div className="pkg-skeleton__footer">
          <div className="pkg-skeleton__price shimmer" />
          <div className="pkg-skeleton__actions">
            <div className="pkg-skeleton__btn shimmer" />
            <div className="pkg-skeleton__btn shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCardSkeleton;
