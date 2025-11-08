#!/usr/bin/env python3
"""
Sovereign Identity Guardian - Daily Usage AI Model
Advanced machine learning model for detecting suspicious daily activity patterns
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
warnings.filterwarnings('ignore')

class AdvancedDailyUsageModel:
    """
    Advanced AI model for daily usage pattern analysis
    Detects anomalies, suspicious behaviors, and privacy risks
    """
    
    def __init__(self):
        self.model = None
        self.anomaly_detector = None
        self.scaler = StandardScaler()
        self.cluster_model = None
        self.model_metadata = {}
        
        # Behavioral patterns database
        self.suspicious_patterns = {
            'high_risk_activities': [
                'unusual_login', 'multiple_failed_attempts', 'geographic_impossibility',
                'after_hours_activity', 'privilege_escalation', 'data_exfiltration'
            ],
            'privacy_risks': [
                'excessive_data_sharing', 'weak_privacy_settings', 'third_party_tracking',
                'location_tracking', 'biometric_data_collection', 'behavioral_profiling'
            ],
            'security_threats': [
                'malware_signatures', 'phishing_attempts', 'social_engineering',
                'credential_stuffing', 'man_in_the_middle', 'zero_day_exploits'
            ]
        }
        
        # Normal behavior baselines
        self.baseline_metrics = {
            'avg_daily_logins': 5,
            'avg_session_duration': 30,  # minutes
            'normal_login_times': [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],  # 8 AM - 6 PM
            'typical_locations': 3,  # number of usual locations
            'avg_data_usage': 500  # MB per day
        }
    
    def extract_advanced_features(self, activity_data, activity_type='general'):
        """
        Extract comprehensive features from daily activity data
        """
        features = {}
        
        try:
            # Parse activity data
            activities = self.parse_activity_data(activity_data, activity_type)
            
            # Time-based features
            features['total_activities'] = len(activities)
            features['activity_duration_hours'] = self.calculate_activity_duration(activities)
            features['avg_activities_per_hour'] = features['total_activities'] / max(features['activity_duration_hours'], 1)
            
            # Time distribution features
            time_features = self.analyze_time_distribution(activities)
            features.update(time_features)
            
            # Behavioral pattern features
            behavior_features = self.analyze_behavioral_patterns(activities)
            features.update(behavior_features)
            
            # Risk pattern features
            risk_features = self.analyze_risk_patterns(activities, activity_type)
            features.update(risk_features)
            
            # Privacy assessment features
            privacy_features = self.assess_privacy_risks(activities)
            features.update(privacy_features)
            
            # Anomaly detection features
            anomaly_features = self.detect_anomalies(activities)
            features.update(anomaly_features)
            
            # Composite risk score
            features['composite_risk_score'] = self.calculate_composite_risk(features)
            
        except Exception as e:
            print(f"⚠️  Error extracting features: {e}")
            # Set default values
            features = self._get_default_features()
        
        return features
    
    def parse_activity_data(self, activity_data, activity_type):
        """Parse and structure activity data"""
        activities = []
        
        if isinstance(activity_data, str):
            # Parse text-based activity log
            lines = activity_data.strip().split('\n')
            for line in lines:
                if line.strip():
                    activity = self.parse_activity_line(line, activity_type)
                    if activity:
                        activities.append(activity)
        elif isinstance(activity_data, list):
            activities = activity_data
        elif isinstance(activity_data, dict):
            activities = [activity_data]
        
        return activities
    
    def parse_activity_line(self, line, activity_type):
        """Parse individual activity line"""
        activity = {
            'timestamp': datetime.now(),
            'type': activity_type,
            'description': line.strip(),
            'risk_level': 'low'
        }
        
        # Extract time if present
        time_match = re.search(r'(\d{1,2}:\d{2})', line)
        if time_match:
            activity['time'] = time_match.group(1)
        
        # Extract duration if present
        duration_match = re.search(r'(\d+)\s*(min|minutes|hour|hours)', line.lower())
        if duration_match:
            activity['duration'] = int(duration_match.group(1))
        
        # Detect risk keywords
        risk_keywords = ['suspicious', 'unusual', 'failed', 'error', 'warning', 'alert']
        for keyword in risk_keywords:
            if keyword in line.lower():
                activity['risk_level'] = 'high'
                break
        
        return activity
    
    def calculate_activity_duration(self, activities):
        """Calculate total activity duration in hours"""
        if not activities:
            return 0
        
        # Simple estimation based on activity count and type
        base_duration = len(activities) * 0.1  # 6 minutes per activity
        return min(base_duration, 24)  # Cap at 24 hours
    
    def analyze_time_distribution(self, activities):
        """Analyze temporal distribution of activities"""
        features = {}
        
        if not activities:
            return self._get_default_time_features()
        
        # Count activities by time of day
        morning_count = 0  # 6 AM - 12 PM
        afternoon_count = 0  # 12 PM - 6 PM
        evening_count = 0  # 6 PM - 12 AM
        night_count = 0  # 12 AM - 6 AM
        
        for activity in activities:
            if 'time' in activity:
                try:
                    hour = int(activity['time'].split(':')[0])
                    if 6 <= hour < 12:
                        morning_count += 1
                    elif 12 <= hour < 18:
                        afternoon_count += 1
                    elif 18 <= hour < 24:
                        evening_count += 1
                    else:
                        night_count += 1
                except:
                    pass
        
        total = len(activities)
        features['morning_activity_ratio'] = morning_count / max(total, 1)
        features['afternoon_activity_ratio'] = afternoon_count / max(total, 1)
        features['evening_activity_ratio'] = evening_count / max(total, 1)
        features['night_activity_ratio'] = night_count / max(total, 1)
        
        # Unusual timing detection
        features['has_unusual_timing'] = int(features['night_activity_ratio'] > 0.3)
        
        return features
    
    def analyze_behavioral_patterns(self, activities):
        """Analyze behavioral patterns for anomalies"""
        features = {}
        
        if not activities:
            return self._get_default_behavior_features()
        
        # Activity frequency analysis
        activity_types = {}
        risk_activities = 0
        
        for activity in activities:
            activity_type = activity.get('type', 'unknown')
            activity_types[activity_type] = activity_types.get(activity_type, 0) + 1
            
            if activity.get('risk_level') == 'high':
                risk_activities += 1
        
        features['unique_activity_types'] = len(activity_types)
        features['risk_activity_ratio'] = risk_activities / len(activities)
        
        # Concentration analysis
        if activity_types:
            max_activities = max(activity_types.values())
            features['activity_concentration'] = max_activities / len(activities)
        else:
            features['activity_concentration'] = 0
        
        # Behavioral consistency
        features['behavioral_consistency'] = 1.0 - features['activity_concentration']
        
        return features
    
    def analyze_risk_patterns(self, activities, activity_type):
        """Analyze specific risk patterns"""
        features = {}
        
        risk_indicators = {
            'multiple_failures': 0,
            'rapid_succession': 0,
            'unusual_sequences': 0,
            'privilege_changes': 0
        }
        
        # Simple pattern detection
        failure_keywords = ['failed', 'error', 'denied', 'rejected']
        rapid_threshold = 10  # activities within 1 minute
        
        failure_count = 0
        for activity in activities:
            description = activity.get('description', '').lower()
            
            # Count failures
            if any(keyword in description for keyword in failure_keywords):
                failure_count += 1
            
            # Detect privilege changes
            if 'admin' in description or 'root' in description or 'elevated' in description:
                risk_indicators['privilege_changes'] += 1
        
        risk_indicators['multiple_failures'] = min(failure_count / max(len(activities), 1), 1.0)
        
        features['failure_rate'] = risk_indicators['multiple_failures']
        features['privilege_change_count'] = risk_indicators['privilege_changes']
        features['suspicious_sequence_count'] = risk_indicators['unusual_sequences']
        
        return features
    
    def assess_privacy_risks(self, activities):
        """Assess privacy-related risks"""
        features = {}
        
        privacy_indicators = {
            'data_sharing_keywords': ['share', 'upload', 'post', 'publish', 'sync'],
            'tracking_keywords': ['track', 'monitor', 'analytics', 'cookie', 'advertising'],
            'sensitive_data_keywords': ['password', 'credit card', 'ssn', 'address', 'phone']
        }
        
        data_sharing_count = 0
        tracking_count = 0
        sensitive_data_count = 0
        
        for activity in activities:
            description = activity.get('description', '').lower()
            
            for keyword in privacy_indicators['data_sharing_keywords']:
                if keyword in description:
                    data_sharing_count += 1
            
            for keyword in privacy_indicators['tracking_keywords']:
                if keyword in description:
                    tracking_count += 1
            
            for keyword in privacy_indicators['sensitive_data_keywords']:
                if keyword in description:
                    sensitive_data_count += 1
        
        total = len(activities)
        features['data_sharing_ratio'] = data_sharing_count / max(total, 1)
        features['tracking_ratio'] = tracking_count / max(total, 1)
        features['sensitive_data_ratio'] = sensitive_data_count / max(total, 1)
        
        features['privacy_risk_score'] = (
            features['data_sharing_ratio'] * 0.4 +
            features['tracking_ratio'] * 0.3 +
            features['sensitive_data_ratio'] * 0.3
        )
        
        return features
    
    def detect_anomalies(self, activities):
        """Detect anomalous patterns in activities"""
        features = {}
        
        if len(activities) < 3:
            return {'anomaly_score': 0.0, 'cluster_count': 1}
        
        # Convert activities to feature vectors for clustering
        activity_vectors = []
        for activity in activities:
            vector = [
                len(activity.get('description', '')),
                activity.get('duration', 0) or 0,
                1 if activity.get('risk_level') == 'high' else 0
            ]
            activity_vectors.append(vector)
        
        # Use DBSCAN for anomaly detection
        try:
            self.cluster_model = DBSCAN(eps=0.5, min_samples=2)
            clusters = self.cluster_model.fit_predict(activity_vectors)
            
            # Count anomalies (points labeled as -1)
            anomaly_count = np.sum(clusters == -1)
            features['anomaly_score'] = anomaly_count / len(activities)
            features['cluster_count'] = len(set(clusters)) - (1 if -1 in clusters else 0)
            
        except Exception as e:
            features['anomaly_score'] = 0.0
            features['cluster_count'] = 1
        
        return features
    
    def calculate_composite_risk(self, features):
        """Calculate overall composite risk score"""
        risk_components = [
            features.get('risk_activity_ratio', 0) * 0.25,
            features.get('failure_rate', 0) * 0.20,
            features.get('privacy_risk_score', 0) * 0.20,
            features.get('anomaly_score', 0) * 0.15,
            features.get('has_unusual_timing', 0) * 0.10,
            features.get('sensitive_data_ratio', 0) * 0.10
        ]
        
        return min(sum(risk_components) * 100, 100)
    
    def _get_default_features(self):
        """Get default feature set"""
        default_features = {}
        default_features.update(self._get_default_time_features())
        default_features.update(self._get_default_behavior_features())
        default_features.update({
            'failure_rate': 0.0,
            'privilege_change_count': 0.0,
            'suspicious_sequence_count': 0.0,
            'data_sharing_ratio': 0.0,
            'tracking_ratio': 0.0,
            'sensitive_data_ratio': 0.0,
            'privacy_risk_score': 0.0,
            'anomaly_score': 0.0,
            'cluster_count': 1.0,
            'composite_risk_score': 0.0
        })
        return default_features
    
    def _get_default_time_features(self):
        return {
            'morning_activity_ratio': 0.33,
            'afternoon_activity_ratio': 0.33,
            'evening_activity_ratio': 0.33,
            'night_activity_ratio': 0.0,
            'has_unusual_timing': 0.0
        }
    
    def _get_default_behavior_features(self):
        return {
            'unique_activity_types': 1.0,
            'risk_activity_ratio': 0.0,
            'activity_concentration': 1.0,
            'behavioral_consistency': 0.0
        }
    
    def prepare_training_data(self, activities_list, labels):
        """Prepare training data with feature engineering"""
        features_list = []
        
        for activity_data in activities_list:
            features = self.extract_advanced_features(activity_data)
            feature_values = list(features.values())
            features_list.append(feature_values)
        
        X = np.array(features_list, dtype=float)
        y = np.array(labels)
        
        return X, y
    
    def train(self, use_accumulated_data=True, test_size=0.3):
        """Train the advanced daily usage model"""
        print("🚀 Training Advanced Daily Usage Model...")
        
        if use_accumulated_data:
            # Use accumulated data from storage
            activities, labels = data_storage.get_daily_usage_data()
            stats = data_storage.get_stats()['daily_usage']
            
            print(f"📊 Using accumulated data: {stats['total_samples']} samples")
            print(f"📊 Normal: {stats['normal_count']}, Suspicious: {stats['suspicious_count']}")
            
            if len(activities) >= 4:  # Minimum samples needed
                X, y = self.prepare_training_data(activities, labels)
            else:
                print("📝 Insufficient accumulated data, using sample data...")
                sample_data = self._get_sample_data()
                X, y = self.prepare_training_data(sample_data['activities'], sample_data['labels'])
        else:
            # Use only sample data
            print("📝 Using sample data only...")
            sample_data = self._get_sample_data()
            X, y = self.prepare_training_data(sample_data['activities'], sample_data['labels'])
        
        print(f"📊 Data shape: {X.shape}")
        
        # Adjust for small datasets
        n_samples = len(X)
        if n_samples < 10:
            test_size = 0.2
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        print(f"📊 Training set: {X_train.shape}, Test set: {X_test.shape}")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Create ensemble model
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42,
            subsample=0.8
        )
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Train anomaly detector
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.anomaly_detector.fit(X_train_scaled)
        
        # Evaluate model
        train_accuracy = self.model.score(X_train_scaled, y_train)
        test_accuracy = self.model.score(X_test_scaled, y_test) if len(X_test) > 0 else 0
        
        # Cross-validation
        cv_folds = min(3, len(X_train_scaled) // 2)
        if cv_folds >= 2:
            cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=cv_folds)
            cv_mean = cv_scores.mean()
            cv_std = cv_scores.std()
        else:
            cv_mean = test_accuracy
            cv_std = 0.0
        
        # Store model metadata
        self.model_metadata = {
            'training_samples': len(X_train),
            'test_samples': len(X_test),
            'train_accuracy': train_accuracy,
            'test_accuracy': test_accuracy,
            'cv_mean_accuracy': cv_mean,
            'cv_std_accuracy': cv_std,
            'used_accumulated_data': use_accumulated_data,
            'total_samples': len(X),
            'trained_at': datetime.now().isoformat()
        }
        
        # Save metadata to storage
        data_storage.save_model_metadata('daily_usage_scanner', self.model_metadata)
        
        print(f"✅ Model training completed!")
        print(f"📊 Training Accuracy: {train_accuracy:.4f}")
        print(f"📊 Test Accuracy: {test_accuracy:.4f}")
        print(f"📊 Cross-Validation: {cv_mean:.4f} ± {cv_std:.4f}")
        print(f"📊 Total Samples Used: {len(X)}")
        
        # Print classification report if we have test samples
        if len(X_test) > 0:
            y_pred = self.model.predict(X_test_scaled)
            print(f"\n📈 Classification Report:")
            print(classification_report(y_test, y_pred, target_names=['Normal', 'Suspicious']))
        
        return self.model_metadata
    
    def predict_risk(self, activity_data, activity_type='general'):
        """Predict risk for daily activities"""
        if not self.model:
            # Return basic analysis if model not trained
            features = self.extract_advanced_features(activity_data, activity_type)
            risk_score = int(features.get('composite_risk_score', 0))
            
            return {
                'is_suspicious': risk_score > 60,
                'risk_score': risk_score,
                'risk_level': self.calculate_risk_level(risk_score),
                'confidence': 0.5,
                'features': features,
                'analysis': self._generate_detailed_analysis(features, risk_score),
                'recommendations': self._generate_recommendations(features),
                'note': 'Model not trained, using basic pattern analysis'
            }
        
        # Extract features
        features = self.extract_advanced_features(activity_data, activity_type)
        feature_values = np.array([list(features.values())], dtype=float)
        
        # Scale features
        feature_values_scaled = self.scaler.transform(feature_values)
        
        # Make prediction
        prediction = self.model.predict(feature_values_scaled)[0]
        probability = self.model.predict_proba(feature_values_scaled)[0]
        
        # Calculate risk score (0-100)
        risk_score = int(probability[1] * 100) if prediction == 1 else int(probability[0] * 100)
        
        # Anomaly detection
        anomaly_score = self.anomaly_detector.score_samples(feature_values_scaled)[0]
        is_anomalous = anomaly_score < -0.1
        
        return {
            'is_suspicious': bool(prediction),
            'risk_score': risk_score,
            'risk_level': self.calculate_risk_level(risk_score),
            'confidence': float(max(probability)),
            'is_anomalous': bool(is_anomalous),
            'anomaly_score': float(anomaly_score),
            'features': features,
            'analysis': self._generate_detailed_analysis(features, risk_score),
            'recommendations': self._generate_recommendations(features)
        }
    
    def calculate_risk_level(self, risk_score):
        """Calculate risk level based on score"""
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
        """Generate detailed analysis of activities"""
        analysis = {
            'summary': '',
            'key_findings': [],
            'behavioral_insights': []
        }
        
        if risk_score >= 80:
            analysis['summary'] = 'Critical risk detected. Immediate review recommended.'
        elif risk_score >= 60:
            analysis['summary'] = 'High risk patterns identified. Security review advised.'
        elif risk_score >= 40:
            analysis['summary'] = 'Moderate risk detected. Monitor activities closely.'
        elif risk_score >= 20:
            analysis['summary'] = 'Low risk. Normal activity patterns.'
        else:
            analysis['summary'] = 'Minimal risk. Typical usage patterns.'
        
        # Key findings
        if features.get('risk_activity_ratio', 0) > 0.3:
            analysis['key_findings'].append('High proportion of risky activities detected')
        
        if features.get('failure_rate', 0) > 0.2:
            analysis['key_findings'].append('Elevated failure rate in operations')
        
        if features.get('privacy_risk_score', 0) > 0.6:
            analysis['key_findings'].append('Significant privacy concerns identified')
        
        if features.get('has_unusual_timing', 0):
            analysis['key_findings'].append('Unusual activity timing patterns')
        
        if features.get('anomaly_score', 0) > 0.3:
            analysis['key_findings'].append('Anomalous behavioral patterns detected')
        
        # Behavioral insights
        if features.get('behavioral_consistency', 0) < 0.5:
            analysis['behavioral_insights'].append('Inconsistent behavior patterns detected')
        
        if features.get('activity_concentration', 0) > 0.8:
            analysis['behavioral_insights'].append('Highly concentrated activity types')
        
        if features.get('night_activity_ratio', 0) > 0.4:
            analysis['behavioral_insights'].append('Unusually high nighttime activity')
        
        return analysis
    
    def _generate_recommendations(self, features):
        """Generate security recommendations"""
        recommendations = []
        
        if features.get('privacy_risk_score', 0) > 0.5:
            recommendations.append('Review and strengthen privacy settings')
            recommendations.append('Limit data sharing with third-party applications')
        
        if features.get('failure_rate', 0) > 0.3:
            recommendations.append('Investigate failed activity patterns')
            recommendations.append('Check system logs for errors')
        
        if features.get('risk_activity_ratio', 0) > 0.4:
            recommendations.append('Implement additional authentication for high-risk activities')
            recommendations.append('Monitor account for suspicious behavior')
        
        if features.get('has_unusual_timing', 0):
            recommendations.append('Set up alerts for unusual time activity')
            recommendations.append('Review access patterns regularly')
        
        if features.get('anomaly_score', 0) > 0.4:
            recommendations.append('Conduct security audit of user behavior')
            recommendations.append('Implement behavioral analytics monitoring')
        
        # Default recommendations
        if not recommendations:
            recommendations.extend([
                'Maintain regular security updates',
                'Use multi-factor authentication',
                'Monitor account activity regularly',
                'Review privacy settings monthly'
            ])
        
        return recommendations
    
    def _get_sample_data(self):
        """Get sample training data (fallback)"""
        sample_activities = [
            # Normal activities
            "09:00 - Login successful",
            "09:15 - Checked email",
            "10:30 - Browsed news websites",
            "14:00 - Online shopping",
            "16:45 - Social media browsing",
            # Suspicious activities
            "02:30 - Multiple failed login attempts",
            "03:15 - Unusual geographic login detected",
            "04:00 - Privilege escalation attempt",
            "23:45 - Data export initiated",
            "00:30 - Unknown device connection"
        ]
        
        sample_labels = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]  # 0 = normal, 1 = suspicious
        
        return {'activities': sample_activities, 'labels': sample_labels}
    
    def save_model(self, filepath='advanced_daily_usage_model.joblib'):
        """Save trained model and metadata"""
        if self.model:
            model_data = {
                'model': self.model,
                'anomaly_detector': self.anomaly_detector,
                'scaler': self.scaler,
                'cluster_model': self.cluster_model,
                'suspicious_patterns': self.suspicious_patterns,
                'baseline_metrics': self.baseline_metrics,
                'model_metadata': self.model_metadata
            }
            joblib.dump(model_data, filepath)
            print(f"✅ Model saved to {filepath}")
            return True
        else:
            print("❌ No trained model to save")
            return False
    
    def load_model(self, filepath='advanced_daily_usage_model.joblib'):
        """Load trained model and metadata"""
        try:
            model_data = joblib.load(filepath)
            
            self.model = model_data['model']
            self.anomaly_detector = model_data['anomaly_detector']
            self.scaler = model_data['scaler']
            self.cluster_model = model_data['cluster_model']
            self.suspicious_patterns = model_data['suspicious_patterns']
            self.baseline_metrics = model_data['baseline_metrics']
            self.model_metadata = model_data['model_metadata']
            
            print(f"✅ Model loaded from {filepath}")
            print(f"📊 Model accuracy: {self.model_metadata.get('test_accuracy', 'N/A')}")
            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
    
    def add_training_sample(self, activity_data, label, source="manual", description=""):
        """Add a new training sample to accumulated data"""
        return data_storage.add_daily_usage_sample(activity_data, label, source, description)

def main():
    """Main function to demonstrate the model"""
    print("🛡️ Sovereign Identity Guardian - Daily Usage AI Model")
    
    # Create model instance
    model = AdvancedDailyUsageModel()
    
    # Check current data stats
    stats = data_storage.get_stats()
    print(f"📊 Current Data Statistics:")
    print(f"   Daily Usage: {stats['daily_usage']['total_samples']} samples")
    
    # Train with accumulated data
    metadata = model.train(use_accumulated_data=True)
    
    # Test prediction
    test_activities = """
    08:30 - Normal login
    09:15 - Email checked
    10:45 - Web browsing
    14:20 - Online banking
    16:30 - Social media
    02:15 - Unusual login from foreign country
    03:30 - Multiple password reset attempts
    """
    
    prediction = model.predict_risk(test_activities)
    print(f"\n🔍 Prediction Results:")
    print(f"Is Suspicious: {prediction['is_suspicious']}")
    print(f"Risk Score: {prediction['risk_score']}/100")
    print(f"Risk Level: {prediction['risk_level']}")
    print(f"Confidence: {prediction['confidence']:.2f}")
    print(f"Is Anomalous: {prediction['is_anomalous']}")
    print(f"Analysis: {prediction['analysis']['summary']}")
    
    # Save model
    model.save_model()
    
    print(f"\n✅ Daily Usage AI Model Demo Completed!")

if __name__ == "__main__":
    main()