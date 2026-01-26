import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { guideAPI } from "../../services/api";
import "./GuideDocuments.css";

const GuideDocumentsPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("license");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a document file");
      return;
    }

    if (!token) {
      setError("Authentication required. Please register first.");
      navigate("/guide/register");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("document_type", docType);

      const response = await guideAPI.uploadDocuments(formData, token);

      if (response.success) {
        setSuccess(`${docType} uploaded successfully!`);
        setUploadedDocs([...uploadedDocs, { document_type: docType, verified: false }]);
        setFile(null);
        setDocType("license");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(response.message || "Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (uploadedDocs.length > 0) {
      navigate("/guide/pending");
    } else {
      setError("Please upload at least one document before continuing.");
    }
  };

  return (
    <main className="guide-documents-page">
      <div className="guide-documents-container">
        <div className="guide-documents-card">
          <div className="guide-documents-header">
            <h1 className="guide-documents-title">Upload Verification Documents</h1>
            <p className="guide-documents-subtitle">
              Please upload documents to verify your credentials
            </p>
          </div>

          {error && (
            <div className="guide-documents-alert error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="guide-documents-alert success-alert">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="guide-documents-form">
            <div className="guide-documents-form-group">
              <label className="guide-documents-label">Document Type *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="guide-documents-select"
              >
                <option value="license">Tour Guide License</option>
                <option value="certificate">Certification</option>
                <option value="id_card">ID Card / Passport</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="guide-documents-form-group">
              <label className="guide-documents-label">Upload Document *</label>
              <div className="guide-documents-upload">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="guide-documents-file-input"
                />
                <div className="guide-documents-upload-area">
                  <Upload size={32} />
                  <p>
                    {file ? file.name : "Click to select or drag and drop"}
                  </p>
                  <small>Supported: PDF, JPG, PNG (Max 10MB)</small>
                </div>
              </div>
            </div>

            <button type="submit" className="guide-documents-button" disabled={loading}>
              {loading ? "Uploading..." : "Upload Document"}
            </button>
          </form>

          {uploadedDocs.length > 0 && (
            <div className="guide-documents-uploaded">
              <h3 className="guide-documents-uploaded-title">Uploaded Documents</h3>
              <div className="guide-documents-list">
                {uploadedDocs.map((doc, idx) => (
                  <div key={idx} className="guide-documents-item">
                    <FileText size={18} />
                    <span>{doc.document_type}</span>
                    <span className="guide-doc-status">Pending Review</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="guide-documents-continue-button"
              >
                Continue to Next Step
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default GuideDocumentsPage;
