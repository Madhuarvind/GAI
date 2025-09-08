# Resume Screener Bot with IBM Watson - Project Plan

## Project Overview
A full-stack application that automates resume screening using IBM watsonx.ai LLM for candidate analysis and scoring.

## Tech Stack
- **Backend**: Python Flask
- **Frontend**: React.js with Bootstrap
- **Database**: SQLite (for development)
- **File Processing**: PyPDF2, python-docx
- **AI Integration**: IBM watsonx.ai API
- **File Storage**: Local storage for uploaded resumes

## Project Structure
```
resume-screener-bot/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── config.py
│   ├── services/
│   │   ├── resume_parser.py
│   │   ├── watson_service.py
│   │   ├── profile_verification.py
│   │   ├── jd_matching.py
│   │   └── database.py
│   ├── models/
│   │   └── candidate.py
│   └── uploads/
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Chatbot.js
│   │   │   └── HRChatbot.js
│   │   ├── services/
│   │   └── App.js
│   └── build/
├── database/
│   └── candidates.db
└── README.md
```

## Key Components

### 1. Backend (Flask API)
- **File Upload Endpoint**: Handle resume uploads (PDF/DOCX)
- **Text Extraction Service**: Extract text from uploaded files
- **Watson Integration Service**: Send text to watsonx.ai LLM for analysis
- **Database Service**: Store candidate data and analysis results
- **Results Endpoint**: Serve analyzed candidate data to frontend
- **HR Chatbot Endpoint**: Handle general HR queries about candidates
- **Profile Verification**: LinkedIn/GitHub profile enrichment
- **JD Matching**: Semantic similarity matching

### 2. Frontend (React Dashboard)
- **Upload Interface**: Drag-and-drop file upload
- **Dashboard**: Display candidate scores, summaries, and filtering
- **Candidate Details**: View individual candidate analysis
- **HR Query Chatbot**: Interactive AI assistant for HR queries
- **Individual Chatbot**: Chat with specific candidates
- **Responsive Design**: Bootstrap-based UI

### 3. IBM Watson Integration
- **Prompt Engineering**: Custom prompts for resume analysis
- **LLM Analysis**: Extract experience, skills, job roles
- **Scoring System**: Relevance score (1-100)
- **Categorization**: "Highly Qualified", "Qualified", "Not a Fit"
- **HR Chatbot**: Answer general HR queries
- **Profile Enrichment**: LinkedIn/GitHub verification
- **JD Matching**: Semantic similarity analysis

## Implementation Steps

### Phase 1: Backend Setup ✅
1. Create Flask application structure ✅
2. Set up file upload handling ✅
3. Implement resume text extraction ✅
4. Configure IBM Watson API integration ✅
5. Create database models ✅

### Phase 2: Watson Integration ✅
1. Set up watsonx.ai API credentials ✅
2. Design prompt templates for resume analysis ✅
3. Implement LLM response parsing ✅
4. Create scoring and categorization logic ✅

### Phase 3: Frontend Development ✅
1. Create React application ✅
2. Build file upload component ✅
3. Create dashboard with candidate listing ✅
4. Implement filtering and sorting ✅
5. Add candidate detail view ✅

### Phase 4: Advanced Features ✅
1. HR Query Chatbot implementation ✅
2. Profile verification service ✅
3. Job description matching ✅
4. Enhanced UI components ✅

## Files Created

### Backend Files:
- `backend/app.py` - Main Flask application with all endpoints
- `backend/requirements.txt` - Python dependencies
- `backend/services/resume_parser.py` - PDF/DOCX text extraction
- `backend/services/watson_service.py` - IBM Watson integration and chatbots
- `backend/services/database.py` - Database operations
- `backend/services/profile_verification.py` - LinkedIn/GitHub verification
- `backend/services/jd_matching.py` - Job description matching
- `backend/.env.example` - Environment configuration template

### Frontend Files:
- `frontend/package.json` - React dependencies
- `frontend/src/App.js` - Main React component with navigation
- `frontend/src/components/Upload.js` - File upload component
- `frontend/src/components/Dashboard.js` - Candidate dashboard
- `frontend/src/components/Chatbot.js` - Individual candidate chat
- `frontend/src/components/HRChatbot.js` - HR Query Chatbot
- `frontend/src/App.css` - Application styles

### Configuration Files:
- `README.md` - Comprehensive documentation
- `run.bat` - Windows startup script
- `PROJECT_PLAN.md` - This project plan

## Dependencies
- Python: Flask, PyPDF2, python-docx, requests, ibm-watson, python-dotenv, flask-cors
- Node.js: React, axios, bootstrap, react-router-dom

## Next Steps
1. Test the complete application
2. Configure IBM Watson credentials
3. Upload sample resumes for testing
4. Test HR Query Chatbot functionality
5. Verify profile verification and JD matching features

## HR Query Chatbot Examples
The HR Query Chatbot can handle queries like:
- "Who are the top 5 matches for Data Scientist role?"
- "Does this candidate have leadership experience?"
- "What's the salary expectation trend among shortlisted candidates?"
- "Show me candidates with Python skills"
- "How many candidates have more than 5 years of experience?"
- "What are the most common skills among qualified candidates?"
