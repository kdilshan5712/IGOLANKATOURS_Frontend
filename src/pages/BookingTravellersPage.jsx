/**
 * 🎯 I GO LANKA TOURS - Booking Travellers Page
 * 
 * Second step of the booking flow. Collects detailed information for all 
 * travelers (Adults & Children) including passport details and nationalities.
 * Performs complex age-based validation against the selected travel date.
 * 
 * @module BookingTravellersPage
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { User, Shield, Calendar, Globe, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import "./BookingTravellersPage.css";

/**
 * BookingTravellersPage Component
 * 
 * Manages individual traveler profile collection and age-rule validation.
 * 
 * @returns {JSX.Element}
 */
const BookingTravellersPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bookingData, setBookingData] = useState(null);
    const [travellers, setTravellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // STATE RECOVERY: Load Step 1 Data from sessionStorage
        const step1Data = sessionStorage.getItem('booking_step1');
        if (!step1Data) {
            navigate(`/booking/${id}`); // Redirect to start if no data
            return;
        }

        const parsedData = JSON.parse(step1Data);
        setBookingData(parsedData);

        // DATA INITIALIZATION: Build Travellers Array based on counts
        const totalTravelers = (parsedData.adults || 0) + (parsedData.children || 0);

        // PERSISTENCE: Check for existing data (e.g., if user returns from payment)
        const existingTravellers = sessionStorage.getItem('booking_travellers');

        if (existingTravellers) {
            setTravellers(JSON.parse(existingTravellers));
        } else {
            // AUTH INTEGRATION: Pre-fill first traveler with logged-in user info
            const currentUser = authAPI.getCurrentUser();
            const initialTravellers = Array(totalTravelers).fill(null).map((_, index) => ({
                id: index,
                fullName: index === 0 && currentUser ? currentUser.name : "",
                passportNumber: "",
                passportExpiry: "",
                nationality: "",
                dateOfBirth: "",
                dietaryRestrictions: "",
                medicalConditions: "",
                isPrimary: index === 0, // First one is primary contact
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

        // @VALIDATION: Iterate through all travelers to ensure complete profiles
        for (let i = 0; i < travellers.length; i++) {
            const t = travellers[i];
            
            // @VALIDATION: Basic required check for individual fields
            if (!t.fullName.trim() || !t.passportNumber.trim() || !t.passportExpiry || !t.nationality.trim() || !t.dateOfBirth) {
                alert(`Please fill in all details for Traveller ${i + 1}`);
                return;
            }

            // @VALIDATION: Passport number format check
            const passportRegex = /^[A-Z0-9]{6,20}$/i;
            if (!passportRegex.test(t.passportNumber.trim())) {
                alert(`Invalid passport number for Traveller ${i + 1}. It must be 6-20 alphanumeric characters.`);
                return;
            }

            // @VALIDATION: Passport expiry check (must be at least 6 months after travel date)
            if (bookingData.travel_date) {
                const travelDateObj = new Date(bookingData.travel_date);
                const expiryDateObj = new Date(t.passportExpiry);
                const minExpiry = new Date(travelDateObj);
                minExpiry.setMonth(minExpiry.getMonth() + 6);
                
                if (expiryDateObj < minExpiry) {
                    alert(`Passport expiry date for Traveller ${i + 1} must be at least 6 months after the travel date (${new Date(bookingData.travel_date).toLocaleDateString()}).`);
                    return;
                }
            }

            // @VALIDATION: Business Rule - Age validation for Adults (must be >= 18)
            if (t.type === 'Adult' && bookingData.travel_date) {
                const age = calculateAge(t.dateOfBirth, bookingData.travel_date);
                if (age < 18) {
                    alert(`Traveller ${i + 1} is listed as an Adult but is ${age} years old on the travel date. Adults must be 18 years or older.`);
                    return;
                }
            }

            // @VALIDATION: Business Rule - Age validation for Children (must be under 18 and at least 2)
            if (t.type === 'Child' && bookingData.travel_date) {
                const age = calculateAge(t.dateOfBirth, bookingData.travel_date);
                if (age >= 18) {
                    alert(`Traveller ${i + 1} is listed as a Child but is ${age} years old on the travel date. Children must be under 18 years.`);
                    return;
                }
                if (age < 2) {
                    alert(`Traveller ${i + 1} is listed as a Child but is ${age} years old on the travel date. Children must be 2 years or older.`);
                    return;
                }
            }
        }

        // PERSISTENCE: Save validated traveler data to session
        sessionStorage.setItem('booking_travellers', JSON.stringify(travellers));

        // NAVIGATION: Move to payment step
        navigate(`/booking/${id}/payment`);
    };

    if (loading) return <div className="loading-container">Loading...</div>;

    return (
        <div className="traveller-page-container">

            {/* Hero Banner */}
            <div className="traveller-hero">
                <div className="traveller-hero-text">
                    <h1>Traveller <span>Information</span></h1>
                    <p>Step 2 of 3 — Enter passport details exactly as they appear</p>
                </div>
            </div>

            <div className="traveller-page-content">
                <div className="steps-indicator">
                    <div className="step completed">
                        <div className="step-number"><CheckCircle size={16} /></div>
                        <span>Details</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step active">
                        <div className="step-number">2</div>
                        <span>Travellers</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <span>Payment</span>
                    </div>
                </div>

                <div className="primary-contact-notice">
                    <Shield size={18} />
                    <span>The first traveller will be the <strong>Primary Contact</strong> for this booking. Their details are pre-filled from your account.</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {travellers.map((traveller, index) => (
                        <div key={index} className="traveller-card">
                            <div className="traveller-header">
                                <div className="traveller-header-left">
                                    <div className="traveller-icon">
                                        <User size={20} />
                                    </div>
                                    <h3>
                                        Traveller {index + 1}
                                        {index === 0 && <small>(Primary)</small>}
                                    </h3>
                                </div>
                                <span className="traveller-type-badge">{traveller.type}</span>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><User size={14} />Full Name (as in Passport)</label>
                                    <input
                                        type="text"
                                        value={traveller.fullName}
                                        onChange={(e) => handleInputChange(index, 'fullName', e.target.value)}
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Globe size={14} />Nationality</label>
                                    <input
                                        type="text"
                                        value={traveller.nationality}
                                        onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
                                        placeholder="e.g. American"
                                        list="nationalities-list"
                                        required
                                    />
                                    <datalist id="nationalities-list">
                                        <option value="American" />
                                        <option value="British" />
                                        <option value="Canadian" />
                                        <option value="Australian" />
                                        <option value="Indian" />
                                        <option value="German" />
                                        <option value="French" />
                                        <option value="Japanese" />
                                        <option value="Chinese" />
                                        <option value="Maldivian" />
                                        <option value="Russian" />
                                        <option value="Sri Lankan" />
                                    </datalist>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><Shield size={14} />Passport Number</label>
                                    <input
                                        type="text"
                                        value={traveller.passportNumber}
                                        onChange={(e) => handleInputChange(index, 'passportNumber', e.target.value.toUpperCase())}
                                        placeholder="e.g. A12345678"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Calendar size={14} />Date of Birth</label>
                                    <input
                                        type="date"
                                        value={traveller.dateOfBirth}
                                        onChange={(e) => handleInputChange(index, 'dateOfBirth', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><Calendar size={14} />Passport Expiry Date</label>
                                    <input
                                        type="date"
                                        value={traveller.passportExpiry || ""}
                                        onChange={(e) => handleInputChange(index, 'passportExpiry', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dietary & Medical Requirements (Optional)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={traveller.dietaryRestrictions || ""}
                                            onChange={(e) => handleInputChange(index, 'dietaryRestrictions', e.target.value)}
                                            placeholder="e.g. Vegetarian"
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="text"
                                            value={traveller.medicalConditions || ""}
                                            onChange={(e) => handleInputChange(index, 'medicalConditions', e.target.value)}
                                            placeholder="e.g. Asthma"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
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
                            <ArrowLeft size={16} /> Back to Details
                        </button>
                        <button type="submit" className="btn-continue">
                            Continue to Payment <ArrowRight size={16} />
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default BookingTravellersPage;
