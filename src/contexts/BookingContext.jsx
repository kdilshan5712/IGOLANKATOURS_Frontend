import { createContext, useState, useContext } from 'react';

export const BookingContext = createContext(null);

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

  const updateBookingData = (data) => {
    setBookingData(prev => ({
      ...prev,
      ...data
    }));
  };

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

  // Simulate payment processing
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
