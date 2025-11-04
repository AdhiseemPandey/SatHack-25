#!/usr/bin/env python3
"""
Sovereign Identity Guardian - Email Spam Detection AI Model
Advanced machine learning for email spam and phishing detection
"""

import numpy as np
import pandas as pd
import joblib
import re
import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_storage import data_storage

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import warnings
warnings.filterwarnings('ignore')

class AdvancedEmailSpamModel:
    """
    Advanced AI model for email spam and phishing detection
    Uses multiple feature extraction techniques and ensemble learning
    """
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.scaler = StandardScaler()
        self.stop_words = self._get_english_stopwords()
        self.model_metadata = {}
        
        # Enhanced spam patterns database
        self.spam_patterns = {
            'urgent_keywords': [
                'urgent', 'immediately', 'asap', 'quick', 'instant',
                'emergency', 'critical', 'important', 'action required'
            ],
            'financial_keywords': [
                'free', 'winner', 'prize', 'million', 'dollar',
                'cash', 'money', 'reward', 'bonus', 'grant'
            ],
            'phishing_keywords': [
                'verify', 'confirm', 'account', 'password', 'login',
                'security', 'update', 'suspended', 'limited time'
            ],
            'suspicious_phrases': [
                'click here', 'click below', 'link below', 'visit here',
                'limited offer', 'act now', 'don\'t miss', 'exclusive',
                'congratulations', 'you won', 'you\'ve been selected'
            ],
            'threat_keywords': [
                'suspend', 'terminate', 'close', 'delete', 'expire',
                'final warning', 'last chance', 'immediately'
            ]
        }
        
        # Common legitimate domains (whitelist)
        self.legitimate_domains = {
            'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
            'icloud.com', 'aol.com', 'protonmail.com'
        }
    
    def _get_english_stopwords(self):
        """Get English stopwords without NLTK dependency"""
        return {
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", 
            "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 
            'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 
            'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 
            'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 
            'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 
            'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 
            'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 
            'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 
            'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
            'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 
            'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 
            'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 
            'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 
            'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', 
            "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 
            'wouldn', "wouldn't"
        }
    
    def preprocess_text(self, text):
        """Advanced text preprocessing"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep basic punctuation for context
        text = re.sub(r'[^\w\s\.@\-]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def extract_advanced_features(self, email_text):
        """
        Extract comprehensive features from email text
        Includes linguistic, structural, and pattern-based features
        """
        features = {}
        
        try:
            processed_text = self.preprocess_text(email_text)
            
            # Basic text statistics
            features['text_length'] = len(email_text)
            features['word_count'] = len(processed_text.split())
            features['sentence_count'] = len(re.split(r'[.!?]+', email_text))
            features['avg_word_length'] = np.mean([len(word) for word in processed_text.split()]) if processed_text.split() else 0
            features['avg_sentence_length'] = features['word_count'] / max(features['sentence_count'], 1)
            
            # Capitalization features
            upper_count = sum(1 for char in email_text if char.isupper())
            features['caps_ratio'] = upper_count / max(len(email_text), 1)
            features['has_excessive_caps'] = int(features['caps_ratio'] > 0.3)
            
            # URL and link analysis
            url_pattern = r'https?://[^\s]+'
            urls = re.findall(url_pattern, email_text)
            features['url_count'] = len(urls)
            features['has_urls'] = int(len(urls) > 0)
            features['suspicious_url_ratio'] = self._analyze_urls(urls)
            
            # Email address analysis
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, email_text)
            features['email_count'] = len(emails)
            features['suspicious_email_ratio'] = self._analyze_emails(emails)
            
            # Pattern-based features
            features['spam_keyword_score'] = self._calculate_spam_keyword_score(email_text)
            features['urgency_score'] = self._calculate_urgency_score(email_text)
            features['financial_score'] = self._calculate_financial_score(email_text)
            features['phishing_score'] = self._calculate_phishing_score(email_text)
            
            # Structural features
            features['has_greeting'] = int(bool(re.search(r'^(dear|hello|hi|greetings)', processed_text, re.IGNORECASE)))
            features['has_signature'] = int(bool(re.search(r'(regards|sincerely|thank you|best)[^.!?]*$', processed_text, re.IGNORECASE)))
            features['has_disclaimer'] = int('disclaimer' in processed_text or 'confidential' in processed_text)
            
            # Linguistic complexity
            features['readability_score'] = self._calculate_readability(email_text)
            features['unique_word_ratio'] = len(set(processed_text.split())) / max(features['word_count'], 1)
            
            # Special character analysis
            features['special_char_ratio'] = len(re.findall(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>/?]', email_text)) / max(len(email_text), 1)
            features['exclamation_count'] = email_text.count('!')
            features['question_count'] = email_text.count('?')
            
            # Combined risk score
            features['composite_risk_score'] = (
                features['spam_keyword_score'] * 0.3 +
                features['urgency_score'] * 0.2 +
                features['financial_score'] * 0.2 +
                features['phishing_score'] * 0.3
            )
            
        except Exception as e:
            print(f"⚠️  Error extracting features: {e}")
            # Set default values
            features = self._get_default_features()
        
        return features
    
    def _analyze_urls(self, urls):
        """Analyze URLs for suspicious patterns"""
        if not urls:
            return 0.0
        
        suspicious_count = 0
        for url in urls:
            # Check for URL shortening services
            if any(service in url for service in ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co']):
                suspicious_count += 1
            # Check for IP addresses in URLs
            elif re.search(r'\d+\.\d+\.\d+\.\d+', url):
                suspicious_count += 1
            # Check for suspicious TLDs
            elif re.search(r'\.(xyz|top|club|loan|win|review)', url):
                suspicious_count += 1
        
        return suspicious_count / len(urls)
    
    def _analyze_emails(self, emails):
        """Analyze email addresses for suspicious patterns"""
        if not emails:
            return 0.0
        
        suspicious_count = 0
        for email in emails:
            # Check for random-looking email addresses
            local_part = email.split('@')[0]
            if re.search(r'\d{4,}', local_part) or len(local_part) < 4:
                suspicious_count += 1
            # Check domain reputation
            domain = email.split('@')[1]
            if domain not in self.legitimate_domains and not re.search(r'\.(com|org|net|edu|gov)$', domain):
                suspicious_count += 1
        
        return suspicious_count / len(emails)
    
    def _calculate_spam_keyword_score(self, text):
        """Calculate score based on spam keyword frequency"""
        text_lower = text.lower()
        score = 0
        
        for category, keywords in self.spam_patterns.items():
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
        
        return min(score / 5, 1.0)  # Normalize to 0-1
    
    def _calculate_urgency_score(self, text):
        """Calculate urgency score"""
        text_lower = text.lower()
        score = 0
        
        for keyword in self.spam_patterns['urgent_keywords'] + self.spam_patterns['threat_keywords']:
            if keyword in text_lower:
                score += 2  # Higher weight for urgency
        
        return min(score / 10, 1.0)
    
    def _calculate_financial_score(self, text):
        """Calculate financial incentive score"""
        text_lower = text.lower()
        score = 0
        
        for keyword in self.spam_patterns['financial_keywords']:
            if keyword in text_lower:
                score += 1
        
        return min(score / 5, 1.0)
    
    def _calculate_phishing_score(self, text):
        """Calculate phishing attempt score"""
        text_lower = text.lower()
        score = 0
        
        for keyword in self.spam_patterns['phishing_keywords'] + self.spam_patterns['suspicious_phrases']:
            if keyword in text_lower:
                score += 1
        
        # Additional phishing indicators
        if re.search(r'bank|paypal|amazon|microsoft|apple', text_lower):
            score += 1
        if re.search(r'\$\d+|\d+\s*(dollars|usd)', text_lower):
            score += 1
        
        return min(score / 8, 1.0)
    
    def _calculate_readability(self, text):
        """Calculate simple readability score (lower = more complex)"""
        words = text.split()
        if len(words) < 10:
            return 1.0
        
        # Simple approximation - more complex text has longer words and sentences
        avg_word_len = np.mean([len(word) for word in words])
        sentences = re.split(r'[.!?]+', text)
        avg_sentence_len = len(words) / len(sentences)
        
        # Normalize to 0-1 (higher = more readable)
        readability = 1.0 / (1.0 + (avg_word_len - 4) * 0.1 + (avg_sentence_len - 10) * 0.05)
        return max(0.1, min(1.0, readability))
    
    def _get_default_features(self):
        """Get default feature set"""
        return {
            'text_length': 0.0,
            'word_count': 0.0,
            'sentence_count': 0.0,
            'avg_word_length': 0.0,
            'avg_sentence_length': 0.0,
            'caps_ratio': 0.0,
            'has_excessive_caps': 0.0,
            'url_count': 0.0,
            'has_urls': 0.0,
            'suspicious_url_ratio': 0.0,
            'email_count': 0.0,
            'suspicious_email_ratio': 0.0,
            'spam_keyword_score': 0.0,
            'urgency_score': 0.0,
            'financial_score': 0.0,
            'phishing_score': 0.0,
            'has_greeting': 0.0,
            'has_signature': 0.0,
            'has_disclaimer': 0.0,
            'readability_score': 0.0,
            'unique_word_ratio': 0.0,
            'special_char_ratio': 0.0,
            'exclamation_count': 0.0,
            'question_count': 0.0,
            'composite_risk_score': 0.0
        }
    
    def prepare_training_data(self, emails, labels, use_tfidf=True):
        """Prepare training data with multiple feature types"""
        structural_features = []
        text_features = []
        
        for email in emails:
            # Structural features
            structural_feats = self.extract_advanced_features(email)
            structural_features.append(list(structural_feats.values()))
            
            # Text features for TF-IDF
            processed_text = self.preprocess_text(email)
            text_features.append(processed_text)
        
        # Convert to arrays
        X_structural = np.array(structural_features, dtype=float)
        
        if use_tfidf and len(emails) >= 5:  # Only use TF-IDF if we have enough samples
            # TF-IDF features
            self.vectorizer = TfidfVectorizer(
                max_features=500,  # Reduced for small datasets
                stop_words='english',
                ngram_range=(1, 2),
                min_df=1  # Reduced for small datasets
            )
            X_tfidf = self.vectorizer.fit_transform(text_features).toarray()
            
            # Combine features
            X_combined = np.hstack([X_structural, X_tfidf])
        else:
            X_combined = X_structural
        
        y = np.array(labels)
        
        return X_combined, y
    
    def train(self, use_accumulated_data=True, test_size=0.3, use_tfidf=True):
        """Train the advanced spam detection model"""
        print("🚀 Training Advanced Email Spam Model...")
        
        if use_accumulated_data:
            # Use accumulated data from storage
            emails, labels = data_storage.get_email_data()
            stats = data_storage.get_stats()['emails']
            
            print(f"📊 Using accumulated data: {stats['total_samples']} samples")
            print(f"📊 Legitimate: {stats['legitimate_count']}, Spam: {stats['spam_count']}")
            
            if len(emails) >= 4:  # Minimum samples needed
                X, y = self.prepare_training_data(emails, labels, use_tfidf)
            else:
                print("📝 Insufficient accumulated data, using sample data...")
                sample_data = self._get_sample_data()
                X, y = self.prepare_training_data(sample_data['emails'], sample_data['labels'], use_tfidf)
        else:
            # Use only sample data
            print("📝 Using sample data only...")
            sample_data = self._get_sample_data()
            X, y = self.prepare_training_data(sample_data['emails'], sample_data['labels'], use_tfidf)
        
        print(f"📊 Data shape: {X.shape}")
        
        # Adjust for small datasets
        n_samples = len(X)
        if n_samples < 10:
            test_size = 0.2
            use_tfidf = False
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        print(f"📊 Training set: {X_train.shape}, Test set: {X_test.shape}")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Create ensemble model with adjusted parameters
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42,
            subsample=0.8
        )
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
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
            'used_tfidf': use_tfidf,
            'used_accumulated_data': use_accumulated_data,
            'total_samples': len(X),
            'trained_at': datetime.now().isoformat()
        }
        
        # Save metadata to storage
        data_storage.save_model_metadata('email_scanner', self.model_metadata)
        
        print(f"✅ Model training completed!")
        print(f"📊 Training Accuracy: {train_accuracy:.4f}")
        print(f"📊 Test Accuracy: {test_accuracy:.4f}")
        print(f"📊 Cross-Validation: {cv_mean:.4f} ± {cv_std:.4f}")
        print(f"📊 Total Samples Used: {len(X)}")
        
        # Print classification report if we have test samples
        if len(X_test) > 0:
            y_pred = self.model.predict(X_test_scaled)
            print(f"\n📈 Classification Report:")
            print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Spam']))
        
        return self.model_metadata
    
    def _get_sample_data(self):
        """Get sample training data (fallback)"""
        sample_emails = [
            # Spam emails
            "URGENT: Your account will be SUSPENDED! Click here to verify: http://bit.ly/fake-link",
            "Congratulations! You won $1,000,000! Claim your prize now: http://tinyurl.com/fake-win",
            "FREE iPhone! Limited time offer! Click below: http://free-iphone.xyz",
            # Legitimate emails
            "Hi John, attached is the report you requested. Let me know if you need anything else. Best, Sarah",
            "Meeting reminder: Tomorrow at 2 PM in Conference Room B. Please bring the quarterly reports.",
            "Your invoice #INV-2024-001 is ready for payment. Please review and let us know if you have questions."
        ]
        sample_labels = [1, 1, 1, 0, 0, 0]  # 1 = spam, 0 = legitimate
        
        return {'emails': sample_emails, 'labels': sample_labels}
    
    def predict_spam(self, email_text):
        """Predict if email is spam"""
        if not self.model:
            # Return basic analysis if model not trained
            features = self.extract_advanced_features(email_text)
            spam_score = int(features.get('composite_risk_score', 0) * 100)
            
            return {
                'is_spam': spam_score > 60,
                'spam_score': spam_score,
                'confidence': 0.5,
                'probability_legitimate': 1.0 - (spam_score / 100),
                'probability_spam': spam_score / 100,
                'features': features,
                'analysis': self._generate_detailed_analysis(email_text, features, spam_score),
                'risk_factors': self._identify_risk_factors(features, email_text),
                'note': 'Model not trained, using basic pattern analysis'
            }
        
        # Extract features
        features = self.extract_advanced_features(email_text)
        structural_features = np.array([list(features.values())], dtype=float)
        
        # Handle feature dimension mismatch
        if self.model_metadata.get('used_tfidf', False) and self.vectorizer:
            try:
                # Process text for TF-IDF
                processed_text = self.preprocess_text(email_text)
                tfidf_features = self.vectorizer.transform([processed_text]).toarray()
                
                # Combine features
                X = np.hstack([structural_features, tfidf_features])
            except Exception as e:
                print(f"⚠️  TF-IDF transformation failed: {e}, using structural features only")
                X = structural_features
        else:
            X = structural_features
        
        # Ensure feature dimensions match training
        expected_features = self.scaler.n_features_in_ if hasattr(self.scaler, 'n_features_in_') else X.shape[1]
        
        if X.shape[1] != expected_features:
            print(f"⚠️  Feature dimension mismatch: got {X.shape[1]}, expected {expected_features}")
            # Pad or truncate features to match expected dimensions
            if X.shape[1] < expected_features:
                # Pad with zeros
                padding = np.zeros((X.shape[0], expected_features - X.shape[1]))
                X = np.hstack([X, padding])
            else:
                # Truncate
                X = X[:, :expected_features]
        
        try:
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Make prediction
            prediction = self.model.predict(X_scaled)[0]
            probability = self.model.predict_proba(X_scaled)[0]
            
            # Calculate spam score (0-100)
            spam_score = int(probability[1] * 100)  # Probability of being spam
            
            # Generate detailed analysis
            analysis = self._generate_detailed_analysis(email_text, features, spam_score)
            
            return {
                'is_spam': bool(prediction),
                'spam_score': spam_score,
                'confidence': float(max(probability)),
                'probability_legitimate': float(probability[0]),
                'probability_spam': float(probability[1]),
                'features': features,
                'analysis': analysis,
                'risk_factors': self._identify_risk_factors(features, email_text)
            }
        except Exception as e:
            print(f"⚠️  Prediction error: {e}, falling back to feature analysis")
            # Fallback to feature-based analysis
            spam_score = int(features.get('composite_risk_score', 0) * 100)
            return {
                'is_spam': spam_score > 60,
                'spam_score': spam_score,
                'confidence': 0.7,
                'probability_legitimate': 1.0 - (spam_score / 100),
                'probability_spam': spam_score / 100,
                'features': features,
                'analysis': self._generate_detailed_analysis(email_text, features, spam_score),
                'risk_factors': self._identify_risk_factors(features, email_text),
                'note': 'Model prediction failed, using feature analysis'
            }

    def _generate_detailed_analysis(self, email_text, features, spam_score):
        """Generate detailed analysis of the email"""
        analysis = {
            'summary': '',
            'key_indicators': [],
            'recommendation': ''
        }
        
        if spam_score >= 80:
            analysis['summary'] = 'High probability of spam/phishing email'
            analysis['recommendation'] = 'Do not interact with this email. Delete it immediately.'
        elif spam_score >= 60:
            analysis['summary'] = 'Likely spam email'
            analysis['recommendation'] = 'Exercise extreme caution. Verify sender before any action.'
        elif spam_score >= 40:
            analysis['summary'] = 'Suspicious elements detected'
            analysis['recommendation'] = 'Review carefully before taking any action.'
        else:
            analysis['summary'] = 'Appears to be legitimate'
            analysis['recommendation'] = 'Standard email handling procedures apply.'
        
        # Identify key indicators
        if features['spam_keyword_score'] > 0.5:
            analysis['key_indicators'].append('High spam keyword frequency')
        if features['urgency_score'] > 0.6:
            analysis['key_indicators'].append('Urgent or threatening language')
        if features['financial_score'] > 0.5:
            analysis['key_indicators'].append('Financial incentives mentioned')
        if features['phishing_score'] > 0.6:
            analysis['key_indicators'].append('Phishing attempt indicators')
        if features['suspicious_url_ratio'] > 0.5:
            analysis['key_indicators'].append('Suspicious URLs detected')
        if features['has_excessive_caps']:
            analysis['key_indicators'].append('Excessive capitalization')
        
        return analysis
    
    def _identify_risk_factors(self, features, email_text):
        """Identify specific risk factors"""
        risk_factors = []
        
        # Check individual risk indicators
        if features['spam_keyword_score'] > 0.3:
            risk_factors.append(f"Spam keywords detected (score: {features['spam_keyword_score']:.2f})")
        
        if features['urgency_score'] > 0.4:
            risk_factors.append(f"Urgent language used (score: {features['urgency_score']:.2f})")
        
        if features['financial_score'] > 0.3:
            risk_factors.append(f"Financial incentives mentioned (score: {features['financial_score']:.2f})")
        
        if features['url_count'] > 2:
            risk_factors.append(f"Multiple URLs ({features['url_count']})")
        
        if features['suspicious_url_ratio'] > 0.3:
            risk_factors.append(f"Suspicious URLs ({features['suspicious_url_ratio']:.2f} ratio)")
        
        if features['has_excessive_caps']:
            risk_factors.append("Excessive capitalization detected")
        
        if features['exclamation_count'] > 3:
            risk_factors.append(f"Multiple exclamation marks ({features['exclamation_count']})")
        
        return risk_factors
    
    def save_model(self, filepath='advanced_email_spam_model.joblib'):
        """Save trained model and metadata"""
        if self.model:
            model_data = {
                'model': self.model,
                'vectorizer': self.vectorizer,
                'scaler': self.scaler,
                'spam_patterns': self.spam_patterns,
                'model_metadata': self.model_metadata
            }
            joblib.dump(model_data, filepath)
            print(f"✅ Model saved to {filepath}")
            return True
        else:
            print("❌ No trained model to save")
            return False
    
    def load_model(self, filepath='advanced_email_spam_model.joblib'):
        """Load trained model and metadata"""
        try:
            model_data = joblib.load(filepath)
            
            self.model = model_data['model']
            self.vectorizer = model_data['vectorizer']
            self.scaler = model_data['scaler']
            self.spam_patterns = model_data['spam_patterns']
            self.model_metadata = model_data['model_metadata']
            
            print(f"✅ Model loaded from {filepath}")
            print(f"📊 Model accuracy: {self.model_metadata.get('test_accuracy', 'N/A')}")
            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
    
    def add_training_sample(self, email, label, source="manual", description=""):
        """Add a new training sample to accumulated data"""
        return data_storage.add_email_sample(email, label, source, description)

def main():
    """Main function to demonstrate the model"""
    print("🛡️ Sovereign Identity Guardian - Email AI Model")
    
    # Create model instance
    model = AdvancedEmailSpamModel()
    
    # Check current data stats
    stats = data_storage.get_stats()
    print(f"📊 Current Data Statistics:")
    print(f"   Emails: {stats['emails']['total_samples']} samples")
    
    # Train with accumulated data
    metadata = model.train(use_accumulated_data=True)
    
    # Test prediction
    test_email = "URGENT! Your bank account needs verification. Click here now: http://fake-bank-security.com"
    
    prediction = model.predict_spam(test_email)
    print(f"\n🔍 Prediction Results:")
    print(f"Is Spam: {prediction['is_spam']}")
    print(f"Spam Score: {prediction['spam_score']}/100")
    print(f"Confidence: {prediction['confidence']:.2f}")
    print(f"Analysis: {prediction['analysis']['summary']}")
    
    # Save model
    model.save_model()
    
    print(f"\n✅ Email AI Model Demo Completed!")

if __name__ == "__main__":
    main()