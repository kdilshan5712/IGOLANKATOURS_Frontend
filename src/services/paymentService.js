import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Payment Service
 * Handles all payment-related API calls
 */

/**
 * Create a payment intent for a booking
 */
export const createPaymentIntent = async (bookingId, amount, token, useMock = false) => {
    try {
        // @API_CALL: Initialize Stripe payment intent or mock transaction
        const response = await axios.post(
            `${API_URL}/payments/create-intent`,
            {
                bookingId,
                amount,
                currency: 'usd',
                useMock
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        // @ERROR_HANDLING: Capture intent creation failures
        console.error('Error creating payment intent:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create payment intent'
        };
    }
};

/**
 * Process dummy payment (Mock)
 */
export const processDummyPayment = async (bookingId, amount, token) => {
    try {
        // @API_CALL: Process non-Stripe (mock) payment bypass
        const response = await axios.post(
            `${API_URL}/payments/process-dummy`,
            {
                bookingId,
                amount
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        // @ERROR_HANDLING: Capture mock processing errors
        console.error('Error processing dummy payment:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to process payment'
        };
    }
};

/**
 * Confirm payment after successful Stripe payment
 */
export const confirmPayment = async (paymentIntentId, bookingId, token) => {
    try {
        // @API_CALL: Finalize payment status after Stripe webhook/return
        const response = await axios.post(
            `${API_URL}/payments/confirm`,
            {
                paymentIntentId,
                bookingId
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        // @ERROR_HANDLING: Error during payment finalization phase
        console.error('Error confirming payment:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to confirm payment'
        };
    }
};

/**
 * Process refund for cancelled booking
 */
export const processRefund = async (bookingId, refundAmount, reason, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/payments/refund`,
            {
                bookingId,
                refundAmount,
                reason
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error processing refund:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to process refund'
        };
    }
};

/**
 * Get payment history for a user
 */
export const getPaymentHistory = async (userId, token) => {
    try {
        const response = await axios.get(
            `${API_URL}/payments/history/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch payment history',
            payments: []
        };
    }
};

const paymentService = {
    createPaymentIntent,
    confirmPayment,
    processRefund,
    getPaymentHistory,
    processDummyPayment
};

export default paymentService;
