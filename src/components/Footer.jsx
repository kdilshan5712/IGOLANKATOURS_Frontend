import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top */}
        <div className="footer-top">
          {/* Brand */}
          <div>
            <h3 className="footer-brand-title">
              I GO LANKA <span className="footer-brand-accent">TOURS</span>
            </h3>
            <p className="footer-brand-description">
              Trusted local experts creating unforgettable Sri Lankan travel
              experiences for guests from around the world.
            </p>

            <div className="footer-social">
              <a
                href="#"
                className="footer-social-link"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="footer-social-link"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="footer-social-link"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="footer-section-title">
              Company
            </h4>
            <ul className="footer-links">
              <li>
                <Link to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/packages">
                  Tour Packages
                </Link>
              </li>
              <li>
                <a href="#about">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/guide/register">
                  Become a Tour Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Tours */}
          <div>
            <h4 className="footer-section-title">
              Popular Tours
            </h4>
            <ul className="footer-links">
              <li>Beach Getaways</li>
              <li>Cultural Triangle</li>
              <li>Wildlife Safaris</li>
              <li>Hill Country</li>
              <li>Custom Tours</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-section-title">
              Contact
            </h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <MapPin size={16} />
                <span>Katunayaka, Sri Lanka</span>
              </li>
              <li className="footer-contact-item">
                <Phone size={16} />
                <span>+94 77 763 9196</span>
              </li>
              <li className="footer-contact-item">
                <Mail size={16} />
                <span>tours.igolanka@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2026 I GO LANKA TOURS. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">
              Privacy Policy
            </a>
            <a href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
