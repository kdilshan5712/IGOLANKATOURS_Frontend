/**
 * 🎯 I GO LANKA TOURS - Admin User Management
 *
 * Full CRUD interface for managing system users.
 * Admins can view, filter, create, suspend/activate, and delete user accounts.
 *
 * @module AdminUsersPage
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, User, Trash2, UserPlus, CheckCircle,
  XCircle, AlertTriangle, Search, RefreshCw, X
} from "lucide-react";
import { adminAPI } from "../../services/api";
import "./AdminUsers.css";

function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!token || role !== "admin") { navigate("/login"); return; }
    fetchUsers();
  }, [navigate]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await adminAPI.getAllUsers(token);
      if (result.success) setUsers(result.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoading(userId + newStatus);
    try {
      const result = await adminAPI.updateUserStatus(userId, newStatus, token);
      if (result.success) {
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, status: newStatus } : u));
        showToast(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      } else {
        showToast(result.message || "Failed to update status", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading("delete-" + deleteTarget.user_id);
    try {
      const result = await adminAPI.deleteUser(deleteTarget.user_id, token);
      if (result.success) {
        setUsers(prev => prev.filter(u => u.user_id !== deleteTarget.user_id));
        showToast("User deleted successfully");
      } else {
        showToast(result.message || "Failed to delete user", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.email || !createForm.password) {
      setCreateError("Email and password are required");
      return;
    }
    setCreateLoading(true);
    try {
      const result = await adminAPI.createUser(createForm, token);
      if (result.success) {
        showToast("User created successfully");
        setShowCreateModal(false);
        setCreateForm({ email: "", password: "", full_name: "", phone: "" });
        fetchUsers();
      } else {
        setCreateError(result.message || "Failed to create user");
      }
    } catch (err) {
      setCreateError("An error occurred. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filter === "all" || user.role === filter;
    const searchLower = search.toLowerCase();
    const matchesSearch = !search ||
      (user.email || "").toLowerCase().includes(searchLower) ||
      (user.full_name || "").toLowerCase().includes(searchLower);
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-users-loading">
          <RefreshCw size={24} className="spin-icon" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* Toast Notification */}
      {toast && (
        <div className={`admin-users-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage system users — create, activate, suspend, or delete accounts</p>
        </div>
        <button className="admin-users-add-btn" onClick={() => setShowCreateModal(true)}>
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Search + Filters */}
      <div className="admin-users-toolbar">
        <div className="admin-users-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
        <div className="users-filters">
          {["all", "tourist", "guide", "admin"].map(role => (
            <button
              key={role}
              className={filter === role ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}s
              <span className="count-badge">
                {role === "all" ? users.length : users.filter(u => u.role === role).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Bookings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="8" className="no-data">No users found</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.user_id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {user.full_name?.charAt(0).toUpperCase() || <User size={16} />}
                      </div>
                      <span className="user-name">{user.full_name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="text-secondary">{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === "admin" && <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status || "active"}`}>
                      {user.status || "active"}
                    </span>
                  </td>
                  <td>
                    {user.email_verified
                      ? <span className="verified-badge">Verified</span>
                      : <span className="unverified-badge">Unverified</span>}
                  </td>
                  <td className="text-secondary">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="text-center font-medium">{user.booking_count || 0}</td>
                  <td>
                    <div className="admin-users-actions">
                      {user.role !== "admin" && (
                        <>
                          {user.status !== "active" ? (
                            <button
                              className="action-btn activate"
                              title="Activate"
                              disabled={actionLoading === user.user_id + "active"}
                              onClick={() => handleStatusChange(user.user_id, "active")}
                            >
                              <CheckCircle size={15} />
                            </button>
                          ) : (
                            <button
                              className="action-btn suspend"
                              title="Suspend"
                              disabled={actionLoading === user.user_id + "suspended"}
                              onClick={() => handleStatusChange(user.user_id, "suspended")}
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                          <button
                            className="action-btn delete"
                            title="Delete User"
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2><UserPlus size={20} /> Create New User</h2>
              <button className="admin-modal-close" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="admin-modal-body">
              {createError && (
                <div className="admin-modal-error">
                  <AlertTriangle size={16} /> {createError}
                </div>
              )}
              <div className="admin-modal-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Silva"
                  value={createForm.full_name}
                  onChange={e => setCreateForm(p => ({ ...p, full_name: e.target.value }))}
                />
              </div>
              <div className="admin-modal-field">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  required
                  value={createForm.email}
                  onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="admin-modal-field">
                <label>Temporary Password *</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  required
                  value={createForm.password}
                  onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div className="admin-modal-field">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="+94 77 000 0000"
                  value={createForm.phone}
                  onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-modal-btn cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="admin-modal-btn create" disabled={createLoading}>
                  {createLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header danger">
              <h2><AlertTriangle size={20} /> Confirm Delete</h2>
              <button className="admin-modal-close" onClick={() => setDeleteTarget(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-modal-confirm-text">
                Are you sure you want to permanently delete <strong>{deleteTarget.full_name || deleteTarget.email}</strong>?
                This action <strong>cannot be undone</strong> and will remove all associated data.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-modal-btn cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="admin-modal-btn delete"
                onClick={handleDelete}
                disabled={actionLoading === "delete-" + deleteTarget.user_id}
              >
                {actionLoading === "delete-" + deleteTarget.user_id ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
