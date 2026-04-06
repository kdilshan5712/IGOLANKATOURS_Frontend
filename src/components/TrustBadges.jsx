import { ShieldCheck, Award, HeadphonesIcon, Map } from "lucide-react";
import "./TrustBadges.css";

const TrustBadges = () => {
    const badges = [
        {
            icon: <ShieldCheck size={32} className="trust-icon" />,
            title: "Secure Booking",
            desc: "100% secure payments",
        },
        {
            icon: <Award size={32} className="trust-icon" />,
            title: "Top Rated",
            desc: "Consistently 5-star reviews",
        },
        {
            icon: <HeadphonesIcon size={32} className="trust-icon" />,
            title: "24/7 Support",
            desc: "Always here to help you",
        },
        {
            icon: <Map size={32} className="trust-icon" />,
            title: "Local Experts",
            desc: "Authentic Sri Lankan experiences",
        },
    ];

    return (
        <section className="trust-badges-section">
            <div className="trust-badges-container">
                <div className="trust-badges-grid">
                    {badges.map((badge, index) => (
                        <div key={index} className="trust-badge-item">
                            <div className="trust-icon-wrapper">{badge.icon}</div>
                            <div className="trust-content">
                                <h3 className="trust-title">{badge.title}</h3>
                                <p className="trust-desc">{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustBadges;
