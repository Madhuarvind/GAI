import re
from typing import Dict, List, Tuple

class BiasDetector:
    def __init__(self):
        # Gender-related terms
        self.gender_terms = {
            'male': ['he', 'him', 'his', 'man', 'men', 'boy', 'boys', 'male', 'masculine', 'gentleman', 'mr', 'sir'],
            'female': ['she', 'her', 'hers', 'woman', 'women', 'girl', 'girls', 'female', 'feminine', 'lady', 'ms', 'mrs', 'miss'],
            'neutral': ['they', 'them', 'their', 'person', 'people', 'individual', 'candidate', 'applicant']
        }

        # Age-related patterns
        self.age_patterns = [
            r'\b\d{1,2}\s*(?:years?|yrs?|yo)\b',
            r'\b(?:young|old|senior|junior|experienced|inexperienced)\b',
            r'\b(?:fresh|recent|new)\s*(?:graduate|grad)\b',
            r'\b(?:mid|late|early)\s*\d{1,2}s\b'
        ]

        # Location/cultural bias terms
        self.location_bias_terms = [
            'international', 'domestic', 'local', 'foreign', 'overseas',
            'immigrant', 'migrant', 'expat', 'native', 'citizen'
        ]

        # Education bias terms
        self.education_bias_terms = [
            'ivy league', 'top-tier', 'prestigious', 'elite',
            'ivy', 'harvard', 'stanford', 'mit', 'oxford', 'cambridge'
        ]

    def analyze_bias(self, text: str) -> Dict:
        """Analyze text for potential bias indicators"""
        text_lower = text.lower()

        bias_analysis = {
            'gender_bias': self._detect_gender_bias(text_lower),
            'age_bias': self._detect_age_bias(text_lower),
            'location_bias': self._detect_location_bias(text_lower),
            'education_bias': self._detect_education_bias(text_lower),
            'overall_bias_score': 0,
            'bias_recommendations': [],
            'bias_free_score': 100
        }

        # Calculate overall bias score
        bias_scores = [
            bias_analysis['gender_bias']['score'],
            bias_analysis['age_bias']['score'],
            bias_analysis['location_bias']['score'],
            bias_analysis['education_bias']['score']
        ]

        bias_analysis['overall_bias_score'] = sum(bias_scores) / len(bias_scores)
        bias_analysis['bias_free_score'] = 100 - bias_analysis['overall_bias_score']

        # Generate recommendations
        bias_analysis['bias_recommendations'] = self._generate_recommendations(bias_analysis)

        return bias_analysis

    def _detect_gender_bias(self, text: str) -> Dict:
        """Detect gender-related bias in text"""
        male_count = sum(1 for term in self.gender_terms['male'] if term in text)
        female_count = sum(1 for term in self.gender_terms['female'] if term in text)
        neutral_count = sum(1 for term in self.gender_terms['neutral'] if term in text)

        total_gender_terms = male_count + female_count
        bias_score = 0

        if total_gender_terms > 0:
            # Calculate imbalance
            if male_count > female_count:
                imbalance_ratio = male_count / (female_count + 1)
            else:
                imbalance_ratio = female_count / (male_count + 1)

            bias_score = min(50, imbalance_ratio * 10)  # Scale to 0-50

        return {
            'score': bias_score,
            'male_terms': male_count,
            'female_terms': female_count,
            'neutral_terms': neutral_count,
            'recommendation': 'Use gender-neutral language' if bias_score > 10 else None
        }

    def _detect_age_bias(self, text: str) -> Dict:
        """Detect age-related bias in text"""
        age_indicators = 0

        for pattern in self.age_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            age_indicators += len(matches)

        # Additional age-related terms
        age_terms = ['young', 'old', 'senior', 'junior', 'experienced', 'inexperienced', 'fresh graduate']
        for term in age_terms:
            age_indicators += text.count(term)

        bias_score = min(50, age_indicators * 5)  # Scale to 0-50

        return {
            'score': bias_score,
            'age_indicators': age_indicators,
            'recommendation': 'Focus on skills and experience rather than age' if bias_score > 10 else None
        }

    def _detect_location_bias(self, text: str) -> Dict:
        """Detect location/cultural bias in text"""
        location_indicators = 0

        for term in self.location_bias_terms:
            location_indicators += text.count(term)

        # Check for specific location mentions
        location_patterns = [
            r'\b(?:from|in|at)\s+(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',  # City/Country names
            r'\b(?:asian|african|european|american|middle eastern)\b'
        ]

        for pattern in location_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            location_indicators += len(matches)

        bias_score = min(50, location_indicators * 3)  # Scale to 0-50

        return {
            'score': bias_score,
            'location_indicators': location_indicators,
            'recommendation': 'Consider remote work capabilities' if bias_score > 10 else None
        }

    def _detect_education_bias(self, text: str) -> Dict:
        """Detect education/institution bias in text"""
        education_indicators = 0

        for term in self.education_bias_terms:
            education_indicators += text.count(term)

        # Check for university rankings or prestige indicators
        prestige_patterns = [
            r'\b(?:ranked|top|best|leading|premier)\s+(?:university|college|school|institution)\b',
            r'\b(?:tier|elite|prestigious|ivy)\b'
        ]

        for pattern in prestige_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            education_indicators += len(matches)

        bias_score = min(50, education_indicators * 4)  # Scale to 0-50

        return {
            'score': bias_score,
            'education_indicators': education_indicators,
            'recommendation': 'Value all educational backgrounds equally' if bias_score > 10 else None
        }

    def _generate_recommendations(self, bias_analysis: Dict) -> List[str]:
        """Generate bias mitigation recommendations"""
        recommendations = []

        if bias_analysis['gender_bias']['score'] > 10:
            recommendations.append("Use gender-neutral language in job descriptions")
            recommendations.append("Focus on skills and experience rather than gender-specific terms")

        if bias_analysis['age_bias']['score'] > 10:
            recommendations.append("Emphasize skills and competencies over years of experience")
            recommendations.append("Consider transferable skills from various career stages")

        if bias_analysis['location_bias']['score'] > 10:
            recommendations.append("Highlight remote work opportunities")
            recommendations.append("Focus on timezone compatibility rather than location")

        if bias_analysis['education_bias']['score'] > 10:
            recommendations.append("Value all educational institutions equally")
            recommendations.append("Consider practical experience alongside formal education")

        if not recommendations:
            recommendations.append("No significant bias detected - good job maintaining fair language!")

        return recommendations

    def create_blind_resume(self, resume_text: str) -> Tuple[str, Dict]:
        """Create a blind version of the resume by removing personal identifiers"""
        blind_text = resume_text

        # Remove names (common patterns)
        name_patterns = [
            r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # First Last
            r'\b[A-Z][a-z]+\s+[A-Z]\.\s*[A-Z][a-z]+\b',  # First M. Last
            r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b'  # First Middle Last
        ]

        removed_info = {'names': [], 'emails': [], 'phones': [], 'addresses': []}

        for pattern in name_patterns:
            matches = re.findall(pattern, blind_text)
            for match in matches:
                if match not in ['This Is', 'That Is', 'It Is']:  # Avoid common phrases
                    removed_info['names'].append(match)
                    blind_text = blind_text.replace(match, '[NAME REMOVED]')

        # Remove email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, blind_text)
        for email in emails:
            removed_info['emails'].append(email)
            blind_text = blind_text.replace(email, '[EMAIL REMOVED]')

        # Remove phone numbers
        phone_pattern = r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b'
        phones = re.findall(phone_pattern, blind_text)
        for phone in phones:
            phone_str = ''.join(phone)
            removed_info['phones'].append(phone_str)
            blind_text = blind_text.replace(phone_str, '[PHONE REMOVED]')

        # Remove addresses (basic pattern)
        address_pattern = r'\b\d+\s+[A-Za-z0-9\s,.-]+\b'
        addresses = re.findall(address_pattern, blind_text)
        for address in addresses:
            if len(address.split()) > 3:  # Likely an address if more than 3 words
                removed_info['addresses'].append(address)
                blind_text = blind_text.replace(address, '[ADDRESS REMOVED]')

        return blind_text, removed_info

def analyze_resume_bias(resume_text: str) -> Dict:
    """Main function to analyze resume for bias"""
    detector = BiasDetector()
    return detector.analyze_bias(resume_text)

def create_blind_version(resume_text: str) -> Tuple[str, Dict]:
    """Main function to create blind resume version"""
    detector = BiasDetector()
    return detector.create_blind_resume(resume_text)
