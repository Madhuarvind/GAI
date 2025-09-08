import re
from typing import Dict, List, Tuple
from datetime import datetime
import json

class AdvancedRankingService:
    def __init__(self):
        # Culture fit indicators
        self.culture_keywords = {
            'leadership': ['lead', 'manage', 'direct', 'supervise', 'mentor', 'guide', 'influence'],
            'collaboration': ['team', 'collaborate', 'cooperate', 'partnership', 'together', 'group', 'collective'],
            'innovation': ['innovate', 'creative', 'innovative', 'research', 'develop', 'design', 'pioneer'],
            'excellence': ['quality', 'excellence', 'best', 'superior', 'outstanding', 'exceptional', 'premium'],
            'integrity': ['ethical', 'honest', 'transparent', 'responsible', 'accountable', 'trustworthy'],
            'growth': ['learn', 'grow', 'develop', 'improve', 'advance', 'progress', 'evolve']
        }

        # Career trajectory patterns
        self.trajectory_patterns = {
            'rapid_growth': [
                r'promoted?\s+within\s+\d+\s+(?:year|month)s?',
                r'advanced\s+quickly',
                r'fast\s+track',
                r'accelerated\s+career'
            ],
            'steady_progression': [
                r'promoted?\s+(?:\d+\s+times?|multiple\s+times?)',
                r'steady\s+advancement',
                r'consistent\s+growth'
            ],
            'leadership_potential': [
                r'led\s+teams?',
                r'managed\s+projects?',
                r'supervised\s+staff',
                r'mentored\s+(?:team|staff)'
            ]
        }

        # Skill gap analysis
        self.skill_categories = {
            'technical': ['python', 'java', 'javascript', 'sql', 'aws', 'docker', 'kubernetes', 'react', 'node.js'],
            'soft_skills': ['communication', 'leadership', 'problem solving', 'teamwork', 'adaptability'],
            'domain_expertise': ['machine learning', 'data science', 'cybersecurity', 'cloud computing', 'devops']
        }

    def analyze_culture_fit(self, resume_text: str, company_values: List[str] = None) -> Dict:
        """Analyze culture fit based on resume content and company values"""
        resume_lower = resume_text.lower()

        culture_scores = {}
        total_indicators = 0

        # Analyze predefined culture dimensions
        for dimension, keywords in self.culture_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in resume_lower)
            culture_scores[dimension] = min(100, matches * 20)  # Scale to 0-100
            total_indicators += matches

        # Company-specific values analysis
        company_fit_score = 0
        if company_values:
            company_matches = 0
            for value in company_values:
                if value.lower() in resume_lower:
                    company_matches += 1
            company_fit_score = (company_matches / len(company_values)) * 100 if company_values else 0

        overall_culture_score = sum(culture_scores.values()) / len(culture_scores)

        return {
            'overall_score': overall_culture_score,
            'dimension_scores': culture_scores,
            'company_fit_score': company_fit_score,
            'total_indicators': total_indicators,
            'recommendations': self._generate_culture_recommendations(culture_scores)
        }

    def predict_career_trajectory(self, resume_text: str, current_experience: int = 0) -> Dict:
        """Predict career trajectory and growth potential"""
        resume_lower = resume_text.lower()

        trajectory_scores = {}

        # Analyze rapid growth indicators
        rapid_growth_matches = 0
        for pattern in self.trajectory_patterns['rapid_growth']:
            if re.search(pattern, resume_lower, re.IGNORECASE):
                rapid_growth_matches += 1

        # Analyze steady progression
        steady_progression_matches = 0
        for pattern in self.trajectory_patterns['steady_progression']:
            if re.search(pattern, resume_lower, re.IGNORECASE):
                steady_progression_matches += 1

        # Analyze leadership potential
        leadership_matches = 0
        for pattern in self.trajectory_patterns['leadership_potential']:
            if re.search(pattern, resume_lower, re.IGNORECASE):
                leadership_matches += 1

        # Calculate trajectory scores
        trajectory_scores['rapid_growth'] = min(100, rapid_growth_matches * 25)
        trajectory_scores['steady_progression'] = min(100, steady_progression_matches * 20)
        trajectory_scores['leadership_potential'] = min(100, leadership_matches * 15)

        # Overall trajectory score
        overall_trajectory = (
            trajectory_scores['rapid_growth'] * 0.4 +
            trajectory_scores['steady_progression'] * 0.3 +
            trajectory_scores['leadership_potential'] * 0.3
        )

        # Predict senior role potential
        senior_potential = self._calculate_senior_potential(current_experience, trajectory_scores)

        return {
            'overall_trajectory_score': overall_trajectory,
            'trajectory_components': trajectory_scores,
            'senior_role_potential': senior_potential,
            'growth_prediction': self._predict_growth_trajectory(trajectory_scores, current_experience),
            'recommendations': self._generate_trajectory_recommendations(trajectory_scores)
        }

    def analyze_skill_gaps(self, resume_text: str, job_requirements: List[str] = None) -> Dict:
        """Analyze skill gaps between resume and job requirements"""
        resume_lower = resume_text.lower()

        skill_analysis = {}

        # Analyze technical skills
        technical_skills = []
        for skill in self.skill_categories['technical']:
            if skill in resume_lower:
                technical_skills.append(skill)

        # Analyze soft skills
        soft_skills = []
        for skill in self.skill_categories['soft_skills']:
            if skill in resume_lower:
                soft_skills.append(skill)

        # Analyze domain expertise
        domain_skills = []
        for skill in self.skill_categories['domain_expertise']:
            if skill in resume_lower:
                domain_skills.append(skill)

        skill_analysis['technical'] = {
            'found': technical_skills,
            'coverage': len(technical_skills) / len(self.skill_categories['technical']) * 100
        }

        skill_analysis['soft_skills'] = {
            'found': soft_skills,
            'coverage': len(soft_skills) / len(self.skill_categories['soft_skills']) * 100
        }

        skill_analysis['domain'] = {
            'found': domain_skills,
            'coverage': len(domain_skills) / len(self.skill_categories['domain_expertise']) * 100
        }

        # Job-specific gap analysis
        job_gaps = []
        if job_requirements:
            for requirement in job_requirements:
                requirement_lower = requirement.lower()
                found = any(skill in requirement_lower for skill in technical_skills + soft_skills + domain_skills)
                if not found and len(requirement.split()) > 1:  # Only check meaningful requirements
                    job_gaps.append(requirement)

        overall_skill_coverage = (
            skill_analysis['technical']['coverage'] * 0.5 +
            skill_analysis['soft_skills']['coverage'] * 0.3 +
            skill_analysis['domain']['coverage'] * 0.2
        )

        return {
            'overall_skill_coverage': overall_skill_coverage,
            'skill_analysis': skill_analysis,
            'job_specific_gaps': job_gaps,
            'missing_skills_count': len(job_gaps),
            'recommendations': self._generate_skill_recommendations(skill_analysis, job_gaps)
        }

    def generate_advanced_ranking(self, resume_text: str, job_description: str = None,
                                company_values: List[str] = None, current_experience: int = 0) -> Dict:
        """Generate comprehensive advanced ranking analysis"""

        # Extract job requirements from job description
        job_requirements = []
        if job_description:
            job_requirements = self._extract_job_requirements(job_description)

        # Perform all analyses
        culture_fit = self.analyze_culture_fit(resume_text, company_values)
        career_trajectory = self.predict_career_trajectory(resume_text, current_experience)
        skill_gaps = self.analyze_skill_gaps(resume_text, job_requirements)

        # Calculate overall advanced ranking score
        overall_score = (
            culture_fit['overall_score'] * 0.3 +
            career_trajectory['overall_trajectory_score'] * 0.3 +
            skill_gaps['overall_skill_coverage'] * 0.4
        )

        # Generate ranking tier
        ranking_tier = self._calculate_ranking_tier(overall_score, culture_fit, career_trajectory, skill_gaps)

        return {
            'overall_advanced_score': overall_score,
            'ranking_tier': ranking_tier,
            'culture_fit_analysis': culture_fit,
            'career_trajectory_analysis': career_trajectory,
            'skill_gap_analysis': skill_gaps,
            'key_strengths': self._identify_key_strengths(culture_fit, career_trajectory, skill_gaps),
            'development_areas': self._identify_development_areas(culture_fit, career_trajectory, skill_gaps),
            'recommendations': self._generate_overall_recommendations(culture_fit, career_trajectory, skill_gaps)
        }

    def _extract_job_requirements(self, job_description: str) -> List[str]:
        """Extract key requirements from job description"""
        requirements = []

        # Look for common requirement patterns
        patterns = [
            r'(?:requirements?|qualifications?|skills?|experience?)\s*:\s*(.*?)(?:\n|$)',
            r'(?:must\s+have|required|essential)\s+(.*?)(?:\n|$)'
        ]

        for pattern in patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                # Split by common delimiters and clean up
                items = re.split(r'[•·\-\*\n]', match)
                for item in items:
                    item = item.strip()
                    if len(item) > 10 and not any(word in item.lower() for word in ['and', 'or', 'the', 'with']):
                        requirements.append(item)

        return list(set(requirements))  # Remove duplicates

    def _calculate_senior_potential(self, experience: int, trajectory_scores: Dict) -> float:
        """Calculate potential for senior roles"""
        base_potential = min(100, experience * 5)  # Experience factor

        trajectory_factor = (
            trajectory_scores['leadership_potential'] * 0.5 +
            trajectory_scores['rapid_growth'] * 0.3 +
            trajectory_scores['steady_progression'] * 0.2
        )

        return (base_potential + trajectory_factor) / 2

    def _predict_growth_trajectory(self, trajectory_scores: Dict, experience: int) -> str:
        """Predict future career growth trajectory"""
        avg_score = sum(trajectory_scores.values()) / len(trajectory_scores)

        if avg_score >= 70 and experience >= 5:
            return "High potential for senior leadership roles"
        elif avg_score >= 50 and experience >= 3:
            return "Strong potential for mid-level advancement"
        elif avg_score >= 30:
            return "Moderate growth potential with development"
        else:
            return "May benefit from additional experience and skill development"

    def _calculate_ranking_tier(self, overall_score: float, culture_fit: Dict,
                              career_trajectory: Dict, skill_gaps: Dict) -> str:
        """Calculate ranking tier based on all factors"""
        if overall_score >= 80:
            return "Elite Candidate"
        elif overall_score >= 70:
            return "High Potential"
        elif overall_score >= 60:
            return "Strong Candidate"
        elif overall_score >= 50:
            return "Qualified Candidate"
        elif overall_score >= 40:
            return "Potential with Development"
        else:
            return "Needs Significant Development"

    def _identify_key_strengths(self, culture_fit: Dict, career_trajectory: Dict, skill_gaps: Dict) -> List[str]:
        """Identify key strengths across all analysis areas"""
        strengths = []

        # Culture fit strengths
        top_culture = max(culture_fit['dimension_scores'].items(), key=lambda x: x[1])
        if top_culture[1] >= 60:
            strengths.append(f"Strong {top_culture[0]} orientation")

        # Career trajectory strengths
        top_trajectory = max(career_trajectory['trajectory_components'].items(), key=lambda x: x[1])
        if top_trajectory[1] >= 60:
            strengths.append(f"Excellent {top_trajectory[0].replace('_', ' ')} record")

        # Skill strengths
        for category, analysis in skill_gaps['skill_analysis'].items():
            if analysis['coverage'] >= 70:
                strengths.append(f"Strong {category} skills coverage")

        return strengths

    def _identify_development_areas(self, culture_fit: Dict, career_trajectory: Dict, skill_gaps: Dict) -> List[str]:
        """Identify areas for development"""
        areas = []

        # Culture fit gaps
        low_culture = [k for k, v in culture_fit['dimension_scores'].items() if v < 40]
        if low_culture:
            areas.extend([f"Enhance {area} orientation" for area in low_culture])

        # Career trajectory gaps
        low_trajectory = [k for k, v in career_trajectory['trajectory_components'].items() if v < 40]
        if low_trajectory:
            areas.extend([f"Develop {area.replace('_', ' ')} skills" for area in low_trajectory])

        # Skill gaps
        if skill_gaps['job_specific_gaps']:
            areas.append(f"Address {len(skill_gaps['job_specific_gaps'])} job-specific skill gaps")

        return areas

    def _generate_culture_recommendations(self, culture_scores: Dict) -> List[str]:
        """Generate culture fit recommendations"""
        recommendations = []
        low_scores = [k for k, v in culture_scores.items() if v < 50]

        for area in low_scores:
            recommendations.append(f"Consider highlighting {area} experiences in resume and interviews")

        if not recommendations:
            recommendations.append("Strong cultural alignment - maintain current positioning")

        return recommendations

    def _generate_trajectory_recommendations(self, trajectory_scores: Dict) -> List[str]:
        """Generate career trajectory recommendations"""
        recommendations = []

        if trajectory_scores['leadership_potential'] < 50:
            recommendations.append("Seek leadership opportunities and team management roles")

        if trajectory_scores['rapid_growth'] < 50:
            recommendations.append("Consider roles with clear advancement paths and growth opportunities")

        if not recommendations:
            recommendations.append("Strong career progression - continue current trajectory")

        return recommendations

    def _generate_skill_recommendations(self, skill_analysis: Dict, job_gaps: List[str]) -> List[str]:
        """Generate skill development recommendations"""
        recommendations = []

        for category, analysis in skill_analysis.items():
            if analysis['coverage'] < 60:
                missing_count = len(self.skill_categories[category]) - len(analysis['found'])
                recommendations.append(f"Develop {missing_count} additional {category} skills")

        if job_gaps:
            recommendations.append(f"Address {len(job_gaps)} job-specific requirements through training or certification")

        if not recommendations:
            recommendations.append("Strong skill alignment - focus on deepening expertise")

        return recommendations

    def _generate_overall_recommendations(self, culture_fit: Dict, career_trajectory: Dict, skill_gaps: Dict) -> List[str]:
        """Generate comprehensive recommendations"""
        recommendations = []

        # Combine all recommendations
        recommendations.extend(culture_fit['recommendations'])
        recommendations.extend(career_trajectory['recommendations'])
        recommendations.extend(skill_gaps['recommendations'])

        # Remove duplicates and limit to top 5
        unique_recommendations = list(set(recommendations))[:5]

        return unique_recommendations

def analyze_advanced_ranking(resume_text: str, job_description: str = None,
                           company_values: List[str] = None, current_experience: int = 0) -> Dict:
    """Main function to perform advanced ranking analysis"""
    service = AdvancedRankingService()
    return service.generate_advanced_ranking(resume_text, job_description, company_values, current_experience)
