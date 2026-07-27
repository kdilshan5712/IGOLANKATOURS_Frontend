import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, ArrowLeft, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { destinationAPI, packageAPI, transformPackages } from "../services/api";
import PackageCard from "../components/PackageCard";
import SEO from "../components/SEO";
import "./DestinationDetailsPage.css";

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const DestinationDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);
    const [relatedPackages, setRelatedPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch all destinations to find the current one
                const destResponse = await destinationAPI.getAll();

                if (!destResponse.success || !Array.isArray(destResponse.data)) {
                    throw new Error("Failed to load destination data");
                }

                const foundDest = destResponse.data.find(d =>
                    d.id === id ||
                    d.destination_id === id ||
                    d.id === parseInt(id) ||
                    d.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase()
                );

                if (!foundDest) {
                    setError("Destination not found");
                    setLoading(false);
                    return;
                }

                setDestination(foundDest);

                // 2. Fetch packages that might relate to this destination
                const pkgResponse = await packageAPI.getAll();

                if (pkgResponse.success && pkgResponse.packages) {
                    const transformed = transformPackages(pkgResponse.packages);

                    // Filter logic: Check if destination name is in the itinerary, title, or highlights
                    const destinationName = foundDest.name.toLowerCase();

                    const filtered = transformed.filter(pkg => {
                        // Check itinerary locations first (most accurate)
                        const hasInItinerary = pkg.itinerary?.some(stop =>
                            stop.location && stop.location.toLowerCase().includes(destinationName)
                        );

                        // Fallback to name or category/highlights loosely
                        const hasInName = pkg.name.toLowerCase().includes(destinationName);
                        const hasInHighlights = pkg.highlights?.some(h =>
                            h.toLowerCase().includes(destinationName)
                        );

                        return hasInItinerary || hasInName || hasInHighlights;
                    });

                    setRelatedPackages(filtered);
                }
            } catch (err) {
                console.error("Error fetching destination details:", err);
                setError("An error occurred while loading the destination.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="destination-details-loading">
                <Loader className="animate-spin" size={48} />
                <p>Curating destination details...</p>
            </div>
        );
    }

    if (error || !destination) {
        return (
            <div className="destination-details-error">
                <p>{error || "Destination not found"}</p>
                <button onClick={() => navigate('/destinations')} className="btn-primary">
                    Back to Destinations
                </button>
            </div>
        );
    }

    const imageUrl = destination.image_url || destination.image;

    return (
        <main className="destination-details-page">
            <SEO 
                title={`${destination.name} – Explore Top Sri Lanka Destinations`}
                description={destination.description}
                keywords={`${destination.name}, Sri Lanka destination, visit ${destination.name}, ${destination.category} in Sri Lanka`}
                ogImage={imageUrl}
                canonicalUrl={`https://www.igolankatours.com/destinations/${id}`}
            />

            {/* Ambient Effects */}
            <div className="destination-details-ambient-glow-1"></div>
            <div className="destination-details-ambient-glow-2"></div>

            {/* Hero Section */}
            <div className="destination-hero">
                <div className="destination-hero-image-container">
                    {imageUrl ? (
                        <motion.img 
                            initial={{ scale: 1.15, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            src={imageUrl} 
                            alt={destination.name} 
                            className="destination-hero-image" 
                        />
                    ) : (
                        <div className="destination-hero-placeholder">No Image Available</div>
                    )}
                    <div className="destination-hero-overlay"></div>
                </div>

                <div className="destination-hero-content-wrapper">
                    <motion.div 
                        className="destination-hero-back"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                    >
                        <Link to="/destinations" className="back-link">
                            <ArrowLeft size={18} className="arrow-left-icon" />
                            All Destinations
                        </Link>
                    </motion.div>
                    <motion.div 
                        className="destination-hero-title-area"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.span className="destination-category-badge" variants={fadeUp}>
                            {destination.category || "Destination"}
                        </motion.span>
                        <motion.h1 className="destination-title" variants={fadeUp}>
                            {destination.name}
                        </motion.h1>
                        <motion.div className="destination-location" variants={fadeUp}>
                            <MapPin size={18} className="location-pin" />
                            <span>Sri Lanka</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <div className="destination-content-container">
                {/* Main Content Area */}
                <div className="destination-main-content">
                    <motion.section 
                        className="destination-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                    >
                        <h2 className="destination-section-title">Overview</h2>
                        <div className="destination-description-box">
                            <p className="destination-description">
                                {destination.description}
                            </p>
                            {destination.full_description && (
                                <div 
                                    className="destination-full-description" 
                                    dangerouslySetInnerHTML={{ __html: destination.full_description }} 
                                />
                            )}
                        </div>
                    </motion.section>

                    {/* Related Packages Grid */}
                    <motion.section 
                        className="destination-related-packages"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                    >
                        <div className="related-packages-header">
                            <h2 className="destination-section-title">Tours Visiting {destination.name}</h2>
                            <span className="related-count">{relatedPackages.length} Packages Found</span>
                        </div>

                        {relatedPackages.length > 0 ? (
                            <motion.div 
                                className="related-packages-grid"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {relatedPackages.map(pkg => (
                                    <motion.div key={pkg.id} variants={fadeUp}>
                                        <PackageCard pkg={pkg} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="related-packages-empty">
                                <p>We're currently updating our tours for this destination.</p>
                                <div className="empty-packages-buttons">
                                    <Link to="/packages" className="btn-secondary">View All Tours</Link>
                                    <Link to="/contact" className="btn-primary">Request Custom Tour</Link>
                                </div>
                            </div>
                        )}
                    </motion.section>
                </div>
            </div>
        </main>
    );
};

export default DestinationDetailsPage;
