import streamlit as st
import re
import pdfplumber
import docx
from datetime import datetime
from dateutil import parser
import requests

# ======================================================
# PAGE CONFIG
# ======================================================

st.set_page_config(
    page_title="Professional Resume Analyzer",
    page_icon="📄",
    layout="wide"
)

# ======================================================
# SKILL CATEGORIES
# ======================================================

SKILL_CATEGORIES = {
    'Programming Languages': [
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 
        'go', 'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 
        'solidity', ' c,', ' c '
    ],
    'Web Technologies': [
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 
        'spring', 'html', 'css', 'sass', 'next.js', 'tailwind', 'bootstrap',
        'codeigniter', 'asp.net', '.net', 'fastapi', 'reactjs', 'nodejs'
    ],
    'Databases': [
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 
        'dynamodb', 'oracle', 'cassandra', 'sqlite', 'mssql', 'ssms'
    ],
    'Cloud & DevOps': [
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 
        'ansible', 'ci/cd', 'gitlab', 'github actions', 'ec2', 's3', 'lambda'
    ],
    'Data & AI': [
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 
        'scikit-learn', 'pandas', 'numpy', 'spark', 'hadoop', 'tableau', 
        'power bi', 'llm', 'nlp', 'rag', 'langchain', 'hugging face', 
        'ocr', 'ai', 'ml', 'data analytics'
    ],
    'Blockchain': [
        'blockchain', 'solidity', 'ethereum', 'polygon', 'smart contract',
        'web3', 'metamask', 'ganache', 'remix'
    ],
    'Tools & Methodologies': [
        'git', 'github', 'jira', 'agile', 'scrum', 'rest api', 'graphql', 
        'microservices', 'linux', 'bash', 'figma', 'postman'
    ]
}

EDUCATION_KEYWORDS = [
    'bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.sc', 'm.sc', 
    'mba', 'diploma', 'degree', 'b.e', 'm.e', 'bca', 'mca', 'btech',
    'engineering', 'college', 'university', 'cgpa', 'gpa'
]

# ======================================================
# TEXT EXTRACTION
# ======================================================

def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        with pdfplumber.open(file) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        st.error(f"Error reading PDF: {str(e)}")
        return ""

def extract_text_from_docx(file):
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        st.error(f"Error reading DOCX: {str(e)}")
        return ""

def extract_text_from_txt(file):
    """Extract text from TXT file"""
    try:
        return file.read().decode('utf-8')
    except Exception as e:
        st.error(f"Error reading TXT: {str(e)}")
        return ""

# ======================================================
# GITHUB API
# ======================================================

def extract_github_username(text):
    """Extract GitHub username from resume"""
    patterns = [
        r'github\.com/([a-zA-Z0-9_-]+)',
        r'@([a-zA-Z0-9_-]+)\s+(?:on\s+)?github',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

def get_github_stats(username):
    """Fetch real GitHub statistics"""
    if not username:
        return None
    
    try:
        # GitHub API - public repos
        url = f"https://api.github.com/users/{username}"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'public_repos': data.get('public_repos', 0),
                'followers': data.get('followers', 0),
                'profile_url': data.get('html_url', ''),
                'name': data.get('name', username)
            }
    except Exception as e:
        st.warning(f"Could not fetch GitHub stats: {str(e)}")
    
    return None

# ======================================================
# DATE PARSING
# ======================================================

def parse_date_flexible(date_str):
    """Parse various date formats"""
    date_str = date_str.strip()
    
    # Handle "Present", "Current", etc.
    if date_str.lower() in ['present', 'current', 'now']:
        return datetime.now()
    
    # Try common formats
    formats = [
        '%b %y',      # May 25
        '%B %y',      # May 25
        '%b, %y',     # May, 25
        '%B, %y',     # May, 25
        '%b %Y',      # May 2025
        '%B %Y',      # May 2025
        '%m/%Y',      # 05/2025
        '%Y',         # 2025
    ]
    
    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            # If year is < 100, assume 20xx
            if parsed.year < 100:
                parsed = parsed.replace(year=2000 + parsed.year)
            return parsed
        except:
            continue
    
    return None

def calculate_duration_months(start_str, end_str):
    """Calculate duration in months between two dates"""
    start_date = parse_date_flexible(start_str)
    end_date = parse_date_flexible(end_str)
    
    if start_date and end_date:
        diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
        return max(0, diff)
    
    return 0

# ======================================================
# EXPERIENCE EXTRACTION
# ======================================================

def extract_experience_entries(text):
    """Extract individual work experience entries with dates"""
    lines = text.split('\n')
    experiences = []
    
    # Look for experience section
    in_experience_section = False
    
    for i, line in enumerate(lines):
        # Check if we're in experience section
        if re.search(r'\bEXPERIENCE\b', line, re.IGNORECASE):
            in_experience_section = True
            continue
        
        # Stop at next major section
        if in_experience_section and re.search(r'\b(PROJECTS?|EDUCATION|SKILLS|CERTIFICATIONS?)\b', line, re.IGNORECASE):
            in_experience_section = False
        
        # Look for date ranges in format: May, 25 – Aug, 25 or Jul, 24 – Aug, 24
        date_match = re.search(r'([A-Za-z]{3,9},?\s*\d{2})\s*[-–—]\s*([A-Za-z]{3,9},?\s*\d{2}|Present)', line, re.IGNORECASE)
        
        if date_match:
            start_date = date_match.group(1)
            end_date = date_match.group(2)
            
            # Try to find the company/role on the same or previous line
            role_line = line
            if i > 0:
                role_line = lines[i-1] + " " + line
            
            experiences.append({
                'start': start_date,
                'end': end_date,
                'context': role_line[:100],
                'months': calculate_duration_months(start_date, end_date)
            })
    
    return experiences

def calculate_total_experience(experiences):
    """Calculate total experience in years"""
    total_months = sum(exp['months'] for exp in experiences)
    return round(total_months / 12, 1)

# ======================================================
# PROJECT EXTRACTION
# ======================================================

def extract_projects_from_resume(text):
    """Extract actual distinct projects from PROJECTS section"""
    lines = text.split('\n')
    projects = []
    
    in_project_section = False
    
    for line in lines:
        # Check if we're in projects section
        if re.search(r'\bPROJECTS?\b', line, re.IGNORECASE):
            in_project_section = True
            continue
        
        # Stop at next major section
        if in_project_section and re.search(r'\b(EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS?|HACKATHONS?)\b', line, re.IGNORECASE):
            break
        
        if in_project_section:
            # Look for project titles (usually start with bullet or capital letter and have | or -)
            # Pattern: Project Name - Description | Tech Stack or Project Name | Tech Stack
            if re.match(r'^[\s●•▪▫◦▹▸▪-]*[A-Z]', line) and ('|' in line or '–' in line or '-' in line):
                # Extract project name (before | or –)
                project_name = re.split(r'[|–-]', line)[0].strip()
                # Remove bullet points
                project_name = re.sub(r'^[\s●•▪▫◦▹▸▪-]+', '', project_name)
                
                if len(project_name) > 3 and len(project_name) < 100:
                    projects.append(project_name)
    
    return projects

# ======================================================
# ENHANCED ANALYSIS
# ======================================================

def analyze_resume(text, fetch_github=True):
    """Analyze resume and extract key information"""
    
    if not text or len(text.strip()) < 50:
        return None
    
    lower_text = text.lower()
    words = text.split()
    
    # Extract skills by category
    found_skills = {}
    total_skills = 0
    
    for category, keywords in SKILL_CATEGORIES.items():
        found = []
        for skill in keywords:
            skill_pattern = r'\b' + re.escape(skill.strip()) + r'\b'
            if re.search(skill_pattern, lower_text):
                found.append(skill.strip())
        
        if found:
            found_skills[category] = list(set(found))
            total_skills += len(found)
    
    # Extract actual experience entries
    experience_entries = extract_experience_entries(text)
    total_experience_years = calculate_total_experience(experience_entries)
    
    # Extract actual projects from PROJECTS section
    projects_from_resume = extract_projects_from_resume(text)
    
    # GitHub integration
    github_username = extract_github_username(text)
    github_stats = None
    if fetch_github and github_username:
        with st.spinner(f"Fetching GitHub stats for @{github_username}..."):
            github_stats = get_github_stats(github_username)
    
    # Use GitHub repo count if available, otherwise use resume projects
    total_projects = len(projects_from_resume)
    if github_stats and github_stats['public_repos'] > 0:
        total_projects = github_stats['public_repos']
    
    # Education
    education_found = [edu for edu in EDUCATION_KEYWORDS if edu in lower_text]
    has_education = len(education_found) > 0
    
    cgpa_match = re.search(r'(?:cgpa|gpa)[:\s]+(\d+\.?\d*)\s*(?:/|out of)?\s*(\d+\.?\d*)?', lower_text)
    cgpa_value = None
    if cgpa_match:
        cgpa_value = f"{cgpa_match.group(1)}"
        if cgpa_match.group(2):
            cgpa_value += f"/{cgpa_match.group(2)}"
    
    # Contact and links
    has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
    has_phone = bool(re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text))
    has_github = bool(github_username)
    has_linkedin = bool(re.search(r'linkedin\.com', lower_text))
    has_portfolio = 'portfolio' in lower_text or len(re.findall(r'https?://', text)) > 3
    
    # Hackathons
    hackathon_keywords = ['hackathon', 'competition', 'finalist', 'winner', 'award']
    has_hackathons = any(keyword in lower_text for keyword in hackathon_keywords)
    
    # Calculate metrics
    completeness_factors = [
        has_email,
        has_phone,
        has_education,
        total_skills > 5,
        total_projects > 0,
        len(experience_entries) > 0,
        len(words) > 200
    ]
    completeness_score = (sum(completeness_factors) / len(completeness_factors)) * 100
    
    presence_factors = [
        has_github,
        has_linkedin,
        has_portfolio,
        has_hackathons,
        github_stats is not None
    ]
    presence_score = (sum(presence_factors) / len(presence_factors)) * 100
    
    overall_score = (completeness_score + presence_score) / 2
    
    # Generate recommendations
    recommendations = []
    if not has_email or not has_phone:
        recommendations.append("✉️ Add complete contact information (email and phone)")
    if total_skills < 10:
        recommendations.append("🔧 Consider highlighting more technical skills")
    if not has_github:
        recommendations.append("🔗 Add your GitHub profile link")
    elif not github_stats:
        recommendations.append("🔗 Make sure your GitHub profile is public")
    if total_projects < 3:
        recommendations.append("📁 Work on more projects to showcase your skills")
    if not education_found:
        recommendations.append("🎓 Clearly mention your educational qualifications")
    if len(words) < 400:
        recommendations.append("📝 Expand on your experiences and key achievements")
    if len(experience_entries) == 0:
        recommendations.append("💼 Add internship or work experience details")
    if not has_hackathons:
        recommendations.append("🏅 Participate in hackathons to gain practical experience")
    
    return {
        'word_count': len(words),
        'skills': found_skills,
        'total_skills': total_skills,
        'experience_years': total_experience_years,
        'experience_entries': experience_entries,
        'experience_count': len(experience_entries),
        'projects_from_resume': projects_from_resume,
        'project_count': total_projects,
        'github_username': github_username,
        'github_stats': github_stats,
        'education': education_found,
        'cgpa': cgpa_value,
        'has_hackathons': has_hackathons,
        'contact': {
            'email': has_email,
            'phone': has_phone,
            'github': has_github,
            'linkedin': has_linkedin,
            'portfolio': has_portfolio
        },
        'metrics': {
            'completeness': round(completeness_score, 1),
            'professional_presence': round(presence_score, 1),
            'overall': round(overall_score, 1)
        },
        'recommendations': recommendations
    }

# ======================================================
# UI COMPONENTS
# ======================================================

def display_metrics(analysis):
    """Display key metrics"""
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(
            "📊 Completeness Score",
            f"{analysis['metrics']['completeness']}%",
            help="Based on presence of key resume elements"
        )
    
    with col2:
        st.metric(
            "🌐 Professional Presence",
            f"{analysis['metrics']['professional_presence']}%",
            help="Based on online profiles and GitHub activity"
        )
    
    with col3:
        st.metric(
            "⭐ Overall Quality",
            f"{analysis['metrics']['overall']}%",
            help="Combined score of all factors"
        )

def display_overview(analysis):
    """Display resume overview stats"""
    st.subheader("📄 Resume Overview")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Word Count", analysis['word_count'])
    with col2:
        st.metric("Skills Found", analysis['total_skills'])
    with col3:
        if analysis['experience_years'] > 0:
            st.metric("Total Experience", f"{analysis['experience_years']} years")
        else:
            st.metric("Experience Entries", analysis['experience_count'])
    with col4:
        project_label = "GitHub Repos" if analysis['github_stats'] else "Projects (Resume)"
        st.metric(project_label, analysis['project_count'])
    
    # Experience breakdown
    if analysis['experience_entries']:
        st.markdown("#### 💼 Work Experience Breakdown")
        for i, exp in enumerate(analysis['experience_entries'], 1):
            duration_text = f"{exp['months']} months" if exp['months'] > 0 else "Duration not calculated"
            st.text(f"{i}. {exp['start']} to {exp['end']} ({duration_text})")
    
    # Projects list
    if analysis['projects_from_resume']:
        with st.expander(f"📁 Projects from Resume ({len(analysis['projects_from_resume'])})"):
            for i, project in enumerate(analysis['projects_from_resume'], 1):
                st.text(f"{i}. {project}")
    
    # GitHub Stats
    if analysis['github_stats']:
        st.markdown("#### 👨‍💻 GitHub Profile")
        gh = analysis['github_stats']
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Public Repos", gh['public_repos'])
        with col2:
            st.metric("Followers", gh['followers'])
        with col3:
            st.markdown(f"[View Profile]({gh['profile_url']})")
    elif analysis['github_username']:
        st.info(f"GitHub: @{analysis['github_username']} (Stats not fetched)")
    
    if analysis['cgpa']:
        st.info(f"🎓 **CGPA/GPA:** {analysis['cgpa']}")
    
    if analysis['has_hackathons']:
        st.info("🏆 **Hackathons/Competitions:** Participation detected")

def display_skills(analysis):
    """Display detected skills by category"""
    if analysis['skills']:
        st.subheader("🔧 Technical Skills Detected")
        
        for category, skills in analysis['skills'].items():
            with st.expander(f"{category} ({len(skills)} skills)", expanded=len(skills) > 3):
                skills_html = " ".join([
                    f'<span style="background-color: #1e40af; color: #bfdbfe; padding: 6px 14px; border-radius: 16px; margin: 4px; display: inline-block; font-size: 13px;">{skill.title()}</span>'
                    for skill in sorted(skills)
                ])
                st.markdown(skills_html, unsafe_allow_html=True)
    else:
        st.warning("⚠️ No technical skills detected. Make sure to list your skills clearly.")

def display_contact_info(analysis):
    """Display contact and professional links"""
    st.subheader("📞 Contact & Professional Links")
    
    contact = analysis['contact']
    
    col1, col2, col3, col4, col5 = st.columns(5)
    
    cols = [col1, col2, col3, col4, col5]
    items = [
        ('✉️ Email', contact['email']),
        ('📱 Phone', contact['phone']),
        ('💼 LinkedIn', contact['linkedin']),
        ('👨‍💻 GitHub', contact['github']),
        ('🌐 Portfolio', contact['portfolio'])
    ]
    
    for col, (label, has_item) in zip(cols, items):
        with col:
            if has_item:
                st.success(label)
            else:
                st.error(label)

def display_recommendations(recommendations):
    """Display improvement recommendations"""
    if recommendations:
        st.subheader("💡 Recommendations for Improvement")
        for rec in recommendations:
            st.info(rec)
    else:
        st.success("✅ Your resume looks comprehensive! Great job!")

# ======================================================
# MAIN APP
# ======================================================

def main():
    st.title("📄 Professional Resume Analyzer")
    st.markdown("Get objective feedback on your resume with **real GitHub integration**")
    st.markdown("---")
    
    # Options
    col1, col2 = st.columns([3, 1])
    with col2:
        fetch_github = st.checkbox("Fetch GitHub Stats", value=True, help="Fetch real repository count from GitHub")
    
    uploaded_file = st.file_uploader(
        "Upload your resume",
        type=['pdf', 'docx', 'txt'],
        help="Supports PDF, DOCX, and TXT formats"
    )
    
    if uploaded_file:
        file_type = uploaded_file.name.split('.')[-1].lower()
        
        with st.spinner("📖 Reading resume..."):
            if file_type == 'pdf':
                text = extract_text_from_pdf(uploaded_file)
            elif file_type == 'docx':
                text = extract_text_from_docx(uploaded_file)
            elif file_type == 'txt':
                text = extract_text_from_txt(uploaded_file)
            else:
                st.error("Unsupported file format")
                return
        
        if not text or len(text.strip()) < 50:
            st.error("⚠️ Could not extract enough text from the file.")
            return
        
        with st.spinner("🔍 Analyzing resume..."):
            analysis = analyze_resume(text, fetch_github=fetch_github)
        
        if not analysis:
            st.error("⚠️ Unable to analyze resume.")
            return
        
        st.success("✅ Analysis complete!")
        st.markdown("---")
        
        display_metrics(analysis)
        st.markdown("---")
        display_overview(analysis)
        st.markdown("---")
        display_skills(analysis)
        st.markdown("---")
        display_contact_info(analysis)
        st.markdown("---")
        display_recommendations(analysis['recommendations'])
        st.markdown("---")
        
        with st.expander("📄 Resume Preview (First 2000 characters)"):
            st.text(text[:2000])
        
        st.info("""
        **ℹ️ Disclaimer:** This tool provides objective analysis based on resume content and public GitHub data. 
        It cannot verify claims or replace human review.
        """)
    
    else:
        st.info("👆 Upload your resume to get started")
        
        with st.expander("ℹ️ What's new in this version?"):
            st.markdown("""
            ### ✨ Real Data Extraction
            
            - **Actual Experience Calculation**: Parses date ranges and calculates real duration
            - **True Project Count**: Extracts projects from PROJECTS section
            - **GitHub Integration**: Fetches real repository count from GitHub API
            - **Experience Breakdown**: Shows each job with duration
            - **Accurate Skill Detection**: Better pattern matching
            
            ### 🔍 What it analyzes:
            - Skills across 7 technical categories
            - Real work experience with date parsing
            - Projects from resume + GitHub repos
            - Contact information and links
            - Education with CGPA
            - Hackathon participation
            """)

if __name__ == "__main__":
    main()