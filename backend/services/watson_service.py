import os
import json
import requests
from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class WatsonResumeAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('WATSONX_API_KEY')
        self.url = os.getenv('WATSONX_URL')
        self.project_id = os.getenv('WATSONX_PROJECT_ID')
        
        if not all([self.api_key, self.url, self.project_id]):
            raise Exception("Watsonx.ai credentials not configured. Please set WATSONX_API_KEY, WATSONX_URL, and WATSONX_PROJECT_ID environment variables.")
        
        self.authenticator = IAMAuthenticator(self.api_key)
        self.assistant = AssistantV2(
            version='2023-06-15',
            authenticator=self.authenticator
        )
        self.assistant.set_service_url(self.url)
    
    def analyze_resume(self, resume_text, job_description=None):
        """Analyze resume using Watsonx.ai LLM"""
        
        # Default prompt for resume analysis
        prompt = f"""
        You are an expert HR recruiter. Analyze the following resume and provide a comprehensive assessment.

        RESUME TEXT:
        {resume_text[:4000]}  # Limit text to avoid token limits

        Please analyze this resume and provide:
        1. Years of experience (numeric value)
        2. Key skills and technologies (comma-separated list)
        3. Previous job roles and companies
        4. Education background
        5. Overall relevance score (0-100) for a software engineering role
        6. Categorization: "Highly Qualified", "Qualified", or "Not a Fit"
        7. Brief summary of candidate's strengths and weaknesses

        Format your response as valid JSON with these exact keys:
        {{
            "years_experience": number,
            "key_skills": ["skill1", "skill2", ...],
            "previous_roles": ["role1 at company1", "role2 at company2", ...],
            "education": "degree, institution, year",
            "relevance_score": number,
            "category": "Highly Qualified|Qualified|Not a Fit",
            "summary": "brief summary text"
        }}
        """
        
        try:
            # Create session
            session_response = self.assistant.create_session(
                assistant_id=self.project_id
            )
            session_id = session_response.get_result()['session_id']
            
            # Send message to Watson
            response = self.assistant.message(
                assistant_id=self.project_id,
                session_id=session_id,
                input={
                    'message_type': 'text',
                    'text': prompt,
                    'options': {
                        'return_context': True
                    }
                }
            )
            
            # Get the response
            result = response.get_result()
            assistant_response = result['output']['generic'][0]['text']
            
            # Parse the JSON response
            analysis_result = json.loads(assistant_response)
            
            # Clean up session
            self.assistant.delete_session(
                assistant_id=self.project_id,
                session_id=session_id
            )
            
            return analysis_result
            
        except Exception as e:
            raise Exception(f"Watson analysis failed: {str(e)}")

# Fallback function for when Watson credentials aren't available
def analyze_resume_with_watson(resume_text, job_description=None):
    """Wrapper function that handles Watson analysis with fallback"""
    try:
        analyzer = WatsonResumeAnalyzer()
        return analyzer.analyze_resume(resume_text, job_description)
    except Exception as e:
        # Fallback to mock analysis if Watson is not configured
        print(f"Watson analysis failed, using mock data: {str(e)}")
        return get_mock_analysis(resume_text)

def get_mock_analysis(resume_text):
    """Mock analysis for testing when Watson is not available"""
    # Simple analysis based on text content
    text_lower = resume_text.lower()
    
    # Mock analysis logic
    experience = 3 if 'experience' in text_lower else 1
    skills = ['Python', 'JavaScript', 'React'] if any(x in text_lower for x in ['python', 'javascript', 'react']) else ['Basic Skills']
    
    return {
        "years_experience": experience,
        "key_skills": skills,
        "previous_roles": ["Software Developer at Tech Company", "Junior Developer at Startup"],
        "education": "Bachelor's in Computer Science, University of Technology, 2020",
        "relevance_score": 75,
        "category": "Qualified",
        "summary": "Candidate shows potential with relevant skills and some experience. Would benefit from additional project experience."
    }
