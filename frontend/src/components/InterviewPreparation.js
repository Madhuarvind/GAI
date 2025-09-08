import React, { useState, useEffect } from 'react';
import config from '../config';

const InterviewPreparation = ({ candidateId, onClose }) => {
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInterviewPreparation();
  }, [candidateId]);

  const fetchInterviewPreparation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/api/interview-preparation/${candidateId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch interview preparation data');
      }
      const data = await response.json();
      setInterviewData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
      default:
        return 'bg-success';
    }
  };

  const getPersonalityBadge = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-info';
    if (score >= 40) return 'bg-warning';
    return 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Interview Preparation</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Generating interview preparation materials...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Interview Preparation</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger">
                <h6>Error loading interview preparation data</h6>
                <p>{error}</p>
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
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-question-circle me-2"></i>
              Interview Preparation - Candidate {candidateId}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {interviewData && (
              <>
                {/* Preparation Summary */}
                <div className="row mb-4">
                  <div className="col-md-12">
                    <div className="card border-primary">
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-clipboard-check me-2"></i>
                          Interview Preparation Summary
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-3">
                            <strong>Total Questions:</strong>
                            <div className="h4 text-primary">{interviewData.preparation_summary?.total_questions || 0}</div>
                          </div>
                          <div className="col-md-3">
                            <strong>Risk Level:</strong>
                            <div>
                              <span className={`badge ${getRiskBadge(interviewData.red_flags_analysis?.risk_level)}`}>
                                {interviewData.red_flags_analysis?.risk_level || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <strong>Top Traits:</strong>
                            <div>
                              {interviewData.preparation_summary?.key_personality_traits?.map((trait, index) => (
                                <span key={index} className="badge bg-info me-1 mb-1">{trait}</span>
                              )) || 'None identified'}
                            </div>
                          </div>
                          <div className="col-md-3">
                            <strong>Focus Areas:</strong>
                            <div>
                              {interviewData.preparation_summary?.preparation_focus?.map((focus, index) => (
                                <small key={index} className="d-block text-muted">• {focus}</small>
                              )) || 'Standard preparation'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interview Questions */}
                <div className="row mb-4">
                  <div className="col-md-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-question-circle-fill me-2"></i>
                          Personalized Interview Questions
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="accordion" id="questionsAccordion">
                          {/* Experience-based Questions */}
                          {interviewData.interview_questions?.questions?.experience_based?.length > 0 && (
                            <div className="accordion-item">
                              <h2 className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#experienceQuestions">
                                  Experience-Based Questions ({interviewData.interview_questions.questions.experience_based.length})
                                </button>
                              </h2>
                              <div id="experienceQuestions" className="accordion-collapse collapse show" data-bs-parent="#questionsAccordion">
                                <div className="accordion-body">
                                  <ul className="list-group list-group-flush">
                                    {interviewData.interview_questions.questions.experience_based.map((question, index) => (
                                      <li key={index} className="list-group-item">
                                        <strong>Q{index + 1}:</strong> {question}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Technical Questions */}
                          {interviewData.interview_questions?.questions?.technical_questions?.length > 0 && (
                            <div className="accordion-item">
                              <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#technicalQuestions">
                                  Technical Questions ({interviewData.interview_questions.questions.technical_questions.length})
                                </button>
                              </h2>
                              <div id="technicalQuestions" className="accordion-collapse collapse" data-bs-parent="#questionsAccordion">
                                <div className="accordion-body">
                                  <ul className="list-group list-group-flush">
                                    {interviewData.interview_questions.questions.technical_questions.map((question, index) => (
                                      <li key={index} className="list-group-item">
                                        <strong>Q{index + 1}:</strong> {question}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Behavioral Questions */}
                          {interviewData.interview_questions?.questions?.behavioral_questions?.length > 0 && (
                            <div className="accordion-item">
                              <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#behavioralQuestions">
                                  Behavioral Questions ({interviewData.interview_questions.questions.behavioral_questions.length})
                                </button>
                              </h2>
                              <div id="behavioralQuestions" className="accordion-collapse collapse" data-bs-parent="#questionsAccordion">
                                <div className="accordion-body">
                                  <ul className="list-group list-group-flush">
                                    {interviewData.interview_questions.questions.behavioral_questions.map((question, index) => (
                                      <li key={index} className="list-group-item">
                                        <strong>Q{index + 1}:</strong> {question}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cultural Fit Questions */}
                          {interviewData.interview_questions?.questions?.cultural_fit_questions?.length > 0 && (
                            <div className="accordion-item">
                              <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#culturalQuestions">
                                  Cultural Fit Questions ({interviewData.interview_questions.questions.cultural_fit_questions.length})
                                </button>
                              </h2>
                              <div id="culturalQuestions" className="accordion-collapse collapse" data-bs-parent="#questionsAccordion">
                                <div className="accordion-body">
                                  <ul className="list-group list-group-flush">
                                    {interviewData.interview_questions.questions.cultural_fit_questions.map((question, index) => (
                                      <li key={index} className="list-group-item">
                                        <strong>Q{index + 1}:</strong> {question}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Red Flags Analysis */}
                {interviewData.red_flags_analysis && (
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <div className="card border-warning">
                        <div className="card-header bg-warning">
                          <h6 className="mb-0">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Red Flags Analysis
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-4">
                              <strong>Overall Risk Score:</strong>
                              <div className="h4 text-warning">{interviewData.red_flags_analysis.overall_risk_score || 0}/25</div>
                            </div>
                            <div className="col-md-4">
                              <strong>Risk Level:</strong>
                              <div>
                                <span className={`badge ${getRiskBadge(interviewData.red_flags_analysis.risk_level)}`}>
                                  {interviewData.red_flags_analysis.risk_level}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <strong>Recommendations:</strong>
                              <ul className="list-unstyled">
                                {interviewData.red_flags_analysis.recommendations?.map((rec, index) => (
                                  <li key={index} className="small">• {rec}</li>
                                )) || <li className="small">No specific recommendations</li>}
                              </ul>
                            </div>
                          </div>

                          {/* Detailed Red Flags */}
                          <div className="mt-3">
                            <h6>Detailed Analysis:</h6>
                            <div className="row">
                              {Object.entries(interviewData.red_flags_analysis.red_flags || {}).map(([flagType, flagData]) => (
                                <div key={flagType} className="col-md-6 mb-3">
                                  <div className={`card ${flagData.detected ? 'border-danger' : 'border-success'}`}>
                                    <div className="card-body">
                                      <h6 className="card-title">
                                        {flagType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </h6>
                                      <p className="card-text">
                                        <strong>Severity:</strong>
                                        <span className={`badge ms-2 ${flagData.severity > 3 ? 'bg-danger' : flagData.severity > 1 ? 'bg-warning' : 'bg-success'}`}>
                                          {flagData.severity}/5
                                        </span>
                                      </p>
                                      {flagData.details?.length > 0 && (
                                        <div>
                                          <strong>Details:</strong>
                                          <ul className="list-unstyled small mt-2">
                                            {flagData.details.map((detail, index) => (
                                              <li key={index}>• {detail}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personality Insights */}
                {interviewData.personality_insights && (
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <h6 className="mb-0">
                            <i className="bi bi-person-circle me-2"></i>
                            Personality Insights
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <h6>Dominant Traits:</h6>
                              <div className="mb-3">
                                {interviewData.personality_insights.dominant_traits?.map(([trait, score], index) => (
                                  <div key={index} className="d-flex align-items-center mb-2">
                                    <span className="badge bg-primary me-2" style={{ minWidth: '80px' }}>
                                      {trait.replace(/_/g, ' ')}
                                    </span>
                                    <div className="progress flex-grow-1" style={{ height: '20px' }}>
                                      <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${score}%` }}
                                        aria-valuenow={score}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                      >
                                        {score}%
                                      </div>
                                    </div>
                                  </div>
                                )) || 'No dominant traits identified'}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <h6>Writing Style Analysis:</h6>
                              <div className="mb-2">
                                <strong>Style:</strong> {interviewData.personality_insights.style_analysis?.writing_style || 'Unknown'}
                              </div>
                              <div className="mb-2">
                                <strong>Avg Sentence Length:</strong> {interviewData.personality_insights.style_analysis?.avg_sentence_length || 0} words
                              </div>
                              <div className="mb-2">
                                <strong>Action Verbs Used:</strong> {interviewData.personality_insights.style_analysis?.action_verb_count || 0}
                              </div>
                              <div className="mb-2">
                                <strong>Quantifiable Achievements:</strong> {interviewData.personality_insights.style_analysis?.quantifiable_achievements || 0}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <h6>Key Insights:</h6>
                            <div className="alert alert-light">
                              {interviewData.personality_insights.insights?.map((insight, index) => (
                                <p key={index} className="mb-1">• {insight}</p>
                              )) || 'No specific insights available'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interview Strategy */}
                {interviewData.interview_strategy && (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="card border-success">
                        <div className="card-header bg-success text-white">
                          <h6 className="mb-0">
                            <i className="bi bi-lightbulb me-2"></i>
                            Recommended Interview Strategy
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <h6>Interview Style:</h6>
                              <p className="text-muted">{interviewData.interview_strategy.interview_style || 'Standard'}</p>

                              <h6>Key Questions to Ask:</h6>
                              <ul>
                                {interviewData.interview_strategy.key_questions_to_ask?.map((question, index) => (
                                  <li key={index}>{question}</li>
                                )) || <li>No specific questions recommended</li>}
                              </ul>
                            </div>
                            <div className="col-md-6">
                              <h6>Follow-up Topics:</h6>
                              <ul>
                                {interviewData.interview_strategy.follow_up_topics?.map((topic, index) => (
                                  <li key={index}>{topic}</li>
                                )) || <li>No specific topics recommended</li>}
                              </ul>

                              <h6>Assessment Criteria:</h6>
                              <ul>
                                {interviewData.interview_strategy.assessment_criteria?.map((criteria, index) => (
                                  <li key={index}>{criteria}</li>
                                )) || <li>No specific criteria recommended</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-1"></i>
              Print Preparation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPreparation;
