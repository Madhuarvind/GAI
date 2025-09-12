import unittest
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.watson_service import get_mock_analysis

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
