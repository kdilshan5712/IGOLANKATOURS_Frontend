import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Edit2, Star, Check, X } from 'lucide-react';
import { galleryAPI } from '../../services/api';
import './AdminGalleryPage.css';

const AdminGalleryPage = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    image: null,
    title: '',
    description: '',
    category: 'Nature'
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    is_featured: false,
    status: 'active'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all'
  });
  const [stats, setStats] = useState({
    total_images: 0,
    active_images: 0,
    featured_images: 0,
    total_categories: 0
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  // Fetch gallery images
  const fetchGallery = async () => {
    try {
      setLoading(true);
      const filtersParams = {};
      if (filters.category !== 'all') filtersParams.category = filters.category;
      if (filters.status !== 'all') filtersParams.status = filters.status;

      const result = await galleryAPI.getAdminAll(token, filtersParams);

      if (!result.success) throw new Error(result.message || 'Failed to fetch gallery');
      setGallery(result.gallery || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const result = await galleryAPI.getCategories();
      if (!result.success) throw new Error(result.message || 'Failed to fetch categories');
      setCategories(result.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const result = await galleryAPI.getStats(token);
      if (!result.success) throw new Error(result.message || 'Failed to fetch stats');
      setStats(result.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGallery();
      fetchCategories();
      fetchStats();
    }
  }, [filters, token]);

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload form submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!uploadForm.image || !uploadForm.title || !uploadForm.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', uploadForm.image);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);

      const result = await galleryAPI.uploadImage(token, formData);

      if (!result.success) throw new Error(result.message || 'Upload failed');

      setSuccess('Image uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({ image: null, title: '', description: '', category: 'Nature' });
      setImagePreview(null);
      fetchGallery();
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const result = await galleryAPI.updateImage(token, editingImage.gallery_id, editForm);

      if (!result.success) throw new Error(result.message || 'Update failed');

      setSuccess('Image updated successfully!');
      setShowEditModal(false);
      setEditingImage(null);
      fetchGallery();
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (galleryId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setLoading(true);
      const result = await galleryAPI.deleteImage(token, galleryId);

      if (!result.success) throw new Error(result.message || 'Delete failed');

      setSuccess('Image deleted successfully!');
      fetchGallery();
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle featured toggle
  const handleToggleFeatured = async (image) => {
    try {
      setLoading(true);
      const result = await galleryAPI.updateImage(token, image.gallery_id, { is_featured: !image.is_featured });

      if (!result.success) throw new Error(result.message || 'Update failed');

      fetchGallery();
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (image) => {
    setEditingImage(image);
    setEditForm({
      title: image.title,
      description: image.description || '',
      category: image.category,
      is_featured: image.is_featured,
      status: image.status
    });
    setShowEditModal(true);
  };

  return (
    <div className="admin-gallery-page">
      <div className="gallery-header">
        <div className="header-content">
          <h1>🖼️ Gallery Management</h1>
          <p>Manage and organize tour gallery images</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <Plus size={20} /> Upload Image
        </button>
      </div>

      {/* Statistics */}
      <div className="gallery-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.total_images}</h3>
            <p>Total Images</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.active_images}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{stats.featured_images}</h3>
            <p>Featured</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📂</div>
          <div className="stat-info">
            <h3>{stats.total_categories}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <X size={20} /> {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <Check size={20} /> {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className="gallery-filters">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {loading ? (
          <div className="loading">Loading gallery...</div>
        ) : gallery.length > 0 ? (
          gallery.map((image) => (
            <div key={image.gallery_id} className="gallery-item">
              <div className="item-image">
                <img src={image.image_url} alt={image.title} />
                {image.is_featured && <div className="featured-badge">⭐ Featured</div>}
              </div>
              <div className="item-info">
                <h3>{image.title}</h3>
                <p className="category">{image.category}</p>
                <p className="description">{image.description}</p>
                <div className="item-meta">
                  <span className={`status ${image.status}`}>{image.status}</span>
                  <span className="date">{new Date(image.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="item-actions">
                <button
                  className="btn-icon featured-btn"
                  onClick={() => handleToggleFeatured(image)}
                  title={image.is_featured ? 'Remove from featured' : 'Add to featured'}
                >
                  <Star size={20} fill={image.is_featured ? 'currentColor' : 'none'} />
                </button>
                <button
                  className="btn-icon edit-btn"
                  onClick={() => openEditModal(image)}
                  title="Edit"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  className="btn-icon delete-btn"
                  onClick={() => handleDelete(image.gallery_id)}
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-items">
            <ImageIcon size={48} />
            <p>No gallery images found. Start by uploading an image!</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload New Image</h2>
              <button
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="upload-form">
              {/* Image Preview */}
              <div className="upload-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <div className="preview-placeholder">
                    <ImageIcon size={48} />
                    <p>Image preview will appear here</p>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="form-group">
                <label>Image File *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  required
                  className="file-input"
                />
                <small>Accepted formats: JPEG, PNG, WebP (Max 10MB)</small>
              </div>

              {/* Title */}
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g., Sigiriya Rock Fortress"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Additional details about the image..."
                  rows="3"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  required
                >
                  <option value="Nature">Nature</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Beach">Beach</option>
                  <option value="Wildlife">Wildlife</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingImage && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Image</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <div className="edit-preview">
              <img src={editingImage.image_url} alt={editingImage.title} />
            </div>

            <form onSubmit={handleEditSubmit} className="edit-form">
              {/* Title */}
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="3"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  <option value="Nature">Nature</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Beach">Beach</option>
                  <option value="Wildlife">Wildlife</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Featured Checkbox */}
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="featured"
                  checked={editForm.is_featured}
                  onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                />
                <label htmlFor="featured">Featured Image</label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGalleryPage;
