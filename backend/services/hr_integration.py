import requests
import json
import pandas as pd
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class HRIntegrationService:
    """Service for integrating with HR systems and ATS platforms"""

    def __init__(self):
        self.supported_systems = {
            'workday': {
                'name': 'Workday',
                'api_version': 'v1',
                'endpoints': {
                    'candidates': '/api/v1/candidates',
                    'applications': '/api/v1/applications'
                }
            },
            'greenhouse': {
                'name': 'Greenhouse',
                'api_version': 'v1',
                'endpoints': {
                    'candidates': '/v1/candidates',
                    'applications': '/v1/applications'
                }
            },
            'sap': {
                'name': 'SAP SuccessFactors',
                'api_version': 'v2',
                'endpoints': {
                    'candidates': '/odata/v2/Candidate',
                    'applications': '/odata/v2/JobApplication'
                }
            }
        }

    def send_to_hr_system(self, system_name, candidate_data, api_key=None, api_url=None):
        """
        Send candidate data to HR system

        Args:
            system_name (str): Name of HR system (workday, greenhouse, sap)
            candidate_data (dict): Candidate information to send
            api_key (str): API key for authentication
            api_url (str): Base URL for the HR system API

        Returns:
            dict: Response from HR system
        """
        if system_name not in self.supported_systems:
            raise ValueError(f"Unsupported HR system: {system_name}")

        if not api_key or not api_url:
            raise ValueError("API key and URL are required")

        system_config = self.supported_systems[system_name]

        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }

            # Format candidate data for the specific HR system
            formatted_data = self._format_candidate_data(system_name, candidate_data)

            endpoint = f"{api_url.rstrip('/')}{system_config['endpoints']['candidates']}"

            response = requests.post(endpoint, json=formatted_data, headers=headers, timeout=30)

            if response.status_code in [200, 201]:
                logger.info(f"Successfully sent candidate to {system_config['name']}")
                return {
                    'success': True,
                    'system': system_config['name'],
                    'response': response.json(),
                    'status_code': response.status_code
                }
            else:
                logger.error(f"Failed to send candidate to {system_config['name']}: {response.text}")
                return {
                    'success': False,
                    'system': system_config['name'],
                    'error': response.text,
                    'status_code': response.status_code
                }

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {system_config['name']}: {str(e)}")
            return {
                'success': False,
                'system': system_config['name'],
                'error': str(e)
            }

    def _format_candidate_data(self, system_name, candidate_data):
        """Format candidate data according to HR system requirements"""

        base_data = {
            'first_name': candidate_data.get('first_name', ''),
            'last_name': candidate_data.get('last_name', ''),
            'email': candidate_data.get('email', ''),
            'phone': candidate_data.get('phone', ''),
            'resume_text': candidate_data.get('resume_text', ''),
            'skills': candidate_data.get('key_skills', []),
            'experience_years': candidate_data.get('years_experience', 0),
            'education': candidate_data.get('education', ''),
            'current_position': candidate_data.get('current_position', ''),
            'location': candidate_data.get('location', ''),
            'source': 'AI Resume Screener'
        }

        if system_name == 'workday':
            return {
                'candidate': {
                    'personalInfo': {
                        'firstName': base_data['first_name'],
                        'lastName': base_data['last_name'],
                        'email': base_data['email'],
                        'phone': base_data['phone']
                    },
                    'professionalInfo': {
                        'skills': base_data['skills'],
                        'experience': base_data['experience_years'],
                        'education': base_data['education'],
                        'currentPosition': base_data['current_position']
                    },
                    'attachments': [{
                        'type': 'resume',
                        'content': base_data['resume_text']
                    }],
                    'source': base_data['source']
                }
            }

        elif system_name == 'greenhouse':
            return {
                'first_name': base_data['first_name'],
                'last_name': base_data['last_name'],
                'email_addresses': [{'value': base_data['email'], 'type': 'personal'}],
                'phone_numbers': [{'value': base_data['phone'], 'type': 'mobile'}],
                'custom_fields': {
                    'skills': ', '.join(base_data['skills']),
                    'experience_years': str(base_data['experience_years']),
                    'education': base_data['education'],
                    'source': base_data['source']
                },
                'attachments': [{
                    'filename': 'resume.txt',
                    'content': base_data['resume_text'],
                    'content_type': 'text/plain'
                }]
            }

        elif system_name == 'sap':
            return {
                'firstName': base_data['first_name'],
                'lastName': base_data['last_name'],
                'email': base_data['email'],
                'phone': base_data['phone'],
                'backgroundElements': {
                    'education': [{'school': base_data['education']}],
                    'experience': [{'company': base_data['current_position'], 'years': base_data['experience_years']}]
                },
                'skills': [{'skillName': skill} for skill in base_data['skills']],
                'attachments': [{
                    'fileName': 'resume.txt',
                    'fileContent': base_data['resume_text']
                }]
            }

        return base_data

    def export_candidate_insights(self, candidate_data, export_format='json'):
        """
        Export candidate insights in various formats

        Args:
            candidate_data (dict): Complete candidate data
            export_format (str): Export format (json, pdf, excel)

        Returns:
            bytes: Exported data in bytes
        """
        if export_format == 'json':
            return self._export_json(candidate_data)
        elif export_format == 'pdf':
            return self._export_pdf(candidate_data)
        elif export_format == 'excel':
            return self._export_excel(candidate_data)
        else:
            raise ValueError(f"Unsupported export format: {export_format}")

    def _export_json(self, candidate_data):
        """Export candidate data as JSON"""
        export_data = {
            'candidate_info': {
                'id': candidate_data.get('id'),
                'filename': candidate_data.get('filename'),
                'upload_date': candidate_data.get('upload_date'),
                'relevance_score': candidate_data.get('analysis_result', {}).get('relevance_score'),
                'category': candidate_data.get('analysis_result', {}).get('category'),
                'years_experience': candidate_data.get('analysis_result', {}).get('years_experience'),
                'key_skills': candidate_data.get('analysis_result', {}).get('key_skills', []),
                'education': candidate_data.get('analysis_result', {}).get('education'),
                'previous_roles': candidate_data.get('analysis_result', {}).get('previous_roles', [])
            },
            'bias_analysis': candidate_data.get('bias_analysis', {}),
            'profile_enrichment': candidate_data.get('profile_enrichment', {}),
            'job_match': candidate_data.get('jd_match_result', {}),
            'advanced_ranking': candidate_data.get('advanced_ranking', {}),
            'export_date': datetime.now().isoformat()
        }

        return json.dumps(export_data, indent=2).encode('utf-8')

    def _export_pdf(self, candidate_data):
        """Export candidate data as PDF"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title = Paragraph(f"Candidate Analysis Report - {candidate_data.get('filename', 'Unknown')}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))

        # Basic Information
        story.append(Paragraph("Basic Information", styles['Heading2']))
        basic_info = [
            ['Field', 'Value'],
            ['Upload Date', candidate_data.get('upload_date', 'N/A')],
            ['Relevance Score', f"{candidate_data.get('analysis_result', {}).get('relevance_score', 'N/A')}%"],
            ['Category', candidate_data.get('analysis_result', {}).get('category', 'N/A')],
            ['Years of Experience', str(candidate_data.get('analysis_result', {}).get('years_experience', 'N/A'))],
            ['Education', candidate_data.get('analysis_result', {}).get('education', 'N/A')]
        ]

        table = Table(basic_info)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(table)
        story.append(Spacer(1, 12))

        # Skills
        story.append(Paragraph("Key Skills", styles['Heading2']))
        skills = candidate_data.get('analysis_result', {}).get('key_skills', [])
        if skills:
            skills_text = ', '.join(skills)
        else:
            skills_text = 'No skills listed'
        story.append(Paragraph(skills_text, styles['Normal']))
        story.append(Spacer(1, 12))

        # Summary
        story.append(Paragraph("Summary", styles['Heading2']))
        summary = candidate_data.get('analysis_result', {}).get('summary', 'No summary available')
        story.append(Paragraph(summary, styles['Normal']))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    def _export_excel(self, candidate_data):
        """Export candidate data as Excel"""
        buffer = BytesIO()

        # Create multiple sheets
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            # Basic Info Sheet
            basic_info = {
                'Field': ['ID', 'Filename', 'Upload Date', 'Relevance Score', 'Category', 'Experience', 'Education'],
                'Value': [
                    candidate_data.get('id', ''),
                    candidate_data.get('filename', ''),
                    candidate_data.get('upload_date', ''),
                    candidate_data.get('analysis_result', {}).get('relevance_score', ''),
                    candidate_data.get('analysis_result', {}).get('category', ''),
                    candidate_data.get('analysis_result', {}).get('years_experience', ''),
                    candidate_data.get('analysis_result', {}).get('education', '')
                ]
            }
            df_basic = pd.DataFrame(basic_info)
            df_basic.to_excel(writer, sheet_name='Basic Info', index=False)

            # Skills Sheet
            skills = candidate_data.get('analysis_result', {}).get('key_skills', [])
            if skills:
                df_skills = pd.DataFrame({'Skill': skills})
                df_skills.to_excel(writer, sheet_name='Skills', index=False)

            # Bias Analysis Sheet
            bias_data = candidate_data.get('bias_analysis', {})
            if bias_data:
                df_bias = pd.DataFrame(list(bias_data.items()), columns=['Metric', 'Value'])
                df_bias.to_excel(writer, sheet_name='Bias Analysis', index=False)

        buffer.seek(0)
        return buffer.getvalue()

    def get_supported_systems(self):
        """Get list of supported HR systems"""
        return list(self.supported_systems.keys())

    def validate_hr_connection(self, system_name, api_key, api_url):
        """Validate connection to HR system"""
        if system_name not in self.supported_systems:
            return {'valid': False, 'error': f'Unsupported system: {system_name}'}

        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }

            # Try a simple GET request to test connection
            test_url = f"{api_url.rstrip('/')}/health"  # Assuming health endpoint exists
            response = requests.get(test_url, headers=headers, timeout=10)

            return {
                'valid': response.status_code == 200,
                'system': self.supported_systems[system_name]['name'],
                'status_code': response.status_code
            }

        except requests.exceptions.RequestException as e:
            return {
                'valid': False,
                'system': self.supported_systems[system_name]['name'],
                'error': str(e)
            }


# Global instance
hr_integration = HRIntegrationService()


def send_candidate_to_hr(system_name, candidate_data, api_key=None, api_url=None):
    """Convenience function to send candidate to HR system"""
    return hr_integration.send_to_hr_system(system_name, candidate_data, api_key, api_url)


def export_candidate_data(candidate_data, export_format='json'):
    """Convenience function to export candidate data"""
    return hr_integration.export_candidate_insights(candidate_data, export_format)


def validate_hr_system_connection(system_name, api_key, api_url):
    """Convenience function to validate HR system connection"""
    return hr_integration.validate_hr_connection(system_name, api_key, api_url)


def get_supported_hr_systems():
    """Get list of supported HR systems"""
    return hr_integration.get_supported_systems()
