import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
          <div className="users-filters">
            <button
              className={filter === "all" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("all")}
            >
              All Users ({users.length})
            </button>
            <button
              className={filter === "tourist" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("tourist")}
            >
              Tourists ({users.filter(u => u.role === "tourist").length})
            </button>
            <button
              className={filter === "guide" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("guide")}
            >
              Guides ({users.filter(u => u.role === "guide").length})
            </button>
            <button
              className={filter === "admin" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("admin")}
            >
              Admins ({users.filter(u => u.role === "admin").length})
            </button>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>EMAIL VERIFIED</th>
                  <th>JOINED</th>
                  <th>BOOKINGS</th>
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
                            {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.full_name || "N/A"}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
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
                          <span className="verified">✓ Verified</span>
                        ) : (
                          <span className="not-verified">✕ Not Verified</span>
                        )}
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="bookings-count">{user.booking_count || 0}</td>
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
