import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Edit, Trash2, X, Save, AlertCircle, Calendar, Image as ImageIcon, Link } from "lucide-react";
import { promotionsAPI, authAPI } from "../../services/api";
import "./AdminCouponsPage.css"; // Reuse existing clean styles

const AdminPromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [token, setToken] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        discount_code: "",
        discount_percentage: 0,
        image_url: "",
        display_style: "banner",
        start_date: "",
        end_date: "",
        is_active: true
    });

    useEffect(() => {
        const storedToken = authAPI.getToken();
        setToken(storedToken);
        fetchPromotions(storedToken);
    }, []);

    const fetchPromotions = async (authToken) => {
        try {
            setLoading(true);
            const res = await promotionsAPI.getAllPromotions(authToken || token);
            if (res.success) {
                setPromotions(res.promotions);
            } else {
                setError("Failed to fetch promotions");
            }
        } catch (err) {
            setError("Error loading promotions");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (promo = null) => {
        if (promo) {
            setEditingPromotion(promo);
            setFormData({
                title: promo.title,
                description: promo.description,
                discount_code: promo.discount_code || "",
                discount_percentage: promo.discount_percentage || 0,
                image_url: promo.image_url || "",
                display_style: promo.display_style || "banner",
                start_date: promo.start_date ? new Date(promo.start_date).toISOString().split('T')[0] : "",
                end_date: promo.end_date ? new Date(promo.end_date).toISOString().split('T')[0] : "",
                is_active: promo.is_active
            });
        } else {
            setEditingPromotion(null);
            setFormData({
                title: "",
                description: "",
                discount_code: "",
                discount_percentage: 0,
                image_url: "",
                display_style: "banner",
                start_date: "",
                end_date: "",
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPromotion(null);
        setError(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingPromotion) {
                res = await promotionsAPI.updatePromotion(editingPromotion.id, formData, token);
            } else {
                res = await promotionsAPI.createPromotion(formData, token);
            }

            if (res.success) {
                fetchPromotions(token);
                handleCloseModal();
            } else {
                alert(res.message || "Failed to save promotion");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving promotion");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this promotion? This action cannot be undone.")) {
            try {
                const res = await promotionsAPI.deletePromotion(id, token);
                if (res.success) {
                    fetchPromotions(token);
                } else {
                    alert(res.message);
                }
            } catch (err) {
                console.error(err);
                alert("Error deleting promotion");
            }
        }
    };

    return (
        <div className="admin-coupons-page">
            <div className="admin-page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Megaphone className="header-icon" />
                    <div>
                        <h1>Promotions & Banners</h1>
                        <p>Manage seasonal announcements, flash sales, and homepage banners.</p>
                    </div>
                </div>
                <button className="primary-btn" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Create Promotion
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {loading ? (
                <div className="loading-spinner">Loading promotions...</div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Style</th>
                                <th>Code</th>
                                <th>Validity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: "center" }}>No promotions found. Create one!</td></tr>
                            ) : (
                                promotions.map(promo => (
                                    <tr key={promo.id}>
                                        <td>
                                            <strong>{promo.title}</strong>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{promo.description.substring(0, 40)}...</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${promo.display_style === 'banner' ? 'badge-blue' : 'badge-purple'}`}>
                                                {promo.display_style.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {promo.discount_percentage > 0 && <span className="badge badge-red" style={{marginRight: '5px'}}>{promo.discount_percentage}% OFF</span>}
                                            {promo.discount_code ? (
                                                <span className="badge badge-yellow">{promo.discount_code}</span>
                                            ) : (promo.discount_percentage === 0 && "-")}
                                        </td>
                                        <td>
                                            <div className="date-info">
                                                {promo.start_date ? new Date(promo.start_date).toLocaleDateString() : "Now"} - 
                                                {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : "Forever"}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${promo.is_active ? "badge-green" : "badge-red"}`}>
                                                {promo.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button className="icon-btn edit" onClick={() => handleOpenModal(promo)} title="Edit Promotion">
                                                <Edit size={18} />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(promo.id)} title="Delete Promotion">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content admin-coupon-modal">
                        <div className="modal-header">
                            <h2>{editingPromotion ? "Edit Promotion" : "Create Promotion"}</h2>
                            <button className="close-btn" onClick={handleCloseModal}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-group">
                                <label>Promotion Title *</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g., Summer Flash Sale!" />
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea 
                                    value={formData.description} 
                                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                    required 
                                    placeholder="e.g., Get 20% off all southern coast tours this weekend!"
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Display Style</label>
                                    <select value={formData.display_style} onChange={e => setFormData({ ...formData, display_style: e.target.value })}>
                                        <option value="banner">Hero Banner (Large)</option>
                                        <option value="marquee">Scrolling Marquee (Top Bar)</option>
                                        <option value="popup">Popup Modal</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Discount Code (Optional)</label>
                                    <div className="input-with-icon">
                                        <Link size={18} />
                                        <input type="text" value={formData.discount_code} onChange={e => setFormData({ ...formData, discount_code: e.target.value })} placeholder="SUMMER20" />
                                    </div>
                                </div>
                                <div className="form-group half-width">
                                    <label>Percentage Discount (0-100)</label>
                                    <div className="input-with-icon">
                                        <input type="number" min="0" max="100" value={formData.discount_percentage} onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })} placeholder="e.g. 20" style={{ paddingLeft: '15px' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Background Image URL (Optional)</label>
                                <div className="input-with-icon">
                                    <ImageIcon size={18} />
                                    <input type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <div className="input-with-icon">
                                        <Calendar size={18} />
                                        <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <div className="input-with-icon">
                                        <Calendar size={18} />
                                        <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                    Promotion is Active
                                </label>
                                <p className="help-text">Inactive promotions will never be shown to customers, regardless of dates.</p>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    <Save size={18} /> {editingPromotion ? "Update Promotion" : "Create Promotion"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromotionsPage;
