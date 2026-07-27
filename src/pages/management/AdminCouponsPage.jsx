/**
 * 🎯 I GO LANKA TOURS - Admin Coupons Management
 * 
 * Provides a specialized interface for administrators to manage promotional 
 * codes. Supports percentage and fixed discounts, expiration logic, usage 
 * limitations, and active/inactive toggling.
 * 
 * @module AdminCouponsPage
 */

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Edit, Trash2, X, Save, AlertCircle, Calendar, Hash, DollarSign } from "lucide-react";
import { adminAPI, authAPI } from "../../services/api";
import "./AdminCouponsPage.css";

/**
 * AdminCouponsPage Component
 * 
 * Orchestrates the CRUD operations for promotional coupons, synchronizing 
 * with the administrative API and managing modal-driven forms.
 * 
 * @returns {JSX.Element}
 */
const AdminCouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [token, setToken] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_amount: "0",
        max_discount: "",
        expiry_date: "",
        usage_limit: "",
        is_active: true
    });

    useEffect(() => {
        const storedToken = authAPI.getToken();
        setToken(storedToken);
        fetchCoupons(storedToken);
    }, []);

    const fetchCoupons = async (authToken) => {
        try {
            setLoading(true);
            // @API_CALL: Fetch all configured promotional coupons
            const res = await adminAPI.getAllCoupons(authToken || token);
            if (res.success) {
                setCoupons(res.coupons);
            } else {
                // @ERROR_HANDLING: API returned failure state for coupon retrieval
                setError("Failed to fetch coupons");
            }
        } catch (err) {
            // @ERROR_HANDLING: Network or endpoint connectivity issue
            setError("Error loading coupons");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                min_amount: coupon.min_amount || "0",
                max_discount: coupon.max_discount || "",
                expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : "",
                usage_limit: coupon.usage_limit || "",
                is_active: coupon.is_active
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: "",
                discount_type: "percentage",
                discount_value: "",
                min_amount: "0",
                max_discount: "",
                expiry_date: "",
                usage_limit: "",
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCoupon(null);
        setError(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingCoupon) {
                // @API_CALL: Update existing coupon configuration
                res = await adminAPI.updateCoupon(editingCoupon.coupon_id, formData, token);
            } else {
                // @API_CALL: Create a new promotional coupon
                res = await adminAPI.createCoupon(formData, token);
            }

            if (res.success) {
                fetchCoupons(token);
                handleCloseModal();
            } else {
                // @ERROR_HANDLING: Form submission failed at the service level
                alert(res.message || "Failed to save coupon");
            }
        } catch (err) {
            // @ERROR_HANDLING: Unexpected network or server failure
            console.error(err);
            alert("Error saving coupon");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
            try {
                const res = await adminAPI.deleteCoupon(id, token);
                if (res.success) {
                    fetchCoupons(token);
                } else {
                    alert(res.message);
                }
            } catch (err) {
                console.error(err);
                alert("Error deleting coupon");
            }
        }
    };

    return (
        <div className="admin-coupons-page">
            <div className="admin-page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Ticket size={32} color="var(--admin-primary)" />
                    <div>
                        <h1>Promo Codes & Coupons</h1>
                        <p style={{ margin: '0.25rem 0 0 0' }}>Configure promotional codes, custom discounts, and usage limits</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Create New Coupon
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading coupons...</div>
            ) : (
                <div className="coupons-grid">
                    {coupons.length === 0 ? (
                        <div className="no-data">No active coupons found. Create one to get started!</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Discount</th>
                                        <th>Type</th>
                                        <th>Valid Until</th>
                                        <th>Usage</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map(coupon => (
                                        <tr key={coupon.coupon_id}>
                                            <td>
                                                <span className="coupon-code">{coupon.code}</span>
                                            </td>
                                            <td>
                                                <strong>{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}</strong>
                                            </td>
                                            <td>
                                                <span className={`badge type-${coupon.discount_type}`}>
                                                    {coupon.discount_type}
                                                </span>
                                            </td>
                                            <td>
                                                {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : "Never expires"}
                                            </td>
                                            <td>
                                                {coupon.usage_count} / {coupon.usage_limit || "∞"}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}>
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button className="btn-icon" title="Edit Coupon" onClick={() => handleOpenModal(coupon)}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon delete" title="Delete Coupon" onClick={() => handleDelete(coupon.coupon_id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}</h2>
                            <button className="modal-close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={handleCloseModal}>
                                <X size={24} color="var(--admin-text-secondary)" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSave} className="modal-form">
                                <div className="modal-form-group">
                                    <label className="modal-label">Coupon Code</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="E.g. SUMMER2026"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                        disabled={!!editingCoupon}
                                    />
                                    <small style={{ color: '#64748b' }}>Codes are automatically capitalized.</small>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="modal-form-group">
                                        <label className="modal-label">Discount Type</label>
                                        <select
                                            className="modal-input"
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                            disabled={!!editingCoupon}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div className="modal-form-group">
                                        <label className="modal-label">Discount Value</label>
                                        <input
                                            type="number"
                                            className="modal-input"
                                            placeholder={formData.discount_type === 'percentage' ? "e.g. 10" : "e.g. 50"}
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                            required
                                            disabled={!!editingCoupon}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="modal-form-group">
                                        <label className="modal-label">Min. Booking Amount ($)</label>
                                        <input
                                            type="number"
                                            className="modal-input"
                                            value={formData.min_amount}
                                            onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                                            placeholder="0 for none"
                                        />
                                    </div>
                                    <div className="modal-form-group">
                                        <label className="modal-label">Max Discount Cap ($)</label>
                                        <input
                                            type="number"
                                            className="modal-input"
                                            value={formData.max_discount}
                                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                            placeholder="Leave empty for no cap"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="modal-form-group">
                                        <label className="modal-label">Expiry Date</label>
                                        <input
                                            type="date"
                                            className="modal-input"
                                            value={formData.expiry_date}
                                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-form-group">
                                        <label className="modal-label">Usage Limit</label>
                                        <input
                                            type="number"
                                            className="modal-input"
                                            value={formData.usage_limit}
                                            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                            placeholder="Times it can be used"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="is_active" style={{ cursor: 'pointer', fontWeight: 500, color: 'var(--admin-text-secondary)' }}>Coupon is active</label>
                                </div>

                                <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        <Save size={18} /> {editingCoupon ? "Save Changes" : "Create Coupon"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCouponsPage;
