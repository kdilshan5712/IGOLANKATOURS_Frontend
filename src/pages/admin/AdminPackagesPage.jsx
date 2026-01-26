import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import "./AdminPackages.css";

function AdminPackagesPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Cultural",
    budget: "mid",
    hotel: "3-star",
    rating: "4.5",
    image: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }

    fetchPackages();
  }, [navigate]);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.getAllPackages(token);
      
      if (result.success) {
        setPackages(result.packages || []);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        category: pkg.category,
        budget: pkg.budget,
        hotel: pkg.hotel || "3-star",
        rating: pkg.rating || "4.5",
        image: pkg.image || ""
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "Cultural",
        budget: "mid",
        hotel: "3-star",
        rating: "4.5",
        image: ""
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackage(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let result;
      if (editingPackage) {
        result = await adminAPI.updatePackage(editingPackage.package_id, formData, token);
      } else {
        result = await adminAPI.createPackage(formData, token);
      }

      if (result.success) {
        await fetchPackages();
        handleCloseModal();
      } else {
        alert(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Failed to save package");
    }
  };

  const handleDelete = async (packageId) => {
    if (!window.confirm("Are you sure you want to delete this package?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const result = await adminAPI.deletePackage(packageId, token);
      if (result.success) {
        await fetchPackages();
      } else {
        alert(result.message || "Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package");
    }
  };

  const handleToggleStatus = async (packageId, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      const result = await adminAPI.updatePackage(
        packageId,
        { is_active: !currentStatus },
        token
      );
      if (result.success) {
        await fetchPackages();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading packages...</div>
    </div>
  );
  }

  return (
    <div className="admin-page">
          <div className="packages-header">
            <h2>All Packages ({packages.length})</h2>
            <button onClick={() => handleOpenModal()} className="btn-primary">
              + Add New Package
            </button>
          </div>

          <div className="packages-table-container">
            <table className="packages-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.package_id}>
                    <td className="package-name-cell">
                      <div className="package-info">
                        {pkg.image && (
                          <img src={pkg.image} alt={pkg.name} className="package-thumb" />
                        )}
                        <span>{pkg.name}</span>
                      </div>
                    </td>
                    <td>{pkg.category}</td>
                    <td>
                      <span className={`badge badge-${pkg.budget}`}>
                        {pkg.budget}
                      </span>
                    </td>
                    <td>{pkg.duration}</td>
                    <td className="price-cell">${pkg.price}</td>
                    <td>⭐ {pkg.rating}</td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={pkg.is_active}
                          onChange={() => handleToggleStatus(pkg.package_id, pkg.is_active)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleOpenModal(pkg)}
                          className="btn-edit"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.package_id)}
                          className="btn-delete"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPackage ? "Edit Package" : "Add New Package"}</h2>
              <button onClick={handleCloseModal} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="package-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Package Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 7 Days"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="Cultural">Cultural</option>
                    <option value="Beach">Beach</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Budget Level *</label>
                  <select name="budget" value={formData.budget} onChange={handleChange}>
                    <option value="budget">Budget</option>
                    <option value="mid">Mid-Range</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hotel Level</label>
                  <input
                    type="text"
                    name="hotel"
                    value={formData.hotel}
                    onChange={handleChange}
                    placeholder="e.g., 4-star"
                  />
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <small>Enter Unsplash or Supabase Storage URL</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingPackage ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPackagesPage;
