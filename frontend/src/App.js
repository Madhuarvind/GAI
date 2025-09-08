import React, { useState, useEffect } from 'react';
import UploadComponent from './components/Upload';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import HRChatbot from './components/HRChatbot';
import config from './config';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/candidates`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
  };

  const handleUploadSuccess = () => {
    fetchCandidates();
    setCurrentView('dashboard');
  };

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidateId(candidateId);
    setCurrentView('chatbot');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'upload':
        return <UploadComponent onUploadSuccess={handleUploadSuccess} />;
      case 'dashboard':
        return <Dashboard candidates={candidates} onRefresh={fetchCandidates} onCandidateSelect={handleCandidateSelect} />;
      case 'chatbot':
        return <Chatbot candidateId={selectedCandidateId} />;
      case 'hr-chatbot':
        return <HRChatbot />;
      default:
        return <UploadComponent onUploadSuccess={handleUploadSuccess} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand mb-0 h1">
            📄 Resume Screener Bot
          </span>
          <div className="navbar-nav flex-row">
            <button
              className={`nav-link btn btn-link text-white me-2 ${currentView === 'upload' ? 'active' : ''}`}
              onClick={() => setCurrentView('upload')}
            >
              Upload Resume
            </button>
            <button
              className={`nav-link btn btn-link text-white me-2 ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard ({candidates.length})
            </button>
            <button
              className={`nav-link btn btn-link text-white me-2 ${currentView === 'hr-chatbot' ? 'active' : ''}`}
              onClick={() => setCurrentView('hr-chatbot')}
            >
              HR Assistant 🤖
            </button>
            {selectedCandidateId && (
              <button
                className={`nav-link btn btn-link text-white ${currentView === 'chatbot' ? 'active' : ''}`}
                onClick={() => setCurrentView('chatbot')}
              >
                AI Chat
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {loading && (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && renderContent()}
      </div>
    </div>
  );
}

export default App;
