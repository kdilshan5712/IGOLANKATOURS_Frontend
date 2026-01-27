import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, LogOut } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./GuidePending.css";

const GuidePendingPage = () => {
  const navigate = useNavigate();
  const [email] = useState(localStorage.getItem("guideEmail") || "");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guideEmail");
    localStorage.removeItem("guideName");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/guide/register");
    }
  }, [navigate]);

  return (
    <>
      <Navbar />
      <main className="guide-pending-page">
        <div className="guide-pending-container">
        <div className="guide-pending-card">
          <div className="guide-pending-icon">
            <Clock size={64} />
          </div>

          <h1 className="guide-pending-title">Application Under Review</h1>

          <p className="guide-pending-message">
            Thank you for submitting your documents!
          </p>

          <div className="guide-pending-content">
            <p className="guide-pending-description">
              Your application is currently under review by our admin team. 
              We'll verify your documents and contact you at:
            </p>

            <p className="guide-pending-email">{email}</p>

            <div className="guide-pending-timeline">
              <div className="guide-pending-step">
                <div className="guide-pending-step-number">1</div>
                <h3>Documents Submitted</h3>
                <p>Your documents have been received</p>
              </div>

              <div className="guide-pending-connector"></div>

              <div className="guide-pending-step">
                <div className="guide-pending-step-number">2</div>
                <h3>Under Review</h3>
                <p>Admin team is verifying your credentials</p>
              </div>

              <div className="guide-pending-connector"></div>

              <div className="guide-pending-step">
                <div className="guide-pending-step-number">3</div>
                <h3>Approval Notification</h3>
                <p>You'll receive approval via email</p>
              </div>

              <div className="guide-pending-connector"></div>

              <div className="guide-pending-step">
                <div className="guide-pending-step-number">4</div>
                <h3>Dashboard Access</h3>
                <p>Start managing your tours</p>
              </div>
            </div>
          </div>

          <div className="guide-pending-info">
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your documents (usually within 24-48 hours)</li>
              <li>We may request additional information if needed</li>
              <li>You'll receive an approval email once verified</li>
              <li>You can then log in and access your dashboard</li>
            </ul>
          </div>

          <button onClick={handleLogout} className="guide-pending-logout-button">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </main>
      <Footer />
    </>
  );
};

export default GuidePendingPage;
