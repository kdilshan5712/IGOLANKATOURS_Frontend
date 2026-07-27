/**
 * 🎯 I GO LANKA TOURS - Premium Visual Experience Gallery
 * 
 * Displays a curated collection of Sri Lankan travel photography,
 * categorized by destination and experience. Includes a cinematic
 * lightbox functionality and dynamic filtering.
 * 
 * @module GalleryPage
 */

import { useState, useEffect } from "react";
import { X, Camera, MapPin, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { galleryAPI } from "../services/api";
import SEO from "../components/SEO";
import "./GalleryPage.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState(["all"]);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [imagesRes, categoriesRes] = await Promise.all([
        galleryAPI.getAll({ status: 'active' }),
        galleryAPI.getCategories()
      ]);

      if (imagesRes.success) {
        setImages(imagesRes.gallery);
      } else {
        setError(imagesRes.message || "Failed to load gallery images");
      }

      if (categoriesRes.success) {
        setCategories(["all", ...categoriesRes.categories]);
      }
    } catch (err) {
      console.error("Error loading gallery data:", err);
      setError("An unexpected error occurred while loading the gallery");
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = activeTab === "all" 
    ? images 
    : images.filter(img => img.category === activeTab);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <main className="gallery-page">
        <div className="gallery-page-container flex justify-center items-center min-h-[50vh]">
          <Loader className="animate-spin text-yellow-500" size={48} />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="gallery-page">
        <div className="gallery-page-container flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchGalleryData}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="gallery-page">
      <SEO
        title="Sri Lanka Travel Photos & Gallery – Beautiful Destinations"
        description="Explore stunning photos of Sri Lanka's most beautiful destinations. See real travel photography of Sigiriya, Ella, Kandy, Galle, and more."
        keywords="sri lanka photos, sri lanka travel gallery, sri lanka destination pictures"
        canonicalUrl="https://www.igolankatours.com/gallery"
      />

      {/* Ambient Glow Effects */}
      <div className="gallery-ambient-1"></div>
      <div className="gallery-ambient-2"></div>

      <div className="gallery-page-container">
        {/* Hero Section */}
        <motion.div 
          className="gallery-page-hero"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className="gallery-hero-icon" variants={fadeUp}>
            <Camera size={36} />
          </motion.div>
          <motion.h1 className="gallery-page-title" variants={fadeUp}>
            Curated <span className="accent">Moments</span>
          </motion.h1>
          <motion.p className="gallery-page-subtitle" variants={fadeUp}>
            Immerse yourself in the breathtaking beauty of Sri Lanka.
          </motion.p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          className="gallery-tabs"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              className={`gallery-tab ${activeTab === cat ? "active" : ""}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat === "all" ? "All Experiences" : cat}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div 
          className="gallery-grid"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image) => (
              <motion.div
                key={image.gallery_id || image.id}
                className="gallery-item"
                onClick={() => handleImageClick(image)}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <div className="gallery-image-wrapper">
                  <img
                    src={image.image_url}
                    alt={image.title || image.destination}
                    className="gallery-image"
                    loading="lazy"
                  />
                  <div className="gallery-overlay">
                    <div className="gallery-overlay-content">
                      <h3 className="gallery-item-title">{image.title || 'Sri Lanka Tourism'}</h3>
                      {image.category && (
                        <span className="gallery-item-category">
                          <MapPin size={12} />
                          {image.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <motion.div className="gallery-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Camera size={48} />
            <h2>No moments found</h2>
            <p>Try selecting a different category to view our gallery.</p>
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className="lightbox-close" onClick={closeLightbox}>
              <X size={24} />
            </button>
            <motion.div 
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || selectedImage.destination}
                className="lightbox-image"
              />
              <div className="lightbox-info">
                <h2 className="lightbox-title">{selectedImage.title || 'Sri Lanka Tourism'}</h2>
                {selectedImage.category && (
                  <div className="lightbox-category">
                    <MapPin size={16} />
                    <span>{selectedImage.category}</span>
                  </div>
                )}
                {selectedImage.description && (
                  <p className="mt-3 text-white/80 leading-relaxed text-sm">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default GalleryPage;
