/**
 * 🎯 I GO LANKA TOURS - Admin Audit Logs Page
 * 
 * Provides high-level visibility into administrative actions and system 
 * modifications. Includes sophisticated filtering by action type, target 
 * entity, and date range, with CSV/PDF export capabilities.
 * 
 * @module AdminAuditLogsPage
 */

import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Activity, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Layout,
  Download,
  FileText as FileTextIcon,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import "./AdminAuditLogs.css";
import "../../styles/AdminTheme.css";

/**
 * AdminAuditLogsPage Component
 * 
 * Orchestrates the retrieval and display of system audit trails for administrative review.
 * 
 * @returns {JSX.Element}
 */
const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    actionType: "",
    targetType: "",
    dateFrom: "",
    dateTo: ""
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showChangesModal, setShowChangesModal] = useState(false);
  
  // Export states
  const [exportFormat, setExportFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

    const fetchLogs = async () => {
    setLoading(true);
    try {
      // @API_CALL: Fetch paginated audit logs with active filters
      const response = await adminAPI.getAuditLogs({
        ...filters,
        page: currentPage,
        limit: 20
      });

      if (response.success) {
        setLogs(response.logs);
        setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
      } else {
        // @ERROR_HANDLING: API returned failure state
        setError(response.message || "Failed to load audit logs");
      }
    } catch (err) {
      // @ERROR_HANDLING: Network or server connectivity issue
      console.error("Fetch logs error:", err);
      setError("An error occurred while fetching audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      actionType: "",
      targetType: "",
      dateFrom: "",
      dateTo: ""
    });
    setCurrentPage(1);
    // We need to wait for state update or pass the reset values directly
    setTimeout(() => fetchLogs(), 10);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openChangesModal = (log) => {
    setSelectedLog(log);
    setShowChangesModal(true);
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return '#10b981'; // Green
    if (action.includes('UPDATE')) return '#3b82f6'; // Blue
    if (action.includes('DELETE')) return '#ef4444'; // Red
    if (action.includes('REJECT')) return '#f59e0b'; // Orange
    return '#6b7280';
  };

  const handleExport = async () => {
    setExporting(true);
    setExportMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("token");
      const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      
      // @API_CALL: Generate a physical report of filtered audit trails
      const response = await adminAPI.generateReport(
        "audit", 
        exportFormat, 
        filters.dateFrom || "2000-01-01", 
        filters.dateTo || new Date().toISOString().split('T')[0],
        token
      );

      if (response.success && response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setExportMessage({ text: `Successfully exported to ${exportFormat.toUpperCase()}`, type: "success" });
      } else {
        // @ERROR_HANDLING: Report generation failure at the service layer
        throw new Error(response.message || "Failed to generate report");
      }
    } catch (err) {
      console.error("Export error:", err);
      setExportMessage({ text: err.message || "Failed to export logs", type: "error" });
    } finally {
      setExporting(false);
      setTimeout(() => setExportMessage({ text: "", type: "" }), 5000);
    }
  };

  return (
    <div className="admin-page audit-logs-page">
      <div className="admin-page-header">
        <div>
          <h1>System Audit Logs</h1>
          <p>Track all administrative actions and system changes</p>
        </div>
        <div className="header-actions">
          <div className="export-controls">
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              className="export-select"
              disabled={exporting}
            >
              <option value="csv">CSV Format</option>
              <option value="pdf">PDF Format</option>
            </select>
            <button 
              className="btn btn-success" 
              onClick={handleExport} 
              disabled={exporting || loading}
            >
              {exporting ? <RefreshCw size={14} className="spin" /> : <Download size={14} />}
              Export
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => fetchLogs()} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {exportMessage.text && (
        <div className={`status-badge ${exportMessage.type === 'error' ? 'status-error' : 'status-success'}`} style={{ marginBottom: '1rem', padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeIn 0.3s ease-out' }}>
          {exportMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {exportMessage.text}
        </div>
      )}

      {/* Filters Section */}
      <div className="section-container glass-panel filters-panel">
        <div className="filters-grid">
          <div className="filter-group">
            <label><Activity size={14} /> Action Type</label>
            <select name="actionType" value={filters.actionType} onChange={handleFilterChange}>
              <option value="">All Actions</option>
              <option value="CREATE_PACKAGE">Create Package</option>
              <option value="UPDATE_PACKAGE">Update Package</option>
              <option value="DELETE_PACKAGE">Delete Package</option>
              <option value="UPDATE_BOOKING_STATUS">Update Booking</option>
              <option value="APPROVE_GUIDE">Approve Guide</option>
              <option value="REJECT_GUIDE">Reject Guide</option>
              <option value="UPDATE_PAYOUT_STATUS">Update Payout</option>
              <option value="APPROVE_REVIEW">Approve Review</option>
              <option value="REJECT_REVIEW">Reject Review</option>
            </select>
          </div>

          <div className="filter-group">
            <label><Layout size={14} /> Target Type</label>
            <select name="targetType" value={filters.targetType} onChange={handleFilterChange}>
              <option value="">All Targets</option>
              <option value="PACKAGE">Packages</option>
              <option value="BOOKING">Bookings</option>
              <option value="GUIDE">Guides</option>
              <option value="PAYOUT_REQUEST">Payouts</option>
              <option value="REVIEW">Reviews</option>
              <option value="USER">Users</option>
            </select>
          </div>

          <div className="filter-group">
            <label><Calendar size={14} /> From Date</label>
            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label><Calendar size={14} /> To Date</label>
            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn btn-secondary" onClick={resetFilters}>Reset</button>
          <button className="btn btn-primary" onClick={applyFilters}><Search size={16} /> Filter Results</button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="section-container glass-panel">
        {error && <div className="error-alert">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={48} className="spin" />
            <p>Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} color="#94a3b8" />
            <h3>No Logs Found</h3>
            <p>No administrative actions match your current filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>Target ID</th>
                  <th>Changes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.log_id}>
                    <td className="timestamp-cell">
                      <Calendar size={12} /> {formatDate(log.created_at)}
                    </td>
                    <td>
                      <div className="admin-info">
                        <User size={14} />
                        <div>
                          <span className="admin-name">{log.admin_name}</span>
                          <span className="admin-email">{log.admin_email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="action-badge" 
                        style={{ backgroundColor: `${getActionColor(log.action_type)}15`, color: getActionColor(log.action_type), borderColor: `${getActionColor(log.action_type)}30` }}
                      >
                        {log.action_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="description-cell">{log.description}</td>
                    <td className="id-cell">{log.target_id || 'N/A'}</td>
                    <td>
                      {log.changes && (
                        <button className="btn-icon-label" onClick={() => openChangesModal(log)}>
                          <Eye size={14} /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              className="pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
              className="pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Changes Modal */}
      {showChangesModal && selectedLog && (
        <div className="modal-overlay" onClick={() => setShowChangesModal(false)}>
          <div className="modal-container changes-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Details</h3>
              <button className="close-btn" onClick={() => setShowChangesModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="log-summary">
                <div className="summary-item">
                  <span className="label">Action:</span>
                  <span className="value">{selectedLog.action_type}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Target:</span>
                  <span className="value">{selectedLog.target_type} ({selectedLog.target_id})</span>
                </div>
                <div className="summary-item">
                  <span className="label">IP Address:</span>
                  <span className="value">{selectedLog.ip_address || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="json-container">
                <label>Modification Data (JSON)</label>
                <pre className="json-view">
                  {JSON.stringify(typeof selectedLog.changes === 'string' ? JSON.parse(selectedLog.changes) : selectedLog.changes, null, 2)}
                </pre>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowChangesModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
