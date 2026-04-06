import { useState, useEffect } from "react";
import { Star, Quote, Loader } from "lucide-react";
import "./TestimonialsSection.css";

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                // Fetch approved reviews from the public endpoint
                const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const response = await fetch(`${API_BASE_URL}/reviews?limit=6`);
                const data = await response.json();

                if (data.success) {
                    setTestimonials(data.reviews || []);
                }
            } catch (error) {
                console.error("Failed to load testimonials:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const renderStars = (rating) => {
        return Array(rating).fill(0).map((_, i) => (
            <Star key={i} size={16} className="testimonial-star-filled" />
        ));
    };

    if (loading) {
        return (
            <section className="testimonials-section">
                <div className="testimonials-container">
                    <div className="flex justify-center items-center py-12">
                        <Loader className="animate-spin text-teal-600" size={40} />
                    </div>
                </div>
            </section>
        );
    }

    if (testimonials.length === 0) {
        // Return null or placeholder if there are no reviews yet
        return null;
    }

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <h2 className="testimonials-title">What Our Travelers Say</h2>
                    <p className="testimonials-subtitle">
                        Don't just take our word for it. Read reviews from people who have explored Sri Lanka with us.
                    </p>
                </div>

                <div className="testimonials-grid">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.review_id} className="testimonial-card">
                            <Quote className="testimonial-quote-icon" size={40} />

                            <div className="testimonial-rating">
                                {renderStars(testimonial.rating)}
                            </div>

                            <div className="testimonial-text-wrapper mb-4">
                                {testimonial.title && <h4 className="font-bold text-gray-800 mb-2">{testimonial.title}</h4>}
                                <p className="testimonial-text">"{testimonial.comment}"</p>
                            </div>

                            <div className="testimonial-tour-tag mb-4">
                                <span>Tour:</span> {testimonial.package_name || "Custom Tour"}
                            </div>

                            <div className="testimonial-author mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg">
                                    {testimonial.reviewer_name ? testimonial.reviewer_name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="testimonial-author-info">
                                    <h4 className="testimonial-author-name">{testimonial.reviewer_name || "Anonymous Traveler"}</h4>
                                    <p className="testimonial-author-country text-xs text-gray-500">
                                        {new Date(testimonial.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
