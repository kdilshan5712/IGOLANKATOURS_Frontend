import "./AdminHeader.css";

function AdminHeader({ title, subtitle }) {
  const userName = localStorage.getItem("userName") || "Admin";
  const userEmail = localStorage.getItem("userEmail") || "";

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="admin-header-right">
        <div className="admin-user-info">
          <div className="admin-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="admin-user-details">
            <span className="admin-user-name">{userName}</span>
            <span className="admin-user-role">{userEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
