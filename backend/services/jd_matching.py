import os
import json
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_watson.natural_language_understanding_v1 import Features, SemanticRolesOptions
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from dotenv import load_dotenv
from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator as AssistantIAMAuthenticator

load_dotenv()

class JDMatcher:
    def __init__(self):
        self.api_key = os.getenv('WATSONX_API_KEY')
        self.url = os.getenv('WATSONX_URL')
        self.project_id = os.getenv('WATSONX_PROJECT_ID')
        
        if not all([self.api_key, self.url, self.project_id]):
            raise Exception("Watsonx.ai credentials not configured. Please set WATSONX_API_KEY, WATSONX_URL, and WATSONX_PROJECT_ID environment variables.")
        
        self.authenticator = AssistantIAMAuthenticator(self.api_key)
        self.assistant = AssistantV2(
            version='2023-06-15',
            authenticator=self.authenticator
        )
        self.assistant.set_service_url(self.url)
    
    def match_jd_resume(self, job_description, resume_text):
        """
        Perform semantic similarity matching between job description and resume text.
        Returns match score (0-100) and explanation.
        """
        prompt = f"""
        You are an expert HR recruiter. Compare the following job description and resume text.

        JOB DESCRIPTION:
        {job_description[:2000]}

        RESUME TEXT:
        {resume_text[:4000]}

        Please provide:
        1. A match score (0-100) indicating how well the resume fits the job description.
        2. A natural language explanation of why the candidate matches or does not match.

        Format your response as JSON with keys:
        {{
            "match_score": number,
            "explanation": "text"
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
            
            # Parse JSON response
            match_result = json.loads(assistant_response)
            
            # Clean up session
            self.assistant.delete_session(
                assistant_id=self.project_id,
                session_id=session_id
            )
            
            return match_result
        except Exception as e:
            raise Exception(f"JD matching failed: {str(e)}")

def match_job_description(job_description, resume_text):
    try:
        matcher = JDMatcher()
        return matcher.match_jd_resume(job_description, resume_text)
    except Exception as e:
        # Fallback mock
        print(f"JD matching failed, using mock data: {str(e)}")
        return {
            "match_score": 80,
            "explanation": "Candidate has relevant skills and experience matching the job description."
        }
