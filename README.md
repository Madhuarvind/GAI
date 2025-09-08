# Resume Screener Bot with IBM Watson

A comprehensive AI-powered resume screening system that automates candidate evaluation using IBM Watsonx.ai LLM for intelligent analysis and scoring.

## Features

- **Resume Upload & Processing**: Support for PDF and DOCX formats
- **AI-Powered Analysis**: IBM Watsonx.ai integration for intelligent candidate evaluation
- **Automated Scoring**: Relevance scores and categorization (Highly Qualified, Qualified, Not a Fit)
- **Interactive Dashboard**: Filter, sort, and view detailed candidate analysis
- **HR Query Assistant**: AI chatbot for asking questions about candidates
- **Candidate Chat**: Individual AI conversations about specific candidates
- **Bias Detection & Fair Screening**: Automated bias detection with blind recruitment mode
- **Real-time Processing**: Instant analysis results with detailed insights

### Bias Detection & Fair Screening

- **Automated Bias Analysis**: Detects gender, age, location, and education bias in resumes
- **Blind Recruitment Mode**: Removes personal identifiers (names, emails, phones, addresses) for fair screening
- **Bias Scoring**: Comprehensive bias assessment with actionable recommendations
- **Fair Screening Toggle**: Option to analyze resumes with bias mitigation
- **Bias Mitigation Recommendations**: Specific suggestions to reduce bias in hiring process

## Architecture

### Backend (Flask)
- **File Processing**: PyPDF2 and python-docx for text extraction
- **AI Integration**: IBM Watsonx.ai for resume analysis
- **Bias Detection**: Automated bias analysis and blind resume creation
- **Database**: SQLite for candidate data storage
- **REST API**: Comprehensive endpoints for frontend interaction

### Frontend (React)
- **Upload Interface**: Drag-and-drop file upload with validation
- **Dashboard**: Candidate overview with filtering and sorting
- **Bias Analysis**: Detailed bias detection and fair screening interface
- **HR Assistant**: Interactive chatbot for HR queries
- **Candidate Chat**: Individual candidate analysis chat

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- IBM Watsonx.ai account and API credentials

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure IBM Watsonx.ai:**
   - Create a `.env` file in the backend directory
   - Add your Watsonx.ai credentials:
   ```env
   WATSONX_API_KEY=your_api_key_here
   WATSONX_URL=https://api.us-south.assistant.watson.cloud.ibm.com
   WATSONX_PROJECT_ID=your_project_id_here
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   python app.py
   ```
   Server will run on http://localhost:5000

2. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on http://localhost:3000

### Using the Application

1. **Upload Resumes:**
   - Click "Upload Resume" in the navigation
   - Select a PDF or DOCX file
   - Optionally add a job description for better matching
   - Click "Upload & Analyze Resume"

2. **View Dashboard:**
   - Navigate to "Dashboard" to see all analyzed candidates
   - Filter by category (Highly Qualified, Qualified, Not a Fit)
   - Sort by relevance score, experience, or upload date
   - Click "View Details" for comprehensive analysis
   - Click "Bias Analysis" to view detailed bias detection results

3. **Bias Detection & Fair Screening:**
   - Each candidate card shows a bias indicator
   - Click the "Bias" button to view detailed bias analysis
   - Switch between "Bias Analysis" and "Blind Resume" tabs
   - View bias scores for gender, age, location, and education
   - See recommendations for reducing bias
   - Access blind resume version for anonymous screening

4. **HR Assistant:**
   - Click "HR Assistant 🤖" for interactive queries
   - Ask questions like:
     - "Who are the top 5 candidates for Data Scientist role?"
     - "Show me candidates with Python skills"
     - "What's the average experience level?"

5. **Candidate Chat:**
   - From the dashboard, click "AI Chat" on any candidate
   - Ask specific questions about that candidate

## API Endpoints

### Resume Management
- `POST /api/upload` - Upload and analyze resume
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/<id>` - Get specific candidate

### Bias Detection & Fair Screening
- `GET /api/bias-analysis/<candidate_id>` - Get bias analysis for candidate
- `GET /api/blind-resume/<candidate_id>` - Get blind version of resume
- `POST /api/fair-screening/toggle` - Toggle fair screening mode

### AI Chat
- `POST /api/chat` - Chat about specific candidate
- `POST /api/hr-chat` - General HR queries

### System
- `GET /api/health` - Health check

## Configuration

### IBM Watsonx.ai Setup

1. **Create IBM Cloud Account:**
   - Visit https://cloud.ibm.com
   - Create a free account or log in

2. **Create Watsonx.ai Project:**
   - Go to Watsonx.ai service
   - Create a new project
   - Note your Project ID

3. **Generate API Key:**
   - Go to IBM Cloud API Keys
   - Create a new API key
   - Copy the API key and URL

4. **Update .env file:**
   ```env
   WATSONX_API_KEY=your_actual_api_key
   WATSONX_URL=https://api.us-south.assistant.watson.cloud.ibm.com
   WATSONX_PROJECT_ID=your_actual_project_id
   ```

## Development

### Project Structure
```
resume-screener-bot/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   ├── services/
│   │   ├── resume_parser.py   # Text extraction from PDFs/DOCX
│   │   ├── watson_service.py  # IBM Watson integration
│   │   ├── bias_detection.py  # Bias detection and fair screening
│   │   └── database.py        # Database operations
│   └── uploads/               # Uploaded resume files
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── BiasAnalysis.js # Bias detection interface
│   │   │   ├── Dashboard.js   # Main dashboard
│   │   │   ├── Upload.js      # File upload component
│   │   │   └── HRChatbot.js   # HR assistant chatbot
│   │   ├── config.js          # API configuration
│   │   └── App.js             # Main React app
│   └── public/
└── README.md
```

### Adding New Features

1. **Backend Features:**
   - Add new endpoints in `app.py`
   - Create service functions in `services/`
   - Update database models if needed

2. **Frontend Features:**
   - Create new components in `components/`
   - Update `App.js` for routing
   - Add API calls using the config

## Troubleshooting

### Common Issues

1. **Watson API Errors:**
   - Verify API key and project ID in `.env`
   - Check Watsonx.ai service status
   - Ensure correct URL for your region

2. **File Upload Issues:**
   - Check file size (max 16MB)
   - Verify file format (PDF/DOCX only)
   - Ensure uploads directory exists

3. **Frontend Connection Issues:**
   - Verify backend server is running on port 5000
   - Check CORS settings
   - Confirm API_BASE_URL in config.js

4. **Bias Detection Issues:**
   - Ensure bias_detection.py is properly imported
   - Check that blind resume creation is working
   - Verify bias analysis data is being saved

### Mock Data Fallback

If Watson credentials are not configured, the system will use mock analysis data for testing purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

## Future Enhancements

- [ ] Multi-language resume support
- [ ] Advanced filtering and search
- [ ] Bulk resume processing
- [ ] Integration with ATS systems
- [ ] Custom scoring algorithms
- [ ] Resume comparison features
- [ ] Export functionality
- [ ] User authentication and roles
- [x] Bias detection and fair screening
- [ ] Enhanced privacy controls
- [ ] Audit logging for compliance
