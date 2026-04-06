import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "./BookingTravellersPage.css";

const BookingTravellersPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bookingData, setBookingData] = useState(null);
    const [travellers, setTravellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Load Step 1 Data
        const step1Data = sessionStorage.getItem('booking_step1');
        if (!step1Data) {
            navigate(`/booking/${id}`); // Redirect to start if no data
            return;
        }

        const parsedData = JSON.parse(step1Data);
        setBookingData(parsedData);

        // 2. Initialize Travellers Array
        const totalTravelers = (parsedData.adults || 0) + (parsedData.children || 0);

        // Check if we already have data (if user came back from payment page)
        const existingTravellers = sessionStorage.getItem('booking_travellers');

        if (existingTravellers) {
            setTravellers(JSON.parse(existingTravellers));
        } else {
            // Initialize new
            const currentUser = authAPI.getCurrentUser();
            const initialTravellers = Array(totalTravelers).fill(null).map((_, index) => ({
                id: index,
                fullName: index === 0 && currentUser ? currentUser.name : "",
                passportNumber: "",
                nationality: "",
                dateOfBirth: "",
                isPrimary: index === 0, // First one is primary by default
                type: index < (parsedData.adults || 0) ? 'Adult' : 'Child'
            }));
            setTravellers(initialTravellers);
        }

        setLoading(false);
    }, [id, navigate]);

    const handleInputChange = (index, field, value) => {
        const updatedTravellers = [...travellers];
        updatedTravellers[index] = {
            ...updatedTravellers[index],
            [field]: value
        };
        setTravellers(updatedTravellers);
    };

    const calculateAge = (birthDate, referenceDate) => {
        const birth = new Date(birthDate);
        const ref = new Date(referenceDate);
        let age = ref.getFullYear() - birth.getFullYear();
        const monthDiff = ref.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate
        for (let i = 0; i < travellers.length; i++) {
            const t = travellers[i];
            
            // Basic required check
            if (!t.fullName.trim() || !t.passportNumber.trim() || !t.nationality.trim() || !t.dateOfBirth) {
                alert(`Please fill in all details for Traveller ${i + 1}`);
                return;
            }

            // Age validation for Children
            if (t.type === 'Child' && bookingData.travel_date) {
                const age = calculateAge(t.dateOfBirth, bookingData.travel_date);
                if (age > 16) {
                    alert(`Traveller ${i + 1} is listed as a Child but is ${age} years old. Children must be 16 years or younger at the time of travel. Please go back and correct the traveler counts.`);
                    return;
                }
            }
        }

        // Save
        sessionStorage.setItem('booking_travellers', JSON.stringify(travellers));

        // Proceed
        navigate(`/booking/${id}/payment`);
    };

    if (loading) return <div className="loading-container">Loading...</div>;

    return (
        <div className="traveller-page-container">
            <div className="traveller-page-content">
                <h1>Traveller Information</h1>

                <div className="steps-indicator">
                    <div className="step">
                        <div className="step-number">1</div>
                        <span>Details</span>
                    </div>
                    <div className="step active">
                        <div className="step-number">2</div>
                        <span>Travellers</span>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <span>Payment</span>
                    </div>
                </div>

                <div className="primary-contact-notice">
                    <span>ℹ️</span>
                    <span>The first traveller will be considered the Primary Contact for this booking.</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {travellers.map((traveller, index) => (
                        <div key={index} className="traveller-card">
                            <div className="traveller-header">
                                <h3>Traveller {index + 1} {index === 0 && "(Primary)"}</h3>
                                <span className="traveller-type-badge">{traveller.type}</span>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name (as in Passport)</label>
                                    <input
                                        type="text"
                                        value={traveller.fullName}
                                        onChange={(e) => handleInputChange(index, 'fullName', e.target.value)}
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nationality</label>
                                    <input
                                        type="text"
                                        value={traveller.nationality}
                                        onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
                                        placeholder="e.g. American"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Passport Number</label>
                                    <input
                                        type="text"
                                        value={traveller.passportNumber}
                                        onChange={(e) => handleInputChange(index, 'passportNumber', e.target.value)}
                                        placeholder="Enter passport number"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        value={traveller.dateOfBirth}
                                        onChange={(e) => handleInputChange(index, 'dateOfBirth', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="action-buttons">
                        <button
                            type="button"
                            className="btn-back"
                            onClick={() => navigate(`/booking/${id}`)}
                        >
                            ← Back to Details
                        </button>
                        <button type="submit" className="btn-continue">
                            Continue to Payment →
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default BookingTravellersPage;
