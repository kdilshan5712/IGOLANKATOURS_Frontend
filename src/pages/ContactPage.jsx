/**
 * 🎯 I GO LANKA TOURS - Contact & Inquiry Gateway
 * 
 * Provides a communication interface for travelers to send inquiries,
 * request quotes for AI-generated itineraries, or ask questions. Supports 
 * contextual data injection from the AI travel assistant.
 * 
 * @module ContactPage
 */

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send, MessageCircle, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { contactAPI } from "../services/api";
import SEO from "../components/SEO";
import "./ContactPage.css";

/**
 * ContactPage Component
 * 
 * Manages contact form state, validation, and API submission.
 * 
 * @returns {JSX.Element}
 */
const ContactPage = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [aiSessionId, setAiSessionId] = useState(null);

  // @SIDE_EFFECTS: Handle pre-filled contextual data from routing (e.g., from AI Chatbot)
  useEffect(() => {
    if (location.state) {
      if (location.state.aiItinerary) {
        setAiSessionId(location.state.aiSessionId);
        setFormData(prev => ({
          ...prev,
          subject: "Custom AI Itinerary Quote Request",
          message: `I would like to request an official quote to book this custom AI-generated itinerary:\n\n${location.state.aiItinerary}\n\nEstimated Target Price: $${location.state.aiPrice || 'TBD'}\n\nPlease let me know the final price and how to proceed with booking.`
        }));
      } else if (location.state.packageName) {
        // ... (existing packageName logic)
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    // @VALIDATION: Basic presence checks before submission
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      // @API_CALL: Submit contact inquiry to backend
      const result = await contactAPI.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        session_id: aiSessionId
      });

      if (result.success) {
        setMessage("Thank you for contacting us! We'll get back to you soon.");
        setMessageType("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        // @ERROR_HANDLING: Parse validation errors or generic failures from API
        if (result.errors) {
          setFieldErrors(result.errors);
          setMessage("Please correct the highlighted errors.");
        } else {
          setMessage(result.message || "Failed to send message");
        }
        setMessageType("error");
      }
    } catch (error) {
      // @ERROR_HANDLING: Catch network or unexpected runtime errors
      console.error("Error submitting contact form:", error);
      setMessage("Failed to send message. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-page">
      <SEO 
        title="Contact Us"
        description="Have questions about your Sri Lanka trip? Contact I GO LANKA TOURS via email, phone, or WhatsApp. Our travel experts are here to help."
        keywords="contact Sri Lanka tours, travel inquiry Sri Lanka, I GO LANKA TOURS support"
      />
      <div className="contact-page-container">
        <div className="contact-page-header">
          <h1 className="contact-page-title">Get In Touch</h1>
          <p className="contact-page-subtitle">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-form-section">
            <div className="contact-form-card">
              <h2 className="contact-form-title">Send Us a Message</h2>

              <form onSubmit={handleSubmit}>
                {message && (
                  <div className={`contact-form-message contact-form-message-${messageType}`}>
                    {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p>{message}</p>
                  </div>
                )}

                <div className="contact-form-group">
                  <label className="contact-form-label">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-form-input"
                    placeholder="Enter your name"
                    required
                    minLength={2}
                  />
                  {fieldErrors.name && <span className="field-error-message">{fieldErrors.name}</span>}
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="contact-form-input"
                    placeholder="your.email@example.com"
                    required
                  />
                  {fieldErrors.email && <span className="field-error-message">{fieldErrors.email}</span>}
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="contact-form-input"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="contact-form-input"
                    placeholder="What is your message about?"
                    required
                    minLength={3}
                  />
                  {fieldErrors.subject && <span className="field-error-message">{fieldErrors.subject}</span>}
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="contact-form-textarea"
                    placeholder="Tell us about your travel plans or any questions you have..."
                    rows="5"
                    required
                    minLength={10}
                    maxLength={5000}
                  />
                  {fieldErrors.message && <span className="field-error-message">{fieldErrors.message}</span>}
                  <p className="contact-form-char-count">
                    {formData.message.length}/5000 characters
                  </p>
                </div>

                <button
                  type="submit"
                  className="contact-form-submit-btn"
                  disabled={loading}
                >
                  <Send size={20} />
                  <span>{loading ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            </div>
          </div>

          <div className="contact-info-section">
            <div className="contact-info-card">
              <h3 className="contact-info-title">Contact Information</h3>
              <p className="contact-info-subtitle">
                Reach out to us through any of these channels
              </p>

              <div className="contact-info-items">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="contact-info-item-title">Phone</h4>
                    <p className="contact-info-item-value">+94 77 763 9196</p>

                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="contact-info-item-title">Email</h4>
                    <p className="contact-info-item-value">
                      tours.igolanka@gmail.com
                    </p>

                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h4 className="contact-info-item-title">WhatsApp</h4>
                    <p className="contact-info-item-value">+94 77 763 9196</p>
                    <p className="contact-info-item-note">
                      Available 24/7 for urgent inquiries
                    </p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="contact-info-item-title">Office Address</h4>
                    <p className="contact-info-item-value">
                      Katunayaka
                    </p>
                    <p className="contact-info-item-value">Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-faq-card">
              <div className="contact-faq-icon">
                <HelpCircle size={32} />
              </div>
              <div className="contact-faq-content">
                <h3 className="contact-faq-title">Frequently Asked Questions</h3>
                <p className="contact-faq-text">
                  Find quick answers to common questions about our tours, bookings, and policies.
                </p>
                <Link to="/faq" className="contact-faq-btn">
                  View FAQs
                </Link>
              </div>
            </div>

            <div className="contact-hours-card">
              <h3 className="contact-hours-title">Business Hours</h3>
              <div className="contact-hours-item">
                <span>Monday - Friday</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>
              <div className="contact-hours-item">
                <span>Saturday</span>
                <span>9:00 AM - 4:00 PM</span>
              </div>
              <div className="contact-hours-item">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
