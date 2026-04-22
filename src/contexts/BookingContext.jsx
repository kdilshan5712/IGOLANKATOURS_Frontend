/**
 * 📦 BookingContext
 * 
 * Centralized state management for the tour booking wizard.
 * Persists package selection, traveler details, and payment status across steps.
 */
export const BookingContext = createContext(null);

/**
 * 🛠️ BookingProvider Component
 * 
 * Wraps the booking-related routes to provide access to shared state.
 */
export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    packageId: null,
    packageData: null,
    travelDate: '',
    numberOfTravelers: 1,
    travellerInfo: {
      fullName: '',
      email: '',
      phone: '',
      specialRequests: ''
    },
    paymentInfo: {
      method: 'card',
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: ''
    },
    totalAmount: 0,
    bookingReference: null,
    status: 'pending',
    paymentStatus: null
  });

  /**
   * 🔄 Merge new data into the current booking state
   */
  const updateBookingData = (data) => {
    setBookingData(prev => ({
      ...prev,
      ...data
    }));
  };

  /**
   * 🧹 Clear all booking data (e.g., after success or cancellation)
   */
  const resetBooking = () => {
    setBookingData({
      packageId: null,
      packageData: null,
      travelDate: '',
      numberOfTravelers: 1,
      travellerInfo: {
        fullName: '',
        email: '',
        phone: '',
        specialRequests: ''
      },
      paymentInfo: {
        method: 'card',
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: ''
      },
      totalAmount: 0,
      bookingReference: null,
      status: 'pending',
      paymentStatus: null
    });
  };

  /**
   * 💳 processPayment (Mock Implementation)
   * 
   * Simulates a network call to a payment gateway.
   * Includes random failure simulation for testing @ERROR_HANDLING in UI components.
   * 
   * @API_CALL: Simulated backend interaction
   */
  const processPayment = async (paymentInfo) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 80% success rate for demo
        const isSuccess = Math.random() > 0.2;
        
        if (isSuccess) {
          const bookingRef = `IGT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          
          updateBookingData({
            bookingReference: bookingRef,
            status: 'confirmed',
            paymentStatus: 'success',
            paymentInfo
          });
          
          resolve({
            success: true,
            bookingReference: bookingRef,
            message: 'Payment processed successfully'
          });
        } else {
          // @ERROR_HANDLING: Persistent failure state in context
          updateBookingData({
            status: 'pending',
            paymentStatus: 'failed',
            paymentInfo
          });
          
          reject({
            success: false,
            message: 'Payment declined. Please try another card or contact your bank.'
          });
        }
      }, 2000); // 2 second delay to simulate processing
    });
  };

  const value = {
    bookingData,
    updateBookingData,
    resetBooking,
    processPayment
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
