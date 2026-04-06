import "../styles/LegalPages.css";
import { AlertCircle, RefreshCw, XCircle, ShieldCheck, HelpCircle, Mail, Phone } from "lucide-react";
import SEO from "../components/SEO";

const CancellationPolicyPage = () => {
  return (
    <main className="legal-page-layout">
      <SEO 
        title="Cancellation Policy"
        description="Understand the cancellation and refund policy of I GO LANKA TOURS. Find information on fees and processes for changing your booking."
      />
      <div className="legal-container">
        <div className="legal-glass-panel">
          <div className="legal-header">
            <h1 className="legal-title">Cancellation Policy</h1>
            <p className="legal-subtitle">Last Updated: January 16, 2026</p>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-section-title"><AlertCircle size={24} style={{ color: '#2563eb' }} /> Introduction</h2>
              <p className="legal-text">
                At I GO LANKA TOURS, we understand that travel plans can change. This Cancellation
                Policy outlines the terms and conditions for canceling your booking and the refund
                process.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><XCircle size={24} style={{ color: '#ef4444' }} /> Cancellation by Customer</h2>
              <p className="legal-text">
                Cancellations must be in writing via email. The following charges apply:
              </p>

              <div className="legal-contact-card" style={{ background: '#f8fafc', padding: '20px' }}>
                <ul className="legal-list">
                  <li><strong>More than 60 days:</strong> 10% fee</li>
                  <li><strong>45 to 60 days:</strong> 25% fee</li>
                  <li><strong>30 to 44 days:</strong> 50% fee</li>
                  <li><strong>15 to 29 days:</strong> 75% fee</li>
                  <li><strong>Less than 15 days:</strong> 100% fee (No refund)</li>
                </ul>
              </div>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><RefreshCw size={24} style={{ color: '#10b981' }} /> Refund Process</h2>
              <ul className="legal-list">
                <li>Processed within 14 business days</li>
                <li>Credited to original payment method</li>
                <li>Processing fees are non-refundable</li>
                <li>Bank charges are the responsibility of the customer</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><ShieldCheck size={24} style={{ color: '#2563eb' }} /> Travel Insurance</h2>
              <p className="legal-text">
                We strongly recommend purchasing comprehensive travel insurance that covers trip
                cancellations, medical emergencies, and unforeseen circumstances.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title"><HelpCircle size={24} style={{ color: '#2563eb' }} /> Contact Us</h2>
              <p className="legal-text">
                For cancellation requests or questions about this policy, please contact:
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

export default CancellationPolicyPage;
