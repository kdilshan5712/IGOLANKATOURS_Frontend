import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Shield, UserPlus, Trash2, AlertCircle } from 'lucide-react';
import './AdminManagement.css';

const AdminManagementPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const result = await adminAPI.getAllAdmins(token);
    
    if (result.success) {
      setAdmins(result.admins || []);
    } else {
      setError(result.message || 'Failed to load admins');
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchAdmins();
    })();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    const token = localStorage.getItem('token');
    const result = await adminAPI.createAdmin(token, formData);

    setSubmitting(false);

    if (result.success) {
      setFormSuccess('Admin created successfully!');
      setFormData({ email: '', password: '', full_name: '' });
      setShowCreateForm(false);
      fetchAdmins(); // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => setFormSuccess(''), 3000);
    } else {
      setFormError(result.message || 'Failed to create admin');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1>Admin Management</h1>
          <p>Manage administrator accounts</p>
        </div>
        <button 
          className="btn-create-admin"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <UserPlus size={20} />
          {showCreateForm ? 'Cancel' : 'Create New Admin'}
        </button>
      </div>

      {formSuccess && (
        <div className="alert alert-success">
          <AlertCircle size={20} />
          {formSuccess}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="create-admin-form">
          <h2>Create New Admin</h2>
          <form onSubmit={handleCreateAdmin}>
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="full_name">Full Name (Optional)</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>

            {formError && (
              <div className="form-error">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ email: '', password: '', full_name: '' });
                  setFormError('');
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="admins-list-section">
        <h2>All Administrators ({admins.length})</h2>
        
        {loading ? (
          <div className="loading-state">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} />
            <p>No admin accounts found</p>
          </div>
        ) : (
          <div className="admins-table-container">
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Status</th>
                  <th>Email Verified</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.user_id}>
                    <td>
                      <div className="admin-email">
                        <Shield size={16} />
                        {admin.email}
                      </div>
                    </td>
                    <td>{admin.full_name || '—'}</td>
                    <td>
                      <span className={`status-badge status-${admin.status}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td>
                      <span className={`verified-badge ${admin.email_verified ? 'verified' : 'unverified'}`}>
                        {admin.email_verified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </td>
                    <td>{formatDate(admin.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagementPage;
