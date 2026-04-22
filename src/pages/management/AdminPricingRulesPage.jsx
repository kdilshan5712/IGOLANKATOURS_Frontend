/**
 * 🎯 I GO LANKA TOURS - Admin Seasonal Pricing Management
 * 
 * Provides an administrative interface for configuring seasonal price 
 * adjustments. Supports date-range rules, geographical coast-based 
 * applicability, and percentage-based price shifts.
 * 
 * @module AdminPricingRulesPage
 */

import React, { useState, useEffect } from "react";
import { Package, Calendar, Edit, Trash2, Plus, X, Save, AlertCircle } from "lucide-react";
import { adminAPI, authAPI } from "../../services/api";
import "./AdminPricingRulesPage.css";

/**
 * AdminPricingRulesPage Component
 * 
 * Orchestrates the management of seasonal price multipliers, synchronizing 
 * period-based rules with the administrative pricing service.
 * 
 * @returns {JSX.Element}
 */
const AdminPricingRulesPage = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [token, setToken] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        start_month: 1,
        start_day: 1,
        end_month: 12,
        end_day: 31,
        percentage: 0,
        coast_type: "all",
        is_active: true
    });

    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" }
    ];

    useEffect(() => {
        const storedToken = authAPI.getToken();
        setToken(storedToken);
        fetchRules(storedToken);
    }, []);

    const fetchRules = async (authToken) => {
        try {
            setLoading(true);
            // @API_CALL: Fetch all seasonal pricing adjustment rules
            const res = await adminAPI.getPricingRules(authToken || token);
            if (res.success) {
                setRules(res.rules);
            } else {
                // @ERROR_HANDLING: API failure response
                setError("Failed to fetch pricing rules");
            }
        } catch (err) {
            // @ERROR_HANDLING: Connection or major failure
            setError("Error loading rules");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (rule = null) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({
                name: rule.name,
                start_month: rule.start_month,
                start_day: rule.start_day,
                end_month: rule.end_month,
                end_day: rule.end_day,
                percentage: rule.percentage,
                coast_type: rule.coast_type || "all",
                is_active: rule.is_active
            });
        } else {
            setEditingRule(null);
            setFormData({
                name: "",
                start_month: 1,
                start_day: 1,
                end_month: 12,
                end_day: 31,
                percentage: 0,
                coast_type: "all",
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRule(null);
        setError(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingRule) {
                // @API_CALL: Update configuration for an existing pricing rule
                res = await adminAPI.updatePricingRule(editingRule.rule_id, formData, token);
            } else {
                // @API_CALL: Create a new seasonal pricing modification rule
                res = await adminAPI.createPricingRule(formData, token);
            }

            if (res.success) {
                fetchRules(token);
                handleCloseModal();
            } else {
                // @ERROR_HANDLING: Service layer validation failure
                alert(res.message || "Failed to save rule");
            }
        } catch (err) {
            // @ERROR_HANDLING: Unexpected network or environment failure
            console.error(err);
            alert("Error saving rule");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this pricing rule?")) {
            try {
                const res = await adminAPI.deletePricingRule(id, token);
                if (res.success) {
                    fetchRules(token);
                } else {
                    alert(res.message);
                }
            } catch (err) {
                console.error(err);
                alert("Error deleting rule");
            }
        }
    };

    const getMonthName = (monthNum) => {
        return months.find(m => m.value === monthNum)?.label || monthNum;
    };

    return (
        <div className="admin-pricing-page">
            <div className="admin-header-actions">
                <h1>Seasonal Pricing Rules</h1>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Add New Rule
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading rules...</div>
            ) : (
                <div className="rules-grid">
                    {rules.length === 0 ? (
                        <div className="no-data">No pricing rules defined.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Period</th>
                                        <th>Coast</th>
                                        <th>Adjustment</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rules.map(rule => (
                                        <tr key={rule.rule_id}>
                                            <td>
                                                <span className="rule-name">{rule.name}</span>
                                            </td>
                                            <td>
                                                {getMonthName(rule.start_month)} {rule.start_day} - {getMonthName(rule.end_month)} {rule.end_day}
                                            </td>
                                            <td>
                                                <span className={`badge coast-${rule.coast_type}`}>
                                                    {rule.coast_type === 'all' ? 'All Coasts' : rule.coast_type === 'south' ? 'South Coast' : 'East Coast'}
                                                </span>
                                            </td>
                                            <td className={rule.percentage > 0 ? "text-danger" : "text-success"}>
                                                {rule.percentage > 0 ? "+" : ""}{rule.percentage}%
                                            </td>
                                            <td>
                                                <span className={`status-badge ${rule.is_active ? 'active' : 'inactive'}`}>
                                                    {rule.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button className="btn-icon" onClick={() => handleOpenModal(rule)}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(rule.rule_id)}>
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
                    <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingRule ? "Edit Pricing Rule" : "New Pricing Rule"}</h2>
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSave} className="modal-form">
                                <div className="modal-form-group">
                                    <label className="modal-label">Rule Name</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Peak Season"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                                        <label className="modal-label">Start Date</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select
                                                className="modal-input"
                                                style={{ flex: 2 }}
                                                value={formData.start_month}
                                                onChange={(e) => setFormData({ ...formData, start_month: parseInt(e.target.value) })}
                                            >
                                                {months.map(m => (
                                                    <option key={m.value} value={m.value}>{m.label}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                className="modal-input"
                                                style={{ flex: 1 }}
                                                min="1"
                                                max="31"
                                                value={formData.start_day}
                                                onChange={(e) => setFormData({ ...formData, start_day: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                                        <label className="modal-label">End Date</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select
                                                className="modal-input"
                                                style={{ flex: 2 }}
                                                value={formData.end_month}
                                                onChange={(e) => setFormData({ ...formData, end_month: parseInt(e.target.value) })}
                                            >
                                                {months.map(m => (
                                                    <option key={m.value} value={m.value}>{m.label}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                className="modal-input"
                                                style={{ flex: 1 }}
                                                min="1"
                                                max="31"
                                                value={formData.end_day}
                                                onChange={(e) => setFormData({ ...formData, end_day: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                                        <label className="modal-label">Price Adjustment (%)</label>
                                        <input
                                            type="number"
                                            className="modal-input"
                                            value={formData.percentage}
                                            onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                                            required
                                        />
                                        <small style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>Use negative for discounts (e.g. -10)</small>
                                    </div>
                                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                                        <label className="modal-label">Coast Applicability</label>
                                        <select
                                            className="modal-input"
                                            value={formData.coast_type}
                                            onChange={(e) => setFormData({ ...formData, coast_type: e.target.value })}
                                        >
                                            <option value="all">All Coasts</option>
                                            <option value="south">South Coast Only</option>
                                            <option value="east">East Coast Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="is_active" style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                                        Is Active
                                    </label>
                                </div>

                                <div className="modal-footer" style={{ padding: '1.5rem 0 0 0', border: 'none', background: 'transparent' }}>
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        <Save size={16} /> Save Rule
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

export default AdminPricingRulesPage;
