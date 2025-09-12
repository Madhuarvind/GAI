import unittest

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

class TestWatsonService(unittest.TestCase):

    def test_get_mock_analysis(self):
        """Test mock analysis function returns expected structure"""
        resume_text = "John Doe\nSoftware Engineer\nPython, JavaScript\n5 years experience"

        result = get_mock_analysis(resume_text)

        # Check that all required keys are present
        required_keys = [
            'years_experience', 'key_skills', 'previous_roles',
            'education', 'relevance_score', 'category', 'summary'
        ]

        for key in required_keys:
            self.assertIn(key, result)

        # Check data types
        self.assertIsInstance(result['years_experience'], int)
        self.assertIsInstance(result['key_skills'], list)
        self.assertIsInstance(result['previous_roles'], list)
        self.assertIsInstance(result['education'], str)
        self.assertIsInstance(result['relevance_score'], int)
        self.assertIsInstance(result['category'], str)
        self.assertIsInstance(result['summary'], str)

        # Check value ranges
        self.assertGreaterEqual(result['relevance_score'], 0)
        self.assertLessEqual(result['relevance_score'], 100)
        self.assertIn(result['category'], ['Highly Qualified', 'Qualified', 'Not a Fit'])

if __name__ == '__main__':
    unittest.main()
