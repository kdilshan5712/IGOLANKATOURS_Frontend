import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cancelBooking } from '../services/api';

function CancelBookingModal({ booking, onClose, onSuccess }) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Calculate refund information
    const calculateRefund = () => {
        const travelDate = new Date(booking.travel_date);
        const now = new Date();
        const daysUntilTravel = Math.ceil((travelDate - now) / (1000 * 60 * 60 * 24));

        let refundPercentage = 0;
        if (daysUntilTravel >= 30) {
            refundPercentage = 100;
        } else if (daysUntilTravel >= 14) {
            refundPercentage = 75;
        } else if (daysUntilTravel >= 7) {
            refundPercentage = 50;
        } else if (daysUntilTravel >= 3) {
            refundPercentage = 25;
        } else {
            refundPercentage = 0;
        }

        const refundAmount = (booking.total_price * refundPercentage) / 100;

        return {
            daysUntilTravel,
            refundPercentage,
            refundAmount
        };
    };

    const refundInfo = calculateRefund();

    const handleCancel = async () => {
        try {
            setLoading(true);
            setError('');

            const result = await cancelBooking(booking.booking_id, reason);

            if (result.success) {
                // Show success with refund details
                const refundMsg = result.refund
                    ? `Refund: $${result.refund.amount.toFixed(2)} (${result.refund.percentage}% - ${result.refund.daysUntilTravel} days until travel)`
                    : '';

                onSuccess({
                    ...result,
                    message: `${result.message}. ${refundMsg}`
                });
                onClose();
            } else {
                setError(result.message || 'Failed to cancel booking');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while cancelling the booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertTriangle size={20} color="#f59e0b" />
                        <h2>Cancel Booking</h2>
                    </div>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="cancel-booking-info" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.125rem' }}>{booking.package_name}</h3>
                        <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>Travel Date: {new Date(booking.travel_date).toLocaleDateString()}</p>
                        <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>Total Price: ${booking.total_price}</p>
                    </div>

                    <div className="cancel-refund-info" style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Refund Information</h4>
                        <div className="refund-details" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.75rem', padding: '1.25rem' }}>
                            <div className="refund-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span style={{ color: '#64748b' }}>Days until travel:</span>
                                <strong>{refundInfo.daysUntilTravel} days</strong>
                            </div>
                            <div className="refund-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span style={{ color: '#64748b' }}>Refund percentage:</span>
                                <strong style={{ color: refundInfo.refundPercentage > 0 ? '#10b981' : '#dc2626' }}>
                                    {refundInfo.refundPercentage}%
                                </strong>
                            </div>
                            <div className="refund-row refund-total" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0 0', marginTop: '0.5rem', borderTop: '2px solid #3b82f6' }}>
                                <span style={{ fontWeight: '600' }}>Refund amount:</span>
                                <strong style={{ fontSize: '1.25rem', color: '#3b82f6' }}>${refundInfo.refundAmount.toFixed(2)}</strong>
                            </div>
                        </div>

                        <div className="cancellation-policy" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '1rem', marginTop: '1.5rem' }}>
                            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#92400e' }}>Cancellation Policy:</h5>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#78350f' }}>
                                <li>30+ days: 100% refund</li>
                                <li>14-29 days: 75% refund</li>
                                <li>7-13 days: 50% refund</li>
                                <li>3-6 days: 25% refund</li>
                                <li>Less than 3 days: No refund</li>
                            </ul>
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label className="modal-label" htmlFor="cancel-reason">Reason for cancellation (optional):</label>
                        <textarea
                            id="cancel-reason"
                            className="modal-input"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please let us know why you're cancelling..."
                            rows={4}
                        />
                    </div>

                    {error && (
                        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Keep Booking
                    </button>
                    <button
                        onClick={handleCancel}
                        className="btn btn-danger"
                        disabled={loading}
                    >
                        {loading ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CancelBookingModal;
