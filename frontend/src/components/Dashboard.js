import React, { useState } from 'react';

const Dashboard = ({ candidates, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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

          <div className="mb-2">
            <strong>Uploaded: </strong>
            <small>{new Date(candidate.upload_date).toLocaleDateString()}</small>
          </div>

          <button
            className="btn btn-outline-primary btn-sm w-100"
            onClick={() => setSelectedCandidate(candidate)}
          >
            View Details
          </button>
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
                
                <p><strong>Previous Roles:</strong></p>
                <ul>
                  {candidate.analysis_result?.previous_roles?.map((role, index) => (
                    <li key={index}>{role}</li>
                  )) || <li>No roles listed</li>}
                </ul>
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Candidate Dashboard</h4>
        <button className="btn btn-outline-primary" onClick={onRefresh}>
          ↻ Refresh
        </button>
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
    </div>
  );
};

export default Dashboard;
