import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PackageCard from "./PackageCard";
import { packageAPI } from "../services/api";
import "./PackagesPreview.css";

const PackagesPreview = () => {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await packageAPI.getFeatured(3);
        if (data.success && data.packages) {
          // Transform packages to ensure consistency with PackageCard expected format
          // The PackageCard expects 'price' or 'currentPrice', backend returns 'price'
          setFeaturedPackages(data.packages.map(pkg => ({
            ...pkg,
            id: pkg.package_id // Ensure id is accessible as pkg.id for links
          })));
        }
      } catch (error) {
        console.error("Error fetching featured packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="packages-preview-section">
      <div className="packages-preview-container">
        {/* Header */}
        <div className="packages-preview-header">
          <div>
            <h2 className="packages-preview-title">
              Popular tour packages
            </h2>
            <p className="packages-preview-description">
              Handpicked tours designed to give you the best of Sri Lanka
            </p>
          </div>

          <Link to="/packages" className="packages-preview-link">
            View all packages
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Grid */}
        <div className="packages-preview-grid">
          {loading ? (
            // Skeleton / Loading placeholders
            [1, 2, 3].map((i) => (
              <div key={i} className="package-card-skeleton" style={{ 
                height: "400px", 
                backgroundColor: "#f7fafc", 
                borderRadius: "12px",
                animation: "pulse 1.5s infinite"
              }}></div>
            ))
          ) : (
            featuredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))
          )}
        </div>

        {/* Mobile CTA */}
        <div className="packages-preview-mobile-cta">
          <Link to="/packages" className="packages-preview-mobile-link">
            View all packages
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackagesPreview;
