/**
 * 🎯 I GO LANKA TOURS - Visual Experience Gallery
 * 
 * Displays a curated collection of Sri Lankan travel photography,
 * categorized by destination and experience. Includes lightbox functionality
 * and dynamic filtering from the centralized gallery service.
 * 
 * @module GalleryPage
 */

import { useState, useEffect } from "react";
import { X, Camera, Star, Heart, MapPin, Loader } from "lucide-react";
import { galleryAPI } from "../services/api";
import SEO from "../components/SEO";
import "./GalleryPage.css";

/**
 * GalleryPage Component
 * 
 * Coordinates image fetching, filtering, and full-screen visualization.
 * 
 * @returns {JSX.Element}
 */
const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState(["all"]);

  // @SIDE_EFFECTS: Load gallery images and category filters on mount
  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    setLoading(true);
    setError(null);
    try {
      // @API_CALL: Fetch images and categories in parallel for efficiency
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
      // @ERROR_HANDLING: Handle concurrent fetch failures
      console.error("Error loading gallery data:", err);
      setError("An unexpected error occurred while loading the gallery");
    } finally {
      setLoading(false);
    }
  };

  // Separate images by type logic, inferring 'official' if category exists, else 'traveler'
  // Alternatively, use is_featured or simply treat all as official for now if no specific column differentiates them.
  // For this implementation, we assume all uploaded via Admin are 'official'.
  // Traveler images would typically come from approved reviews.
  const officialImages = images; // Update this logic if you have a specific flag differentiating traveler images
  const travelerImages = []; // Placeholder until review images show in gallery

  // Filter images based on active tab
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
          <Loader className="animate-spin text-blue-600" size={48} />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="gallery-page">
        <div className="gallery-page-container flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchGalleryData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
        description="Explore stunning photos of Sri Lanka's most beautiful destinations. See real travel photography of Sigiriya, Ella, Kandy, Galle, Mirissa beach, Yala wildlife, and more before you book your tour."
        keywords="sri lanka photos, sri lanka travel gallery, sri lanka destination pictures, sigiriya photos, ella sri lanka pictures, kandy photos, mirissa beach photos, yala safari photos, sri lanka landscape, beautiful sri lanka, sri lanka tourism photos"
        canonicalUrl="https://www.igolankatours.com/gallery"
        ogImage="https://www.igolankatours.com/og-image.jpg"
      />
      <div className="gallery-page-container">
        {/* Hero Section */}
        <div className="gallery-page-hero">
          <div className="gallery-hero-icon">
            <Camera size={48} />
          </div>
          <h1 className="gallery-page-title">Gallery</h1>
          <p className="gallery-page-subtitle">
            Travel Memories from Sri Lanka
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="gallery-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`gallery-tab ${activeTab === cat ? "active" : ""}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat === "all" ? (
                "All Photos"
              ) : (
                <>
                  <Camera size={16} />
                  {cat}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {filteredImages.map((image) => (
            <div
              key={image.gallery_id || image.id}
              className="gallery-item"
              onClick={() => handleImageClick(image)}
            >
              <div className="gallery-image-wrapper">
                {/* @ASSETS: Gallery images are served via external URLs provided by the galleryAPI */}
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
                        <MapPin size={14} />
                        {image.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="gallery-empty">
            <Camera size={64} />
            <h2>No images found</h2>
            <p>Try selecting a different filter to view images.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || selectedImage.destination}
              className="lightbox-image"
            />
            <div className="lightbox-info">
              <h2 className="lightbox-title">{selectedImage.title || 'Sri Lanka Tourism'}</h2>
              {selectedImage.category && (
                <div className="lightbox-category">
                  <MapPin size={18} />
                  <span>{selectedImage.category}</span>
                </div>
              )}
              {selectedImage.description && (
                <p className="lightbox-description mt-2 text-white/80">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GalleryPage;
