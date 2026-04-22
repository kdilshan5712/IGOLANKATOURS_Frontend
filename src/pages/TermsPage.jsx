/**
 * 🎯 I GO LANKA TOURS - Terms & Conditions Page
 * 
 * Outlines the legal agreement between the tour operator and travelers,
 * covering bookings, payments, cancellations, and code of conduct.
 * 
 * @module TermsPage
 */

import "../styles/LegalPages.css";
import { FileText, CreditCard, Luggage, Edit, AlertTriangle, Users, MessageSquare, Mail, Phone, Shield, Lock, Eye } from "lucide-react";
import SEO from "../components/SEO";

/**
 * TermsPage Component
 * 
 * Renders static legal terms with SEO support.
 * 
 * @returns {JSX.Element}
 */
const TermsPage = () => {
  return (
    <main className="legal-page-layout">
      <SEO 
        title="Terms & Conditions"
        description="Read the Terms and Conditions of I GO LANKA TOURS. Understand the rules and regulations for using our travel services."
      />
      <div className="legal-container">
        <div className="legal-glass-panel">
          <div className="legal-header">
            <h1 className="legal-title">Terms & Conditions</h1>
            <p className="legal-subtitle">Last Updated: January 16, 2026</p>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-section-title"><FileText size={24} /> Introduction</h2>
              <p className="legal-text">
                Welcome to I GO LANKA TOURS. These Terms and Conditions govern your use of our
                website and travel services. By accessing our website or booking our services,
                you agree to be bound by these terms.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><Luggage size={24} /> Booking Conditions</h2>
              <ul className="legal-list">
                <li>You must be at least 18 years of age</li>
                <li>All information provided must be accurate</li>
                <li>A booking is confirmed only upon receipt of payment</li>
                <li>Package prices are subject to availability</li>
                <li>Special requests are subject to availability</li>
                <li>You are responsible for valid travel documents</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><CreditCard size={24} /> Payment Terms</h2>
              <ul className="legal-list">
                <li>A deposit of 30% is required at booking</li>
                <li>Full payment must be received 30 days prior to departure</li>
                <li>Late payment may result in cancellation</li>
                <li>We accept cards and bank transfers</li>
                <li>Payments are processed in US Dollars (USD)</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><Edit size={24} /> Changes and Modifications</h2>
              <p className="legal-text">
                I GO LANKA TOURS reserves the right to modify itineraries due to weather or safety concerns.
              </p>
              <ul className="legal-list">
                <li>Changes more than 30 days before departure: $50 fee</li>
                <li>Changes within 30 days are subject to availability</li>
                <li>Name changes are not permitted once confirmed</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><AlertTriangle size={24} /> Liability Limitations</h2>
              <p className="legal-text">
                We are not liable for delays by airlines, hotels, or loss of belongings. We strongly recommend purchasing comprehensive travel insurance.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><Users size={24} /> Conduct and Behavior</h2>
              <p className="legal-text">
                Travelers are expected to behave respectfully. We reserve the right to remove any traveler from a tour if their behavior is disruptive.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><MessageSquare size={24} style={{ color: '#2563eb' }} /> Contact Information</h2>
              <div className="legal-contact-card">
                <div className="legal-contact-item">
                  <Mail size={20} style={{ color: '#2563eb' }} />
                  <span>tours.igolanka@gmail.com</span>
                </div>
                <div className="legal-contact-item">
                  <Phone size={20} style={{ color: '#2563eb' }} />
                  <span>+94 77 763 9196</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
