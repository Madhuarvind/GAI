import requests
import re

def extract_links(text):
    """Extract LinkedIn and GitHub URLs from text"""
    linkedin_pattern = r'https?://(www\.)?linkedin\.com/in/[A-Za-z0-9_-]+'
    github_pattern = r'https?://(www\.)?github\.com/[A-Za-z0-9_-]+'
    
    linkedin_links = re.findall(linkedin_pattern, text)
    github_links = re.findall(github_pattern, text)
    
    return linkedin_links, github_links

def verify_linkedin_profile(url):
    """Verify LinkedIn profile exists and fetch basic info (mock implementation)"""
    # Real implementation would use LinkedIn API or scraping with authentication
    # Here we mock the response
    return {
        'url': url,
        'name': 'John Doe',
        'headline': 'Software Engineer at Tech Company',
        'location': 'San Francisco, CA',
        'connections': 500
    }

def verify_github_profile(url):
    """Verify GitHub profile exists and fetch basic info"""
    try:
        username = url.rstrip('/').split('/')[-1]
        api_url = f'https://api.github.com/users/{username}'
        response = requests.get(api_url)
        if response.status_code == 200:
            data = response.json()
            return {
                'url': url,
                'name': data.get('name'),
                'public_repos': data.get('public_repos'),
                'followers': data.get('followers'),
                'following': data.get('following'),
                'bio': data.get('bio')
            }
        else:
            return None
    except Exception as e:
        return None

def enrich_candidate_profiles(resume_text):
    """Extract and verify LinkedIn and GitHub profiles from resume text"""
    linkedin_links, github_links = extract_links(resume_text)
    
    linkedin_profiles = [verify_linkedin_profile(url) for url in linkedin_links]
    github_profiles = [verify_github_profile(url) for url in github_links]
    
    return {
        'linkedin_profiles': linkedin_profiles,
        'github_profiles': github_profiles
    }
