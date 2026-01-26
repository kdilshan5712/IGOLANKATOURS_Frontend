import { MapPin } from "lucide-react";
import "./DestinationsSection.css";

const DestinationsSection = () => {
  const destinations = [
    {
      name: "Sigiriya",
      category: "UNESCO Heritage",
      description: "Ancient rock fortress with panoramic views",
      image:
        "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/sigiriyaRock.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvc2lnaXJpeWFSb2NrLnBuZyIsImlhdCI6MTc2ODU4NjYwMSwiZXhwIjoxODAwMTIyNjAxfQ.kJbe9kw-E0sHyWzKD1iHnkYNS5YBIkp-nezrLGprqbM",
    },
    {
      name: "Ella",
      category: "Hill Country",
      description: "Misty mountains and scenic train journeys",
      image:
        "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/Ella.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvRWxsYS5wbmciLCJpYXQiOjE3Njg1ODY2MzEsImV4cCI6MTgwMDEyMjYzMX0.IeMAt_w-TgDGBIDv6kDt7Y2FFf9CjfDVN6wN5n5Qrdo",
    },
    {
      name: "Kandy",
      category: "Cultural Capital",
      description: "Sacred city rich in tradition and history",
      image:
        "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/kandy.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMva2FuZHkucG5nIiwiaWF0IjoxNzY4NTg2NjU1LCJleHAiOjE4MDAxMjI2NTV9.v-Hpb3q5bbyAWt2e-FdMhCjMQbtRtTRrl3c1tkmqug0",
    },
    {
      name: "Tea Country",
      category: "Nature & Landscapes",
      description: "Lush tea plantations and waterfalls",
      image:
        "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/nuwaraeliya.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvbnV3YXJhZWxpeWEucG5nIiwiaWF0IjoxNzY4NTg2Njc3LCJleHAiOjE4MDAxMjI2Nzd9.TOhXfG0ELcdYtm_kA3TURlVIfhO-wdgSaFuAYQgbN7s",
    },
  ];

  return (
    <section id="destinations" className="destinations-section">
      <div className="destinations-container">
        {/* Header */}
        <div className="destinations-header">
          <h2 className="destinations-title">
            Must-visit places in Sri Lanka
          </h2>
          <p className="destinations-description">
            Discover iconic landmarks and beautiful landscapes across the
            island.
          </p>
        </div>

        {/* Grid */}
        <div className="destinations-grid">
          {destinations.map((destination, index) => (
            <div
              key={index}
              className="destination-card"
            >
              <div className="destination-image-wrapper">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="destination-image"
                />
                <div className="destination-image-overlay" />
              </div>

              <div className="destination-content">
                <div className="destination-category">
                  <MapPin size={14} />
                  <span>{destination.category}</span>
                </div>

                <h3 className="destination-name">
                  {destination.name}
                </h3>

                <p className="destination-description">
                  {destination.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
