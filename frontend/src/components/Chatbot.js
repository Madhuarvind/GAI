import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

const Chatbot = ({ candidateId }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI assistant. Ask me anything about this candidate!", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/chat`, {
        message: inputMessage,
        candidate_id: candidateId
      });

      const botMessage = { text: response.data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-info text-white">
        <h5 className="card-title mb-0">🤖 AI Assistant</h5>
      </div>
      <div className="card-body">
        <div className="chat-messages" style={{ height: '300px', overflowY: 'auto', marginBottom: '10px' }}>
          {messages.map((message, index) => (
            <div key={index} className={`message mb-2 ${message.sender === 'user' ? 'text-end' : ''}`}>
              <div
                className={`d-inline-block p-2 rounded ${
                  message.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-light border'
                }`}
                style={{ maxWidth: '80%' }}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message mb-2">
              <div className="d-inline-block p-2 rounded bg-light border">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Ask about the candidate..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            Send
          </button>
        </div>

        <div className="mt-2">
          <small className="text-muted">
            Try asking: "What are the candidate's strengths?", "Is this candidate suitable for a senior role?", "What skills does the candidate have?"
          </small>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
