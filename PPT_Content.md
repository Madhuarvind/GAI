# Resume Screener Bot - Academic Project Presentation

## Slide 1: Title Slide

**RESUME SCREENER BOT**  
*AI-Powered Resume Screening System using IBM Watson*

**Student Name:** [Your Full Name]  
**Registration Number:** [Your Reg. No.]  
**Class:** [Your Class/Year]  
**Department:** [Your Department]  
**Batch:** [Your Batch]  
**Academic Year:** [Current Academic Year]  

**Project Guide:** [Guide Name]  
**Institution:** [Institution Name]  

---

## Slide 2: Abstract

**Project Overview:**  
The Resume Screener Bot is an innovative AI-powered system designed to automate the resume screening process for HR teams. Utilizing IBM Watsonx.ai Large Language Model (LLM), the system intelligently analyzes candidate resumes, extracts key information, and provides automated scoring and categorization.

**Key Objectives:**  
- Automate manual resume screening process  
- Implement AI-powered candidate evaluation  
- Detect and mitigate hiring biases  
- Provide interactive HR assistance tools  
- Ensure fair and efficient recruitment process  

**Technology Stack:** Python Flask (Backend), React.js (Frontend), IBM Watsonx.ai API, SQLite Database  

**Expected Outcome:** 80% reduction in manual screening time with improved hiring quality and fairness.

---

## Slide 3: Introduction

**Problem Statement:**  
In today's competitive job market, HR teams face significant challenges in efficiently screening large volumes of resumes. Manual review processes are time-consuming, prone to human error, and can introduce unconscious biases in candidate evaluation.

**Current Challenges:**  
- **Time Intensive:** 4-6 hours daily spent on manual resume review  
- **Inconsistency:** Different reviewers apply varying evaluation criteria  
- **Bias Potential:** Unconscious bias affecting hiring decisions  
- **Scalability Issues:** Difficulty handling high-volume applications  
- **Manual Data Extraction:** Tedious process of information gathering  

**Proposed Solution:**  
Development of an AI-powered Resume Screener Bot that automates the entire screening pipeline using advanced natural language processing and machine learning capabilities.

**Scope of Project:**  
- Resume upload and text extraction (PDF/DOCX)  
- AI-powered candidate analysis and scoring  
- Bias detection and fair screening implementation  
- Interactive chatbot for HR queries  
- Web-based dashboard for candidate management  

---

## Slide 4: Key Insights - Implementation Details

**Core Implementation Components:**

1. **Resume Processing Engine**
   - Text extraction from PDF and DOCX files using PyPDF2 and python-docx
   - Preprocessing and cleaning of extracted text
   - Support for multiple file formats and error handling

2. **AI Analysis Module**
   - Integration with IBM Watsonx.ai LLM
   - Custom prompt engineering for resume analysis
   - Structured JSON response parsing
   - Fallback mechanism for offline testing

3. **Bias Detection System**
   - Gender bias analysis using linguistic patterns
   - Age-related bias detection
   - Location and education bias identification
   - Blind resume creation for anonymous screening

4. **Database Architecture**
   - SQLite database for candidate data storage
   - Optimized queries for performance
   - Data persistence and retrieval operations

5. **Web Interface Development**
   - React.js frontend with Bootstrap styling
   - RESTful API communication
   - Responsive design for multiple devices

**Technical Innovations:**
- Custom Watson integration with specialized prompts
- Multi-dimensional bias detection algorithm
- Real-time chatbot interactions
- Scalable architecture for enterprise use

---

## Slide 5: Advantages & Disadvantages

**Advantages:**

✅ **Time Efficiency:** Reduces screening time by approximately 80%  
✅ **Consistency:** Standardized evaluation criteria across all candidates  
✅ **Bias Reduction:** Automated detection and mitigation of hiring biases  
✅ **Scalability:** Can handle large volumes of resumes simultaneously  
✅ **Cost Effective:** Low operational costs compared to manual processes  
✅ **User-Friendly:** Intuitive web interface for HR teams  
✅ **Data-Driven:** Analytics and insights for better hiring decisions  
✅ **Accessibility:** 24/7 availability for resume processing  

**Disadvantages:**

❌ **Initial Setup Cost:** Requires IBM Watson API configuration  
❌ **Technical Dependency:** Reliance on external AI services  
❌ **Learning Curve:** Training required for HR teams  
❌ **Data Privacy Concerns:** Handling sensitive candidate information  
❌ **Limited Customization:** Fixed evaluation criteria may not suit all organizations  
❌ **Internet Dependency:** Requires stable internet for AI processing  
❌ **File Format Limitations:** Currently supports only PDF and DOCX  

**Mitigation Strategies:**
- Comprehensive data encryption and privacy measures
- Offline fallback mechanisms
- Extensive user training programs
- Modular architecture for future customizations

---

## Slide 6: Intents & Entities Sample

**IBM Watson Chatbot Implementation:**

**Primary Intents:**

1. **candidate_search**
   - Purpose: Search for candidates based on specific criteria
   - Sample Utterances:
     - "Find candidates with Python skills"
     - "Show me developers with 5+ years experience"
     - "Who has leadership experience?"

2. **candidate_analysis**
   - Purpose: Get detailed analysis of specific candidates
   - Sample Utterances:
     - "Analyze candidate #123"
     - "What are the strengths of this applicant?"
     - "Give me details about candidate experience"

3. **hr_queries**
   - Purpose: General HR-related questions
   - Sample Utterances:
     - "What's the average experience level?"
     - "How many qualified candidates do we have?"
     - "Show salary expectations trend"

4. **bias_analysis**
   - Purpose: Check for bias in hiring process
   - Sample Utterances:
     - "Analyze bias in current candidates"
     - "Show fair screening recommendations"
     - "Check for gender bias"

**Key Entities:**

1. **Skills Entity**
   - Values: Python, JavaScript, React, Java, SQL, etc.
   - Synonyms: programming languages, technical skills

2. **Experience Entity**
   - Values: 1-2 years, 3-5 years, 5+ years, entry-level, senior
   - Patterns: numeric ranges, experience levels

3. **Job_Roles Entity**
   - Values: Software Engineer, Data Scientist, Product Manager, etc.
   - Context: Current position, previous roles

4. **Education Entity**
   - Values: Bachelor's, Master's, PhD, certifications
   - Institutions: University names, degree types

**Sample Conversation Flow:**
```
User: "Find Python developers with 3+ years experience"
Bot: Recognizes intent "candidate_search"
     Extracts entities: skill=Python, experience=3+ years
     Queries database and returns matching candidates
```

---

## Slide 7: Workflow Chart

**System Workflow Diagram:**

```
┌─────────────────┐
│   Resume Upload │
│   (PDF/DOCX)    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│  Text Extraction│────►│   Text Pre-     │
│  (PyPDF2/docx)  │     │   processing    │
└─────────────────┘     └─────────────────┘
          │                        │
          ▼                        ▼
┌─────────────────┐     ┌─────────────────┐
│   AI Analysis   │◄────┤  Bias Detection │
│ (IBM Watson)    │     │   Algorithm     │
└─────────────────┘     └─────────────────┘
          │                        │
          ▼                        ▼
┌─────────────────┐     ┌─────────────────┐
│   Scoring &     │     │   Blind Resume  │
│ Categorization  │     │   Creation      │
└─────────────────┘     └─────────────────┘
          │                        │
          └─────────┬──────────────┘
                    │
                    ▼
         ┌─────────────────┐
         │   Database      │
         │   Storage       │
         └─────────────────┘
                    │
                    ▼
         ┌─────────────────┐
         │   Web Dashboard │
         │   (React.js)    │
         └─────────────────┘
                    │
                    ▼
         ┌─────────────────┐
         │   HR Chatbot    │
         │   Interaction   │
         └─────────────────┘
```

**Process Flow Description:**
1. User uploads resume file
2. System extracts text content
3. AI analyzes content and detects bias
4. Generates scores and categories
5. Stores results in database
6. Displays on web dashboard
7. Enables chatbot interactions

---

## Slide 8: Conclusion

**Project Achievements:**

✅ **Successful Implementation:** Complete AI-powered resume screening system  
✅ **Technical Innovation:** Custom IBM Watson integration with advanced features  
✅ **Bias Mitigation:** Comprehensive bias detection and fair screening capabilities  
✅ **User Experience:** Intuitive web interface with interactive chatbots  
✅ **Scalability:** Architecture designed for enterprise-level deployment  

**Learning Outcomes:**
- Advanced AI integration and prompt engineering
- Full-stack web development with modern technologies
- Natural language processing and chatbot development
- Bias detection algorithms and ethical AI considerations
- Database design and optimization techniques

**Future Enhancements:**
- Multi-language resume support
- Integration with existing ATS systems
- Advanced machine learning models
- Mobile application development
- Enhanced privacy and security features

**Impact & Significance:**
This project demonstrates the practical application of AI in HR processes, showcasing how technology can improve efficiency while promoting fairness in recruitment. The system serves as a foundation for future AI-driven HR solutions.

**Recommendations:**
- Pilot implementation in small organizations first
- Comprehensive user training programs
- Regular system updates and maintenance
- Continuous monitoring of AI performance and bias detection

---

**Thank You!**

**Questions & Discussion**

*Prepared by: [Your Name]*  
*Academic Year: [Current Year]*
