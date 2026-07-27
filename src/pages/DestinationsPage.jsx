/**
 * 🎯 I GO LANKA TOURS - Destinations Discovery Page
 * 
 * Provides a visual grid of Sri Lanka's top travel destinations. Integrates 
 * with the centralized DestinationsMap component to provide spatial context 
 * and category-based visual cues.
 * 
 * @module DestinationsPage
 */

import { useState, useEffect } from "react";
import { MapPin, ArrowRight, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DestinationsMap from "../components/DestinationsMap";
import { destinationAPI } from "../services/api";
import SEO from "../components/SEO";
import "./DestinationsPage.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

/**
 * DestinationsPage Component
 * 
 * Renders an curated list of hotspots and geographical zones, facilitating 
 * discovery before specific package selection.
 * 
 * @returns {JSX.Element}
 */
const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        // @API_CALL: Fetch all geographic hotspots and details
        const response = await destinationAPI.getAll();
        if (response.success && Array.isArray(response.data)) {
          setDestinations(response.data);
        } else {
          console.error("Invalid destinations data:", response);
          setError("Failed to load destinations data.");
        }
      } catch (err) {
        // @ERROR_HANDLING: Persistent connection or API failure
        console.error("Failed to load destinations:", err);
        setError("Failed to load destinations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      Cultural: "category-cultural",
      Nature: "category-nature",
      Beach: "category-beach",
      Wildlife: "category-wildlife",
    };
    return colors[category] || "category-default";
  };

  if (loading) {
    return (
      <div className="destinations-loading">
        <Loader className="animate-spin" size={48} />
        <p>Loading curated hotspots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="destinations-error">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <main className="destinations-page">
      <SEO 
        title="Best Places to Visit in Sri Lanka – Top Destinations 2025"
        description="Discover the most beautiful places to visit in Sri Lanka. Explore Sigiriya Rock Fortress, Ella's Nine Arch Bridge, Kandy's Temple of the Tooth, pristine Mirissa & Unawatuna beaches, Galle Dutch Fort, Yala wildlife, and lush Nuwara Eliya tea country."
        keywords="best places to visit in sri lanka, sri lanka destinations, sigiriya sri lanka, ella sri lanka, kandy sri lanka, galle fort sri lanka, mirissa beach, unawatuna beach, yala national park, nuwara eliya, dambulla cave temple, anuradhapura, polonnaruwa, sri lanka travel guide, things to do in sri lanka, sri lanka must see places"
        canonicalUrl="https://www.igolankatours.com/destinations"
        ogImage="https://www.igolankatours.com/og-image.jpg"
      />

      {/* Ambient Effects */}
      <div className="destinations-ambient-glow-1"></div>
      <div className="destinations-ambient-glow-2"></div>

      <div className="destinations-page-container">
        {/* Hero Header */}
        <motion.div 
          className="destinations-page-hero"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 className="destinations-page-title" variants={fadeUp}>
            Explore Sri Lanka's <span>Most Loved</span> Destinations
          </motion.h1>
          <motion.p className="destinations-page-subtitle" variants={fadeUp}>
            Discover the island's most captivating places, from ancient cities
            and misty mountains to pristine beaches and wildlife sanctuaries.
          </motion.p>
        </motion.div>

        {/* Destinations Grid */}
        <motion.div 
          className="destinations-page-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {destinations.map((destination, index) => (
            <motion.div 
              key={index} 
              className="destination-page-card"
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <div className="destination-page-image-wrapper">
                {/* @ASSETS: Destination images are dynamically sourced from backend API with Unsplash fallback */}
                <img
                  src={destination.image_url || destination.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070"}
                  alt={destination.name}
                  className="destination-page-image"
                  loading="lazy"
                />
                <div className="destination-page-image-overlay" />
                <span
                  className={`destination-page-badge ${getCategoryColor(
                    destination.category
                  )}`}
                >
                  {destination.category}
                </span>
              </div>

              <div className="destination-page-content">
                <div className="destination-page-header">
                  <MapPin className="destination-page-icon" size={18} />
                  <h3 className="destination-page-name">{destination.name}</h3>
                </div>

                <p className="destination-page-description">
                  {destination.description}
                </p>

                <Link
                  to={`/destinations/${destination.id || destination.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="destination-page-link"
                >
                  Explore Features
                  <ArrowRight className="arrow-icon" size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Map Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <DestinationsMap />
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="destinations-page-cta"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="destinations-cta-title">
            Ready to explore these <span>destinations</span>?
          </h2>
          <p className="destinations-cta-text">
            Browse our curated tour packages or contact us to design your
            perfect Sri Lankan adventure.
          </p>
          <div className="destinations-cta-buttons">
            <Link to="/packages" className="btn-primary">
              Browse Tour Packages
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default DestinationsPage;
