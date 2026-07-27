import React, { useEffect, useState } from "react";
import { promotionsAPI } from "../services/api";
import { X, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./PromotionalBanner.css";

const PromotionalBanner = () => {
  const [promotions, setPromotions] = useState([]);
  const [closedPromos, setClosedPromos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivePromos = async () => {
      const res = await promotionsAPI.getActivePromotions();
      if (res.success) {
        setPromotions(res.promotions);
      }
    };
    fetchActivePromos();
  }, []);

  const handleClose = (id) => {
    setClosedPromos([...closedPromos, id]);
  };

  const activePromosToDisplay = promotions.filter(p => !closedPromos.includes(p.id));

  if (activePromosToDisplay.length === 0) return null;

  return (
    <>
      {activePromosToDisplay.map(promo => {
        if (promo.display_style === "marquee") {
          return (
            <div key={promo.id} className="promo-marquee">
              <div className="marquee-content">
                <Tag size={16} />
                <span className="marquee-text">
                  <strong>{promo.title}:</strong> {promo.description}
                  {promo.discount_code && <span className="discount-code">Use Code: {promo.discount_code}</span>}
                </span>
              </div>
              <button className="promo-close" onClick={() => handleClose(promo.id)}><X size={16} /></button>
            </div>
          );
        }

        if (promo.display_style === "banner") {
          return (
            <div 
              key={promo.id} 
              className="promo-hero-banner"
              style={promo.image_url ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${promo.image_url})` } : {}}
            >
              <div className="promo-hero-content">
                <h2>{promo.title}</h2>
                <p>{promo.description}</p>
                {promo.discount_code && (
                  <div className="promo-code-box">
                    Code: <strong>{promo.discount_code}</strong>
                  </div>
                )}
              </div>
              <button className="promo-close hero-close" onClick={() => handleClose(promo.id)}><X size={20} /></button>
            </div>
          );
        }

        if (promo.display_style === "popup") {
          return (
            <div key={promo.id} className="promo-popup-overlay">
              <div className="promo-popup">
                <button className="promo-close popup-close" onClick={() => handleClose(promo.id)}><X size={24} /></button>
                {promo.image_url && <img src={promo.image_url} alt={promo.title} className="popup-image" loading="lazy" decoding="async" />}
                <div className="popup-body">
                  <h2>{promo.title}</h2>
                  <p>{promo.description}</p>
                  {promo.discount_code && (
                    <div className="promo-code-box popup-code">
                      <span>Use Code:</span>
                      <strong>{promo.discount_code}</strong>
                    </div>
                  )}
                  <button className="primary-btn popup-btn" onClick={() => { handleClose(promo.id); navigate('/packages'); }}>
                    Explore Tours
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
};

export default PromotionalBanner;
