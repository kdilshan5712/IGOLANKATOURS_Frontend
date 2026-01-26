import { useState } from "react";
import { X, Camera, Star, Heart, MapPin } from "lucide-react";
import "./GalleryPage.css";

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, official, traveler

  // Mock data for official gallery images
  const officialGalleryImages = [
    {
      id: 1,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/sigiriyaRock.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvc2lnaXJpeWFSb2NrLnBuZyIsImlhdCI6MTc2ODU4NjIyOCwiZXhwIjoxODAwMTIyMjI4fQ.dS3hGhIXJh0rbVJh_22v0GyYrWK-VaMxQFmBRmuCOkI",
      title: "Sigiriya Rock Fortress",
      category: "Cultural",
      type: "official"
    },
    {
      id: 2,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/kandy.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMva2FuZHkucG5nIiwiaWF0IjoxNzY4NTg1OTk5LCJleHAiOjE4MDAxMjE5OTl9.S9fjTptzFD7DTF3jWTrpJh4UjmzQe_js_GhTWosYYv0",
      title: "Temple of the Tooth",
      category: "Cultural",
      type: "official"
    },
    {
      id: 3,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/Ella.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvRWxsYS5wbmciLCJpYXQiOjE3Njg1ODU3NzQsImV4cCI6MTgwMDEyMTc3NH0.f6FoLcMxe86B8NTozCC-jt6QD0usqWuT0OYYJrPKbUk",
      title: "Nine Arch Bridge",
      category: "Nature",
      type: "official"
    },
    {
      id: 4,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/mirissa.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvbWlyaXNzYS5wbmciLCJpYXQiOjE3Njg1ODY1MDIsImV4cCI6MTgwMDEyMjUwMn0.LPfGCBUtObc8TCOjpL2Wi9bK9EaGL-6EOoOYzTWik7Y",
      title: "Mirissa Beach Paradise",
      category: "Beach",
      type: "official"
    },
    {
      id: 5,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/yala.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMveWFsYS5wbmciLCJpYXQiOjE3Njg1ODYxODQsImV4cCI6MTkyNjI2NjE4NH0.A3Jtn33o0iScYF2oBq38gBcjNLEO02ri3XFagprvtd4",
      title: "Yala National Park",
      category: "Wildlife",
      type: "official"
    },
    {
      id: 6,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/galle.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvZ2FsbGUucG5nIiwiaWF0IjoxNzY4NTg1Nzk5LCJleHAiOjE4MDAxMjE3OTl9.V_DdXV7al2X55SV0eG-pjY9YtND_zhkdd4daTadmlSE",
      title: "Galle Dutch Fort",
      category: "Cultural",
      type: "official"
    },
    {
      id: 7,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/nuwaraeliya.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvbnV3YXJhZWxpeWEucG5nIiwiaWF0IjoxNzY4NTgxNTc3LCJleHAiOjE4MDAxMTc1Nzd9.QjLX5etS9tNSU0a8cpuBJc9hQrjSbDi3yx5vQ_PkdQc",
      title: "Tea Plantations",
      category: "Nature",
      type: "official"
    },
    {
      id: 8,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/bentota.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvYmVudG90YS5wbmciLCJpYXQiOjE3Njg1ODU4OTAsImV4cCI6MTgwMDEyMTg5MH0.3JIcPnoZtKU-hh7smhnN0zvcrIpPdvsz2fXDWRmXaXE",
      title: "Bentota Water Sports",
      category: "Beach",
      type: "official"
    },
    {
      id: 9,
      image_url: "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/anuradhapura.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvYW51cmFkaGFwdXJhLnBuZyIsImlhdCI6MTc2ODU4NTc0MCwiZXhwIjoxODAwMTIxNzQwfQ.wrGC3MQvmHV9WpnjFcN3WnSTKMfbTzT_ulvBa-SG7Dg",
      title: "Ancient Temples",
      category: "Cultural",
      type: "official"
    }
  ];

  // Mock data for traveler experience images (from approved reviews)
  const reviewGalleryImages = [
    {
      id: 101,
      image_url: "https://picsum.photos/600/400?random=1",
      destination: "Sigiriya Rock",
      packageName: "Cultural Heritage Tour",
      rating: 5,
      type: "traveler"
    },
    {
      id: 102,
      image_url: "https://picsum.photos/600/400?random=2",
      destination: "Ella Nine Arch Bridge",
      packageName: "Hill Country Adventure",
      rating: 5,
      type: "traveler"
    },
    {
      id: 103,
      image_url: "https://picsum.photos/600/400?random=3",
      destination: "Mirissa Beach",
      packageName: "Coastal Paradise",
      rating: 4,
      type: "traveler"
    },
    {
      id: 104,
      image_url: "https://picsum.photos/600/400?random=4",
      destination: "Yala Safari",
      packageName: "Wildlife Explorer",
      rating: 5,
      type: "traveler"
    },
    {
      id: 105,
      image_url: "https://picsum.photos/600/400?random=5",
      destination: "Kandy Lake",
      packageName: "Cultural Heritage Tour",
      rating: 5,
      type: "traveler"
    },
    {
      id: 106,
      image_url: "https://picsum.photos/600/400?random=6",
      destination: "Tea Plantation Walk",
      packageName: "Hill Country Adventure",
      rating: 4,
      type: "traveler"
    }
  ];

  // Filter images based on active tab
  const getFilteredImages = () => {
    if (activeTab === "official") {
      return officialGalleryImages;
    } else if (activeTab === "traveler") {
      return reviewGalleryImages;
    }
    return [...officialGalleryImages, ...reviewGalleryImages];
  };

  const filteredImages = getFilteredImages();

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <main className="gallery-page">
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
          <button
            className={`gallery-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Photos ({officialGalleryImages.length + reviewGalleryImages.length})
          </button>
          <button
            className={`gallery-tab ${activeTab === "official" ? "active" : ""}`}
            onClick={() => setActiveTab("official")}
          >
            <Camera size={16} />
            Our Travel Moments ({officialGalleryImages.length})
          </button>
          <button
            className={`gallery-tab ${activeTab === "traveler" ? "active" : ""}`}
            onClick={() => setActiveTab("traveler")}
          >
            <Heart size={16} />
            Traveler Experiences ({reviewGalleryImages.length})
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="gallery-item"
              onClick={() => handleImageClick(image)}
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
                    {image.type === "official" && (
                      <>
                        <h3 className="gallery-item-title">{image.title}</h3>
                        <span className="gallery-item-category">
                          <MapPin size={14} />
                          {image.category}
                        </span>
                      </>
                    )}
                    {image.type === "traveler" && (
                      <>
                        <h3 className="gallery-item-title">{image.destination}</h3>
                        <span className="gallery-item-package">{image.packageName}</span>
                        <div className="gallery-item-rating">
                          {Array.from({ length: image.rating }).map((_, idx) => (
                            <Star key={idx} size={14} fill="#fbbf24" stroke="#fbbf24" />
                          ))}
                        </div>
                      </>
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
              {selectedImage.type === "official" && (
                <>
                  <h2 className="lightbox-title">{selectedImage.title}</h2>
                  <div className="lightbox-category">
                    <MapPin size={18} />
                    <span>{selectedImage.category}</span>
                  </div>
                </>
              )}
              {selectedImage.type === "traveler" && (
                <>
                  <h2 className="lightbox-title">{selectedImage.destination}</h2>
                  <p className="lightbox-package">{selectedImage.packageName}</p>
                  <div className="lightbox-rating">
                    {Array.from({ length: selectedImage.rating }).map((_, idx) => (
                      <Star key={idx} size={18} fill="#fbbf24" stroke="#fbbf24" />
                    ))}
                    <span>{selectedImage.rating}/5</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GalleryPage;
