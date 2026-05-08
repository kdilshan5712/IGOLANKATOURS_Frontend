import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Shield, UserPlus, Trash2, AlertCircle, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import './AdminManagement.css';

const AdminManagementPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin'
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

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
      const token = localStorage.getItem('token');
      if (token) {
        const res = await adminAPI.getProfile(token);
        if (res.success && res.profile) {
          setCurrentUserId(res.profile.user_id);
          setCurrentUserRole(res.profile.role);
        }
      }
      await fetchAdmins();
    })();
  }, []);

  const handleStatusChange = async (adminId, newStatus) => {
    setActionLoading(adminId + newStatus);
    const token = localStorage.getItem('token');
    try {
      const result = await adminAPI.updateAdminStatus(adminId, newStatus, token);
      if (result.success) {
        setAdmins(prev => prev.map(a => a.user_id === adminId ? { ...a, status: newStatus } : a));
        setFormSuccess(`Admin ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        setTimeout(() => setFormSuccess(''), 3000);
      } else {
        setError(result.message || "Failed to update status");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading("delete-" + deleteTarget.user_id);
    const token = localStorage.getItem('token');
    try {
      const result = await adminAPI.deleteAdmin(deleteTarget.user_id, token);
      if (result.success) {
        setAdmins(prev => prev.filter(a => a.user_id !== deleteTarget.user_id));
        setFormSuccess("Admin deleted successfully");
        setTimeout(() => setFormSuccess(''), 3000);
      } else {
        setError(result.message || "Failed to delete admin");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

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
      setFormData({ email: '', password: '', full_name: '', role: 'admin' });
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

            {currentUserRole === 'superadmin' && (
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            )}

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
                  setFormData({ email: '', password: '', full_name: '', role: 'admin' });
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
                  {currentUserRole === 'superadmin' && <th>Actions</th>}
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
                    {currentUserRole === 'superadmin' && (
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {admin.user_id !== currentUserId && (
                            <>
                              {admin.status !== 'active' ? (
                                <button
                                  title="Activate"
                                  disabled={actionLoading === admin.user_id + "active"}
                                  onClick={() => handleStatusChange(admin.user_id, "active")}
                                  style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}
                                >
                                  <CheckCircle size={18} />
                                </button>
                              ) : (
                                <button
                                  title="Suspend"
                                  disabled={actionLoading === admin.user_id + "suspended"}
                                  onClick={() => handleStatusChange(admin.user_id, "suspended")}
                                  style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer' }}
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                              <button
                                title="Delete Admin"
                                onClick={() => setDeleteTarget(admin)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem', marginTop: 0 }}><AlertTriangle size={24} /> Confirm Delete</h2>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{deleteTarget.full_name || deleteTarget.email}</strong>?
              This action <strong>cannot be undone</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button 
                onClick={handleDelete} 
                disabled={actionLoading === "delete-" + deleteTarget.user_id}
                style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                {actionLoading === "delete-" + deleteTarget.user_id ? "Deleting..." : "Delete Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementPage;
