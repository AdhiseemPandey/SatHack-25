#!/usr/bin/env python3
"""
Sovereign Identity Guardian - Daily Usage AI Model
COMPLETELY REVISED VERSION with actual message content analysis
"""

import numpy as np
import pandas as pd
import joblib
import re
import json
from datetime import datetime, timedelta
from sklearn.ensemble import GradientBoostingClassifier, IsolationForest
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.cluster import DBSCAN
import warnings
import hashlib
from collections import Counter

import os
import sys

# Add the parent directory to Python path to import data_storage
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import data_storage
from data_storage import DataStorage

# Initialize data_storage
data_storage = DataStorage()

warnings.filterwarnings('ignore')

class AdvancedDailyUsageModel:
    """
    COMPLETELY REVISED AI model that actually analyzes message content
    """
    
    def __init__(self):
        self.model = None
        self.anomaly_detector = None
        self.scaler = StandardScaler()
        self.model_metadata = {}
        
        # Comprehensive risk patterns that actually analyze content
        self.risk_patterns = {
            'critical_security': {
                'keywords': ['failed login', 'unauthorized access', 'brute force', 'hack attempt', 
                           'password crack', 'security breach', 'intrusion detected', 'malware',
                           'ransomware', 'phishing', 'credential theft', 'data exfiltration'],
                'weight': 10
            },
            'suspicious_activity': {
                'keywords': ['suspicious', 'unusual', 'anomalous', 'irregular', 'abnormal',
                           'multiple failed', 'repeated attempt', 'unexpected', 'strange',
                           'odd behavior', 'unfamiliar', 'unknown device'],
                'weight': 8
            },
            'privacy_breach': {
                'keywords': ['data leak', 'privacy violation', 'exposed data', 'sensitive shared',
                           'confidential exposed', 'personal data', 'private information',
                           'data breach', 'information leak', 'unauthorized sharing'],
                'weight': 9
            },
            'access_control': {
                'keywords': ['privilege escalation', 'admin access', 'root access', 'elevated rights',
                           'unauthorized privilege', 'permission change', 'access modified',
                           'rights elevated', 'security bypass', 'authentication bypass'],
                'weight': 7
            },
            'geographic_anomaly': {
                'keywords': ['foreign country', 'different continent', 'impossible travel',
                           'unusual location', 'suspicious location', 'unknown geography',
                           'international access', 'overseas login', 'remote location'],
                'weight': 6
            },
            'temporal_anomaly': {
                'keywords': ['after hours', 'late night', 'early morning', 'unusual time',
                           'non-business hours', 'midnight', '3am', '4am', '2am', '5am'],
                'weight': 5
            },
            'data_operations': {
                'keywords': ['bulk download', 'mass export', 'data transfer', 'file extraction',
                           'database export', 'backup creation', 'data copy', 'information export'],
                'weight': 6
            }
        }
        
        # Normal activities that reduce risk
        self.normal_patterns = {
            'routine_activities': {
                'keywords': ['successful login', 'normal access', 'routine check', 'regular update',
                           'scheduled task', 'authorized access', 'expected behavior', 'typical usage',
                           'standard operation', 'approved activity', 'legitimate access'],
                'weight': -3
            },
            'low_risk_operations': {
                'keywords': ['email checked', 'browsing website', 'reading document', 'viewing page',
                           'opening file', 'accessing resource', 'using application', 'working normally'],
                'weight': -2
            }
        }

    def extract_advanced_features(self, activity_data, activity_type='general'):
        """
        COMPLETELY REVISED feature extraction that actually analyzes message content
        """
        features = {}
        
        try:
            # Parse activities
            activities = self.parse_activity_data(activity_data, activity_type)
            
            if not activities:
                return self._get_default_features()
            
            # Generate unique input signature
            input_hash = self._generate_input_signature(activity_data)
            features['input_hash'] = input_hash
            
            # CONTENT-BASED ANALYSIS - This is what was missing!
            content_features = self.analyze_message_content(activities)
            features.update(content_features)
            
            # Time-based analysis
            time_features = self.analyze_timing_patterns(activities)
            features.update(time_features)
            
            # Behavioral patterns
            behavior_features = self.analyze_behavioral_patterns(activities)
            features.update(behavior_features)
            
            # Calculate dynamic risk scores based on ACTUAL CONTENT
            risk_scores = self.calculate_content_based_risk(features, activities)
            features.update(risk_scores)
            
            # Store raw activity count for debugging
            features['raw_activity_count'] = len(activities)
            features['analyzed_messages'] = [act.get('description', '') for act in activities[:5]]  # Store first 5 messages
            
        except Exception as e:
            print(f"⚠️  Error in feature extraction: {e}")
            features = self._get_default_features()
        
        return features

    def analyze_message_content(self, activities):
        """
        ACTUALLY ANALYZE the content of each message
        """
        features = {}
        
        if not activities:
            return self._get_default_content_features()
        
        total_risk_score = 0
        risk_category_scores = {}
        normal_activity_score = 0
        detailed_risks = []
        
        # Initialize risk categories
        for category in self.risk_patterns:
            risk_category_scores[category] = 0
        
        # Analyze each activity message
        for i, activity in enumerate(activities):
            description = activity.get('description', '').lower()
            activity_risk = 0
            activity_risks = []
            
            # Check for risk patterns in THIS specific message
            for category, pattern in self.risk_patterns.items():
                for keyword in pattern['keywords']:
                    if keyword in description:
                        risk_value = pattern['weight']
                        activity_risk += risk_value
                        risk_category_scores[category] += risk_value
                        activity_risks.append(f"{category}:{keyword}")
                        break  # Count each category only once per activity
            
            # Check for normal patterns that reduce risk
            for category, pattern in self.normal_patterns.items():
                for keyword in pattern['keywords']:
                    if keyword in description:
                        activity_risk += pattern['weight']  # This is negative, so it reduces risk
                        normal_activity_score += abs(pattern['weight'])
                        break
            
            total_risk_score += activity_risk
            detailed_risks.extend(activity_risks)
        
        # Calculate features based on ACTUAL content analysis
        features['total_risk_score'] = total_risk_score
        features['avg_risk_per_activity'] = total_risk_score / len(activities) if activities else 0
        features['risk_activity_ratio'] = len([r for r in detailed_risks if r]) / len(activities) if activities else 0
        features['normal_activity_score'] = normal_activity_score
        
        # Individual risk category scores
        for category in self.risk_patterns:
            features[f'{category}_score'] = risk_category_scores[category]
        
        # Risk diversity
        active_risk_categories = sum(1 for score in risk_category_scores.values() if score > 0)
        features['risk_category_diversity'] = active_risk_categories / len(self.risk_patterns)
        
        # Store detailed risk info for debugging
        features['detected_risks'] = detailed_risks[:10]  # Store first 10 detected risks
        features['unique_risk_patterns'] = len(set(detailed_risks))
        
        return features

    def analyze_timing_patterns(self, activities):
        """Analyze timing patterns from activity messages"""
        features = {}
        
        if not activities:
            return self._get_default_time_features()
        
        night_activities = 0
        weekend_activities = 0
        unusual_hours = 0
        rapid_sequence = 0
        
        activity_times = []
        
        for activity in activities:
            description = activity.get('description', '').lower()
            
            # Extract time from description
            hour = self.extract_hour_from_description(description)
            if hour is not None:
                activity_times.append(hour)
                
                # Check for unusual timing
                if hour < 6 or hour > 22:  # 10 PM - 6 AM
                    night_activities += 1
                if hour in [2, 3, 4, 5]:  # Very unusual hours
                    unusual_hours += 1
            
            # Check for temporal keywords
            if any(keyword in description for keyword in ['midnight', '3am', '4am', '2am', '5am']):
                unusual_hours += 1
        
        # Timing-based features
        total_activities = len(activities)
        features['night_activity_ratio'] = night_activities / total_activities if total_activities else 0
        features['unusual_hour_ratio'] = unusual_hours / total_activities if total_activities else 0
        
        # Rapid sequence detection (multiple activities in short time)
        if len(activity_times) >= 3:
            time_diffs = [activity_times[i+1] - activity_times[i] for i in range(len(activity_times)-1)]
            rapid_sequence = sum(1 for diff in time_diffs if diff <= 1)  # Activities within 1 hour
            features['rapid_sequence_ratio'] = rapid_sequence / len(time_diffs) if time_diffs else 0
        else:
            features['rapid_sequence_ratio'] = 0
        
        return features

    def analyze_behavioral_patterns(self, activities):
        """Analyze behavioral patterns from message content"""
        features = {}
        
        if not activities:
            return self._get_default_behavior_features()
        
        total_activities = len(activities)
        failure_count = 0
        access_change_count = 0
        geographic_count = 0
        data_operation_count = 0
        
        for activity in activities:
            description = activity.get('description', '').lower()
            
            # Count specific behavioral patterns
            if any(word in description for word in ['failed', 'error', 'denied', 'rejected']):
                failure_count += 1
            
            if any(word in description for word in ['access', 'permission', 'privilege', 'rights']):
                access_change_count += 1
            
            if any(word in description for word in ['location', 'country', 'geographic', 'ip address']):
                geographic_count += 1
            
            if any(word in description for word in ['download', 'export', 'transfer', 'copy', 'extract']):
                data_operation_count += 1
        
        # Behavioral ratios
        features['failure_ratio'] = failure_count / total_activities if total_activities else 0
        features['access_change_ratio'] = access_change_count / total_activities if total_activities else 0
        features['geographic_mention_ratio'] = geographic_count / total_activities if total_activities else 0
        features['data_operation_ratio'] = data_operation_count / total_activities if total_activities else 0
        
        # Behavioral complexity
        unique_activities = len(set(act.get('description', '') for act in activities))
        features['activity_diversity'] = unique_activities / total_activities if total_activities else 0
        
        return features

    def extract_hour_from_description(self, description):
        """Extract hour from activity description"""
        # Try to find time patterns
        time_patterns = [
            r'(\d{1,2}):(\d{2})',  # 14:30
            r'(\d{1,2})am',         # 2am
            r'(\d{1,2})pm',         # 2pm
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, description)
            if match:
                if 'pm' in description and match.group(1):
                    hour = int(match.group(1)) + 12
                    return hour if hour < 24 else hour - 12
                elif 'am' in description and match.group(1):
                    hour = int(match.group(1))
                    return hour if hour != 12 else 0
                else:
                    return int(match.group(1))
        
        return None

    def calculate_content_based_risk(self, features, activities):
        """Calculate risk scores based on ACTUAL content analysis"""
        risk_scores = {}
        
        # Base risk from content analysis
        content_risk = features.get('total_risk_score', 0)
        avg_risk = features.get('avg_risk_per_activity', 0)
        risk_ratio = features.get('risk_activity_ratio', 0)
        
        # Timing risk
        timing_risk = (
            features.get('night_activity_ratio', 0) * 50 +
            features.get('unusual_hour_ratio', 0) * 70 +
            features.get('rapid_sequence_ratio', 0) * 40
        )
        
        # Behavioral risk
        behavioral_risk = (
            features.get('failure_ratio', 0) * 60 +
            features.get('access_change_ratio', 0) * 50 +
            features.get('data_operation_ratio', 0) * 40 +
            features.get('geographic_mention_ratio', 0) * 30
        )
        
        # Normal activity mitigation
        normal_score = features.get('normal_activity_score', 0)
        
        # Composite risk score (0-100)
        raw_risk = (
            min(content_risk * 2, 40) +          # Content risk (max 40)
            min(timing_risk, 30) +               # Timing risk (max 30)  
            min(behavioral_risk, 30)             # Behavioral risk (max 30)
        )
        
        # Apply normal activity mitigation
        mitigated_risk = max(0, raw_risk - normal_score)
        
        # Final composite score
        composite_risk = min(mitigated_risk, 100)
        
        risk_scores['composite_risk_score'] = composite_risk
        risk_scores['content_risk'] = min(content_risk * 2, 40)
        risk_scores['timing_risk'] = min(timing_risk, 30)
        risk_scores['behavioral_risk'] = min(behavioral_risk, 30)
        risk_scores['normal_mitigation'] = normal_score
        
        return risk_scores

    def parse_activity_data(self, activity_data, activity_type):
        """Parse activity data - FIXED to handle different inputs"""
        activities = []
        
        if isinstance(activity_data, str):
            lines = [line.strip() for line in activity_data.strip().split('\n') if line.strip()]
            for i, line in enumerate(lines):
                activity = {
                    'timestamp': datetime.now() - timedelta(minutes=i * 10),
                    'type': activity_type,
                    'description': line,
                    'index': i,
                    'original_line': line
                }
                activities.append(activity)
        elif isinstance(activity_data, list):
            for i, item in enumerate(activity_data):
                if isinstance(item, str):
                    activity = {
                        'timestamp': datetime.now() - timedelta(minutes=i * 10),
                        'type': activity_type,
                        'description': item,
                        'index': i,
                        'original_line': item
                    }
                else:
                    activity = {
                        'timestamp': item.get('timestamp', datetime.now() - timedelta(minutes=i * 10)),
                        'type': item.get('type', activity_type),
                        'description': item.get('description', str(item)),
                        'index': i,
                        'original_line': str(item)
                    }
                activities.append(activity)
        elif isinstance(activity_data, dict):
            activity = {
                'timestamp': activity_data.get('timestamp', datetime.now()),
                'type': activity_data.get('type', activity_type),
                'description': activity_data.get('description', str(activity_data)),
                'index': 0,
                'original_line': str(activity_data)
            }
            activities.append(activity)
        
        return activities

    def _generate_input_signature(self, activity_data):
        """Generate unique signature for input data"""
        if isinstance(activity_data, str):
            content = activity_data
        elif isinstance(activity_data, (list, dict)):
            content = json.dumps(activity_data, sort_keys=True)
        else:
            content = str(activity_data)
        
        return hashlib.md5(content.encode()).hexdigest()[:12]

    def _get_default_features(self):
        """Default features when no activities"""
        features = {}
        features.update(self._get_default_content_features())
        features.update(self._get_default_time_features())
        features.update(self._get_default_behavior_features())
        features.update({
            'composite_risk_score': 0,
            'content_risk': 0,
            'timing_risk': 0,
            'behavioral_risk': 0,
            'normal_mitigation': 0,
            'input_hash': 'default',
            'raw_activity_count': 0,
            'analyzed_messages': []
        })
        return features

    def _get_default_content_features(self):
        return {
            'total_risk_score': 0,
            'avg_risk_per_activity': 0,
            'risk_activity_ratio': 0,
            'normal_activity_score': 0,
            'risk_category_diversity': 0,
            'unique_risk_patterns': 0,
            'detected_risks': [],
            'critical_security_score': 0,
            'suspicious_activity_score': 0,
            'privacy_breach_score': 0,
            'access_control_score': 0,
            'geographic_anomaly_score': 0,
            'temporal_anomaly_score': 0,
            'data_operations_score': 0
        }

    def _get_default_time_features(self):
        return {
            'night_activity_ratio': 0,
            'unusual_hour_ratio': 0,
            'rapid_sequence_ratio': 0
        }

    def _get_default_behavior_features(self):
        return {
            'failure_ratio': 0,
            'access_change_ratio': 0,
            'geographic_mention_ratio': 0,
            'data_operation_ratio': 0,
            'activity_diversity': 0
        }

    def predict_risk(self, activity_data, activity_type='general'):
        """Predict risk with CONTENT-BASED analysis"""
        print(f"🔍 Analyzing {len(str(activity_data).split())} words of activity data...")
        
        # Extract features that ACTUALLY analyze content
        features = self.extract_advanced_features(activity_data, activity_type)
        
        if not self.model:
            # Use content-based analysis
            risk_score = int(features.get('composite_risk_score', 0))
            
            result = {
                'is_suspicious': risk_score > 50,
                'risk_score': risk_score,
                'risk_level': self.calculate_risk_level(risk_score),
                'confidence': 0.7,
                'features': features,
                'analysis': self._generate_detailed_analysis(features, risk_score),
                'recommendations': self._generate_recommendations(features),
                'input_signature': features.get('input_hash', 'unknown'),
                'detected_risks': features.get('detected_risks', []),
                'analyzed_messages': features.get('analyzed_messages', []),
                'note': 'Content-based pattern analysis'
            }
            
            # Debug info
            print(f"📊 Content Analysis: {len(features.get('detected_risks', []))} risk patterns found")
            print(f"📊 Raw activities: {features.get('raw_activity_count', 0)}")
            
            return result
        
        # If model is trained, use it (but we'll focus on content analysis for now)
        feature_values = np.array([list(features.values())], dtype=float)
        feature_values_scaled = self.scaler.transform(feature_values)
        
        prediction = self.model.predict(feature_values_scaled)[0]
        probability = self.model.predict_proba(feature_values_scaled)[0]
        
        risk_score = int(probability[1] * 100) if prediction == 1 else int(probability[0] * 100)
        
        return {
            'is_suspicious': bool(prediction),
            'risk_score': risk_score,
            'risk_level': self.calculate_risk_level(risk_score),
            'confidence': float(max(probability)),
            'features': features,
            'analysis': self._generate_detailed_analysis(features, risk_score),
            'recommendations': self._generate_recommendations(features),
            'input_signature': features.get('input_hash', 'unknown'),
            'detected_risks': features.get('detected_risks', [])
        }

    def calculate_risk_level(self, risk_score):
        """Calculate risk level"""
        if risk_score >= 80:
            return 'CRITICAL'
        elif risk_score >= 60:
            return 'HIGH'
        elif risk_score >= 40:
            return 'MEDIUM'
        elif risk_score >= 20:
            return 'LOW'
        else:
            return 'SAFE'

    def _generate_detailed_analysis(self, features, risk_score):
        """Generate analysis based on ACTUAL content findings"""
        analysis = {
            'summary': '',
            'key_findings': [],
            'risk_breakdown': {
                'content_risk': f"{features.get('content_risk', 0):.1f}%",
                'timing_risk': f"{features.get('timing_risk', 0):.1f}%",
                'behavioral_risk': f"{features.get('behavioral_risk', 0):.1f}%"
            },
            'detected_patterns': features.get('detected_risks', [])[:5]  # Show top 5 patterns
        }
        
        # Generate summary based on actual findings
        detected_risks = features.get('detected_risks', [])
        risk_categories = [risk.split(':')[0] for risk in detected_risks if ':' in risk]
        
        if risk_score >= 80:
            analysis['summary'] = f'🚨 CRITICAL: {len(detected_risks)} security threats detected!'
        elif risk_score >= 60:
            analysis['summary'] = f'⚠️ HIGH RISK: {len(detected_risks)} suspicious patterns found'
        elif risk_score >= 40:
            analysis['summary'] = f'🔶 MEDIUM RISK: {len(detected_risks)} concerning activities'
        elif risk_score >= 20:
            analysis['summary'] = f'🔸 LOW RISK: {len(detected_risks)} minor issues'
        else:
            analysis['summary'] = '✅ SAFE: Normal activity patterns'
        
        # Key findings based on ACTUAL detected risks
        if detected_risks:
            analysis['key_findings'].append(f"Found {len(detected_risks)} risk patterns in activities")
        
        if features.get('critical_security_score', 0) > 0:
            analysis['key_findings'].append("Critical security threats detected")
        
        if features.get('night_activity_ratio', 0) > 0.3:
            analysis['key_findings'].append("Unusual nighttime activity patterns")
        
        if features.get('failure_ratio', 0) > 0.4:
            analysis['key_findings'].append("High failure rate in operations")
        
        return analysis

    def _generate_recommendations(self, features):
        """Generate recommendations based on ACTUAL findings"""
        recommendations = []
        detected_risks = features.get('detected_risks', [])
        
        if any('critical_security' in risk for risk in detected_risks):
            recommendations.extend([
                "IMMEDIATE: Investigate security threats",
                "IMMEDIATE: Check for system breaches",
                "Contact security team immediately"
            ])
        
        if any('suspicious_activity' in risk for risk in detected_risks):
            recommendations.append("Review all suspicious activities")
        
        if features.get('night_activity_ratio', 0) > 0.3:
            recommendations.append("Monitor nighttime access patterns")
        
        if features.get('failure_ratio', 0) > 0.4:
            recommendations.append("Investigate system failures")
        
        if not recommendations:
            recommendations = [
                "Continue normal monitoring",
                "Review security logs weekly",
                "Update access controls regularly"
            ]
        
        return recommendations[:5]

    def train(self, use_accumulated_data=True, test_size=0.3):
        """Train the model"""
        print("🚀 Training Content-Aware Daily Usage Model...")
        
        # Use sample data for demonstration
        sample_data = self._get_sample_data()
        X, y = self.prepare_training_data(sample_data['activities'], sample_data['labels'])
        
        # Train simple model
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        self.model = GradientBoostingClassifier(n_estimators=50, random_state=42)
        self.model.fit(X_train, y_train)
        
        accuracy = self.model.score(X_test, y_test)
        print(f"✅ Model trained with accuracy: {accuracy:.3f}")
        
        return {'accuracy': accuracy}

    def prepare_training_data(self, activities_list, labels):
        """Prepare training data"""
        features_list = []
        
        for activity_data in activities_list:
            features = self.extract_advanced_features(activity_data)
            # Use only numeric features
            numeric_features = {k: v for k, v in features.items() if isinstance(v, (int, float))}
            feature_values = list(numeric_features.values())
            features_list.append(feature_values)
        
        return np.array(features_list), np.array(labels)

    def _get_sample_data(self):
        """Sample training data with varied content"""
        return {
            'activities': [
                "08:30 - Normal login successful",
                "09:15 - Checked email routinely",
                "14:00 - Accessed regular documents",
                "16:45 - Standard system usage",
                
                "02:30 - Failed login attempt from unknown IP",
                "02:31 - Multiple failed password attempts",
                "03:15 - Unauthorized access detected",
                "04:00 - Suspicious data export initiated",
                "23:45 - Brute force attack detected",
                
                "10:00 - Normal workflow activities",
                "11:30 - Regular file access",
                "15:00 - Authorized system update",
                
                "01:15 - Unusual geographic login from foreign country",
                "03:30 - Privilege escalation attempt",
                "22:45 - Data exfiltration detected",
                "00:30 - Malware signature found"
            ],
            'labels': [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1]
        }

def demonstrate_content_analysis():
    """Demonstrate the content analysis with different inputs"""
    print("=" * 70)
    print("🧪 CONTENT ANALYSIS DEMONSTRATION")
    print("=" * 70)
    
    model = AdvancedDailyUsageModel()
    
    # Test cases with COMPLETELY DIFFERENT content
    test_cases = [
        {
            'name': 'COMPLETELY NORMAL DAY',
            'data': """
            08:30 - User logged in successfully from office
            09:15 - Checked email and calendar
            10:00 - Attended team meeting
            11:30 - Worked on project documents
            14:00 - Lunch break
            15:30 - Continued regular work
            17:00 - Logged out normally
            """
        },
        {
            'name': 'SUSPICIOUS ACTIVITIES', 
            'data': """
            02:15 - Failed login attempt from unknown IP 192.168.1.100
            02:16 - Multiple failed password attempts detected
            02:17 - Unauthorized access to admin panel
            03:45 - Suspicious data export initiated
            04:30 - Brute force attack patterns detected
            23:15 - Unusual file downloads during off-hours
            """
        },
        {
            'name': 'PRIVACY BREACH SCENARIO',
            'data': """
            09:00 - Normal login
            10:30 - Unauthorized access to confidential files
            11:15 - Data leak detected - sensitive information exposed
            13:45 - Privacy violation - personal data shared externally
            15:20 - Bulk export of customer database
            16:00 - Suspicious sharing of private information
            """
        },
        {
            'name': 'MIXED WITH CRITICAL THREATS',
            'data': """
            08:45 - Normal morning login
            10:20 - Security breach detected in system
            11:00 - Malware signature identified in network
            14:30 - Routine system maintenance
            16:15 - Ransomware attack attempt blocked
            18:00 - Phishing attempt on user credentials
            """
        },
        {
            'name': 'GEOGRAPHIC ANOMALIES',
            'data': """
            09:00 - Login from New York office (expected)
            11:30 - Simultaneous login from China (suspicious)
            14:00 - Access from Russia (unusual geographic pattern)
            16:45 - Login from Brazil within 1 hour of China login
            18:30 - Impossible travel detected: New York to China in 2 hours
            """
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"TEST CASE {i}: {test_case['name']}")
        print(f"{'='*60}")
        
        result = model.predict_risk(test_case['data'])
        
        print(f"📋 INPUT SIGNATURE: {result['input_signature']}")
        print(f"🎯 RISK SCORE: {result['risk_score']}/100")
        print(f"📊 RISK LEVEL: {result['risk_level']}")
        print(f"🔍 SUSPICIOUS: {result['is_suspicious']}")
        print(f"📈 CONFIDENCE: {result['confidence']:.2f}")
        print(f"📝 SUMMARY: {result['analysis']['summary']}")
        
        print(f"\n🔎 DETECTED RISK PATTERNS ({len(result['detected_risks'])} found):")
        for risk in result['detected_risks'][:8]:  # Show first 8
            print(f"   • {risk}")
            
        print(f"\n💡 RECOMMENDATIONS:")
        for rec in result['recommendations']:
            print(f"   • {rec}")
        
        # Show risk breakdown
        print(f"\n📊 RISK BREAKDOWN:")
        for category, score in result['analysis']['risk_breakdown'].items():
            print(f"   • {category}: {score}")

def main():
    """Main function"""
    print("🛡️  Sovereign Identity Guardian - CONTENT-AWARE Daily Usage AI")
    print("🚀 FINAL VERSION - Actually analyzes message content!")
    
    # Demonstrate the content analysis
    demonstrate_content_analysis()
    
    print(f"\n{'='*70}")
    print("✅ DEMONSTRATION COMPLETED!")
    print("📊 This version ACTUALLY analyzes message content and shows different results!")
    print("=" * 70)

if __name__ == "__main__":
    main()