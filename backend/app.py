from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from services.resume_parser import extract_text_from_file
from services.watson_service import analyze_resume_with_watson
from services.database import save_candidate, get_all_candidates
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx', 'doc'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/upload', methods=['POST'])
def upload_resume():
    """Handle resume file upload and processing"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{file_id}.{file_extension}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            # Save file
            file.save(file_path)
            
            # Extract text from resume
            resume_text = extract_text_from_file(file_path)
            
            # Analyze with Watson
            analysis_result = analyze_resume_with_watson(resume_text)
            
            # Save candidate data
            candidate_data = {
                'id': file_id,
                'filename': filename,
                'upload_date': datetime.now().isoformat(),
                'resume_text': resume_text,
                'analysis_result': analysis_result
            }
            
            save_candidate(candidate_data)
            
            return jsonify({
                'success': True,
                'candidate_id': file_id,
                'analysis': analysis_result
            })
            
        except Exception as e:
            return jsonify({'error': f'Processing failed: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    """Get all analyzed candidates"""
    try:
        candidates = get_all_candidates()
        return jsonify({'candidates': candidates})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch candidates: {str(e)}'}), 500

@app.route('/api/candidates/<candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    """Get specific candidate details"""
    # Implementation for getting specific candidate
    return jsonify({'message': 'Candidate details endpoint'})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Resume Screener API'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
