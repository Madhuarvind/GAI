import React, { useState, useEffect } from 'react';
import config from '../config';

const ProfileEnrichment = ({ candidateId, onClose }) => {
  const [candidate, setCandidate] = useState(null);
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (candidateId) {
      fetchCandidateDetails();
    }
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/candidates/${candidateId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch candidate details');
      }
      const data = await response.json();
      setCandidate(data);
      setEnrichmentData(data.profile_enrichment);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnrichProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/enrich-profile/${candidateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to enrich profile');
      }

      const result = await response.json();
      setEnrichmentData(result);
      // Refresh candidate data
      await fetchCandidateDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!candidate) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-badge me-2"></i>
              Profile Enrichment - {candidate.filename}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Resume Text Preview */}
            <div className="mb-4">
              <h6>Resume Text Preview</h6>
              <div className="border p-3 bg-light" style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.9em' }}>
                {candidate.resume_text || 'No resume text available'}
              </div>
            </div>

            {/* Enrichment Button */}
            <div className="mb-4 text-center">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleEnrichProfile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enriching Profile...
                  </>
                ) : (
                  <>
                    <i className="bi bi-magic me-2"></i>
                    Enrich Profile
                  </>
                )}
              </button>
              <div className="form-text">
                Extract LinkedIn and GitHub profiles from resume text
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-danger mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Enrichment Results */}
            {enrichmentData && (
              <div>
                <h6 className="mb-3">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Profile Enrichment Results
                </h6>

                {/* LinkedIn Profiles */}
                {enrichmentData.linkedin_profiles && enrichmentData.linkedin_profiles.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-primary">
                      <i className="bi bi-linkedin me-2"></i>
                      LinkedIn Profiles ({enrichmentData.linkedin_profiles.length})
                    </h6>
                    <div className="row">
                      {enrichmentData.linkedin_profiles.map((profile, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">
                                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                  {profile.name || 'LinkedIn Profile'}
                                </a>
                              </h6>
                              <p className="card-text small text-muted mb-2">
                                {profile.headline || 'No headline available'}
                              </p>
                              <div className="d-flex justify-content-between text-sm">
                                <small className="text-muted">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {profile.location || 'Location not specified'}
                                </small>
                                <small className="text-muted">
                                  <i className="bi bi-people me-1"></i>
                                  {profile.connections || 'N/A'} connections
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GitHub Profiles */}
                {enrichmentData.github_profiles && enrichmentData.github_profiles.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-success">
                      <i className="bi bi-github me-2"></i>
                      GitHub Profiles ({enrichmentData.github_profiles.length})
                    </h6>
                    <div className="row">
                      {enrichmentData.github_profiles.map((profile, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">
                                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                  {profile.name || profile.url.split('/').pop()}
                                </a>
                              </h6>
                              <p className="card-text small text-muted mb-2">
                                {profile.bio || 'No bio available'}
                              </p>
                              <div className="d-flex justify-content-between text-sm">
                                <small className="text-muted">
                                  <i className="bi bi-journal-code me-1"></i>
                                  {profile.public_repos || 0} repos
                                </small>
                                <small className="text-muted">
                                  <i className="bi bi-people me-1"></i>
                                  {profile.followers || 0} followers
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Profiles Found */}
                {(!enrichmentData.linkedin_profiles || enrichmentData.linkedin_profiles.length === 0) &&
                 (!enrichmentData.github_profiles || enrichmentData.github_profiles.length === 0) && (
                  <div className="text-center py-4">
                    <div className="text-muted">
                      <i className="bi bi-info-circle fs-1 mb-3"></i>
                      <h6>No profiles found</h6>
                      <p>The resume text doesn't contain LinkedIn or GitHub profile links, or the profiles couldn't be verified.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            {!enrichmentData && !loading && (
              <div className="alert alert-info">
                <h6><i className="bi bi-info-circle me-2"></i>How it works:</h6>
                <ul className="mb-0">
                  <li>The system scans the resume text for LinkedIn and GitHub URLs</li>
                  <li>Extracts profile information from public profiles</li>
                  <li>Validates the profiles and displays the results</li>
                  <li>This helps verify candidate credentials and portfolio</li>
                </ul>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {enrichmentData && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1"></i>
                Print Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEnrichment;
