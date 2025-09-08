import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const BiasAnalysis = ({ candidateId, onClose }) => {
  const [biasData, setBiasData] = useState(null);
  const [blindResume, setBlindResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('analysis'); // 'analysis' or 'blind'
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBiasAnalysis();
  }, [candidateId]);

  const fetchBiasAnalysis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/api/bias-analysis/${candidateId}`);
      setBiasData(response.data);
    } catch (err) {
      setError('Failed to load bias analysis');
      console.error('Bias analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlindResume = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/blind-resume/${candidateId}`);
      setBlindResume(response.data);
    } catch (err) {
      setError('Failed to load blind resume');
      console.error('Blind resume error:', err);
    }
  };

  const handleViewBlindResume = () => {
    if (!blindResume) {
      fetchBlindResume();
    }
    setViewMode('blind');
  };

  const getBiasColor = (score) => {
    if (score <= 20) return 'text-success';
    if (score <= 40) return 'text-warning';
    return 'text-danger';
  };

  const getBiasBadge = (score) => {
    if (score <= 20) return 'success';
    if (score <= 40) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Analyzing bias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5>Error</h5>
        <p>{error}</p>
        <button className="btn btn-outline-danger btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  if (!biasData) return null;

  const { bias_analysis, removed_personal_info, blind_resume_available } = biasData;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">
              <i className="bi bi-shield-check me-2"></i>
              Bias Detection & Fair Screening Analysis
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Navigation Tabs */}
            <div className="mb-4">
              <nav>
                <div className="nav nav-tabs" id="bias-nav" role="tablist">
                  <button
                    className={`nav-link ${viewMode === 'analysis' ? 'active' : ''}`}
                    onClick={() => setViewMode('analysis')}
                  >
                    <i className="bi bi-graph-up me-1"></i>
                    Bias Analysis
                  </button>
                  {blind_resume_available && (
                    <button
                      className={`nav-link ${viewMode === 'blind' ? 'active' : ''}`}
                      onClick={handleViewBlindResume}
                    >
                      <i className="bi bi-eye-slash me-1"></i>
                      Blind Resume
                    </button>
                  )}
                </div>
              </nav>
            </div>

            {viewMode === 'analysis' && (
              <div>
                {/* Overall Bias Score */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <h3 className={`mb-2 ${getBiasColor(bias_analysis.overall_bias_score)}`}>
                          {bias_analysis.overall_bias_score.toFixed(1)}%
                        </h3>
                        <h6 className="card-title">Overall Bias Score</h6>
                        <span className={`badge bg-${getBiasBadge(bias_analysis.overall_bias_score)}`}>
                          {bias_analysis.overall_bias_score <= 20 ? 'Low Bias' :
                           bias_analysis.overall_bias_score <= 40 ? 'Medium Bias' : 'High Bias'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-success">
                      <div className="card-body text-center">
                        <h3 className="text-success mb-2">
                          {bias_analysis.bias_free_score.toFixed(1)}%
                        </h3>
                        <h6 className="card-title">Fair Screening Score</h6>
                        <small className="text-muted">Higher is better</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Bias Breakdown */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Gender Bias</h6>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${bias_analysis.gender_bias.score}%` }}
                      >
                        {bias_analysis.gender_bias.score.toFixed(1)}%
                      </div>
                    </div>
                    <small className="text-muted">
                      Male terms: {bias_analysis.gender_bias.male_terms} |
                      Female terms: {bias_analysis.gender_bias.female_terms} |
                      Neutral terms: {bias_analysis.gender_bias.neutral_terms}
                    </small>
                  </div>

                  <div className="col-md-6">
                    <h6>Age Bias</h6>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar bg-warning"
                        style={{ width: `${bias_analysis.age_bias.score}%` }}
                      >
                        {bias_analysis.age_bias.score.toFixed(1)}%
                      </div>
                    </div>
                    <small className="text-muted">
                      Age indicators: {bias_analysis.age_bias.age_indicators}
                    </small>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Location Bias</h6>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar bg-info"
                        style={{ width: `${bias_analysis.location_bias.score}%` }}
                      >
                        {bias_analysis.location_bias.score.toFixed(1)}%
                      </div>
                    </div>
                    <small className="text-muted">
                      Location indicators: {bias_analysis.location_bias.location_indicators}
                    </small>
                  </div>

                  <div className="col-md-6">
                    <h6>Education Bias</h6>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar bg-secondary"
                        style={{ width: `${bias_analysis.education_bias.score}%` }}
                      >
                        {bias_analysis.education_bias.score.toFixed(1)}%
                      </div>
                    </div>
                    <small className="text-muted">
                      Education indicators: {bias_analysis.education_bias.education_indicators}
                    </small>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="card border-warning mb-4">
                  <div className="card-header bg-warning text-dark">
                    <h6 className="mb-0">
                      <i className="bi bi-lightbulb me-2"></i>
                      Bias Mitigation Recommendations
                    </h6>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled">
                      {bias_analysis.bias_recommendations.map((rec, index) => (
                        <li key={index} className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Removed Personal Information */}
                {removed_personal_info && Object.keys(removed_personal_info).some(key => removed_personal_info[key].length > 0) && (
                  <div className="card border-info">
                    <div className="card-header bg-info text-white">
                      <h6 className="mb-0">
                        <i className="bi bi-person-dash me-2"></i>
                        Personal Information Removed for Fair Screening
                      </h6>
                    </div>
                    <div className="card-body">
                      {removed_personal_info.names && removed_personal_info.names.length > 0 && (
                        <p><strong>Names:</strong> {removed_personal_info.names.join(', ')}</p>
                      )}
                      {removed_personal_info.emails && removed_personal_info.emails.length > 0 && (
                        <p><strong>Emails:</strong> {removed_personal_info.emails.join(', ')}</p>
                      )}
                      {removed_personal_info.phones && removed_personal_info.phones.length > 0 && (
                        <p><strong>Phones:</strong> {removed_personal_info.phones.join(', ')}</p>
                      )}
                      {removed_personal_info.addresses && removed_personal_info.addresses.length > 0 && (
                        <p><strong>Addresses:</strong> {removed_personal_info.addresses.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'blind' && (
              <div>
                {blindResume ? (
                  <div>
                    <div className="alert alert-info mb-4">
                      <h6>
                        <i className="bi bi-eye-slash me-2"></i>
                        Blind Resume View
                      </h6>
                      <p className="mb-0">
                        This version has personal identifiers removed to ensure fair screening.
                        The AI analysis was performed on this anonymized version.
                      </p>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Anonymized Resume Content</h6>
                      </div>
                      <div className="card-body">
                        <div
                          className="border p-3 bg-light"
                          style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.9em',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {blindResume.blind_resume_text}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading blind resume...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {viewMode === 'analysis' && blind_resume_available && (
              <button
                type="button"
                className="btn btn-info"
                onClick={handleViewBlindResume}
              >
                <i className="bi bi-eye-slash me-1"></i>
                View Blind Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasAnalysis;
