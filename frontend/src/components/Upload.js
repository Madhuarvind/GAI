import React, { useState } from 'react';
import axios from 'axios';

const UploadComponent = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setMessage('');
        setIsError(false);
      } else {
        setMessage('Please select a PDF or Word document');
        setIsError(true);
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      setIsError(true);
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage('Resume uploaded and analyzed successfully!');
        setIsError(false);
        onUploadSuccess();
      } else {
        setMessage(response.data.error || 'Upload failed');
        setIsError(true);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.error || 'Failed to upload resume. Please check if the server is running.');
      setIsError(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">📄 Upload Resume</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="resumeFile" className="form-label">
                Select Resume (PDF or Word Document)
              </label>
              <input
                type="file"
                className="form-control"
                id="resumeFile"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <div className="form-text">
                Supported formats: PDF, DOC, DOCX (Max 16MB)
              </div>
            </div>

            {file && (
              <div className="alert alert-info">
                <strong>Selected file:</strong> {file.name}
                <br />
                <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}

            {message && (
              <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`}>
                {message}
              </div>
            )}

            <button
              className="btn btn-primary w-100"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Analyzing with Watson...
                </>
              ) : (
                'Upload & Analyze Resume'
              )}
            </button>

            <div className="mt-3">
              <small className="text-muted">
                The resume will be analyzed using IBM Watsonx.ai to extract key information,
                calculate a relevance score, and categorize the candidate.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;
