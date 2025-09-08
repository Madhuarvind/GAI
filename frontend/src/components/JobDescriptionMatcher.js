import React, { useState, useEffect } from 'react';
import config from '../config';

const JobDescriptionMatcher = ({ onClose }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [matchingResults, setMatchingResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/candidates`);
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = [];
      for (const candidate of candidates) {
        try {
          const response = await fetch(`${config.API_BASE_URL}/api/match-jd`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              candidate_id: candidate.id,
              job_description: jobDescription
            })
          });

          if (response.ok) {
            const result = await response.json();
            results.push({
              candidate: candidate,
              match_result: result
            });
          } else {
            // Fallback to existing JD match result if available
            if (candidate.jd_match_result) {
              results.push({
                candidate: candidate,
                match_result: candidate.jd_match_result
              });
            }
          }
        } catch (err) {
          console.error(`Failed to match candidate ${candidate.id}:`, err);
          // Use existing result if available
          if (candidate.jd_match_result) {
            results.push({
              candidate: candidate,
              match_result: candidate.jd_match_result
            });
          }
        }
      }

      // Sort by match score descending
      results.sort((a, b) => (b.match_result?.match_score || 0) - (a.match_result?.match_score || 0));
      setMatchingResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMatchBadgeColor = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  const getMatchText = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Poor Match';
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-search me-2"></i>
              Job Description Matching
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Job Description Input */}
            <div className="mb-4">
              <label htmlFor="jobDescription" className="form-label">
                <strong>Job Description</strong>
              </label>
              <textarea
                id="jobDescription"
                className="form-control"
                rows="6"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste or type the job description here..."
              />
              <div className="form-text">
                Enter the complete job description to match against all candidates.
              </div>
            </div>

            {/* Match Button */}
            <div className="mb-4 text-center">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleMatch}
                disabled={loading || !jobDescription.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Matching Candidates...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Match Against All Candidates
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-danger mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Results Display */}
            {matchingResults.length > 0 && (
              <div>
                <h6 className="mb-3">
                  <i className="bi bi-bar-chart me-2"></i>
                  Match Results ({matchingResults.length} candidates)
                </h6>

                <div className="row">
                  {matchingResults.map((result, index) => (
                    <div key={result.candidate.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">
                              #{index + 1} - {result.candidate.filename}
                            </h6>
                            <span className={`badge ${getMatchBadgeColor(result.match_result?.match_score || 0)}`}>
                              {result.match_result?.match_score || 0}%
                            </span>
                          </div>

                          <div className="mb-2">
                            <strong>Match Level:</strong>
                            <span className={`ms-2 ${getMatchBadgeColor(result.match_result?.match_score || 0).replace('bg-', 'text-')}`}>
                              {getMatchText(result.match_result?.match_score || 0)}
                            </span>
                          </div>

                          {result.match_result?.explanation && (
                            <div className="mb-2">
                              <strong>Analysis:</strong>
                              <div className="border-start border-primary border-3 ps-2 mt-1">
                                <small className="text-muted">
                                  {result.match_result.explanation}
                                </small>
                              </div>
                            </div>
                          )}

                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                // Could open candidate details modal
                                console.log('View candidate details:', result.candidate.id);
                              }}
                            >
                              View Details
                            </button>
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => {
                                // Could start interview preparation
                                console.log('Start interview prep:', result.candidate.id);
                              }}
                            >
                              <i className="bi bi-question-circle me-1"></i>
                              Interview Prep
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {matchingResults.length === 0 && !loading && jobDescription.trim() && (
              <div className="text-center py-5">
                <div className="text-muted">
                  <i className="bi bi-info-circle fs-1 mb-3"></i>
                  <h5>No matches found</h5>
                  <p>Click "Match Against All Candidates" to see how candidates match this job description.</p>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {matchingResults.length > 0 && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1"></i>
                Print Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionMatcher;
