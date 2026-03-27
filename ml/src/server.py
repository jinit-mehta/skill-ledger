from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json

app = Flask(__name__)
CORS(app)

# Feature weights for scoring (adjust based on importance)
FEATURE_WEIGHTS = {
    'total_experience_years': 0.25,
    'num_skills': 0.20,
    'num_certifications': 0.15,
    'num_projects': 0.15,
    'education_level': 0.10,
    'num_publications': 0.10,
    'leadership_roles': 0.05
}

# Fraud detection heuristics
FRAUD_INDICATORS = {
    'unrealistic_experience': {'threshold': 20, 'weight': 0.3},
    'too_many_skills': {'threshold': 50, 'weight': 0.2},
    'inconsistent_dates': {'threshold': 0.5, 'weight': 0.2},
    'missing_details': {'threshold': 0.3, 'weight': 0.3}
}

def normalize_value(value, max_value):
    """Normalize a value to 0-1 range"""
    return min(value / max_value, 1.0)

def calculate_ml_score(features):
    """Calculate ML score based on extracted features"""
    score = 0.0
    
    # Experience scoring (max 5 years is considered excellent for this demo level)
    exp_score = normalize_value(features.get('total_experience_years', 0), 5) * 100
    score += exp_score * FEATURE_WEIGHTS['total_experience_years']
    
    # Skills scoring (max 10 skills is considered excellent)
    skills_score = normalize_value(features.get('num_skills', 0), 10) * 100
    score += skills_score * FEATURE_WEIGHTS['num_skills']
    
    # Certifications scoring (max 3 certs is excellent)
    cert_score = normalize_value(features.get('num_certifications', 0), 3) * 100
    score += cert_score * FEATURE_WEIGHTS['num_certifications']
    
    # Projects scoring (max 5 projects)
    proj_score = normalize_value(features.get('num_projects', 0), 5) * 100
    score += proj_score * FEATURE_WEIGHTS['num_projects']
    
    # Education level (0=None, 1=HS, 2=Bachelor, 3=Master, 4=PhD)
    # Be generous: assume if they have >0 it's decent
    edu_raw = features.get('education_level', 0)
    edu_score = normalize_value(edu_raw if edu_raw > 0 else 0, 3) * 100
    score += edu_score * FEATURE_WEIGHTS['education_level']
    
    # Publications scoring (max 2 publications)
    pub_score = normalize_value(features.get('num_publications', 0), 2) * 100
    score += pub_score * FEATURE_WEIGHTS['num_publications']
    
    # Leadership scoring (max 1 leadership roles)
    lead_score = normalize_value(features.get('leadership_roles', 0), 1) * 100
    score += lead_score * FEATURE_WEIGHTS['leadership_roles']
    
    # Feature Engineering Boost: Ensure min score isn't 0 if they have skills
    if score < 20 and features.get('num_skills', 0) > 0:
        score = 20 + (features.get('num_skills', 0) * 2)

    return min(score, 100.0)

def calculate_fraud_probability(features):
    """Calculate fraud probability based on anomaly detection"""
    fraud_score = 0.0
    
    # Check for unrealistic experience
    if features.get('total_experience_years', 0) > 20:
        fraud_score += FRAUD_INDICATORS['unrealistic_experience']['weight']
    
    # Check for too many skills
    if features.get('num_skills', 0) > 50:
        fraud_score += FRAUD_INDICATORS['too_many_skills']['weight']
    
    # Check for missing critical details (heuristic)
    if features.get('num_skills', 0) == 0 or features.get('total_experience_years', 0) == 0:
        fraud_score += FRAUD_INDICATORS['missing_details']['weight']
    
    # Inconsistency check: high certifications but low experience
    if features.get('num_certifications', 0) > 5 and features.get('total_experience_years', 0) < 2:
        fraud_score += FRAUD_INDICATORS['inconsistent_dates']['weight']
    
    return min(fraud_score, 1.0)

def generate_explanation(features, ml_score, fraud_prob):
    """Generate explainable AI output"""
    drivers = []
    
    # Analyze top contributing factors
    if features.get('total_experience_years', 0) > 5:
        impact = features['total_experience_years'] * FEATURE_WEIGHTS['total_experience_years'] * 6.67
        drivers.append({
            'feature': 'Experience Years',
            'value': features['total_experience_years'],
            'impact': round(impact, 2)
        })
    
    if features.get('num_skills', 0) > 10:
        impact = features['num_skills'] * FEATURE_WEIGHTS['num_skills'] * 3.33
        drivers.append({
            'feature': 'Skills Count',
            'value': features['num_skills'],
            'impact': round(impact, 2)
        })
    
    if features.get('num_certifications', 0) > 2:
        impact = features['num_certifications'] * FEATURE_WEIGHTS['num_certifications'] * 10
        drivers.append({
            'feature': 'Certifications',
            'value': features['num_certifications'],
            'impact': round(impact, 2)
        })
    
    if features.get('num_projects', 0) > 3:
        impact = features['num_projects'] * FEATURE_WEIGHTS['num_projects'] * 6.67
        drivers.append({
            'feature': 'Projects',
            'value': features['num_projects'],
            'impact': round(impact, 2)
        })
    
    if features.get('education_level', 0) >= 2:
        edu_names = ['None', 'High School', 'Bachelor', 'Master', 'PhD']
        impact = features['education_level'] * FEATURE_WEIGHTS['education_level'] * 25
        drivers.append({
            'feature': f"Education ({edu_names[min(features['education_level'], 4)]})",
            'value': features['education_level'],
            'impact': round(impact, 2)
        })
    
    # Sort by impact descending
    drivers.sort(key=lambda x: x['impact'], reverse=True)
    
    return {
        'top_drivers': drivers[:5],  # Top 5 drivers
        'fraud_indicators': {
            'unrealistic_claims': fraud_prob > 0.5,
            'missing_data': features.get('num_skills', 0) == 0,
            'inconsistencies': fraud_prob > 0.3
        }
    }

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ML Inference Server'})

@app.route('/score', methods=['POST'])
def score_resume():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        features = data.get('features', {})
        
        if not features:
            return jsonify({'error': 'No features provided'}), 400
        
        # Calculate scores
        ml_score = calculate_ml_score(features)
        fraud_prob = calculate_fraud_probability(features)
        
        # Adjust final score based on fraud probability
        final_score = ml_score * (1 - fraud_prob * 0.5)
        
        # Generate explanation
        explanation = generate_explanation(features, ml_score, fraud_prob)
        
        return jsonify({
            'ml_score': round(ml_score, 2),
            'fraud_prob': round(fraud_prob, 3),
            'final_score': round(final_score, 2),
            'explanation': explanation
        })
    
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting ML Inference Server on http://127.0.0.1:9001")
    app.run(host='127.0.0.1', port=9001, debug=True)