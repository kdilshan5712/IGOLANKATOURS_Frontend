import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRejectionDetails, resubmitApplication, uploadGuideDocuments } from '../../services/api';
import './GuideDocuments.css';

const GuideRejectedPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [rejection, setRejection] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploading, setUploading] = useState(false);
    const [resubmitting, setResubmitting] = useState(false);

    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('license');

    useEffect(() => {
        fetchRejectionDetails();
    }, []);

    const fetchRejectionDetails = async () => {
        try {
            setLoading(true);
            const response = await getRejectionDetails();

            if (response.data.success) {
                setRejection(response.data.rejection);
            } else {
                setError('Failed to load rejection details');
            }
        } catch (err) {
            console.error('Error fetching rejection details:', err);
            setError(err.response?.data?.message || 'Failed to load rejection details');

            // If not actually rejected, redirect to dashboard
            if (err.response?.status === 400) {
                navigate('/guide/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG, PNG, and PDF files are allowed');
                return;
            }

            setSelectedFile(file);
            setError('');
        }
    };

    const handleUploadDocument = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        if (!documentType) {
            setError('Please select a document type');
            return;
        }

        try {
            setUploading(true);
            setError('');

            const formData = new FormData();
            formData.append('document', selectedFile);
            formData.append('document_type', documentType);

            const response = await uploadGuideDocuments(formData);

            if (response.data) {
                setSuccess(`${documentType} uploaded successfully!`);
                setUploadedDocs([...uploadedDocs, {
                    type: documentType,
                    name: selectedFile.name,
                    uploadedAt: new Date()
                }]);

                // Reset form
                setSelectedFile(null);
                setDocumentType('license');
                document.getElementById('file-input').value = '';
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleResubmit = async () => {
        if (uploadedDocs.length === 0) {
            setError('Please upload at least one corrected document before resubmitting');
            return;
        }

        if (!window.confirm('Are you sure you want to resubmit your application? Your status will change to pending review.')) {
            return;
        }

        try {
            setResubmitting(true);
            setError('');

            const response = await resubmitApplication();

            if (response.data.success) {
                setSuccess('Application resubmitted successfully! Redirecting to pending page...');

                // Redirect to pending page after 2 seconds
                setTimeout(() => {
                    navigate('/guide/pending');
                }, 2000);
            }
        } catch (err) {
            console.error('Resubmit error:', err);
            setError(err.response?.data?.message || 'Failed to resubmit application');
        } finally {
            setResubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="guide-documents-page">
                <div className="glass-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading rejection details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="guide-documents-page">
            <div className="glass-container">
                {/* Header */}
                <div className="page-header">
                    <h1>Application Rejected</h1>
                    <p className="subtitle">Your guide application was not approved. Please review the reason and resubmit with corrected documents.</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✅</span>
                        <span>{success}</span>
                    </div>
                )}

                {/* Rejection Details */}
                {rejection && (
                    <div className="rejection-notice">
                        <div className="notice-header">
                            <span className="notice-icon">❌</span>
                            <h2>Rejection Reason</h2>
                        </div>
                        <div className="notice-content">
                            <p className="rejection-reason">{rejection.reason}</p>
                            <div className="rejection-meta">
                                <span>Rejected on: {new Date(rejection.rejectedAt).toLocaleDateString()}</span>
                                <span>Rejected by: {rejection.rejectedBy}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resubmission Instructions */}
                <div className="info-box">
                    <h3>📝 How to Resubmit</h3>
                    <ol>
                        <li>Review the rejection reason above</li>
                        <li>Upload corrected documents that address the issues</li>
                        <li>Click "Resubmit Application" when ready</li>
                        <li>Wait for admin review (2-3 business days)</li>
                    </ol>
                </div>

                {/* Document Upload Section */}
                <div className="upload-section">
                    <h2>Upload Corrected Documents</h2>
                    <p>Upload new documents that address the rejection reason</p>

                    <div className="upload-form">
                        <div className="form-group">
                            <label htmlFor="document-type">Document Type</label>
                            <select
                                id="document-type"
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="form-select"
                            >
                                <option value="license">Tour Guide License</option>
                                <option value="certificate">Certificate</option>
                                <option value="id_card">ID Card</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="file-input">Select File</label>
                            <input
                                id="file-input"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={handleFileSelect}
                                className="form-input"
                            />
                            {selectedFile && (
                                <p className="file-info">
                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleUploadDocument}
                            disabled={!selectedFile || uploading}
                            className="btn btn-primary"
                        >
                            {uploading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>

                    {/* Uploaded Documents List */}
                    {uploadedDocs.length > 0 && (
                        <div className="uploaded-docs-list">
                            <h3>Uploaded Documents ({uploadedDocs.length})</h3>
                            <ul>
                                {uploadedDocs.map((doc, index) => (
                                    <li key={index} className="doc-item">
                                        <span className="doc-icon">📄</span>
                                        <div className="doc-info">
                                            <strong>{doc.type}</strong>
                                            <span className="doc-name">{doc.name}</span>
                                        </div>
                                        <span className="doc-status">✅ Uploaded</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Resubmit Button */}
                <div className="action-section">
                    <button
                        onClick={handleResubmit}
                        disabled={uploadedDocs.length === 0 || resubmitting}
                        className="btn btn-success btn-large"
                    >
                        {resubmitting ? 'Resubmitting...' : 'Resubmit Application'}
                    </button>
                    <p className="action-note">
                        {uploadedDocs.length === 0
                            ? 'Upload at least one corrected document to resubmit'
                            : 'Your application will be reviewed by our admin team'}
                    </p>
                </div>

                {/* Support Section */}
                <div className="support-box">
                    <h3>Need Help?</h3>
                    <p>If you have questions about the rejection or need clarification, contact our support team:</p>
                    <a href="mailto:tours.igolanka@gmail.com" className="btn btn-secondary">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default GuideRejectedPage;
