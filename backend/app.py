from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from services.resume_parser import extract_text_from_file
from services.watson_service import analyze_resume_with_watson
from services.database import save_candidate, get_all_candidates, get_candidate_by_id
from services.hr_integration import (
    get_supported_hr_systems,
    send_candidate_to_hr,
    validate_hr_system_connection,
    export_candidate_data
)
from services.bias_detection import analyze_resume_bias, create_blind_version
from services.advanced_ranking import analyze_advanced_ranking
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

            # Perform bias analysis
            bias_analysis = analyze_resume_bias(resume_text)

            # Create blind version for fair screening
            blind_resume, removed_info = create_blind_version(resume_text)

            # Analyze with Watson (use blind version if bias score is high)
            if bias_analysis['overall_bias_score'] > 30:
                analysis_resume_text = blind_resume
            else:
                analysis_resume_text = resume_text

            analysis_result = analyze_resume_with_watson(analysis_resume_text)

            from services.profile_verification import enrich_candidate_profiles
            from services.jd_matching import match_job_description
            from services.hr_integration import send_candidate_to_hr

            # Enrich candidate profiles with LinkedIn/GitHub data
            profile_enrichment = enrich_candidate_profiles(resume_text)

            # Get job description from request form (optional)
            job_description = request.form.get('job_description', None)
            jd_match_result = None
            if job_description:
                jd_match_result = match_job_description(job_description, resume_text)

            # Prepare candidate data dictionary
            candidate_data = {
                'id': file_id,
                'filename': filename,
                'upload_date': datetime.now().isoformat(),
                'resume_text': resume_text,
                'blind_resume_text': blind_resume,
                'analysis_result': analysis_result,
                'bias_analysis': bias_analysis,
                'removed_personal_info': removed_info,
                'profile_enrichment': profile_enrichment,
            'jd_match_result': jd_match_result,
            'advanced_ranking': None
            }

            # Example: Send shortlisted candidate to HR system (e.g., Workday)
            # This can be conditional or triggered by a separate API in real use
            try:
                hr_api_key = os.getenv('HR_API_KEY')
                hr_api_url = os.getenv('HR_API_URL')
                hr_system = os.getenv('HR_SYSTEM', 'workday')  # default to workday
                hr_response = send_candidate_to_hr(hr_system, candidate_data, api_key=hr_api_key, api_url=hr_api_url)
                if not hr_response.get('success', False):
                    app.logger.error(f"Failed to send candidate to HR system: {hr_response.get('error')}")
            except Exception as e:
                app.logger.error(f"Exception during HR system integration: {str(e)}")

            save_candidate(candidate_data)

            return jsonify({
                'success': True,
                'candidate_id': file_id,
                'analysis': analysis_result,
                'bias_analysis': bias_analysis,
                'fair_screening_available': True
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
    try:
        candidates = get_all_candidates()
        candidate = next((c for c in candidates if c['id'] == candidate_id), None)

        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404

        return jsonify({'candidate': candidate})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch candidate: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Resume Screener API'})

@app.route('/api/chat', methods=['POST'])
def chat_with_watson():
    """Chatbot-style interaction endpoint"""
    data = request.json
    message = data.get('message', '')
    candidate_id = data.get('candidate_id', None)

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    try:
        from services.watson_service import chat_with_watson
        response = chat_with_watson(message, candidate_id)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': f'Chatbot interaction failed: {str(e)}'}), 500

@app.route('/api/hr-chat', methods=['POST'])
def hr_chat():
    """HR Query Chatbot endpoint for general queries about candidates"""
    data = request.json
    message = data.get('message', '')

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    try:
        from services.watson_service import hr_query_chatbot
        response = hr_query_chatbot(message)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': f'HR chatbot failed: {str(e)}'}), 500

@app.route('/api/bias-analysis/<candidate_id>', methods=['GET'])
def get_bias_analysis(candidate_id):
    """Get bias analysis for a specific candidate"""
    try:
        candidates = get_all_candidates()
        candidate = next((c for c in candidates if c['id'] == candidate_id), None)

        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404

        return jsonify({
            'bias_analysis': candidate.get('bias_analysis', {}),
            'removed_personal_info': candidate.get('removed_personal_info', {}),
            'blind_resume_available': bool(candidate.get('blind_resume_text'))
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get bias analysis: {str(e)}'}), 500

@app.route('/api/blind-resume/<candidate_id>', methods=['GET'])
def get_blind_resume(candidate_id):
    """Get blind version of resume for fair screening"""
    try:
        candidates = get_all_candidates()
        candidate = next((c for c in candidates if c['id'] == candidate_id), None)

        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404

        blind_text = candidate.get('blind_resume_text', '')
        if not blind_text:
            return jsonify({'error': 'Blind resume not available'}), 404

        return jsonify({
            'blind_resume_text': blind_text,
            'removed_info': candidate.get('removed_personal_info', {}),
            'bias_analysis': candidate.get('bias_analysis', {})
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get blind resume: {str(e)}'}), 500

@app.route('/api/fair-screening/toggle', methods=['POST'])
def toggle_fair_screening():
    """Toggle fair screening mode for the session"""
    data = request.json
    enabled = data.get('enabled', False)

    # In a real application, this would be stored in session/user preferences
    # For now, we'll just return the status
    return jsonify({
        'fair_screening_enabled': enabled,
        'message': f'Fair screening {"enabled" if enabled else "disabled"}'
    })

@app.route('/api/hr/send-candidate/<candidate_id>', methods=['POST'])
def send_candidate_to_hr_system(candidate_id):
    """Send a specific candidate to HR system"""
    data = request.json
    hr_system = data.get('hr_system', 'workday')
    api_key = data.get('api_key')
    api_url = data.get('api_url')

    if not api_key or not api_url:
        return jsonify({'error': 'API key and URL are required'}), 400

    try:
        candidates = get_all_candidates()
        candidate = next((c for c in candidates if c['id'] == candidate_id), None)

        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404

        from services.hr_integration import send_candidate_to_hr
        response = send_candidate_to_hr(hr_system, candidate, api_key=api_key, api_url=api_url)

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': f'Failed to send candidate to HR system: {str(e)}'}), 500

@app.route('/api/hr/export-candidate/<candidate_id>', methods=['GET'])
def export_candidate_data(candidate_id):
    """Export candidate data in various formats"""
    export_format = request.args.get('format', 'json')

    try:
        candidates = get_all_candidates()
        candidate = next((c for c in candidates if c['id'] == candidate_id), None)

        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404

        from services.hr_integration import export_candidate_data
        exported_data = export_candidate_data(candidate, export_format)

        if export_format == 'json':
            return jsonify(json.loads(exported_data.decode('utf-8')))
        elif export_format in ['pdf', 'excel']:
            from flask import send_file, Response
            import io

            if export_format == 'pdf':
                return send_file(
                    io.BytesIO(exported_data),
                    mimetype='application/pdf',
                    as_attachment=True,
                    download_name=f'candidate_{candidate_id}_report.pdf'
                )
            else:  # excel
                return send_file(
                    io.BytesIO(exported_data),
                    mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    as_attachment=True,
                    download_name=f'candidate_{candidate_id}_report.xlsx'
                )

    except Exception as e:
        return jsonify({'error': f'Failed to export candidate data: {str(e)}'}), 500

@app.route('/api/hr/supported-systems', methods=['GET'])
def get_supported_hr_systems():
    """Get list of supported HR systems"""
    try:
        from services.hr_integration import get_supported_hr_systems
        systems = get_supported_hr_systems()
        return jsonify({'supported_systems': systems})
    except Exception as e:
        return jsonify({'error': f'Failed to get supported systems: {str(e)}'}), 500

@app.route('/api/hr/validate-connection', methods=['POST'])
def validate_hr_connection():
    """Validate connection to HR system"""
    data = request.json
    hr_system = data.get('hr_system')
    api_key = data.get('api_key')
    api_url = data.get('api_url')

    if not hr_system or not api_key or not api_url:
        return jsonify({'error': 'HR system, API key, and URL are required'}), 400

    try:
        from services.hr_integration import validate_hr_system_connection
        result = validate_hr_system_connection(hr_system, api_key, api_url)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Failed to validate connection: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
