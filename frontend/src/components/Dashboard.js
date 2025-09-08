import React, { useState } from 'react';
import config from '../config';
import BiasAnalysis from './BiasAnalysis';
import InterviewPreparation from './InterviewPreparation';
import JobDescriptionMatcher from './JobDescriptionMatcher';
import ProfileEnrichment from './ProfileEnrichment';
import HRIntegration from './HRIntegration';

const Dashboard = ({ candidates, onRefresh, onCandidateSelect }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [biasAnalysisCandidate, setBiasAnalysisCandidate] = useState(null);
  const [interviewPrepCandidate, setInterviewPrepCandidate] = useState(null);
  const [showJobMatcher, setShowJobMatcher] = useState(false);
  const [profileEnrichmentCandidate, setProfileEnrichmentCandidate] = useState(null);

  const filteredCandidates = candidates.filter(candidate => {
    if (filter === 'all') return true;
    const category = candidate.analysis_result?.category || '';
    return category.toLowerCase().includes(filter.toLowerCase());
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.analysis_result?.relevance_score || 0) - (a.analysis_result?.relevance_score || 0);
      case 'experience':
        return (b.analysis_result?.years_experience || 0) - (a.analysis_result?.years_experience || 0);
      case 'date':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const getCategoryBadge = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('high')) {
      return 'success';
    } else if (categoryLower.includes('qualified')) {
      return 'warning';
    } else {
      return 'danger';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const CandidateCard = ({ candidate }) => (
    <div className="col-md-6 col-lg-4 mb-3">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="card-title mb-0">{candidate.filename}</h6>
            <span className={`badge bg-${getCategoryBadge(candidate.analysis_result?.category)}`}>
              {candidate.analysis_result?.category || 'Unknown'}
            </span>
          </div>

          <div className="mb-2">
            <strong>Score: </strong>
            <span className={getScoreColor(candidate.analysis_result?.relevance_score || 0)}>
              {candidate.analysis_result?.relevance_score || 'N/A'}%
            </span>
          </div>

          {candidate.jd_match_result && (
            <div className="mb-2">
              <strong>JD Match: </strong>
              <span className={getScoreColor(candidate.jd_match_result.match_score || 0)}>
                {candidate.jd_match_result.match_score || 'N/A'}%
              </span>
            </div>
          )}

          <div className="mb-2">
            <strong>Experience: </strong>
            {candidate.analysis_result?.years_experience || 'N/A'} years
          </div>

          <div className="mb-2">
            <strong>Skills: </strong>
            <small>
              {candidate.analysis_result?.key_skills?.slice(0, 3).join(', ') || 'No skills listed'}
              {candidate.analysis_result?.key_skills?.length > 3 && '...'}
            </small>
          </div>

          {candidate.analysis_result?.hidden_skills && candidate.analysis_result.hidden_skills.length > 0 && (
            <div className="mb-2">
              <strong>Hidden Skills: </strong>
              <small>
                {candidate.analysis_result.hidden_skills.slice(0, 2).join(', ')}
                {candidate.analysis_result.hidden_skills.length > 2 && '...'}
              </small>
            </div>
          )}

          <div className="mb-2">
            <strong>Uploaded: </strong>
            <small>{new Date(candidate.upload_date).toLocaleDateString()}</small>
          </div>

          {/* Bias Analysis Indicator */}
          {candidate.bias_analysis && (
            <div className="mb-2">
              <strong>Fair Screening: </strong>
              <span className={`badge ${
                candidate.bias_analysis.overall_bias_score <= 20 ? 'bg-success' :
                candidate.bias_analysis.overall_bias_score <= 40 ? 'bg-warning' : 'bg-danger'
              }`}>
                {candidate.bias_analysis.overall_bias_score <= 20 ? 'Low Bias' :
                 candidate.bias_analysis.overall_bias_score <= 40 ? 'Medium Bias' : 'High Bias'}
              </span>
            </div>
          )}

          {/* Advanced Ranking Indicator */}
          {candidate.advanced_ranking && (
            <div className="mb-2">
              <strong>Advanced Ranking: </strong>
              <span className={`badge ${
                candidate.advanced_ranking.overall_score >= 80 ? 'bg-success' :
                candidate.advanced_ranking.overall_score >= 60 ? 'bg-warning' : 'bg-danger'
              }`}>
                {candidate.advanced_ranking.overall_score ? `${candidate.advanced_ranking.overall_score}%` : 'N/A'}
              </span>
            </div>
          )}

          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-outline-primary btn-sm flex-fill"
              onClick={() => setSelectedCandidate(candidate)}
            >
              View Details
            </button>
            <button
              className="btn btn-outline-info btn-sm flex-fill"
              onClick={() => onCandidateSelect && onCandidateSelect(candidate.id)}
            >
              AI Chat
            </button>
            <button
              className="btn btn-outline-secondary btn-sm flex-fill"
              onClick={() => setBiasAnalysisCandidate(candidate.id)}
            >
              <i className="bi bi-shield-check"></i> Bias
            </button>
            <button
              className="btn btn-outline-success btn-sm flex-fill"
              onClick={() => setInterviewPrepCandidate(candidate.id)}
            >
              <i className="bi bi-question-circle"></i> Interview Prep
            </button>
            <button
              className="btn btn-outline-warning btn-sm flex-fill"
              onClick={() => setProfileEnrichmentCandidate(candidate.id)}
            >
              <i className="bi bi-person-badge"></i> Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CandidateModal = ({ candidate, onClose }) => (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Candidate Analysis - {candidate.filename}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Basic Information</h6>
                <p><strong>Relevance Score:</strong>
                  <span className={getScoreColor(candidate.analysis_result?.relevance_score || 0)}>
                    {candidate.analysis_result?.relevance_score || 'N/A'}%
                  </span>
                </p>

                {candidate.jd_match_result && (
                  <p><strong>JD Match Score:</strong>
                    <span className={getScoreColor(candidate.jd_match_result.match_score || 0)}>
                      {candidate.jd_match_result.match_score || 'N/A'}%
                    </span>
                  </p>
                )}

                <p><strong>Category:</strong>
                  <span className={`badge bg-${getCategoryBadge(candidate.analysis_result?.category)} ms-2`}>
                    {candidate.analysis_result?.category || 'Unknown'}
                  </span>
                </p>
                <p><strong>Experience:</strong> {candidate.analysis_result?.years_experience || 'N/A'} years</p>
                <p><strong>Education:</strong> {candidate.analysis_result?.education || 'Not specified'}</p>
              </div>

              <div className="col-md-6">
                <h6>Skills & Roles</h6>
                <p><strong>Key Skills:</strong></p>
                <div className="mb-2">
                  {candidate.analysis_result?.key_skills?.map((skill, index) => (
                    <span key={index} className="badge bg-secondary me-1 mb-1">{skill}</span>
                  )) || 'No skills listed'}
                </div>

                {candidate.analysis_result?.hidden_skills && candidate.analysis_result.hidden_skills.length > 0 && (
                  <>
                    <p><strong>Hidden Skills:</strong></p>
                    <div className="mb-2">
                      {candidate.analysis_result.hidden_skills.map((skill, index) => (
                        <span key={index} className="badge bg-info me-1 mb-1">{skill}</span>
                      ))}
                    </div>
                  </>
                )}

                <p><strong>Previous Roles:</strong></p>
                <ul>
                  {candidate.analysis_result?.previous_roles?.map((role, index) => (
                    <li key={index}>{role}</li>
                  )) || <li>No roles listed</li>}
                </ul>
              </div>
            </div>

            {candidate.jd_match_result && (
              <div className="mt-3">
                <h6>Job Description Match Analysis</h6>
                <div className="border p-3 bg-light">
                  {candidate.jd_match_result.explanation || 'No explanation available'}
                </div>
              </div>
            )}

            {candidate.profile_enrichment && (
              <div className="mt-3">
                <h6>Profile Enrichment</h6>
                <div className="row">
                  {candidate.profile_enrichment.linkedin_profiles && candidate.profile_enrichment.linkedin_profiles.length > 0 && (
                    <div className="col-md-6">
                      <h6>LinkedIn Profiles</h6>
                      {candidate.profile_enrichment.linkedin_profiles.map((profile, index) => (
                        <div key={index} className="border p-2 mb-2">
                          <a href={profile.url} target="_blank" rel="noopener noreferrer">
                            {profile.name || 'LinkedIn Profile'}
                          </a>
                          <br />
                          <small>{profile.headline}</small>
                        </div>
                      ))}
                    </div>
                  )}

                  {candidate.profile_enrichment.github_profiles && candidate.profile_enrichment.github_profiles.length > 0 && (
                    <div className="col-md-6">
                      <h6>GitHub Profiles</h6>
                      {candidate.profile_enrichment.github_profiles.map((profile, index) => (
                        <div key={index} className="border p-2 mb-2">
                          <a href={profile.url} target="_blank" rel="noopener noreferrer">
                            {profile.name || 'GitHub Profile'}
                          </a>
                          <br />
                          <small>{profile.public_repos} repos, {profile.followers} followers</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3">
              <h6>Summary</h6>
              <div className="border p-3 bg-light">
                {candidate.analysis_result?.summary || 'No summary available'}
              </div>
            </div>

            <div className="mt-3">
              <h6>Resume Text Preview</h6>
              <div className="border p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '0.9em' }}>
                {candidate.resume_text || 'No text available'}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-info"
              onClick={() => {
                setBiasAnalysisCandidate(candidate.id);
                onClose();
              }}
            >
              <i className="bi bi-shield-check me-1"></i>
              View Bias Analysis
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => {
                setProfileEnrichmentCandidate(candidate.id);
                onClose();
              }}
            >
              <i className="bi bi-person-badge me-1"></i>
              Enrich Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Candidate Dashboard</h4>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-info"
            onClick={() => setShowJobMatcher(true)}
          >
            <i className="bi bi-search me-1"></i>
            Match JD
          </button>
          <button className="btn btn-outline-primary" onClick={onRefresh}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Filter by Category:</label>
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Candidates</option>
            <option value="high">Highly Qualified</option>
            <option value="qualified">Qualified</option>
            <option value="not">Not a Fit</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Sort by:</label>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Upload Date (Newest)</option>
            <option value="score">Relevance Score (Highest)</option>
            <option value="experience">Experience (Most)</option>
          </select>
        </div>
      </div>

      {sortedCandidates.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted">
            <h5>No candidates found</h5>
            <p>Upload resumes to see them analyzed here.</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {sortedCandidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {biasAnalysisCandidate && (
        <BiasAnalysis
          candidateId={biasAnalysisCandidate}
          onClose={() => setBiasAnalysisCandidate(null)}
        />
      )}

      {interviewPrepCandidate && (
        <InterviewPreparation
          candidateId={interviewPrepCandidate}
          onClose={() => setInterviewPrepCandidate(null)}
        />
      )}

      {showJobMatcher && (
        <JobDescriptionMatcher
          onClose={() => setShowJobMatcher(false)}
        />
      )}

      {profileEnrichmentCandidate && (
        <ProfileEnrichment
          candidateId={profileEnrichmentCandidate}
          onClose={() => setProfileEnrichmentCandidate(null)}
        />
      )}

      <HRIntegration
        candidateId={selectedCandidate?.id}
        candidateData={selectedCandidate}
      />
    </div>
  );
};

export default Dashboard;
