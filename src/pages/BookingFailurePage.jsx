import { useNavigate, useLocation } from "react-router-dom";
import { X, AlertCircle } from "lucide-react";
import "./BookingFailurePage.css";

const BookingFailurePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get error from navigation state or default
    const error = location.state?.error || "Your payment could not be processed.";
    const bookingId = location.state?.bookingId;

    return (
        <div className="booking-failure-container">
            <div className="booking-failure-content">
                <div className="failure-icon-wrapper">
                    <X size={56} strokeWidth={3} />
                </div>

                <h1>Payment Failed</h1>
                <p className="failure-message">
                    We were unable to process your payment. No charges have been made to your account.
                </p>

                {error && (
                    <div className="error-details">
                        <div className="flex items-center justify-center gap-2 mb-1 font-semibold">
                            <AlertCircle size={16} />
                            <span>Error Details</span>
                        </div>
                        <p>{error}</p>
                    </div>
                )}

                <div className="action-buttons">
                    <button
                        onClick={() => bookingId ? navigate(`/booking/${bookingId}/payment`) : navigate(-1)}
                        className="btn-retry"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/contact')}
                        className="btn-support"
                    >
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingFailurePage;
