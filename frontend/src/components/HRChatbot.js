import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const HRChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your HR Assistant. I can help you with questions about your candidates. Try asking me things like:\n\n• Who are the top 5 matches for Data Scientist role?\n• Does this candidate have leadership experience?\n• What's the salary expectation trend among shortlisted candidates?\n• Show me candidates with Python skills",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/hr-chat`, {
        message: inputMessage
      });

      const botMessage = {
        id: messages.length + 2,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card" style={{ height: '80vh' }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-robot me-2"></i>
                HR Query Assistant
              </h5>
              <small className="text-white-50">Ask questions about your candidates</small>
            </div>

            <div className="card-body d-flex flex-column" style={{ overflow: 'hidden' }}>
              {/* Messages Container */}
              <div
                className="flex-grow-1 overflow-auto mb-3 p-3"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  maxHeight: 'calc(80vh - 200px)'
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`d-flex mb-3 ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className={`p-3 rounded-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white border'
                      }`}
                      style={{ maxWidth: '70%', wordWrap: 'break-word' }}
                    >
                      <div className="message-text">
                        {message.text.split('\n').map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            {index < message.text.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                      <small
                        className={`d-block mt-2 ${
                          message.sender === 'user' ? 'text-white-50' : 'text-muted'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </small>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="d-flex justify-content-start mb-3">
                    <div className="p-3 rounded-3 bg-white border" style={{ maxWidth: '70%' }}>
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="mt-auto">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ask me about your candidates..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <i className="bi bi-send"></i>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRChatbot;
