/**
 * 🎯 I GO LANKA TOURS - Privacy Policy Page
 * 
 * Displays the privacy policy terms, data collection methods, 
 * and user rights regarding personal information.
 * 
 * @module PrivacyPolicyPage
 */

import "../styles/LegalPages.css";
import { Shield, Lock, Eye, Users, FileText, Mail, Phone, MessageSquare } from "lucide-react";
import SEO from "../components/SEO";

/**
 * PrivacyPolicyPage Component
 * 
 * Renders static privacy information with SEO support.
 * 
 * @returns {JSX.Element}
 */
const PrivacyPolicyPage = () => {
  return (
    <main className="legal-page-layout">
      <SEO 
        title="Privacy Policy"
        description="Read the Privacy Policy of I GO LANKA TOURS. Learn how we collect, use, and protect your personal information."
      />
      <div className="legal-container">
        <div className="legal-glass-panel">
          <div className="legal-header">
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-subtitle">Last Updated: January 16, 2026</p>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-section-title"><Shield size={24} /> Introduction</h2>
              <p className="legal-text">
                Welcome to I GO LANKA TOURS. We are committed to protecting your personal
                information and your right to privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit our
                website or use our travel services.
              </p>
              <p className="legal-text">
                By using our services, you consent to the data practices described in this policy.
                If you do not agree with the terms of this Privacy Policy, please do not access
                our website or use our services.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><Eye size={24} /> Information We Collect</h2>
              <p className="legal-text">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="legal-list">
                <li>Register for an account on our website</li>
                <li>Make a booking or reservation for tours and travel services</li>
                <li>Subscribe to our newsletter or marketing communications</li>
                <li>Contact us with inquiries or support requests</li>
                <li>Submit reviews or feedback about our services</li>
              </ul>
              <p className="legal-text">
                The personal information we collect may include:
              </p>
              <ul className="legal-list">
                <li>Name and contact information (email address, phone number, mailing address)</li>
                <li>Passport and travel document details</li>
                <li>Payment information (credit card details, billing address)</li>
                <li>Travel preferences and special requirements</li>
                <li>Emergency contact information</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><Lock size={24} /> How We Use Your Information</h2>
              <p className="legal-text">
                We use the information we collect to:
              </p>
              <ul className="legal-list">
                <li>Process your bookings and manage your travel arrangements</li>
                <li>Communicate with you about your reservations and travel itinerary</li>
                <li>Provide customer support and respond to your inquiries</li>
                <li>Send you promotional offers, newsletters, and travel updates</li>
                <li>Improve our website, services, and customer experience</li>
                <li>Comply with legal obligations and protect against fraud</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><Shield size={24} /> Data Protection</h2>
              <p className="legal-text">
                We implement appropriate technical and organizational security measures to protect
                your personal information against unauthorized access, alteration, disclosure, or
                destruction.
              </p>
              <ul className="legal-list">
                <li>Secure SSL encryption for data transmission</li>
                <li>Restricted access to personal information</li>
                <li>Regular security assessments and updates</li>
                <li>Secure payment processing</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><Users size={24} /> Sharing Your Information</h2>
              <p className="legal-text">
                We may share your personal information with travel service providers (hotels, transport companies, tour guides) necessary to fulfill your bookings. We do not sell, rent, or trade your personal information.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><MessageSquare size={24} style={{ color: '#2563eb' }} /> Contact Us</h2>
              <p className="legal-text">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
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

export default PrivacyPolicyPage;
