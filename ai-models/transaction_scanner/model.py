#!/usr/bin/env python3
"""
Sovereign Identity Guardian - Transaction Risk AI Model
Advanced machine learning model for detecting malicious blockchain transactions
"""

import numpy as np
import pandas as pd
import joblib
import json
import re
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import warnings
warnings.filterwarnings('ignore')

class AdvancedTransactionRiskModel:
    """
    Advanced AI model for transaction risk assessment
    Uses ensemble methods and feature engineering for high accuracy
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = []
        self.model_metadata = {}
        
        # Known malicious patterns database
        self.malicious_patterns = {
            'blacklisted_addresses': set(),
            'suspicious_methods': {
                '0x095ea7b3': 'approve',  # ERC20 approve
                '0xa9059cbb': 'transfer', # ERC20 transfer
                '0x23b872dd': 'transferFrom', # ERC20 transferFrom
                '0x42842e0e': 'safeTransferFrom', # ERC721
                '0xb88d4fde': 'safeTransferFrom', # ERC721
            },
            'exploit_patterns': {
                '0x0e0a1c3d': 'malicious_approve',
                '0x60806040': 'contract_creation',
                '0x60a06040': 'proxy_contract'
            }
        }
        
        # Feature configuration
        self.feature_config = {
            'value_thresholds': [0.1, 1.0, 10.0, 100.0],  # ETH
            'gas_thresholds': [21000, 100000, 500000, 1000000],
            'gas_price_thresholds': [10000000000, 50000000000, 200000000000]  # Gwei
        }
    
    def extract_advanced_features(self, transaction_data):
        """
        Extract comprehensive features from transaction data
        ALL FEATURES MUST BE NUMERICAL - NO STRINGS
        """
        features = {}
        
        try:
            # Address-based features
            to_address = transaction_data.get('to', '')
            from_address = transaction_data.get('from', '')
            
            features['to_address_entropy'] = self.calculate_address_entropy(to_address)
            features['from_address_entropy'] = self.calculate_address_entropy(from_address)
            features['address_similarity'] = self.calculate_address_similarity(from_address, to_address)
            
            # Value-based features
            value_wei = int(transaction_data.get('value', 0), 16) if transaction_data.get('value') else 0
            value_eth = value_wei / 10**18
            
            features['value_eth'] = value_eth
            features['value_log'] = np.log1p(value_eth) if value_eth > 0 else 0
            features['is_high_value'] = int(value_eth > 1.0)
            features['is_very_high_value'] = int(value_eth > 10.0)
            
            # Gas features
            gas_price = int(transaction_data.get('gasPrice', 0), 16) if transaction_data.get('gasPrice') else 0
            gas_limit = int(transaction_data.get('gas', 0), 16) if transaction_data.get('gas') else 21000
            
            features['gas_price_gwei'] = gas_price / 10**9
            features['gas_limit'] = gas_limit
            features['gas_ratio'] = gas_limit / 21000  # Ratio to simple transfer
            features['is_high_gas_price'] = int(gas_price > 200000000000)  # 200 Gwei
            features['is_high_gas_limit'] = int(gas_limit > 100000)
            
            # Data analysis features
            data = transaction_data.get('data', '0x')
            features['has_data'] = int(data != '0x' and data != '')
            features['data_length'] = len(data)
            features['data_complexity'] = self.calculate_data_complexity(data)
            
            # Method signature analysis - CONVERT TO NUMERICAL
            method_id = data[:10].lower() if len(data) >= 10 else '0x'
            # Convert method_id to numerical hash instead of string
            features['method_hash'] = self.hash_method_id(method_id)
            features['is_known_method'] = int(method_id in self.malicious_patterns['suspicious_methods'])
            features['is_known_exploit'] = int(method_id in self.malicious_patterns['exploit_patterns'])
            
            # Behavioral features
            features['is_contract_creation'] = int(transaction_data.get('to') is None or transaction_data.get('to') == '')
            features['is_token_transfer'] = int(method_id in ['0xa9059cbb', '0x23b872dd'])
            features['is_approval'] = int(method_id == '0x095ea7b3')
            
            # Pattern-based features
            features['suspicious_score'] = self.calculate_suspicious_score(transaction_data)
            features['risk_pattern_count'] = self.count_risk_patterns(transaction_data)
            
            # Network context features (simulated)
            features['hour_of_day'] = pd.Timestamp.now().hour
            features['day_of_week'] = pd.Timestamp.now().dayofweek
            
            # Transaction frequency simulation (would be real in production)
            features['recent_activity'] = np.random.uniform(0, 1)
            
        except Exception as e:
            print(f"Error extracting features: {e}")
            # Set default values for features in case of error
            for key in self.get_default_features():
                features[key] = 0.0
        
        return features
    
    def hash_method_id(self, method_id):
        """Convert method_id string to numerical hash"""
        if not method_id or method_id == '0x':
            return 0.0
        # Simple hash function to convert string to float between 0-1
        hash_val = 0
        for char in method_id:
            hash_val = (hash_val * 31 + ord(char)) % 1000000
        return float(hash_val) / 1000000
    
    def calculate_address_entropy(self, address):
        """Calculate entropy of an address for pattern detection"""
        if not address or len(address) < 10:
            return 0.0
        
        # Remove '0x' prefix and calculate character distribution
        clean_addr = address[2:].lower()
        if len(clean_addr) == 0:
            return 0.0
            
        char_counts = {}
        for char in clean_addr:
            char_counts[char] = char_counts.get(char, 0) + 1
        
        # Calculate entropy
        entropy = 0.0
        for count in char_counts.values():
            p = count / len(clean_addr)
            if p > 0:
                entropy -= p * np.log2(p)
            
        return entropy
    
    def calculate_address_similarity(self, addr1, addr2):
        """Calculate similarity between two addresses"""
        if not addr1 or not addr2:
            return 0.0
        
        addr1_clean = addr1[2:].lower() if addr1.startswith('0x') else addr1.lower()
        addr2_clean = addr2[2:].lower() if addr2.startswith('0x') else addr2.lower()
        
        # Simple character-based similarity
        common_chars = set(addr1_clean) & set(addr2_clean)
        return len(common_chars) / max(len(set(addr1_clean)), len(set(addr2_clean)), 1)
    
    def calculate_data_complexity(self, data):
        """Calculate complexity of transaction data"""
        if data == '0x' or not data:
            return 0.0
        
        # Remove '0x' prefix
        clean_data = data[2:] if data.startswith('0x') else data
        
        # Calculate unique character ratio and length factor
        unique_chars = len(set(clean_data))
        total_chars = len(clean_data)
        
        if total_chars == 0:
            return 0.0
            
        complexity = (unique_chars / total_chars) * np.log1p(total_chars)
        return complexity
    
    def calculate_suspicious_score(self, transaction_data):
        """Calculate overall suspiciousness score"""
        score = 0
        
        # Check for known malicious addresses
        to_address = transaction_data.get('to', '').lower()
        if to_address in self.malicious_patterns['blacklisted_addresses']:
            score += 50
        
        # Check value
        value_wei = int(transaction_data.get('value', 0), 16) if transaction_data.get('value') else 0
        value_eth = value_wei / 10**18
        if value_eth > 10:
            score += 20
        elif value_eth > 1:
            score += 10
        
        # Check gas
        gas_price = int(transaction_data.get('gasPrice', 0), 16) if transaction_data.get('gasPrice') else 0
        if gas_price > 200000000000:
            score += 15
        
        # Check data
        data = transaction_data.get('data', '')
        method_id = data[:10].lower() if len(data) >= 10 else '0x'
        if method_id in self.malicious_patterns['suspicious_methods']:
            score += 25
        if method_id in self.malicious_patterns['exploit_patterns']:
            score += 35
        
        return min(score, 100)
    
    def count_risk_patterns(self, transaction_data):
        """Count number of risk patterns detected"""
        count = 0
        
        # High value
        value_wei = int(transaction_data.get('value', 0), 16) if transaction_data.get('value') else 0
        if value_wei > 10**18:  # > 1 ETH
            count += 1
        
        # High gas price
        gas_price = int(transaction_data.get('gasPrice', 0), 16) if transaction_data.get('gasPrice') else 0
        if gas_price > 100000000000:  # > 100 Gwei
            count += 1
        
        # Contract interaction
        data = transaction_data.get('data', '')
        if data and data != '0x':
            count += 1
        
        # Known suspicious method
        method_id = data[:10].lower() if len(data) >= 10 else '0x'
        if method_id in self.malicious_patterns['suspicious_methods']:
            count += 2
        
        return count
    
    def get_default_features(self):
        """Get default feature set - ALL NUMERICAL"""
        return {
            'to_address_entropy': 0.0,
            'from_address_entropy': 0.0,
            'address_similarity': 0.0,
            'value_eth': 0.0,
            'value_log': 0.0,
            'is_high_value': 0,
            'is_very_high_value': 0,
            'gas_price_gwei': 0.0,
            'gas_limit': 21000,
            'gas_ratio': 1.0,
            'is_high_gas_price': 0,
            'is_high_gas_limit': 0,
            'has_data': 0,
            'data_length': 0,
            'data_complexity': 0.0,
            'method_hash': 0.0,  # Changed from method_id string
            'is_known_method': 0,
            'is_known_exploit': 0,
            'is_contract_creation': 0,
            'is_token_transfer': 0,
            'is_approval': 0,
            'suspicious_score': 0.0,
            'risk_pattern_count': 0,
            'hour_of_day': 12.0,
            'day_of_week': 0.0,
            'recent_activity': 0.0
        }
    
    def prepare_training_data(self, transactions, labels):
        """Prepare training data with feature engineering"""
        features_list = []
        
        for tx in transactions:
            features = self.extract_advanced_features(tx)
            # Ensure all features are numerical and in correct order
            feature_values = []
            for key in self.get_default_features().keys():
                feature_values.append(features.get(key, 0.0))
            features_list.append(feature_values)
        
        # Store feature names for reference
        self.feature_names = list(self.get_default_features().keys())
        
        X = np.array(features_list, dtype=float)  # Explicitly set to float
        y = np.array(labels)
        
        return X, y
    
    def train(self, transactions, labels, test_size=0.3):
        """Train the advanced risk model"""
        print("🚀 Training Advanced Transaction Risk Model...")
        
        # Prepare data
        X, y = self.prepare_training_data(transactions, labels)
        
        print(f"📊 Data shape: {X.shape}, Labels: {y.shape}")
        print(f"📊 Feature names: {self.feature_names}")
        
        # For small datasets, adjust test_size to ensure minimum samples per class
        n_samples = len(X)
        if n_samples < 10:
            test_size = 0.2  # Use smaller test split for very small datasets
        
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
        
        # Evaluate model
        train_accuracy = self.model.score(X_train_scaled, y_train)
        test_accuracy = self.model.score(X_test_scaled, y_test)
        
        # Cross-validation with adjusted folds for small datasets
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
            'feature_names': self.feature_names,
            'training_samples': len(X_train),
            'test_samples': len(X_test),
            'train_accuracy': train_accuracy,
            'test_accuracy': test_accuracy,
            'cv_mean_accuracy': cv_mean,
            'cv_std_accuracy': cv_std,
            'feature_importance': dict(zip(self.feature_names, self.model.feature_importances_)) if hasattr(self.model, 'feature_importances_') else {}
        }
        
        print(f"✅ Model training completed!")
        print(f"📊 Training Accuracy: {train_accuracy:.4f}")
        print(f"📊 Test Accuracy: {test_accuracy:.4f}")
        print(f"📊 Cross-Validation: {cv_mean:.4f} ± {cv_std:.4f}")
        
        if self.model_metadata['feature_importance']:
            top_features = sorted(self.model_metadata['feature_importance'].items(), key=lambda x: x[1], reverse=True)[:3]
            print(f"📈 Best Features: {top_features}")
        
        return self.model_metadata
    
    def predict_risk(self, transaction_data):
        """Predict risk for a single transaction"""
        if not self.model:
            # Return default prediction if model not trained
            return {
                'risk_level': 0,
                'risk_score': 10,
                'threat_level': 'SAFE',
                'confidence': 0.5,
                'features': {},
                'probabilities': {
                    'safe': 0.5,
                    'risky': 0.5
                },
                'warnings': ['Model not fully trained, using basic analysis']
            }
        
        # Extract features
        features = self.extract_advanced_features(transaction_data)
        
        # Prepare feature array in correct order
        feature_values = []
        for key in self.feature_names:
            feature_values.append(features.get(key, 0.0))
        
        X = np.array([feature_values], dtype=float)
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make prediction
        prediction = self.model.predict(X_scaled)[0]
        probability = self.model.predict_proba(X_scaled)[0]
        
        # Calculate risk score (0-100)
        risk_score = int(probability[1] * 100) if prediction == 1 else int(probability[0] * 100)
        
        # Determine threat level
        threat_level = self.calculate_threat_level(risk_score, features)
        
        return {
            'risk_level': int(prediction),
            'risk_score': risk_score,
            'threat_level': threat_level,
            'confidence': float(max(probability)),
            'features': features,
            'probabilities': {
                'safe': float(probability[0]),
                'risky': float(probability[1])
            },
            'warnings': self.generate_warnings(features, risk_score)
        }
    
    def calculate_threat_level(self, risk_score, features):
        """Calculate threat level based on risk score and features"""
        if risk_score >= 90:
            return 'CRITICAL'
        elif risk_score >= 75:
            return 'HIGH'
        elif risk_score >= 60:
            return 'MEDIUM'
        elif risk_score >= 40:
            return 'LOW'
        else:
            return 'SAFE'
    
    def generate_warnings(self, features, risk_score):
        """Generate specific warnings based on features"""
        warnings = []
        
        if features.get('is_known_exploit', 0):
            warnings.append("Known exploit pattern detected")
        
        if features.get('is_high_value', 0) and risk_score > 60:
            warnings.append("High value transaction with elevated risk")
        
        if features.get('is_high_gas_price', 0) and features.get('has_data', 0):
            warnings.append("Unusual gas price for contract interaction")
        
        if features.get('suspicious_score', 0) > 70:
            warnings.append("Multiple suspicious patterns detected")
        
        if features.get('risk_pattern_count', 0) >= 3:
            warnings.append("Multiple risk indicators present")
        
        return warnings
    
    def save_model(self, filepath):
        """Save trained model and metadata"""
        if self.model:
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'malicious_patterns': self.malicious_patterns,
                'model_metadata': self.model_metadata
            }
            joblib.dump(model_data, filepath)
            print(f"✅ Model saved to {filepath}")
        else:
            raise Exception("No trained model to save")
    
    def load_model(self, filepath):
        """Load trained model and metadata"""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.malicious_patterns = model_data['malicious_patterns']
        self.model_metadata = model_data['model_metadata']
        
        print(f"✅ Model loaded from {filepath}")
        print(f"📊 Model accuracy: {self.model_metadata.get('test_accuracy', 'N/A')}")

# Example usage and testing
def main():
    """Main function to demonstrate the model"""
    print("🛡️ Sovereign Identity Guardian - AI Model Demo")
    
    # Create model instance
    model = AdvancedTransactionRiskModel()
    
    # Expanded sample training data
    sample_transactions = [
        # Safe transactions (10 samples)
        {
            'to': '0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1f',
            'value': '0xde0b6b3a7640000',  # 1 ETH
            'data': '0x',
            'gasPrice': '0x4a817c800',  # 20 Gwei
            'gas': '0x5208'  # 21000
        },
        {
            'to': '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
            'value': '0x16345785d8a0000',  # 0.1 ETH
            'data': '0x',
            'gasPrice': '0x3b9aca00',  # 1 Gwei
            'gas': '0x5208'
        },
        {
            'to': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
            'value': '0x2386f26fc10000',  # 0.01 ETH
            'data': '0x',
            'gasPrice': '0x77359400',  # 2 Gwei
            'gas': '0x5208'
        },
        {
            'to': '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
            'value': '0x1bc16d674ec80000',  # 2 ETH
            'data': '0x',
            'gasPrice': '0x4a817c800',
            'gas': '0x5208'
        },
        {
            'to': '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf',
            'value': '0x6f05b59d3b20000',  # 0.5 ETH
            'data': '0x',
            'gasPrice': '0x3b9aca00',
            'gas': '0x5208'
        },
        
        # Risky transactions (10 samples)
        {
            'to': '0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a',  # Known scam
            'value': '0x1bc16d674ec80000',  # 2 ETH
            'data': '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000',
            'gasPrice': '0x2cb417800',  # 12 Gwei
            'gas': '0x186a0'  # 100,000
        },
        {
            'to': '0x901bb9583b24d97e995513c6778dc6888ab6870e',
            'value': '0x8ac7230489e80000',  # 10 ETH
            'data': '0x095ea7b30000000000000000000000000000000000000000000000000000000000000000',
            'gasPrice': '0x4a817c800',
            'gas': '0x30d40'  # 200,000
        },
        {
            'to': '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a',
            'value': '0x4563918244f40000',  # 5 ETH
            'data': '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000',
            'gasPrice': '0x5d21dba00',  # 25 Gwei
            'gas': '0x249f0'  # 150,000
        },
        {
            'to': '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            'value': '0xad78ebc5ac6200000',  # 125 ETH
            'data': '0x095ea7b30000000000000000000000000000000000000000000000000000000000000000',
            'gasPrice': '0x6fc23ac00',  # 30 Gwei
            'gas': '0x30d40'
        },
        {
            'to': '0x5a4f765476fd8c36357a2e8a5c4a1e4b5a5e5e5e',
            'value': '0x152d02c7e14af6800000',  # 100,000 ETH
            'data': '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000',
            'gasPrice': '0x77359400',  # 2 Gwei
            'gas': '0x186a0'
        }
    ]
    
    sample_labels = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]  # 0 = safe, 1 = risky
    
    # Add known malicious addresses
    model.malicious_patterns['blacklisted_addresses'].add('0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a')
    model.malicious_patterns['blacklisted_addresses'].add('0x901bb9583b24d97e995513c6778dc6888ab6870e')
    model.malicious_patterns['blacklisted_addresses'].add('0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a')
    model.malicious_patterns['blacklisted_addresses'].add('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2')
    model.malicious_patterns['blacklisted_addresses'].add('0x5a4f765476fd8c36357a2e8a5c4a1e4b5a5e5e5e')
    
    # Train model
    metadata = model.train(sample_transactions, sample_labels)
    
    # Test prediction
    test_transaction = {
        'to': '0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a',
        'value': '0xde0b6b3a7640000',
        'data': '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000',
        'gasPrice': '0x4a817c800',
        'gas': '0x186a0'
    }
    
    prediction = model.predict_risk(test_transaction)
    print(f"\n🔍 Prediction Results:")
    print(f"Risk Level: {prediction['risk_level']}")
    print(f"Risk Score: {prediction['risk_score']}/100")
    print(f"Threat Level: {prediction['threat_level']}")
    print(f"Confidence: {prediction['confidence']:.2f}")
    print(f"Warnings: {prediction['warnings']}")
    
    # Save model
    model.save_model('advanced_transaction_model.joblib')
    
    print(f"\n✅ AI Model Demo Completed Successfully!")

if __name__ == "__main__":
    main()