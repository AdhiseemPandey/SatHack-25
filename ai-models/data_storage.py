# data_storage.py
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

    def get_email_data(self):
        """Get all email data and labels"""
        return self.email_data['emails'], self.email_data['labels']

    def get_transaction_data(self):
        """Get all transaction data and labels"""
        return self.transaction_data['transactions'], self.transaction_data['labels']

    def get_stats(self):
        """Get statistics about accumulated data"""
        email_stats = {
            'total_samples': len(self.email_data['emails']),
            'legitimate_count': sum(1 for label in self.email_data['labels'] if label == 0),
            'spam_count': sum(1 for label in self.email_data['labels'] if label == 1)
        }
        
        transaction_stats = {
            'total_samples': len(self.transaction_data['transactions']),
            'legitimate_count': sum(1 for label in self.transaction_data['labels'] if label == 0),
            'fraud_count': sum(1 for label in self.transaction_data['labels'] if label == 1)
        }
        
        return {
            'emails': email_stats,
            'transactions': transaction_stats
        }

    def clear_email_data(self):
        """Clear all email data"""
        self.email_data = {
            'emails': [], 'labels': [], 'sources': [], 'descriptions': [], 'timestamps': []
        }
        self.save_data()
        return True

    def clear_transaction_data(self):
        """Clear all transaction data"""
        self.transaction_data = {
            'transactions': [], 'labels': [], 'sources': [], 'descriptions': [], 'timestamps': []
        }
        self.save_data()
        return True

    def save_model_metadata(self, model_type, metadata):
        """Save model metadata"""
        self.model_metadata[model_type] = metadata
        self.save_data()

    def load_model_metadata(self, model_type):
        """Load model metadata"""
        return self.model_metadata.get(model_type, {})

# Create a global instance
data_storage = DataStorage()