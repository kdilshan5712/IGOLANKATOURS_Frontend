import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, MapPin } from "lucide-react";
import { adminAPI } from "../../services/api";
import "./AdminUsers.css";

function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.getAllUsers(token);

      if (result.success) {
        setUsers(result.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage system users and roles</p>
        </div>
      </div>

      <div className="users-filters">
        {["all", "tourist", "guide", "admin"].map((role) => (
          <button
            key={role}
            className={filter === role ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter(role)}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}s
            <span className="count-badge">
              {role === 'all' ? users.length : users.filter(u => u.role === role).length}
            </span>
          </button>
        ))}
      </div>

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
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {user.full_name?.charAt(0).toUpperCase() || <User size={16} />}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.full_name || "N/A"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-secondary">{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' && <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status || 'active'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td>
                    {user.email_verified ? (
                      <span className="verified-badge">Verified</span>
                    ) : (
                      <span className="unverified-badge">Unverified</span>
                    )}
                  </td>
                  <td className="text-secondary">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="text-center font-medium">{user.booking_count || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsersPage;
