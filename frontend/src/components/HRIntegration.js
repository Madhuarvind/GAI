import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HRIntegration = ({ candidateId, candidateData }) => {
  const [supportedSystems, setSupportedSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState('workday');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    fetchSupportedSystems();
  }, []);

  const fetchSupportedSystems = async () => {
    try {
      const response = await axios.get('/api/hr/supported-systems');
      setSupportedSystems(response.data.supported_systems);
    } catch (error) {
      console.error('Error fetching supported systems:', error);
    }
  };

  const handleSendToHR = async () => {
    if (!apiKey || !apiUrl) {
      setMessage('Please provide API key and URL');
      setMessageType('danger');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`/api/hr/send-candidate/${candidateId}`, {
        hr_system: selectedSystem,
        api_key: apiKey,
        api_url: apiUrl
      });

      if (response.data.success) {
        setMessage(`Successfully sent candidate to ${response.data.system}`);
        setMessageType('success');
      } else {
        setMessage(`Failed to send candidate: ${response.data.error}`);
        setMessageType('danger');
      }
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateConnection = async () => {
    if (!apiKey || !apiUrl) {
      setMessage('Please provide API key and URL');
      setMessageType('danger');
      return;
    }

    setLoading(true);
    setConnectionStatus(null);

    try {
      const response = await axios.post('/api/hr/validate-connection', {
        hr_system: selectedSystem,
        api_key: apiKey,
        api_url: apiUrl
      });

      setConnectionStatus(response.data);
      if (response.data.valid) {
        setMessage(`Connection to ${response.data.system} is valid`);
        setMessageType('success');
      } else {
        setMessage(`Connection failed: ${response.data.error}`);
        setMessageType('warning');
      }
    } catch (error) {
      setConnectionStatus({ valid: false, error: error.message });
      setMessage(`Connection validation failed: ${error.message}`);
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/hr/export-candidate/${candidateId}?format=${exportFormat}`, {
        responseType: exportFormat === 'json' ? 'json' : 'blob'
      });

      if (exportFormat === 'json') {
        // Download JSON
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `candidate_${candidateId}_report.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else {
        // Handle PDF/Excel download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `candidate_${candidateId}_report.${exportFormat}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      setMessage(`Candidate data exported as ${exportFormat.toUpperCase()}`);
      setMessageType('success');
    } catch (error) {
      setMessage(`Export failed: ${error.response?.data?.error || error.message}`);
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">HR Systems Integration</h5>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage('')} aria-label="Close"></button>
            </div>
          )}

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">HR System</label>
                <select
                  className="form-select"
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                >
                  {supportedSystems.map(system => (
                    <option key={system} value={system}>
                      {system.charAt(0).toUpperCase() + system.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">API Key</label>
                <input
                  type="password"
                  className="form-control"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">API URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com"
                />
              </div>

              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={handleValidateConnection}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Test Connection
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleSendToHR}
                  disabled={loading || !candidateId}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Send to HR
                </button>
              </div>

              {connectionStatus && (
                <div className={`alert ${connectionStatus.valid ? 'alert-success' : 'alert-danger'}`}>
                  <strong>Connection Status:</strong> {connectionStatus.valid ? 'Valid' : 'Invalid'}
                  {connectionStatus.system && <div>System: {connectionStatus.system}</div>}
                  {connectionStatus.error && <div>Error: {connectionStatus.error}</div>}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Export Candidate Data</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Export Format</label>
                    <select
                      className="form-select"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                    >
                      <option value="json">JSON</option>
                      <option value="pdf">PDF Report</option>
                      <option value="excel">Excel Spreadsheet</option>
                    </select>
                  </div>

                  <button
                    className="btn btn-success w-100"
                    onClick={handleExport}
                    disabled={loading || !candidateId}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    Export as {exportFormat.toUpperCase()}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h6>Supported HR Systems:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {supportedSystems.map(system => (
                    <span key={system} className="badge bg-secondary">
                      {system.charAt(0).toUpperCase() + system.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Summary Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Candidate Summary - {candidateData?.filename}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {candidateData && (
                  <div>
                    <table className="table table-striped">
                      <tbody>
                        <tr>
                          <td><strong>Relevance Score:</strong></td>
                          <td>{candidateData.analysis_result?.relevance_score || 'N/A'}%</td>
                        </tr>
                        <tr>
                          <td><strong>Category:</strong></td>
                          <td>{candidateData.analysis_result?.category || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Years of Experience:</strong></td>
                          <td>{candidateData.analysis_result?.years_experience || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Key Skills:</strong></td>
                          <td>{candidateData.analysis_result?.key_skills?.join(', ') || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Education:</strong></td>
                          <td>{candidateData.analysis_result?.education || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRIntegration;
