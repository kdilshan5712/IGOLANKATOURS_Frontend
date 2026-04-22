/**
 * 🎯 I GO LANKA TOURS - Support & FAQ
 * 
 * Displays categorized frequently asked questions fetched from the backend.
 * Provides quick answers to common travel, booking, and policy inquiries
 * to maximize user self-service and trust.
 * 
 * @module FAQPage
 */

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Mail, Phone, MessageSquare, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { faqAPI } from "../services/api";
import SEO from "../components/SEO";
import "../styles/LegalPages.css";
import "./FAQPage.css";

/**
 * FAQPage Component
 * 
 * Handles FAQ data fetching, category organization, and accordion interactions.
 * 
 * @returns {JSX.Element}
 */
const FAQPage = () => {
    const [openSection, setOpenSection] = useState(0); // Which category is open (mobile view)
    const [openItems, setOpenItems] = useState({}); // Which specific questions are open
    const [faqData, setFaqData] = useState([]);
    const [loading, setLoading] = useState(true);

    // @SIDE_EFFECTS: Fetch all FAQs on component mount
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                // @API_CALL: Fetch FAQ data from public endpoint
                const response = await faqAPI.getAll();
                if (response.success && response.faqData) {
                    setFaqData(response.faqData);
                } else {
                    // @ERROR_HANDLING: Log retrieval failures
                    console.error("Failed to load FAQs", response.message);
                }
            } catch (err) {
                // @ERROR_HANDLING: Catch network or server-side errors
                console.error("Failed to fetch FAQs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    const toggleItem = (categoryIndex, itemIndex) => {
        const key = `${categoryIndex}-${itemIndex}`;
        setOpenItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <main className="legal-page-layout">
            <SEO 
                title="Frequently Asked Questions"
                description="Find answers to common questions about Sri Lanka tours, booking processes, payment methods, and travel requirements."
                keywords="FAQ Sri Lanka tours, travel questions Sri Lanka, I GO LANKA TOURS help"
            />
            <div className="legal-container">
                <div className="legal-glass-panel">
                    <div className="legal-header">
                        <HelpCircle size={48} className="faq-hero-icon" style={{ color: '#60a5fa', marginBottom: '20px' }} />
                        <h1 className="legal-title">Frequently Asked Questions</h1>
                        <p className="legal-subtitle">
                            Find answers to common questions about booking your Sri Lankan adventure.
                        </p>
                    </div>

                    <div className="faq-content-wrapper min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-full pt-12">
                                <Loader className="animate-spin text-teal-600" size={40} />
                            </div>
                        ) : faqData.length > 0 ? (
                            faqData.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="faq-category-section">
                                    <h2 className="legal-section-title">
                                        {section.category}
                                    </h2>

                                    <div className="faq-accordion-list">
                                        {section.items.map((item, itemIndex) => {
                                            const isOpen = openItems[`${sectionIndex}-${itemIndex}`];
                                            return (
                                                <div
                                                    key={itemIndex}
                                                    className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                                                >
                                                    <button
                                                        className="faq-accordion-header"
                                                        onClick={() => toggleItem(sectionIndex, itemIndex)}
                                                        aria-expanded={isOpen}
                                                    >
                                                        <span className="faq-question">{item.question}</span>
                                                        {isOpen ? (
                                                            <ChevronUp className="faq-icon-active" size={20} />
                                                        ) : (
                                                            <ChevronDown className="faq-icon-inactive" size={20} />
                                                        )}
                                                    </button>

                                                    <div
                                                        className="faq-accordion-content"
                                                        style={{ maxHeight: isOpen ? '500px' : '0' }}
                                                    >
                                                        <div className="faq-answer-inner">
                                                            {item.answer}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center pt-12 text-gray-500">
                                <h3>No FAQs available at the moment.</h3>
                            </div>
                        )}
                    </div>

                    <div className="legal-contact-card" style={{ marginTop: '60px', background: '#f1f5f9' }}>
                        <h3 className="legal-section-title" style={{ marginBottom: '15px' }}>Still have questions?</h3>
                        <p className="legal-text" style={{ fontSize: '0.95rem' }}>
                            Our travel experts are here to help you plan your perfect trip.
                        </p>

                        <div className="faq-contact-options" style={{ marginTop: '25px' }}>
                            <a href="mailto:tours.igolanka@gmail.com" className="faq-contact-item" style={{ background: '#ffffff' }}>
                                <div className="faq-contact-icon mail"><Mail size={20} /></div>
                                <div>
                                    <strong>Email Us</strong>
                                    <span>tours.igolanka@gmail.com</span>
                                </div>
                            </a>

                            <a href="tel:+94777639196" className="faq-contact-item" style={{ background: '#ffffff' }}>
                                <div className="faq-contact-icon phone"><Phone size={20} /></div>
                                <div>
                                    <strong>Call Us</strong>
                                    <span>+94 77 763 9196</span>
                                </div>
                            </a>
                        </div>
                        
                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                            <Link to="/custom-tour-chat" className="faq-btn-primary" style={{ flex: 1, textAlign: 'center', background: '#2563eb' }}>Ask AI Agent</Link>
                            <Link to="/contact" className="faq-btn-primary" style={{ flex: 1, textAlign: 'center', background: '#ffffff', color: '#2563eb', border: '1px solid #e2e8f0' }}>Contact Support</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default FAQPage;
