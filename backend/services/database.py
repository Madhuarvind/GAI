import sqlite3
import json
import os
from datetime import datetime

# Database file path
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'candidates.db')

def init_database():
    """Initialize the database with required tables"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create candidates table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        upload_date TEXT NOT NULL,
        resume_text TEXT,
        analysis_result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def save_candidate(candidate_data):
    """Save candidate data to database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Convert analysis_result to JSON string if it's a dict
    analysis_result = candidate_data.get('analysis_result', {})
    if isinstance(analysis_result, dict):
        analysis_result = json.dumps(analysis_result)
    
    cursor.execute('''
    INSERT INTO candidates (id, filename, upload_date, resume_text, analysis_result)
    VALUES (?, ?, ?, ?, ?)
    ''', (
        candidate_data['id'],
        candidate_data['filename'],
        candidate_data['upload_date'],
        candidate_data.get('resume_text', ''),
        analysis_result
    ))
    
    conn.commit()
    conn.close()

def get_all_candidates():
    """Retrieve all candidates from database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT id, filename, upload_date, resume_text, analysis_result, created_at
    FROM candidates
    ORDER BY created_at DESC
    ''')
    
    candidates = []
    for row in cursor.fetchall():
        # Parse analysis_result from JSON string if it exists
        analysis_result = row[4]
        if analysis_result and analysis_result.strip():
            try:
                analysis_result = json.loads(analysis_result)
            except json.JSONDecodeError:
                analysis_result = {"error": "Invalid analysis data"}
        else:
            analysis_result = {}
        
        candidates.append({
            'id': row[0],
            'filename': row[1],
            'upload_date': row[2],
            'resume_text': row[3][:200] + '...' if row[3] and len(row[3]) > 200 else row[3],
            'analysis_result': analysis_result,
            'created_at': row[5]
        })
    
    conn.close()
    return candidates

def get_candidate_by_id(candidate_id):
    """Retrieve specific candidate by ID"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT id, filename, upload_date, resume_text, analysis_result, created_at
    FROM candidates
    WHERE id = ?
    ''', (candidate_id,))
    
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    
    # Parse analysis_result from JSON string
    analysis_result = row[4]
    if analysis_result and analysis_result.strip():
        try:
            analysis_result = json.loads(analysis_result)
        except json.JSONDecodeError:
            analysis_result = {"error": "Invalid analysis data"}
    else:
        analysis_result = {}
    
    candidate = {
        'id': row[0],
        'filename': row[1],
        'upload_date': row[2],
        'resume_text': row[3],
        'analysis_result': analysis_result,
        'created_at': row[5]
    }
    
    conn.close()
    return candidate

def delete_candidate(candidate_id):
    """Delete candidate from database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM candidates WHERE id = ?', (candidate_id,))
    
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

# Initialize database when this module is imported
init_database()
