/**
 * 🎯 I GO LANKA TOURS - Global Footer Component
 *
 * Persistent application footer with premium dark glassmorphism design.
 * Contains brand, navigation, popular tours, contact and legal sections.
 *
 * @module Footer
 */

import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Animated gold shimmer divider */}
      <div className="footer-divider" />

      <div className="footer-container">
        {/* ── Top Grid ── */}
        <div className="footer-top">

          {/* Brand */}
          <div>
            <div className="footer-brand-logo-row">
              <img
                src="https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/Logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9Mb2dvLmpwZyIsImlhdCI6MTc3MDEzMzM2MywiZXhwIjoxOTI3ODEzMzYzfQ.2qbZSGwqCn0kGlcKWf8B1p5BQzYFVnUeXXJy-k2mRIA"
                alt="I GO LANKA TOURS"
                className="footer-brand-logo"
              />
              <h3 className="footer-brand-title">
                I GO LANKA <span className="footer-brand-accent">TOURS</span>
              </h3>
            </div>
            <p className="footer-brand-description">
              Trusted local experts crafting unforgettable Sri Lankan journeys —
              from golden beaches to misty hill country, tailored just for you.
            </p>
            <div className="footer-social">
              <a href="https://www.facebook.com/indika25" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
                <Facebook size={17} />
              </a>
              <a href="#" className="footer-social-link" aria-label="Instagram">
                <Instagram size={17} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="footer-section-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/packages">Tour Packages</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/guide/register">Become a Guide</Link></li>
            </ul>
          </div>

          {/* Popular Tours */}
          <div>
            <h4 className="footer-section-title">Popular Tours</h4>
            <ul className="footer-links">
              <li>Beach Getaways</li>
              <li>Cultural Triangle</li>
              <li>Wildlife Safaris</li>
              <li>Hill Country Escapes</li>
              <li><Link to="/custom-tour-chat">Custom AI Tours ✨</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-section-title">Get in Touch</h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <MapPin size={15} />
                <span>Katunayaka, Sri Lanka</span>
              </li>
              <li className="footer-contact-item">
                <Phone size={15} />
                <span>+94 77 763 9196</span>
              </li>
              <li className="footer-contact-item">
                <Mail size={15} />
                <span>tours.igolanka@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="footer-bottom-bar">
          <p>
            © 2026 <span>I GO LANKA TOURS</span>. All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
            <Link to="/cancellation-policy">Cancellation Policy</Link>
          </div>

          <div className="footer-love">
            Made with <span className="footer-love-heart">♥</span> in Sri Lanka
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
