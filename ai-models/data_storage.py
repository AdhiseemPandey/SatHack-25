#!/usr/bin/env python3
"""
Centralized Data Storage for Sovereign Identity Guardian AI Models
Manages training data accumulation and model metadata
"""

import json
import os
from datetime import datetime

class DataStorage:
    def __init__(self, data_file='accumulated_data.json'):
        self.data_file = data_file
        self.email_data = {
            'emails': [],
            'labels': [],
            'sources': [],
            'descriptions': [],
            'timestamps': []
        }
        self.transaction_data = {
            'transactions': [],
            'labels': [],
            'sources': [],
            'descriptions': [],
            'timestamps': []
        }
        self.daily_usage_data = {
            'activities': [],
            'labels': [],
            'sources': [],
            'descriptions': [],
            'timestamps': []
        }
        self.model_metadata = {}
        self.load_data()

    def load_data(self):
        """Load accumulated data from file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.email_data = data.get('email_data', self.email_data)
                    self.transaction_data = data.get('transaction_data', self.transaction_data)
                    self.daily_usage_data = data.get('daily_usage_data', self.daily_usage_data)
                    self.model_metadata = data.get('model_metadata', {})
                print(f"✅ Loaded data from {self.data_file}")
            except Exception as e:
                print(f"⚠️  Error loading data: {e}, starting with empty dataset")
        else:
            print("📁 No existing data file, starting with empty dataset")

    def save_data(self):
        """Save accumulated data to file"""
        try:
            data = {
                'email_data': self.email_data,
                'transaction_data': self.transaction_data,
                'daily_usage_data': self.daily_usage_data,
                'model_metadata': self.model_metadata,
                'last_updated': datetime.now().isoformat()
            }
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"✅ Data saved to {self.data_file}")
        except Exception as e:
            print(f"❌ Error saving data: {e}")

    def add_email_sample(self, email, label, source="manual", description=""):
        """Add an email sample to accumulated data"""
        self.email_data['emails'].append(email)
        self.email_data['labels'].append(int(label))
        self.email_data['sources'].append(source)
        self.email_data['descriptions'].append(description)
        self.email_data['timestamps'].append(datetime.now().isoformat())
        self.save_data()
        return True

    def add_transaction_sample(self, transaction, label, source="manual", description=""):
        """Add a transaction sample to accumulated data"""
        self.transaction_data['transactions'].append(transaction)
        self.transaction_data['labels'].append(int(label))
        self.transaction_data['sources'].append(source)
        self.transaction_data['descriptions'].append(description)
        self.transaction_data['timestamps'].append(datetime.now().isoformat())
        self.save_data()
        return True

    def add_daily_usage_sample(self, activities, label, source="manual", description=""):
        """Add a daily usage sample to accumulated data"""
        self.daily_usage_data['activities'].append(activities)
        self.daily_usage_data['labels'].append(int(label))
        self.daily_usage_data['sources'].append(source)
        self.daily_usage_data['descriptions'].append(description)
        self.daily_usage_data['timestamps'].append(datetime.now().isoformat())
        self.save_data()
        return True

    def get_email_data(self):
        """Get all email data and labels"""
        return self.email_data['emails'], self.email_data['labels']

    def get_transaction_data(self):
        """Get all transaction data and labels"""
        return self.transaction_data['transactions'], self.transaction_data['labels']

    def get_daily_usage_data(self):
        """Get all daily usage data and labels"""
        return self.daily_usage_data['activities'], self.daily_usage_data['labels']

    def get_stats(self):
        """Get statistics about accumulated data"""
        email_stats = {
            'total_samples': len(self.email_data['emails']),
            'legitimate_count': sum(1 for label in self.email_data['labels'] if label == 0),
            'spam_count': sum(1 for label in self.email_data['labels'] if label == 1),
            'sources': {}
        }
        
        transaction_stats = {
            'total_samples': len(self.transaction_data['transactions']),
            'safe_count': sum(1 for label in self.transaction_data['labels'] if label == 0),
            'risky_count': sum(1 for label in self.transaction_data['labels'] if label == 1),
            'sources': {}
        }
        
        daily_usage_stats = {
            'total_samples': len(self.daily_usage_data['activities']),
            'normal_count': sum(1 for label in self.daily_usage_data['labels'] if label == 0),
            'suspicious_count': sum(1 for label in self.daily_usage_data['labels'] if label == 1),
            'sources': {}
        }
        
        # Count sources
        for source in self.email_data['sources']:
            email_stats['sources'][source] = email_stats['sources'].get(source, 0) + 1
        
        for source in self.transaction_data['sources']:
            transaction_stats['sources'][source] = transaction_stats['sources'].get(source, 0) + 1
            
        for source in self.daily_usage_data['sources']:
            daily_usage_stats['sources'][source] = daily_usage_stats['sources'].get(source, 0) + 1
        
        return {
            'emails': email_stats,
            'transactions': transaction_stats,
            'daily_usage': daily_usage_stats,
            'last_updated': datetime.now().isoformat()
        }

    def clear_data(self, data_type='all'):
        """Clear specific or all data"""
        if data_type == 'emails' or data_type == 'all':
            self.email_data = {'emails': [], 'labels': [], 'sources': [], 'descriptions': [], 'timestamps': []}
        
        if data_type == 'transactions' or data_type == 'all':
            self.transaction_data = {'transactions': [], 'labels': [], 'sources': [], 'descriptions': [], 'timestamps': []}
            
        if data_type == 'daily_usage' or data_type == 'all':
            self.daily_usage_data = {'activities': [], 'labels': [], 'sources': [], 'descriptions': [], 'timestamps': []}
        
        if data_type == 'all':
            self.model_metadata = {}
        
        self.save_data()
        print(f"✅ Cleared {data_type} data")
        return True

    def save_model_metadata(self, model_type, metadata):
        """Save model metadata"""
        self.model_metadata[model_type] = metadata
        self.save_data()

    def get_model_metadata(self, model_type=None):
        """Load model metadata"""
        if model_type:
            return self.model_metadata.get(model_type, {})
        return self.model_metadata

    def get_detailed_samples(self, data_type, limit=10):
        """Get detailed sample information"""
        if data_type == 'emails':
            data = self.email_data
        elif data_type == 'transactions':
            data = self.transaction_data
        elif data_type == 'daily_usage':
            data = self.daily_usage_data
        else:
            return []
        
        samples = []
        for i in range(min(limit, len(data['emails' if data_type == 'emails' else 'transactions' if data_type == 'transactions' else 'activities']))):
            sample = {
                'data': data['emails' if data_type == 'emails' else 'transactions' if data_type == 'transactions' else 'activities'][i],
                'label': data['labels'][i],
                'source': data['sources'][i],
                'timestamp': data['timestamps'][i]
            }
            if data['descriptions'][i]:
                sample['description'] = data['descriptions'][i]
            samples.append(sample)
        
        return samples

# Create a global instance
data_storage = DataStorage()