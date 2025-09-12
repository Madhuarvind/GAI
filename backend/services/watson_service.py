import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

client = OpenAI()

def analyze_resume_with_watson(resume_text, job_description=None):
    """
    Analyze resume using OpenAI API.
    """
    prompt = f"""
    You are an expert HR recruiter. Analyze the following resume and provide a comprehensive assessment.

    RESUME TEXT:
    {resume_text[:4000]}  # Limit text to avoid token limits

    Please analyze this resume and provide:
    1. Years of experience (numeric value)
    2. Key skills and technologies (comma-separated list)
    3. Previous job roles and companies
    4. Education background
    5. Certifications
    6. Projects and achievements
    7. Identify hidden skills or related skills (e.g., if 'TensorFlow' is mentioned, infer 'Deep Learning')
    8. Overall relevance score (0-100) for a software engineering role
    9. Categorization: "Highly Qualified", "Qualified", or "Not a Fit"
    10. Brief summary of candidate's strengths and weaknesses

    Format your response as valid JSON with these exact keys:
    {{

            "years_experience": number,
            "key_skills": ["skill1", "skill2", ...],
            "hidden_skills": ["hidden_skill1", "hidden_skill2", ...],
            "previous_roles": ["role1 at company1", "role2 at company2", ...],
            "education": "degree, institution, year",
            "certifications": ["cert1", "cert2", ...],
            "projects_achievements": ["project1", "achievement1", ...],
            "relevance_score": number,
            "category": "Highly Qualified|Qualified|Not a Fit",
            "summary": "brief summary text"
    }}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )
        assistant_response = response.choices[0].message.content
        analysis_result = json.loads(assistant_response)
        return analysis_result
    except Exception as e:
        raise Exception(f"OpenAI analysis failed: {str(e)}")

# Chatbot interaction for candidate-specific queries
def chat_with_watson(message, candidate_id=None):
    """
    Chatbot interaction with Watsonx.ai for candidate-specific questions.
    """
    try:
        api_key = os.getenv('WATSONX_API_KEY')
        url = os.getenv('WATSONX_URL')
        project_id = os.getenv('WATSONX_PROJECT_ID')
        if not all([api_key, url, project_id]):
            raise Exception("Watsonx.ai credentials not configured.")

        authenticator = IAMAuthenticator(api_key)
        assistant = AssistantV2(version='2023-06-15', authenticator=authenticator)
        assistant.set_service_url(url)

        # Compose prompt with candidate context if candidate_id provided
        prompt = f"You are an AI assistant for recruitment. Answer the question based on candidate data.\nQuestion: {message}"
        if candidate_id:
            prompt += f"\nCandidate ID: {candidate_id}"

        session_response = assistant.create_session(assistant_id=project_id)
        session_id = session_response.get_result()['session_id']

        response = assistant.message(
            assistant_id=project_id,
            session_id=session_id,
            input={
                'message_type': 'text',
                'text': prompt,
                'options': {'return_context': True}
            }
        )
        assistant_response = response.get_result()['output']['generic'][0]['text']

        assistant.delete_session(assistant_id=project_id, session_id=session_id)

        return assistant_response

    except Exception as e:
        return f"Chatbot error: {str(e)}"

# HR Query Chatbot for general HR queries
def hr_query_chatbot(message):
    """
    Chatbot interaction for HR queries about candidates in general.
    """
    try:
        api_key = os.getenv('WATSONX_API_KEY')
        url = os.getenv('WATSONX_URL')
        project_id = os.getenv('WATSONX_PROJECT_ID')
        if not all([api_key, url, project_id]):
            raise Exception("Watsonx.ai credentials not configured.")

        authenticator = IAMAuthenticator(api_key)
        assistant = AssistantV2(version='2023-06-15', authenticator=authenticator)
        assistant.set_service_url(url)

        prompt = f"You are an AI assistant for HR. Answer the following query:\n{message}"

        session_response = assistant.create_session(assistant_id=project_id)
        session_id = session_response.get_result()['session_id']

        response = assistant.message(
            assistant_id=project_id,
            session_id=session_id,
            input={
                'message_type': 'text',
                'text': prompt,
                'options': {'return_context': True}
            }
        )
        assistant_response = response.get_result()['output']['generic'][0]['text']

        assistant.delete_session(assistant_id=project_id, session_id=session_id)

        return assistant_response

    except Exception as e:
        return f"HR Chatbot error: {str(e)}"

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
