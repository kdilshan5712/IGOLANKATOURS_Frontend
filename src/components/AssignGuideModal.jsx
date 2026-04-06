import { useState, useEffect } from "react";
import { X, User, Mail, Phone, Languages, Award, Search } from "lucide-react";
import { adminAPI } from "../services/api";

const AssignGuideModal = ({ booking, onClose, onAssign }) => {
  const [guides, setGuides] = useState([]);
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchAvailableGuides();
  }, []);

  const fetchAvailableGuides = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      console.log(`📍 Fetching approved guides for travel date: ${booking.travel_date}...`);
      
      const formattedDate = booking.travel_date ? new Date(booking.travel_date).toISOString().split('T')[0] : null;
      const data = await adminAPI.getAvailableGuides(token, formattedDate);
      
      if (data.success) {
        console.log(`✅ Loaded ${data.guides?.length || 0} approved guides`);
        setGuides(data.guides || []);
      } else {
        console.error("❌ Failed to fetch guides:", data.message);
        setError(data.message || "Failed to load guides");
        setGuides([]);
      }
    } catch (error) {
      console.error("❌ Error fetching guides:", error);
      setError("Failed to connect to server. Please check your connection.");
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = guides.filter(guide =>
    guide.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedGuideId) {
      alert("Please select a guide");
      return;
    }

    setAssigning(true);
    try {
      await onAssign(booking.booking_id, selectedGuideId, adminNotes);
      onClose();
    } catch (error) {
      console.error("Assignment failed:", error);
      alert("Failed to assign guide. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const selectedGuide = guides.find(g => g.guide_id === selectedGuideId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Tour Guide</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="booking-info" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Reference</p>
              <p style={{ margin: 0, fontWeight: '600' }}>{booking.booking_reference}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Package</p>
              <p style={{ margin: 0, fontWeight: '600' }}>{booking.package_name}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Date</p>
              <p style={{ margin: 0, fontWeight: '600' }}>{new Date(booking.travel_date).toLocaleDateString()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-form-group">
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="modal-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Search guides by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Select Guide *</label>
              {error && (
                <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  ❌ {error}
                </div>
              )}
              
              <div className="guides-list" style={{ maxHeight: '350px', overflowY: 'auto', display: 'grid', gap: '1rem', padding: '2px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading approved guides...</div>
                ) : filteredGuides.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No guides found.</div>
                ) : (
                  filteredGuides.map((guide) => {
                    const isUnavailable = guide.manual_status === 'unavailable';
                    const isBusy = guide.is_busy;
                    const isSelected = selectedGuideId === guide.guide_id;

                    return (
                      <div
                        key={guide.guide_id}
                        onClick={() => !isUnavailable && setSelectedGuideId(guide.guide_id)}
                        style={{
                          padding: '1rem',
                          borderRadius: '0.75rem',
                          border: `2px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                          background: isSelected ? '#f5f3ff' : '#ffffff',
                          cursor: isUnavailable ? 'not-allowed' : 'pointer',
                          opacity: isUnavailable ? 0.6 : 1,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          {guide.profile_photo ? (
                            <img src={guide.profile_photo} alt={guide.full_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: '600' }}>{guide.full_name}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{guide.email}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          {isUnavailable ? (
                            <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase' }}>Unavailable</span>
                          ) : isBusy ? (
                            <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: '700', textTransform: 'uppercase' }}>Busy</span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>Available</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="adminNotes">Admin Notes (Optional)</label>
              <textarea
                id="adminNotes"
                className="modal-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Include special instructions for the guide..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1.5rem 0 0 0', border: 'none', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!selectedGuideId || assigning}
              >
                {assigning ? "Assigning..." : "Assign Guide"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignGuideModal;
