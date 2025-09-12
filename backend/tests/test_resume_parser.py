import unittest
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.resume_parser import extract_text_from_file

class TestResumeParser(unittest.TestCase):

    def setUp(self):
        # Create a test PDF file content
        self.test_pdf_path = 'test_resume.pdf'
        # For testing, we'll create a simple text file to simulate PDF content
        with open(self.test_pdf_path, 'w') as f:
            f.write("John Doe\nSoftware Engineer\n5 years experience\nPython, JavaScript, React")

    def tearDown(self):
        # Clean up test files
        if os.path.exists(self.test_pdf_path):
            os.remove(self.test_pdf_path)

    def test_extract_text_from_file_unsupported(self):
        """Test text extraction from unsupported file format"""
        # This will test the fallback for unsupported formats
        try:
            text = extract_text_from_file(self.test_pdf_path)
            self.fail("Should have raised an exception for unsupported format")
        except Exception as e:
            # Expected for unsupported format
            self.assertIn("Unsupported file format", str(e))

    def test_extract_text_from_file_txt(self):
        """Test text extraction from txt file"""
        # Create a text file
        txt_path = 'test_resume.txt'
        with open(txt_path, 'w') as f:
            f.write("John Doe\nSoftware Engineer\n5 years experience\nPython, JavaScript, React")

        try:
            text = extract_text_from_file(txt_path)
            self.assertIsInstance(text, str)
            self.assertGreater(len(text), 0)
            self.assertIn("John Doe", text)
        except Exception as e:
            # Should not happen for txt files
            self.fail(f"Unexpected error: {str(e)}")
        finally:
            if os.path.exists(txt_path):
                os.remove(txt_path)

if __name__ == '__main__':
    unittest.main()
